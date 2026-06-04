/**
 * Zod validation schemas for API endpoints
 * Provides type-safe input validation and sanitization
 * Replaces express-validator throughout the application
 */

import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { LAUNCHABLE_ITEMS } from "@/constants/launchSite";
import { ALLOWED_FLAGS } from "@/constants/flags";
import {
    isProfane,
    isProfaneHive,
    isProfaneProfanityDev,
    isProfaneSightenginePattern,
    isProfaneSightengineML,
} from "@/utils/profanity";
import {
    PROFILE_NAME_MAX_LENGTH,
    PROFILE_NAME_MIN_LENGTH,
    PROFILE_NAME_REGEX,
    PROFILE_PFP_MAX_INDEX,
    PROFILE_PFP_MIN_INDEX,
    LOOT_BOX_MAX_INDEX_PREMIUM_USER,
    LOOT_BOX_MAX_INDEX_REGULAR_USER,
    PROFILE_PFP_IDS,
} from "@/constants/mainProfile";

// ===== COMMON SCHEMAS =====

export const ID_SCHEMA = z.string().min(1, "ID cannot be empty");

export const OPERATION_SCHEMA = z.enum(["start", "end", "end-with-gem"]);

export const MINI_GAME_OPERATION_SCHEMA = z.enum(["start", "end", "guess"]);

// ===== MINI GAME SCHEMAS =====

export const MINI_GAME_1_SCHEMA = z.object({
    // Mini Game 1 doesn't require additional parameters beyond auth
});

export const MINI_GAME_2_SCHEMA = z
    .object({
        operation: MINI_GAME_OPERATION_SCHEMA,
        userGuess: z.enum(["less", "greater"]).optional(),
    })
    .refine(
        data => {
            if (data.operation === "guess") {
                return data.userGuess !== undefined;
            }
            return true;
        },
        {
            message: 'userGuess is required when operation is "guess"',
            path: ["userGuess"],
        }
    );

export const MINI_GAME_3_SCHEMA = z
    .object({
        operation: MINI_GAME_OPERATION_SCHEMA,
        userGuess: z.number().int().min(1).max(4).optional(),
    })
    .refine(
        data => {
            if (data.operation === "guess") {
                return data.userGuess !== undefined;
            }
            return true;
        },
        {
            message: 'userGuess (1-4) is required when operation is "guess"',
            path: ["userGuess"],
        }
    );

export const MINI_GAME_4_SCHEMA = z
    .object({
        operation: MINI_GAME_OPERATION_SCHEMA,
        userGuess: z.enum(["rock", "paper", "scissors"]).optional(),
    })
    .refine(
        data => {
            if (data.operation === "guess") {
                return data.userGuess !== undefined;
            }
            return true;
        },
        {
            message:
                'userGuess (rock/paper/scissors) is required when operation is "guess"',
            path: ["userGuess"],
        }
    );

// ===== SHOP SCHEMAS =====

export const SHOP_ITEM_TYPE_SCHEMA = z.enum([
    "gem",
    "robot",
    "coin",
    "game_pass",
]);

export const PAY_BY_SCHEMA = z.enum(["gem", "money"]);

export const SHOP_PURCHASE_SCHEMA = z
    .object({
        itemType: SHOP_ITEM_TYPE_SCHEMA,
        itemIndex: z.number().int().min(0, "Item index must be non-negative"),
        payBy: PAY_BY_SCHEMA,
    })
    .refine(
        data => {
            const maxIndexes: Record<
                z.infer<typeof SHOP_ITEM_TYPE_SCHEMA>,
                number
            > = {
                gem: 4,
                robot: 10,
                coin: 5,
                // eslint-disable-next-line @typescript-eslint/naming-convention -- matches API enum literal
                game_pass: 2,
            };

            const maxIndex = maxIndexes[data.itemType];
            return data.itemIndex <= maxIndex;
        },
        {
            message: "Item index exceeds maximum for this item type",
            path: ["itemIndex"],
        }
    );

export const INVOICE_SCHEMA = z.object({
    invoiceId: z.string().min(1, "Invoice ID cannot be empty"),
});

// ===== FACTORY SCHEMAS =====

export const FACTORY_UPGRADE_SCHEMA = z.object({
    operation: OPERATION_SCHEMA,
});

export const FACTORY_BUILD_ITEM_SCHEMA = z.object({
    operation: OPERATION_SCHEMA,
    itemId: z.string().min(1, "Item ID cannot be empty"),
    secondaryItemId: z.number().int().min(0).optional(),
    padId: z.string().min(1, "Pad ID cannot be empty"),
});

// ===== ENERGY GENERATOR SCHEMAS =====

export const ENERGY_GENERATOR_UPGRADE_SCHEMA = z.object({
    operation: OPERATION_SCHEMA,
});

// ===== MINE SCHEMAS =====

export const MINE_UPGRADE_SCHEMA = z.object({
    mineId: z.number().int().min(0).max(2, "Mine ID must be between 0 and 2"),
    operation: OPERATION_SCHEMA,
});

// ===== LAB SCHEMAS =====

export const LAB_UPGRADE_SCHEMA = z.object({
    operation: OPERATION_SCHEMA,
});

export const LAB_UPGRADE_ITEM_SCHEMA = z.object({
    itemId: z.string().min(1, "Item ID is required"),
});

// ===== LAUNCH SITE SCHEMAS =====

export const LAUNCH_SITE_UPGRADE_SCHEMA = z.object({
    skipWithGem: z.boolean(),
});

export const LAUNCH_ITEM_SCHEMA = z.object({
    itemType: z.enum(LAUNCHABLE_ITEMS),
});

// ===== PROFILE SCHEMAS =====

export const LOOT_BOX_OPERATION_SCHEMA = z.enum([
    "start",
    "end",
    "end-with-gems",
    "end-with-key",
]);

/**
 * Schema for validating loot box operations.
 *
 * @property {number} lootBoxIndex - The index of the loot box in the user's inventory.
 *   Must be a non-negative integer and less than or equal to MAX_LOOT_BOX_INDEX.
 * @property {string} operation - The operation to perform on the loot box.
 */
export const PROFILE_LOOT_BOX_SCHEMA = z.object({
    lootBoxIndex: z
        .number()
        .int()
        .min(0)
        .max(
            Math.max(
                LOOT_BOX_MAX_INDEX_REGULAR_USER,
                LOOT_BOX_MAX_INDEX_PREMIUM_USER
            ),
            `Lootbox index must be between 0 and ${Math.max(
                LOOT_BOX_MAX_INDEX_REGULAR_USER,
                LOOT_BOX_MAX_INDEX_PREMIUM_USER
            )}`
        ),
    operation: LOOT_BOX_OPERATION_SCHEMA,
});

export const UPDATE_PROFILE_SCHEMA = z.object({
    name: z
        .string()
        .trim()
        .min(
            PROFILE_NAME_MIN_LENGTH,
            `Name must be at least ${PROFILE_NAME_MIN_LENGTH} characters`
        )
        .max(
            PROFILE_NAME_MAX_LENGTH,
            `Name must be at most ${PROFILE_NAME_MAX_LENGTH} characters`
        )
        .regex(PROFILE_NAME_REGEX, "Name contains invalid characters")
        .optional(),
    profilePictureIndex: z
        .number()
        .int()
        .refine(val => PROFILE_PFP_IDS.includes(val), {
            message: `Invalid profile picture index`,
        })
        .optional(),
    representedFlag: z
        .string()
        .refine(val => ALLOWED_FLAGS.includes(val), {
            message: "Invalid flag code",
        })
        .optional(),
});

export const USE_REFERRAL_CODE_SCHEMA = z.object({
    refCode: z.string().min(1, "Referral code cannot be empty"),
});

// ===== PAYMENT SCHEMAS =====

/** OxaPay webhook IPN — validated after HMAC in middleware; schema documents expected fields */
export const PAYMENT_CALLBACK_SCHEMA = z
    .object({
        track_id: z.string().optional(),
        trackId: z.string().optional(),
        status: z.string().optional(),
        order_id: z.string().optional(),
        orderId: z.string().optional(),
        amount: z.union([z.number(), z.string()]).optional(),
        currency: z.string().optional(),
        type: z.string().optional(),
    })
    .refine(
        (data) => Boolean(data.track_id ?? data.trackId),
        { message: "track_id is required" },
    );

export const PROCESS_INVOICE_SCHEMA = z.object({
    invoiceId: z.string().min(1, "Invoice ID cannot be empty"),
});

// ===== TYPE EXPORTS =====

export type MiniGame2Input = z.infer<typeof MINI_GAME_2_SCHEMA>;
export type MiniGame3Input = z.infer<typeof MINI_GAME_3_SCHEMA>;
export type MiniGame4Input = z.infer<typeof MINI_GAME_4_SCHEMA>;
export type ShopPurchaseInput = z.infer<typeof SHOP_PURCHASE_SCHEMA>;
export type InvoiceInput = z.infer<typeof INVOICE_SCHEMA>;
export type FactoryUpgradeInput = z.infer<typeof FACTORY_UPGRADE_SCHEMA>;
export type FactoryBuildItemInput = z.infer<typeof FACTORY_BUILD_ITEM_SCHEMA>;
export type EnergyGeneratorUpgradeInput = z.infer<
    typeof ENERGY_GENERATOR_UPGRADE_SCHEMA
>;
export type MineUpgradeInput = z.infer<typeof MINE_UPGRADE_SCHEMA>;
export type LabUpgradeInput = z.infer<typeof LAB_UPGRADE_SCHEMA>;
export type LabUpgradeItemInput = z.infer<typeof LAB_UPGRADE_ITEM_SCHEMA>;
export type LaunchSiteUpgradeInput = z.infer<typeof LAUNCH_SITE_UPGRADE_SCHEMA>;
export type LaunchItemInput = z.infer<typeof LAUNCH_ITEM_SCHEMA>;
export type ProfileLootBoxInput = z.infer<typeof PROFILE_LOOT_BOX_SCHEMA>;
export type UpdateProfileInput = z.infer<typeof UPDATE_PROFILE_SCHEMA>;
export type UseReferralCodeInput = z.infer<typeof USE_REFERRAL_CODE_SCHEMA>;
export type PaymentCallbackInput = z.infer<typeof PAYMENT_CALLBACK_SCHEMA>;
export type ProcessInvoiceInput = z.infer<typeof PROCESS_INVOICE_SCHEMA>;

// ===== VALIDATION HELPERS =====

type ValidationRequest = Request & {
    validatedBody?: unknown;
    validatedQuery?: unknown;
    validatedParams?: unknown;
};

const formatZodIssues = (issues: z.ZodIssue[]) =>
    issues.map(issue => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
    }));

/**
 * Creates a validation middleware for Express routes
 */
export function validateBody(schema: z.ZodType) {
    return async (
        req: ValidationRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            req.validatedBody = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid input data",
                        details: formatZodIssues(error.issues),
                    },
                });
            }

            return res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "Validation processing failed",
                },
            });
        }
    };
}

/**
 * Validates query parameters
 */
export function validateQuery(schema: z.ZodType) {
    return (req: ValidationRequest, res: Response, next: NextFunction) => {
        try {
            req.validatedQuery = schema.parse(req.query);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid query parameters",
                        details: formatZodIssues(error.issues),
                    },
                });
            }

            return res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "Query validation processing failed",
                },
            });
        }
    };
}

/**
 * Validates URL parameters
 */
export function validateParams(schema: z.ZodType) {
    return (req: ValidationRequest, res: Response, next: NextFunction) => {
        try {
            req.validatedParams = schema.parse(req.params);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid URL parameters",
                        details: formatZodIssues(error.issues),
                    },
                });
            }

            return res.status(500).json({
                success: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "Parameter validation processing failed",
                },
            });
        }
    };
}
