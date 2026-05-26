import {
    RegExpMatcher,
    englishDataset,
    englishRecommendedTransformers,
} from "obscenity";
import filter from "leo-profanity";
import axios from "axios";
import OpenAI from "openai";
import { appConfig } from "@/config/environment.js";
import _ from "lodash";

// LLM-powered profanity checker (optional, provider-agnostic)
export {
    isProfaneLLM,
    isProfaneLLMBatch,
    type ContentContext,
    type LlmProfanityResult,
} from "@/utils/llmProfanity.js";

type ProfanityCheckingTool =
    | "SimpleFilter"
    | "OpenAiModerationApi"
    | "HiveAiModeration"
    | "ProfanityDev"
    | "SightenginePattern"
    | "SightengineML"
    | "LLM"
    | "LLMBatch";

// Initialize obscenity matcher with English dataset and recommended transformers (leet speak, etc.)
const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});

/**
 * Custom regex patterns for catching repeated characters or specific evasions
 * not caught by standard libraries.
 */
const CUSTOM_PATTERNS = [
    /f+u+c+k+/i,
    /s+h+i+t+/i,
    /b+i+t+c+h+/i,
    /c+u+n+t+/i,
    /d+i+c+k+/i,
    /a+s+s+h+o+l+e+/i,
    /n+i+g+g+e+r+/i,
    /f+a+g+g+o+t+/i,
];

/**
 * Checks if a string contains profanity using multiple strategies:
 * 1. leo-profanity (fast local check)
 * 2. obscenity (robust pattern matching for leet speak etc.)
 * 3. Custom regex patterns (catch-all for repetitions)
 *
 * @param text The text to check.
 * @returns True if profanity is detected, false otherwise.
 */
export function isProfane(text: string): boolean {
    // 1. Fast check with leo-profanity
    if (filter.check(text)) {
        return true;
    }

    // 2. Robust check with obscenity
    if (matcher.hasMatch(text)) {
        return true;
    }

    // 3. Custom regex check
    for (const pattern of CUSTOM_PATTERNS) {
        if (pattern.test(text)) {
            return true;
        }
    }

    // 4. Normalization check (remove non-alphanumeric characters and check again)
    // This catches things like "f.u.c.k" or "s h i t"
    const normalizedText = text.replace(/[^a-zA-Z0-9]/g, "");
    if (filter.check(normalizedText) || matcher.hasMatch(normalizedText)) {
        return true;
    }

    return false;
}

/**
 * Checks if text is profane using the Hive Moderation API (v3).
 * This is an async check intended as a second layer of defense.
 *
 * @param text The text to check
 * @returns Promise<boolean> True if profane, false otherwise
 */
export async function isProfaneHive(text: string): Promise<boolean> {
    if (!appConfig.hiveApiKey) {
        console.warn("[Hive] Skip: HIVE_API_KEY not set");
        return false;
    }

    try {
        const response = await axios.post(
            "https://api.thehive.ai/api/v3/hive/text-moderation",
            {
                input: [
                    {
                        text: text,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${appConfig.hiveApiKey}`,
                    "x-hive-access-key": appConfig.hiveAccessKey,
                    "Content-Type": "application/json",
                },
            }
        );

        // Hive v3 response parsing
        const output = response.data.output?.[0];
        if (output && output.classes) {
            for (const cls of output.classes) {
                // Severity threshold: 2 (Medium) or 3 (High)
                if (
                    cls.class !== "clean" &&
                    cls.class !== "general_safe" &&
                    cls.value >= 2
                ) {
                    console.log(
                        `[Hive] Blocked: "${text}" due to ${cls.class} (Value: ${cls.value})`
                    );
                    return true;
                }
            }
        }
        return false;
    } catch (error) {
        console.error(
            "[Hive] API Error:",
            error instanceof Error ? error.message : error
        );
        return false;
    }
}

/**
 * Checks if text is profane using the Profanity.dev vector API.
 * This is a free, no-auth API that acts as an additional async layer.
 *
 * @param text The text to check
 * @returns Promise<boolean> True if profane, false otherwise
 */
export async function isProfaneProfanityDev(text: string): Promise<boolean> {
    try {
        const response = await axios.post(
            "https://vector.profanity.dev",
            { message: text },
            { headers: { "Content-Type": "application/json" } }
        );

        if (response.data?.isProfanity === true) {
            console.log(`[ProfanityDev] Blocked: "${text}"`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(
            "[ProfanityDev] API Error:",
            error instanceof Error ? error.message : error
        );
        // Fail-open: don't block on API errors
        return false;
    }
}

/**
 * Checks if text contains profanity or PII using Sightengine's rule-based (pattern) moderation.
 * @param text The text to check
 * @returns Promise<boolean> True if text violates rules, false otherwise
 */
export async function isProfaneSightenginePattern(
    text: string
): Promise<boolean> {
    if (!appConfig.sightengineApiUser || !appConfig.sightengineApiSecret) {
        console.warn("[Sightengine Pattern] Skip: API credentials not set");
        return false;
    }

    try {
        const formData = new URLSearchParams();
        formData.append("text", text);
        formData.append("lang", "en");
        formData.append("mode", "rules");
        formData.append("api_user", appConfig.sightengineApiUser);
        formData.append("api_secret", appConfig.sightengineApiSecret);

        const response = await axios.post(
            "https://api.sightengine.com/1.0/text/check.json",
            formData,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const data = response.data;
        if (data.profanity?.matches?.length > 0) {
            console.log(
                `[Sightengine Pattern] Blocked by profanity matches:`,
                data.profanity.matches
            );
            return true;
        }
        if (data.personal?.matches?.length > 0) {
            console.log(
                `[Sightengine Pattern] Blocked by PII matches:`,
                data.personal.matches
            );
            return true;
        }
        if (data.link?.matches?.length > 0) {
            console.log(
                `[Sightengine Pattern] Blocked by link matches:`,
                data.link.matches
            );
            return true;
        }

        return false;
    } catch (error) {
        console.error(
            "[Sightengine Pattern] API Error:",
            error instanceof Error ? error.message : error
        );
        return false;
    }
}

/**
 * Checks if text is toxic using Sightengine's machine learning moderation models.
 * @param text The text to check
 * @returns Promise<boolean> True if text is flagged by ML, false otherwise
 */
export async function isProfaneSightengineML(text: string): Promise<boolean> {
    if (!appConfig.sightengineApiUser || !appConfig.sightengineApiSecret) {
        console.warn("[Sightengine ML] Skip: API credentials not set");
        return false;
    }

    try {
        const formData = new URLSearchParams();
        formData.append("text", text);
        formData.append("lang", "en");
        formData.append("mode", "ml");
        formData.append("api_user", appConfig.sightengineApiUser);
        formData.append("api_secret", appConfig.sightengineApiSecret);

        const response = await axios.post(
            "https://api.sightengine.com/1.0/text/check.json",
            formData,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const classes = response.data.moderation_classes;
        if (classes) {
            // Threshold of 0.5 can be adjusted. Usually 0.5+ is confident classification.
            const threshold = 0.5;
            if (
                classes.sexual >= threshold ||
                classes.discriminatory >= threshold ||
                classes.insulting >= threshold ||
                classes.violent >= threshold ||
                classes.toxic >= threshold
            ) {
                console.log(`[Sightengine ML] Blocked:`, classes);
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error(
            "[Sightengine ML] API Error:",
            error instanceof Error ? error.message : error
        );
        return false;
    }
}

/**
 * Sanitizes a string by replacing profanity with a placeholder.
 * @param text The text to sanitize.
 * @param replacement The character to use for replacement (default: *).
 * @returns The sanitized text.
 */
export function sanitizeText(text: string, replacement: string = "*"): string {
    return filter.clean(text, replacement);
}

/**
 * Adds custom words to the profanity filter.
 * @param words Array of words to add.
 */
export const addForbiddenWords = (words: string[]): void => {
    filter.add(words);
};

// ---------------------------------------------------------------------------
// OpenAI Moderation API
// (Available for future use — not yet wired into the main profanity pipeline)
// Requires: LLM_API_KEY set to an OpenAI API key.
// ---------------------------------------------------------------------------

/** The structured result returned by the OpenAI Moderation API checker. */
export type OpenAiModerationResult = {
    /** True if any moderation category is flagged. */
    isFlagged: boolean;
    /** Category scores from the model (0–1). */
    scores: {
        hate: number;
        "hate/threatening": number;
        harassment: number;
        "harassment/threatening": number;
        "self-harm": number;
        "self-harm/intent": number;
        "self-harm/instructions": number;
        sexual: number;
        "sexual/minors": number;
        violence: number;
        "violence/graphic": number;
    };
    /** Which categories were explicitly flagged as true. */
    flaggedCategories: string[];
};

/**
 * Checks text using the OpenAI Moderation API.
 *
 * This is a free-to-use endpoint (does not count against token quota) and
 * is very fast. Works only with OpenAI API keys — not other providers.
 *
 * @param text      The text to evaluate.
 * @param apiKey    OpenAI API key. Falls back to `LLM_API_KEY` env var.
 * @returns         A structured {@link OpenAiModerationResult}.
 *
 * @example
 * const result = await isProfaneOpenAiModeration("I hate you");
 * if (result.isFlagged) console.log(result.flaggedCategories);
 */
export async function isProfaneOpenAiModeration(
    text: string,
    apiKey?: string
): Promise<OpenAiModerationResult> {
    const FAIL_OPEN: OpenAiModerationResult = {
        isFlagged: false,
        scores: {
            hate: 0,
            "hate/threatening": 0,
            harassment: 0,
            "harassment/threatening": 0,
            "self-harm": 0,
            "self-harm/intent": 0,
            "self-harm/instructions": 0,
            sexual: 0,
            "sexual/minors": 0,
            violence: 0,
            "violence/graphic": 0,
        },
        flaggedCategories: [],
    };

    const resolvedKey = apiKey || appConfig.llm.apiKey;

    if (!resolvedKey) {
        console.warn("[OpenAI Moderation] Skipping: no API key provided");
        return FAIL_OPEN;
    }

    try {
        const openai = new OpenAI({ apiKey: resolvedKey });
        const response = await openai.moderations.create({
            model: "omni-moderation-latest",
            input: text,
        });

        const result = response.results[0];
        if (!result) return FAIL_OPEN;

        const flaggedCategories = Object.entries(result.categories)
            .filter(([, flagged]) => flagged)
            .map(([category]) => category);

        return {
            isFlagged: result.flagged,
            scores: result.category_scores as OpenAiModerationResult["scores"],
            flaggedCategories,
        };
    } catch (error) {
        console.error(
            "[OpenAI Moderation] API Error:",
            error instanceof Error ? error.message : error
        );
        return FAIL_OPEN;
    }
}

export async function checkValForProfanity(
    val: string,
    tools: ProfanityCheckingTool[],
    context?: string
) {
    if (tools.includes("SimpleFilter")) {
        // Check local filter first (fast)
        if (isProfane(val)) return true;
    }

    if (tools.includes("ProfanityDev")) {
        // check the val with profanity dev
        let profanityDevResult = await isProfaneProfanityDev(val);

        if (profanityDevResult) return true;
    }

    if (tools.includes("HiveAiModeration")) {
        if (!_.isNil(context)) {
            val = context + " : " + val;
        }

        // check the val with profanity dev
        let hiveResult = await isProfaneHive(val);

        if (hiveResult) return true;
    }

    if (tools.includes("SightengineML")) {
        if (!_.isNil(context)) {
            val = context + " : " + val;
        }

        // check the val with profanity dev
        let sightEngineMlResult = await isProfaneSightengineML(val);

        if (sightEngineMlResult) return true;
    }

    if (tools.includes("SightenginePattern")) {
        // check the val with profanity dev
        let sightEnginePatternResult = await isProfaneSightenginePattern(val);

        if (sightEnginePatternResult) return true;
    }

    // passed asked checks so it returns false
    return false;
}
