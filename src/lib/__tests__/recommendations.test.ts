// Prisma is imported at module load by the app code under test. The tests below
// only exercise pure functions, so stub @prisma/client to keep the suite
// hermetic (and to avoid resolving its browser build under jsdom) and stub the
// network client so nothing hits the internet.
jest.mock("@prisma/client", () => ({ PrismaClient: class {} }));
jest.mock("../ai/pollinations", () => ({ generateJSON: jest.fn() }));

import {
  sanitizeProfile,
  DISABILITY_TAGS,
  extractDisabilityProfileLocally,
} from "@/lib/ai/disability";
import { __testing, needsDisabilityProfile } from "@/lib/recommendations";

describe("disability profile sanitization", () => {
  it("keeps only values from the controlled vocabulary", () => {
    const profile = sanitizeProfile({
      tags: ["tunanetra", "made_up_tag", "tunarungu", "tunanetra"],
      constraints: ["tidak_berdiri_lama", "invented_constraint"],
      summary: "Butuh screen reader.",
    });

    expect(profile.tags).toEqual(["tunanetra", "tunarungu"]); // deduped, hallucination dropped
    expect(profile.constraints).toEqual(["tidak_berdiri_lama"]);
    expect(profile.promptVersion).toBe("v1");
  });

  it("degrades gracefully on malformed input", () => {
    const profile = sanitizeProfile({ tags: "not-an-array", constraints: null });
    expect(profile.tags).toEqual([]);
    expect(profile.constraints).toEqual([]);
    expect(profile.summary).toBe("");
  });

  it("exposes a non-empty taxonomy", () => {
    expect(DISABILITY_TAGS.length).toBeGreaterThan(0);
  });
});

describe("onboarding gate (existing users)", () => {
  const clientFor = (user: unknown) =>
    ({ users: { findUnique: jest.fn().mockResolvedValue(user) } }) as never;

  it("gates a job-seeker with no note and no tags", async () => {
    const client = clientFor({ role: "user", disabilityNote: null, disabilityTags: null });
    expect(await needsDisabilityProfile(1, client)).toBe(true);
  });

  it("does not gate a job-seeker who already has a note", async () => {
    const client = clientFor({ role: "user", disabilityNote: "tunanetra", disabilityTags: null });
    expect(await needsDisabilityProfile(1, client)).toBe(false);
  });

  it("does not gate a job-seeker who already has tags", async () => {
    const client = clientFor({ role: "user", disabilityNote: null, disabilityTags: { tags: ["tunanetra"] } });
    expect(await needsDisabilityProfile(1, client)).toBe(false);
  });

  it("never gates non job-seeker roles (admin/company/consultant)", async () => {
    for (const role of ["admin", "company", "consultant"]) {
      const client = clientFor({ role, disabilityNote: null, disabilityTags: null });
      expect(await needsDisabilityProfile(1, client)).toBe(false);
    }
  });

  it("treats whitespace-only notes as still missing", async () => {
    const client = clientFor({ role: "user", disabilityNote: "   ", disabilityTags: null });
    expect(await needsDisabilityProfile(1, client)).toBe(true);
  });
});

describe("local (offline) disability extraction", () => {  it("derives tags and constraints from keywords when the AI is unavailable", () => {
    const profile = extractDisabilityProfileLocally("Saya tunanetra, butuh screen reader");
    expect(profile.tags).toContain("tunanetra");
    expect(profile.constraints).toContain("butuh_screen_reader");
  });

  it("returns an empty profile for empty input", () => {
    const profile = extractDisabilityProfileLocally("   ");
    expect(profile.tags).toEqual([]);
    expect(profile.constraints).toEqual([]);
  });

  it("recognizes colloquial physical-disability complaints", () => {
    const profile = extractDisabilityProfileLocally("saya lumpuh pincang kaki kanan, butuh kursi roda");
    expect(profile.tags).toContain("tunadaksa");
    expect(profile.tags).toContain("wheelchair");
    expect(profile.constraints.length).toBeGreaterThan(0);
  });
});

describe("recommendation keyword scoring", () => {
  const job = {
    id: 1,
    title: "Remote Data Entry",
    location: "Jakarta",
    division: "Admin",
    workType: "fulltime",
    salary: null,
    excerpt: "Pekerjaan input data, tidak perlu berdiri lama",
    link: "https://example.com",
    description: "Kerja dari rumah",
  };

  it("scores jobs matching keywords higher", () => {
    const matching = __testing.scoreByKeywords(job as never, ["tidak_berdiri_lama"]);
    const unrelated = __testing.scoreByKeywords(job as never, ["hindari_ketinggian"]);
    expect(matching).toBeGreaterThan(unrelated);
  });

  it("matches jobs via synonyms, not just verbatim tags", () => {
    // A screen-reader need rarely appears literally in a job ad; "remote" and
    // "kerja dari rumah" are the practical signals we must reward.
    const score = __testing.scoreByKeywords(job as never, ["butuh_screen_reader"]);
    expect(score).toBeGreaterThan(0);
  });

  it("ranks an accessible job above an unrelated one for the same need", () => {
    const accessible = { ...job, title: "Data Entry Remote", description: "Kerja dari rumah" };
    const unrelated = {
      ...job,
      id: 2,
      title: "Operator Las",
      division: "Produksi",
      excerpt: "Bekerja di ketinggian dengan alat berat",
      description: "Proyek lapangan",
    };
    const need = ["tunanetra", "butuh_screen_reader"];
    expect(__testing.scoreByKeywords(accessible as never, need)).toBeGreaterThan(
      __testing.scoreByKeywords(unrelated as never, need),
    );
  });

  it("parses a ranking payload and coerces ids", () => {
    const parsed = __testing.parseRanking({
      ranking: [
        { id: "3", score: "88", reason: "cocok" },
        { id: 1, score: 70, reason: "oke" },
        { id: null, score: 10, reason: "invalid" },
      ],
    });
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({ id: 3, score: 88, reason: "cocok" });
  });

  it("handles a malformed ranking payload", () => {
    expect(__testing.parseRanking({ ranking: "nope" })).toEqual([]);
  });
});
