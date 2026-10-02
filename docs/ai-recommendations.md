# AI Job Recommendations (Disability-based)

This feature captures the disability complaint entered by a user during mobile
registration and uses it to power a personalized job recommendation list on the
mobile home screen.

## Flow

```
mobile register  ──►  POST /api/auth/register  { ..., disabilityNote }
                            │
                            ├─ store raw text (Users.disabilityNote)          [sync, fast]
                            └─ normalize → Users.disabilityTags               [async, best-effort]
                                        { tags, constraints, summary, promptVersion }

mobile home  ──►  GET /api/recommendations  (JWT)
                            │
                            ├─ 0. gate: user role=user without profile → 409 { needsDisabilityProfile }
                            ├─ 1. deterministic candidate pool (recent jobs)
                            ├─ 2. keyword pre-filter → shortlist (<= 15)
                            ├─ 3. LLM re-ranks ONLY real shortlist jobs
                            ├─ 4. validate returned ids (anti-hallucination)
                            └─ 5. cache 24h  (fallback if AI is down)

mobile (onboarding) ──► POST /api/user/[id] { disabilityNote }
                            └─ re-tag (AI + local fallback) + invalidate cache
```

## Design principles

1. **Capture ≠ compute.** Registration never blocks on the AI. The raw note is
   stored immediately; tag extraction runs in the background.
2. **Two-tier matching.** Deterministic SQL/keyword filtering first (cheap,
   explainable), then the LLM only re-ranks a small shortlist.
3. **Ground output in DB rows.** The LLM receives real job ids and may only
   return those ids; unknown ids are dropped server-side.
4. **Never empty.** If the AI fails or is rate-limited, a keyword/recent-jobs
   fallback is returned.
5. **Cache.** Results are cached per user for 24h (home screen is fetched often).
6. **Structured output.** `response_format: json_object` + zod validation, plus
   a controlled taxonomy that drops any hallucinated tag/constraint.
7. **Server-side only.** The Pollinations endpoint/token never reaches the mobile
   app.

## Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | `Users.disabilityNote`, `Users.disabilityTags` |
| `prisma/migrations/20261002150000_add_disability_profile/` | migration |
| `src/lib/prisma.ts` | shared PrismaClient singleton |
| `src/lib/ai/pollinations.ts` | server-side OpenAI-compatible client (timeout + retry + loose JSON parse) |
| `src/lib/ai/disability.ts` | taxonomy, zod DTO, `extractDisabilityProfile()` |
| `src/lib/recommendations.ts` | `recommendJobsForUser()` — filter + rank + validate |
| `src/lib/cache.ts` | in-memory TTL cache (swap for Redis when scaling out) |
| `src/app/api/auth/register/route.ts` | validates input, stores note, triggers tagging |
| `src/app/api/(recommendation)/recommendations/route.ts` | `GET /api/recommendations` |
| `src/app/api/(user)/user/[id]/route.ts` | re-tags + invalidates cache on note update |

## API

### `POST /api/auth/register`
```json
{ "email": "a@b.com", "name": "A", "password": "secret123", "disabilityNote": "Saya tunanetra, butuh screen reader" }
```
`disabilityNote` is optional, max 1000 chars. Response never includes the password.

### `GET /api/recommendations?limit=10`
Header: `Authorization: <jwt>`. Response:
```json
[
  { "id": 11, "title": "Data Entry", "location": "Remote", "workType": "fulltime",
    "salary": null, "division": "Admin", "excerpt": "...", "link": "...",
    "score": 90, "reason": "Remote, dapat diakses dengan screen reader" }
]
```
`score`/`reason` are `null` when the fallback path is used.

#### Onboarding gate (existing users)
Users who registered **before** this feature have no disability profile. For
`role: "user"` accounts with neither a `disabilityNote` nor `disabilityTags`, the
endpoint responds with `409` instead of a list:

```json
{
  "title": "Disability profile required",
  "message": "Lengkapi keluhan disabilitas Anda terlebih dahulu untuk mendapatkan rekomendasi.",
  "code": 409,
  "needsDisabilityProfile": true
}
```

The app should then collect the complaint (see `POST /api/user/[id]` below) and
retry. The same `needsDisabilityProfile` flag is attached to:

- `POST /api/auth/login` — at the top level and inside `user`, so the app can
  route to the form *before* the home screen.
- `GET /api/user/[id]` — for the profile screen.

Admins, companies and consultants are never gated.

### `POST /api/user/[id]`
Updates a user. Sending `disabilityNote` recomputes the normalized profile
(AI, with local keyword fallback) and clears that user's cached
recommendations. Example:
```json
{ "disabilityNote": "Saya tunanetra, butuh screen reader" }
```

## Configuration

See `.env.example`. Optional:
- `POLLINATIONS_TOKEN` — raises rate limits / disables public logging.
- `POLLINATIONS_MODEL` — explicit model id (default `openai`).

Without a token the anonymous tier may return `HTTP 402/429` under load; the
client retries once and then falls back, so the endpoint stays available.

## Extending the taxonomy

Add tags to `DISABILITY_TAGS` / `DISABILITY_CONSTRAINTS` in
`src/lib/ai/disability.ts` and bump `DISABILITY_PROMPT_VERSION` /
`RECOMMENDATION_PROMPT_VERSION` so cached results are invalidated.

## Privacy note

Disability data is sensitive personal data. Raw notes are not logged, only the
derived tags are sent to the AI provider, and `private: true` is set so prompts
are excluded from Pollinations' public feeds.
