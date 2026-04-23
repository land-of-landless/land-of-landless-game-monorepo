/**
 * LLM-powered profanity checker.
 *
 * Uses any OpenAI-SDK-compatible provider (OpenAI, xAI, together.ai, etc.)
 * to evaluate text for profanity with structured, typed responses.
 * Results are cached in Redis to minimize repeated API calls.
 */

import OpenAI from "openai";
import { createHash } from "crypto";
import { appConfig } from "@/config/environment.js";
import { redisFastClient as redisClient } from "@/daos/redis/connectRedis/index.js";
import logger from "@/utils/logger.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The context in which the text is being evaluated.
 * This controls the strictness and focus of the LLM prompt.
 *
 * - `username`    – Player / account name. Strictest: catches subtle slurs, hate symbols, leet-speak.
 * - `clan_name`   – Clan / team / guild name. Same as username, also checks for group-hate references.
 * - `chat_message`– In-game or lobby chat. Evaluates conversational toxicity, threats, and harassment.
 */
export type ContentContext = "username" | "clan_name" | "chat_message";

/**
 * The structured result returned by the LLM profanity checker.
 */
export type LlmProfanityResult = {
    /** Whether the text is considered profane / harmful. */
    isProfane: boolean;
    /** Confidence level of the assessment. */
    confidence: "low" | "medium" | "high";
    /** Human-readable explanation, or null if clean. */
    reason: string | null;
    /** Categories identified, e.g. ["hate_speech", "sexual", "violence"]. Empty if clean. */
    categories: string[];
    /** Whether the result was served from cache. */
    fromCache: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a stable Redis cache key for a given context + text combo. */
const buildCacheKey = (context: ContentContext, text: string): string => {
    const hash = createHash("sha256")
        .update(`${context}:${text}`)
        .digest("hex");
    return `llm_profanity:${hash}`;
};

/** Build the system prompt adapted to the content context. */
const buildSystemPrompt = (context: ContentContext): string => {
    const base = `You are a content moderation assistant for an online video game.
Your task is to evaluate player-submitted text for harmful, offensive, or inappropriate content.
Always respond with a single JSON object matching this exact schema:
{
  "isProfane": boolean,
  "confidence": "low" | "medium" | "high",
  "reason": string | null,
  "categories": string[]
}
- "reason" must be null when "isProfane" is false.
- "categories" must be an empty array when "isProfane" is false.
- Valid categories: "profanity", "hate_speech", "sexual", "violence", "harassment", "self_harm", "spam".
- Do NOT flag mild competitive language (e.g. "I will destroy you") or common gaming jargon as profane.`;

    const contextGuides: Record<ContentContext, string> = {
        username: `
CONTEXT: Player username.
- Apply STRICT standards. This name is permanently visible to all players.
- Flag subtle slurs, hate symbols, leet-speak evasions (e.g. "n1gg3r"), and sexual references.
- A name that a reasonable person would find clearly offensive should be flagged.`,
        clan_name: `
CONTEXT: Clan / team name.
- Apply STRICT standards. This name represents a player group.
- Same rules as username: flag slurs, hate symbols, discriminatory references.
- Also flag group-hate references (e.g. "Kill [group]").`,
        chat_message: `
CONTEXT: In-game chat message.
- Apply MODERATE standards. Evaluate conversational context.
- Flag: slurs, targeted harassment, threats of real-world harm, explicit sexual content, spam.
- Do NOT flag: trash talking, competitive jabs, strong language without a target.`,
    };

    return base + contextGuides[context];
};

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Checks if text is profane using an LLM.
 *
 * The provider is configured via environment variables:
 * - LLM_BASE_URL  – Base URL of the OpenAI-compatible API (e.g. "https://api.x.ai/v1")
 * - LLM_API_KEY   – Secret API key for the provider
 * - LLM_MODEL     – Model identifier (e.g. "gpt-4o-mini", "grok-3-mini")
 * - LLM_CACHE_TTL_SECONDS – How long to cache results (default: 3600)
 *
 * @param text    The text to evaluate.
 * @param context The content context – controls prompt strictness.
 * @returns       A structured {@link LlmProfanityResult}.
 */
export const isProfaneLLM = async (
    text: string,
    context: ContentContext = "chat_message",
): Promise<LlmProfanityResult> => {
    const FAIL_OPEN: LlmProfanityResult = {
        isProfane: false,
        confidence: "low",
        reason: null,
        categories: [],
        fromCache: false,
    };

    if (!appConfig.llm.apiKey) {
        logger.warn("[LLM Profanity] Skipping: LLM_API_KEY not set");
        return FAIL_OPEN;
    }

    // --- Cache lookup ---
    const cacheKey = buildCacheKey(context, text);
    try {
        if (redisClient.isOpen) {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached) as LlmProfanityResult;
                return { ...parsed, fromCache: true };
            }
        }
    } catch (err) {
        logger.warn("[LLM Profanity] Redis cache read error", {
            error: err instanceof Error ? err.message : err,
        });
    }

    // --- LLM call ---
    try {
        const openai = new OpenAI({
            apiKey: appConfig.llm.apiKey,
            baseURL: appConfig.llm.baseUrl,
        });

        const completion = await openai.chat.completions.create({
            model: appConfig.llm.model,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: buildSystemPrompt(context) },
                { role: "user", content: text },
            ],
            temperature: 0,
            max_tokens: 256,
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw) throw new Error("Empty LLM response");

        const parsed = JSON.parse(raw) as Omit<LlmProfanityResult, "fromCache">;

        const result: LlmProfanityResult = {
            isProfane: Boolean(parsed.isProfane),
            confidence: parsed.confidence ?? "low",
            reason: parsed.reason ?? null,
            categories: Array.isArray(parsed.categories)
                ? parsed.categories
                : [],
            fromCache: false,
        };

        // --- Cache store ---
        try {
            if (redisClient.isOpen) {
                await redisClient.setEx(
                    cacheKey,
                    appConfig.llm.cacheTtlSeconds,
                    JSON.stringify(result),
                );
            }
        } catch (err) {
            logger.warn("[LLM Profanity] Redis cache write error", {
                error: err instanceof Error ? err.message : err,
            });
        }

        if (result.isProfane) {
            logger.info("[LLM Profanity] Flagged content", {
                context,
                confidence: result.confidence,
                categories: result.categories,
                reason: result.reason,
            });
        }

        return result;
    } catch (err) {
        logger.error("[LLM Profanity] LLM call failed, failing open", {
            error: err instanceof Error ? err.message : err,
        });
        return FAIL_OPEN;
    }
};

/**
 * Checks multiple texts for profanity in a single LLM batch.
 *
 * Logic:
 * 1. Build cache keys for all items.
 * 2. Lookup all items in Redis.
 * 3. Separate "hits" (cached) and "misses" (needs LLM).
 * 4. If misses exist, send them to the LLM in one batch prompt.
 * 5. Parse LLM response, cache new results, and merge with hits.
 *
 * @param items   Array of items to check.
 * @param context The content context (strictness level).
 * @returns       Map of text to LlmProfanityResult.
 */
export const isProfaneLLMBatch = async (
    items: { id: string; text: string }[],
    context: ContentContext = "chat_message",
): Promise<Record<string, LlmProfanityResult>> => {
    const results: Record<string, LlmProfanityResult> = {};
    const misses: { id: string; text: string; cacheKey: string }[] = [];

    if (items.length === 0) return results;

    // 1. Cache Lookup
    try {
        if (redisClient.isOpen) {
            const cacheKeys = items.map((item) =>
                buildCacheKey(context, item.text),
            );
            const cachedValues = await redisClient.mGet(cacheKeys);

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const cached = cachedValues[i];

                if (cached) {
                    results[item.id] = {
                        ...(JSON.parse(cached) as LlmProfanityResult),
                        fromCache: true,
                    };
                } else {
                    misses.push({ ...item, cacheKey: cacheKeys[i] });
                }
            }
        } else {
            // Redis offline: all are misses
            misses.push(
                ...items.map((item) => ({
                    ...item,
                    cacheKey: buildCacheKey(context, item.text),
                })),
            );
        }
    } catch (err) {
        logger.warn("[LLM Profanity Batch] Redis lookup error", {
            error: err instanceof Error ? err.message : err,
        });
        misses.push(
            ...items.map((item) => ({
                ...item,
                cacheKey: buildCacheKey(context, item.text),
            })),
        );
    }

    // 2. LLM Call for Misses
    if (misses.length > 0) {
        if (!appConfig.llm.apiKey) {
            logger.warn("[LLM Profanity Batch] Skipping LLM: API key not set");
            for (const miss of misses) {
                results[miss.id] = {
                    isProfane: false,
                    confidence: "low",
                    reason: null,
                    categories: [],
                    fromCache: false,
                };
            }
            return results;
        }

        try {
            const openai = new OpenAI({
                apiKey: appConfig.llm.apiKey,
                baseURL: appConfig.llm.baseUrl,
            });
            const prompt = `${buildSystemPrompt(context)}
            
INPUT: You are provided with multiple texts in a JSON array. 
Evaluate each and return a JSON object where keys are the IDs provided and values are the assessment objects.

Texts to evaluate:
${JSON.stringify(
    misses.map((m) => ({ id: m.id, text: m.text })),
    null,
    2,
)}`;

            const completion = await openai.chat.completions.create({
                model: appConfig.llm.model,
                response_format: { type: "json_object" },
                messages: [{ role: "system", content: prompt }],
                temperature: 0,
            });

            const raw = completion.choices[0]?.message?.content;
            if (!raw) throw new Error("Empty LLM response");

            const batchResults = JSON.parse(raw) as Record<
                string,
                Omit<LlmProfanityResult, "fromCache">
            >;

            // 3. Process and Cache New Results
            for (const miss of misses) {
                const parsed = batchResults[miss.id];
                const result: LlmProfanityResult = parsed
                    ? {
                          isProfane: Boolean(parsed.isProfane),
                          confidence: parsed.confidence || "low",
                          reason: parsed.reason || null,
                          categories: Array.isArray(parsed.categories)
                              ? parsed.categories
                              : [],
                          fromCache: false,
                      }
                    : {
                          isProfane: false,
                          confidence: "low",
                          reason: "Analysis failed",
                          categories: [],
                          fromCache: false,
                      };

                results[miss.id] = result;

                // Fire-and-forget cache store
                if (redisClient.isOpen && !parsed?.isProfane === false) {
                    // Still cache negative results
                    redisClient
                        .setEx(
                            miss.cacheKey,
                            appConfig.llm.cacheTtlSeconds,
                            JSON.stringify(result),
                        )
                        .catch(() => {});
                }
            }
        } catch (err) {
            logger.error("[LLM Profanity Batch] LLM call failed", {
                error: err instanceof Error ? err.message : err,
            });
            for (const miss of misses) {
                if (!results[miss.id]) {
                    results[miss.id] = {
                        isProfane: false,
                        confidence: "low",
                        reason: "API Error",
                        categories: [],
                        fromCache: false,
                    };
                }
            }
        }
    }

    return results;
};
