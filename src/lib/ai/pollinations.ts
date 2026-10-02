/**
 * Minimal server-side client for the Pollinations.AI OpenAI-compatible API.
 * Docs: https://gen.pollinations.ai/docs  (endpoint: POST https://text.pollinations.ai/openai)
 *
 * IMPORTANT: this module must only be imported from server code (route handlers,
 * background jobs). Never expose the endpoint/token to the mobile app.
 */

const ENDPOINT = "https://text.pollinations.ai/openai";
/** Explicit model id is preferred over the "openai" alias, which can change. */
const DEFAULT_MODEL = process.env.POLLINATIONS_MODEL ?? "openai";

export class PollinationsError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "PollinationsError";
  }
}

export interface GenerateJSONOptions {
  system: string;
  user: string;
  model?: string;
  /** 0 = deterministic, higher = more creative. */
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  /** Fix the seed to make ranking reproducible/testable. */
  seed?: number;
  signal?: AbortSignal;
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

/**
 * Call the chat completion endpoint and parse the assistant message as JSON.
 * Retries once on transient (network / 5xx / 429) failures.
 */
export async function generateJSON<T = unknown>(opts: GenerateJSONOptions): Promise<T> {
  const model = opts.model ?? DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? 20_000;

  const attempt = async (): Promise<T> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const onOuterAbort = () => controller.abort();
    opts.signal?.addEventListener("abort", onOuterAbort);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(process.env.POLLINATIONS_TOKEN
            ? { Authorization: `Bearer ${process.env.POLLINATIONS_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: opts.system },
            { role: "user", content: opts.user },
          ],
          temperature: opts.temperature ?? 0.4,
          max_tokens: opts.maxTokens ?? 700,
          seed: opts.seed,
          // Ask for JSON where supported; we still validate the shape ourselves.
          response_format: { type: "json_object" },
          // Do not expose user disability notes in Pollinations' public feeds.
          private: true,
        }),
      });

      if (!res.ok) {
        throw new PollinationsError(`Pollinations request failed (${res.status})`, res.status);
      }

      const json = (await res.json()) as ChatCompletionResponse;
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new PollinationsError("Pollinations returned an empty response");

      return parseJsonLoose(content) as T;
    } finally {
      clearTimeout(timeout);
      opts.signal?.removeEventListener("abort", onOuterAbort);
    }
  };

  try {
    return await attempt();
  } catch (err) {
    // Do not retry on caller abort.
    if (opts.signal?.aborted) throw err;
    const retriable =
      err instanceof PollinationsError
        ? err.status === undefined || err.status === 429 || (err.status ?? 0) >= 500
        : true;
    if (!retriable) throw err;

    await new Promise((r) => setTimeout(r, 500));
    return attempt();
  }
}

/**
 * Models sometimes wrap JSON in ```json fences or prepend prose.
 * Extract the first balanced JSON object/array as a best effort.
 */
function parseJsonLoose(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // fall through
    }
  }

  const start = trimmed.search(/[[{]/);
  if (start !== -1) {
    const slice = trimmed.slice(start);
    for (let end = slice.length; end > 0; end--) {
      try {
        return JSON.parse(slice.slice(0, end));
      } catch {
        // keep shrinking
      }
    }
  }

  throw new PollinationsError("Failed to parse JSON from Pollinations response");
}
