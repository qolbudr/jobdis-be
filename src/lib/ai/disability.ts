import { z } from "zod";
import { generateJSON } from "./pollinations";

/**
 * Version of the extraction prompt/contract.
 * Bump it whenever the prompt or the taxonomy changes so cached
 * recommendations can be invalidated.
 */
export const DISABILITY_PROMPT_VERSION = "v1";

/**
 * Controlled vocabulary. The LLM is instructed to ONLY use these tags.
 * Anything outside this list is dropped, which keeps recommendations
 * consistent and prevents the model from inventing categories.
 */
export const DISABILITY_TAGS = [
  "tunanetra",
  "low_vision",
  "tunarungu",
  "tunawicara",
  "tunadaksa",
  "wheelchair",
  "amputasi",
  "tunagrahita",
  "autism",
  "adhd",
  "down_syndrome",
  "cerebral_palsy",
  "disleksia",
  "epilepsi",
  "low_vision_warna",
  "penyakit_kronis",
  "kesehatan_mental",
  "lainnya",
] as const;

/**
 * Practical work constraints derived from the complaint.
 * Keep this list small and actionable so it can be mapped to job filters.
 */
export const DISABILITY_CONSTRAINTS = [
  "tidak_berdiri_lama",
  "tidak_angkat_berat",
  "hindari_kerja_lapangan",
  "hindari_ketinggian",
  "butuh_screen_reader",
  "butuh_alat_bantu_dengar",
  "butuh_komunikasi_tertulis",
  "butuh_lingkungan_tenang",
  "butuh_jadwal_fleksibel",
  "butuh_instruksi_visual",
  "hindari_keramaian",
  "hindari_operasikan_mesin",
] as const;

export type DisabilityTag = (typeof DISABILITY_TAGS)[number];
export type DisabilityConstraint = (typeof DISABILITY_CONSTRAINTS)[number];

/**
 * Shape we persist into `Users.disabilityTags` (Prisma Json column).
 * Every failure mode degrades to empty arrays / empty summary so callers
 * never have to special-case a malformed profile.
 */
export const DisabilityProfileSchema = z.object({
  tags: z.array(z.string()).max(8).catch([]),
  constraints: z.array(z.string()).max(8).catch([]),
  summary: z.string().max(300).catch(""),
  promptVersion: z.string().default(DISABILITY_PROMPT_VERSION),
});

export type DisabilityProfile = z.infer<typeof DisabilityProfileSchema>;

const SYSTEM_PROMPT = `Kamu adalah asisten yang mengklasifikasi kebutuhan kerja penyandang disabilitas di Indonesia.
Tugasmu: mengubah keluhan/deskripsi bebas menjadi profil kerja terstruktur.

Balas HANYA JSON valid (tanpa markdown, tanpa penjelasan) dengan skema:
{"tags": string[], "constraints": string[], "summary": string}

Aturan:
- "tags" HANYA boleh berisi nilai dari daftar ini: ${DISABILITY_TAGS.join(", ")}.
- "constraints" HANYA boleh berisi nilai dari daftar ini: ${DISABILITY_CONSTRAINTS.join(", ")}.
- Pilih maksimal 5 tag dan 5 constraints yang paling relevan. Jangan memaksakan.
- "summary": satu kalimat singkat (<= 30 kata) dalam Bahasa Indonesia.
- Jangan mengarang tag/constraint di luar daftar. Jika tidak yakin, gunakan array kosong.
- Jangan menambahkan field lain.`;

/** Keep only values from the allowed vocabulary (defense against hallucinated tags). */
function sanitize(list: string[], allowed: readonly string[]): string[] {
  const allowedSet = new Set<string>(allowed);
  return Array.from(new Set(list.filter((v) => allowedSet.has(v))));
}

export function sanitizeProfile(raw: unknown): DisabilityProfile {
  const parsed = DisabilityProfileSchema.parse(raw ?? {});
  return {
    tags: sanitize(parsed.tags, DISABILITY_TAGS),
    constraints: sanitize(parsed.constraints, DISABILITY_CONSTRAINTS),
    summary: parsed.summary,
    promptVersion: DISABILITY_PROMPT_VERSION,
  };
}

/**
 * Turn a free-text disability complaint into a normalized profile.
 * Throws on network/parse failure — callers must treat this as best-effort.
 */
export async function extractDisabilityProfile(note: string): Promise<DisabilityProfile> {
  const trimmed = note.trim().slice(0, 1000);
  if (trimmed.length === 0) {
    return { tags: [], constraints: [], summary: "", promptVersion: DISABILITY_PROMPT_VERSION };
  }

  const raw = await generateJSON<unknown>({
    system: SYSTEM_PROMPT,
    user: `Keluhan/deskripsi dari pendaftar:\n"""${trimmed}"""`,
    temperature: 0.2,
    maxTokens: 400,
  });

  return sanitizeProfile(raw);
}

/**
 * Keyword cues for each tag/constraint, used by the deterministic fallback.
 * Indonesian + common English synonyms; matched case-insensitively.
 */
const TAG_KEYWORDS: Record<string, string[]> = {
  tunanetra: ["tunanetra", "buta", "netra", "blind", "tidak bisa melihat", "kehilangan penglihatan", "gangguan penglihatan"],
  low_vision: ["low vision", "penglihatan lemah", "rabun", "buram", "penglihatan kabur", "minus"],
  tunarungu: ["tunarungu", "tuli", "rungu", "deaf", "gangguan pendengaran", "kurang dengar", "susah dengar"],
  tunawicara: ["tunawicara", "bisu", "wicara", "tidak bisa bicara", "gangguan bicara", "susah bicara"],
  tunadaksa: ["tunadaksa", "daksa", "cacat fisik", "difabel fisik", "disabilitas fisik", "kelainan fisik", "lumpuh", "pincang", "cacat", "difabel", "stroke", "kaki", "tangan", "patah", "keseleo", "susah jalan", "tidak bisa jalan", "jalan pakai"],
  wheelchair: ["kursi roda", "wheelchair", "roda", "butuh kursi roda", "pakai kursi roda"],
  amputasi: ["amputasi", "tangan palsu", "kaki palsu", "prostesis", "kaki diamputasi", "tangan diamputasi", "kehilangan kaki", "kehilangan tangan"],
  tunagrahita: ["tunagrahita", "grahita", "intelektual", "down", "keterbelakangan"],
  autism: ["autis", "autism", "asperger", "spektrum"],
  adhd: ["adhd", "hiperaktif", "fokus", "sulit fokus", "gampang terdistraksi"],
  down_syndrome: ["down syndrome", "down sindrom", "sindrom down"],
  cerebral_palsy: ["cerebral palsy", "cp", "lumpuh otak"],
  disleksia: ["disleksia", "dyslexia", "sulit membaca"],
  epilepsi: ["epilepsi", "ayan", "kejang", "step"],
  low_vision_warna: ["buta warna", "color blind", "warna"],
  penyakit_kronis: ["kronis", "asma", "jantung", "diabetes", "ginjal", "sesak", "tbc", "hiv", "kanker", "stroke", "darah tinggi", "hipertensi"],
  kesehatan_mental: ["kesehatan mental", "depresi", "cemas", "anxiety", "mental", "stress", "gangguan jiwa", "bipolar", "skizofrenia"],
  lainnya: ["disabilitas", "kebutuhan khusus", "berkebutuhan khusus"],
};

const CONSTRAINT_KEYWORDS: Record<string, string[]> = {
  tidak_berdiri_lama: ["tidak bisa berdiri lama", "tidak berdiri lama", "duduk", "berdiri lama", "susah berdiri", "tidak kuat berdiri", "pincang", "lumpuh", "kaki"],
  tidak_angkat_berat: ["angkat berat", "tidak kuat angkat", "mengangkat", "angkat", "beban berat", "tidak bisa angkat"],
  hindari_kerja_lapangan: ["lapangan", "kerja lapangan", "luar ruangan", "outdoor", "luar", "berjemur", "panas"],
  hindari_ketinggian: ["ketinggian", "memanjat", "tangga", "naik turun", "vertigo"],
  butuh_screen_reader: ["screen reader", "pembaca layar", "tunanetra", "buta", "netra", "braille", "gangguan penglihatan"],
  butuh_alat_bantu_dengar: ["alat bantu dengar", "hearing aid", "tunarungu", "tuli", "bahasa isyarat", "susah dengar", "kurang dengar"],
  butuh_komunikasi_tertulis: ["komunikasi tertulis", "teks", "chat", "tulis", "whatsapp", "tertulis"],
  butuh_lingkungan_tenang: ["lingkungan tenang", "tenang", "sunyi", "berisik", "bising", "ramai suara"],
  butuh_jadwal_fleksibel: ["fleksibel", "waktu fleksibel", "jam kerja fleksibel", "waktu", "jam"],
  butuh_instruksi_visual: ["instruksi visual", "gambar", "visual", "tulisan besar", "diagram"],
  hindari_keramaian: ["keramaian", "ramai", "crowd", "banyak orang", "kerumunan"],
  hindari_operasikan_mesin: ["mesin", "operator mesin", "alat berat", "pabrik", "industri"],
};

function matchKeywords(text: string, map: Record<string, string[]>, allowed: readonly string[]): string[] {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  for (const key of Object.keys(map)) {
    if (!allowed.includes(key)) continue;
    if (map[key].some((kw) => lower.includes(kw))) hits.push(key);
  }
  return hits.slice(0, 8);
}

/**
 * Deterministic, network-free extraction used when the LLM is unavailable.
 * Guarantees a registered complaint is never left without tags.
 */
export function extractDisabilityProfileLocally(note: string): DisabilityProfile {
  const trimmed = note.trim().slice(0, 1000);
  if (trimmed.length === 0) {
    return { tags: [], constraints: [], summary: "", promptVersion: DISABILITY_PROMPT_VERSION };
  }

  const tags = matchKeywords(trimmed, TAG_KEYWORDS, DISABILITY_TAGS);
  const constraints = matchKeywords(trimmed, CONSTRAINT_KEYWORDS, DISABILITY_CONSTRAINTS);

  return sanitizeProfile({
    tags,
    constraints,
    summary: trimmed.length > 200 ? `${trimmed.slice(0, 197)}...` : trimmed,
  });
}
