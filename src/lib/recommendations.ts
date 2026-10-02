import type { PrismaClient } from "@prisma/client";
import {
  DISABILITY_PROMPT_VERSION,
  extractDisabilityProfileLocally,
  type DisabilityProfile,
} from "./ai/disability";
import { generateJSON } from "./ai/pollinations";
import { prisma } from "./prisma";

/**
 * Recommendation strategy (see docs):
 *   1. deterministic candidate set + cheap keyword pre-filter (no hallucination)
 *   2. LLM re-ranks ONLY the real shortlist and must return existing ids
 *   3. ids are validated against the shortlist; graceful fallback on any failure
 *
 * The home screen must never be empty because the AI provider is down.
 */

export const RECOMMENDATION_PROMPT_VERSION = "v1";
const SHORTLIST_SIZE = 15;
const CANDIDATE_POOL = 200;

/**
 * A candidate (role "user") must complete their disability profile before the
 * home screen can show personalized recommendations. This is the single source
 * of truth used by the gate; keep it cheap (one indexed read).
 */
export async function needsDisabilityProfile(
  userId: number,
  client: PrismaClient = prisma,
): Promise<boolean> {
  const user = await client.users.findUnique({
    where: { id: userId },
    select: { role: true, disabilityNote: true, disabilityTags: true },
  });
  if (!user) return false;
  if (user.role !== "user") return false; // only job-seekers are gated

  const hasNote = Boolean(user.disabilityNote && user.disabilityNote.trim());
  const hasTags = Boolean(user.disabilityTags);
  return !hasNote && !hasTags;
}

export interface JobRecommendation {
  id: number;
  title: string;
  location: string;
  division: string | null;
  workType: string;
  salary: number | null;
  excerpt: string | null;
  link: string;
  score: number | null;
  reason: string | null;
}

type CandidateJob = {
  id: number;
  title: string;
  location: string;
  division: string | null;
  workType: string;
  salary: number | null;
  excerpt: string | null;
  link: string;
  description: string;
};

const RECOMMENDATION_SYSTEM_PROMPT = `Kamu adalah konselor karier untuk penyandang disabilitas di Indonesia.
Kamu akan menerima profil pelamar dan daftar lowongan pekerjaan NYATA.

Tugasmu: menilai relevansi setiap lowongan untuk pelamar, lalu urutkan.

Balas HANYA JSON valid dengan skema:
{"ranking":[{"id": number, "score": number, "reason": string}]}

Aturan:
- "id" HARUS salah satu id dari daftar pekerjaan yang diberikan. JANGAN membuat id atau pekerjaan baru.
- "score" 0-100 (semakin tinggi semakin cocok dengan kondisi & batasan pelamar).
- "reason": satu kalimat singkat Bahasa Indonesia yang menjelaskan kecocokan.
- Urutkan dari skor tertinggi. Sertakan setiap id yang diberikan.
- Jangan menambahkan field lain.`;

/**
 * Deterministic keyword pre-filter so we only send a small, relevant prompt to the LLM.
 *
 * Disability tags/constraints rarely appear verbatim in job text, so we expand
 * each constraint into related job-description terms before matching. We also
 * reward "accommodating" signals (remote/flexible/accessible) for constraints
 * that a job can satisfy structurally.
 */
const CONSTRAINT_SYNONYMS: Record<string, string[]> = {
  butuh_screen_reader: ["remote", "komputer", "computer", "data", "admin", "it", "software", "telemarketing", "customer service", "chat"],
  butuh_alat_bantu_dengar: ["remote", "chat", "tulis", "text", "data", "admin", "komputer"],
  butuh_komunikasi_tertulis: ["chat", "tulis", "text", "email", "remote", "admin", "data"],
  butuh_lingkungan_tenang: ["remote", "back office", "data", "arsip", "admin", "laboratorium"],
  butuh_jadwal_fleksibel: ["remote", "freelance", "part time", "parttime", "fleksibel", "shift pendek"],
  butuh_instruksi_visual: ["gambar", "visual", "desain", "design", "video", "grafis"],
  hindari_berdiri_lama: ["remote", "duduk", "desk", "admin", "data", "customer service", "call center"],
  hindari_angkat_berat: ["remote", "admin", "data", "customer service", "kasir", "desk"],
  hindari_kerja_lapangan: ["remote", "kantor", "office", "back office", "indoor"],
  hindari_ketinggian: ["remote", "kantor", "office", "indoor", "duduk"],
  hindari_keramaian: ["remote", "back office", "data", "arsip", "gudang"],
  hindari_operasikan_mesin: ["remote", "admin", "data", "customer service", "desk"],
};

const TAG_SYNONYMS: Record<string, string[]> = {
  tunanetra: ["remote", "screen reader", "audio", "telemarketing", "call center", "customer service"],
  low_vision: ["remote", "screen reader", "audio", "customer service"],
  tunarungu: ["chat", "tulis", "text", "remote", "data", "admin", "visual"],
  tunawicara: ["chat", "tulis", "text", "remote", "data", "admin"],
  tunadaksa: ["remote", "duduk", "desk", "admin", "data", "customer service"],
  wheelchair: ["aksesibel", "accessible", "ramp", "remote", "duduk", "desk", "admin"],
};

/** Signals that a job is likely accommodating; small bonus, never dominant. */
const ACCOMMODATION_SIGNALS = ["remote", "wfh", "kerja dari rumah", "aksesibel", "accessible", "inklusif", "inclusive", "fleksibel", "flexible"];

function scoreByKeywords(job: CandidateJob, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const haystack = `${job.title} ${job.division ?? ""} ${job.excerpt ?? ""} ${job.description}`.toLowerCase();

  let score = 0;
  for (const kw of keywords) {
    // 1. direct match on the raw keyword (covers case where it appears verbatim)
    const direct = kw.toLowerCase().replace(/_/g, " ");
    if (haystack.includes(direct)) score += 1;

    // 2. expanded synonyms for this constraint/tag
    const expanded = [...(CONSTRAINT_SYNONYMS[kw] ?? []), ...(TAG_SYNONYMS[kw] ?? [])];
    for (const term of expanded) {
      if (haystack.includes(term)) score += 0.5;
    }

    // 3. token-level partial match (e.g. "berdiri" from "tidak_berdiri_lama")
    for (const token of direct.split(" ")) {
      if (token.length >= 4 && haystack.includes(token)) score += 0.25;
    }
  }

  // 4. accommodation bonus
  for (const signal of ACCOMMODATION_SIGNALS) {
    if (haystack.includes(signal)) {
      score += 0.5;
      break;
    }
  }

  return score;
}

function fallback(jobs: CandidateJob[], limit: number, keywords: string[] = []): JobRecommendation[] {
  // Keep relevance ordering even without the LLM: sort by keyword score, then recency.
  const ordered =
    keywords.length === 0
      ? jobs
      : jobs
          .map((job) => ({ job, s: scoreByKeywords(job, keywords) }))
          .sort((a, b) => b.s - a.s)
          .map(({ job }) => job);

  return ordered.slice(0, limit).map(({ description: _description, ...j }) => ({
    ...j,
    score: null,
    reason: null,
  }));
}

export async function recommendJobsForUser(
  userId: number,
  limit = 10,
  client: PrismaClient = prisma,
): Promise<JobRecommendation[]> {
  const user = await client.users.findUnique({ where: { id: userId } });
  if (!user) throw new Error(`User ${userId} not found`);

  const jobs = (await client.jobVacancy.findMany({
    orderBy: { createdAt: "desc" },
    take: CANDIDATE_POOL,
    select: {
      id: true,
      title: true,
      location: true,
      division: true,
      workType: true,
      salary: true,
      excerpt: true,
      link: true,
      description: true,
    },
  })) as CandidateJob[];

  if (jobs.length === 0) return [];

  const stored = (user.disabilityTags as DisabilityProfile | null) ?? null;
  let tags = stored?.tags ?? [];
  let constraints = stored?.constraints ?? [];

  // Lazy self-heal: a note exists but was never tagged (e.g. AI was down at
  // registration, or the user predates the feature). Derive a deterministic
  // profile now and persist it so later calls are cheap.
  if (tags.length === 0 && constraints.length === 0 && user.disabilityNote?.trim()) {
    const derived = extractDisabilityProfileLocally(user.disabilityNote);
    tags = derived.tags;
    constraints = derived.constraints;
    if (tags.length > 0 || constraints.length > 0) {
      void client.users
        .update({ where: { id: userId }, data: { disabilityTags: derived } })
        .catch((error) => console.error("[recommendations] lazy tagging persist failed", error));
    }
  }

  // No signal about the user's needs -> return the most recent jobs.
  if (tags.length === 0 && constraints.length === 0) {
    return fallback(jobs, limit);
  }

  const keywords = [...tags, ...constraints];
  const shortlist = jobs
    .map((job) => ({ job, s: scoreByKeywords(job, keywords) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, SHORTLIST_SIZE)
    .map(({ job }) => job);

  // If nothing matched keywords, still let the LLM rank a small recent set.
  if (shortlist.every((j) => scoreByKeywords(j, keywords) === 0)) {
    shortlist.splice(0, shortlist.length, ...jobs.slice(0, SHORTLIST_SIZE));
  }

  let ranking: { id: number; score: number; reason: string }[];
  try {
    const raw = await generateJSON<{ ranking?: unknown }>({
      system: RECOMMENDATION_SYSTEM_PROMPT,
      user: JSON.stringify({
        pelamar: { tags, constraints, catatan: user.disabilityNote ?? "" },
        pekerjaan: shortlist.map((j) => ({
          id: j.id,
          title: j.title,
          divisi: j.division,
          tipe: j.workType,
          lokasi: j.location,
          ringkasan: (j.excerpt ?? "").slice(0, 300),
        })),
      }),
      temperature: 0.3,
      maxTokens: 900,
    });

    ranking = parseRanking(raw);
  } catch (err) {
    console.error("[recommendations] LLM ranking failed, returning keyword fallback:", err);
    return fallback(shortlist, limit, keywords);
  }

  // Anti-hallucination guard: keep only ids that exist in the shortlist.
  const byId = new Map(shortlist.map((j) => [j.id, j]));
  const result = ranking
    .filter((r) => byId.has(r.id))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => {
      const { description: _description, ...job } = byId.get(r.id)!;
      return {
        ...job,
        score: Number.isFinite(r.score) ? Math.max(0, Math.min(100, Math.round(r.score))) : null,
        reason: typeof r.reason === "string" ? r.reason.slice(0, 300) : null,
      };
    });

  // If the model returned nothing usable, fall back to keyword order.
  return result.length > 0 ? result : fallback(shortlist, limit, keywords);
}

function parseRanking(raw: { ranking?: unknown }): { id: number; score: number; reason: string }[] {
  const list = Array.isArray(raw?.ranking) ? raw.ranking : Array.isArray(raw) ? raw : [];
  return (list as unknown[])
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const r = item as Record<string, unknown>;
      if (r.id === null || r.id === undefined || r.id === "") return null;
      const id = typeof r.id === "string" ? Number.parseInt(r.id, 10) : Number(r.id);
      if (!Number.isInteger(id) || id <= 0) return null; // id 0/NaN are not real rows
      const score = typeof r.score === "string" ? Number.parseFloat(r.score) : Number(r.score);
      return {
        id,
        score: Number.isFinite(score) ? score : 0,
        reason: typeof r.reason === "string" ? r.reason : "",
      };
    })
    .filter((r): r is { id: number; score: number; reason: string } => r !== null);
}

export { RECOMMENDATION_PROMPT_VERSION as RECOMMENDATION_VERSION };
export const __testing = { scoreByKeywords, parseRanking, RECOMMENDATION_PROMPT_VERSION, DISABILITY_PROMPT_VERSION };
