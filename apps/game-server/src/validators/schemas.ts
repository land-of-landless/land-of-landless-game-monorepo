/**
 * Zod validation schemas for API endpoints
 * Provides type-safe input validation and sanitization
 * Replaces express-validator throughout the application
 */

import { z } from "zod";
import { LAUNCHABLE_ITEMS } from "@/constants/launchSite";

// ===== COMMON SCHEMAS =====

export const idSchema = z.string().min(1, "ID cannot be empty");

export const operationSchema = z.enum(["start", "end", "end-with-gem"]);

export const miniGameOperationSchema = z.enum(["start", "end", "guess"]);

// ===== MINI GAME SCHEMAS =====

export const miniGame1Schema = z.object({
    // Mini Game 1 doesn't require additional parameters beyond auth
});

export const miniGame2Schema = z
    .object({
        operation: miniGameOperationSchema,
        userGuess: z.enum(["less", "greater"]).optional(),
    })
    .refine(
        (data) => {
            // If operation is 'guess', userGuess is required
            if (data.operation === "guess") {
                return data.userGuess !== undefined;
            }
            return true;
        },
        {
            message: 'userGuess is required when operation is "guess"',
            path: ["userGuess"],
        },
    );

export const miniGame3Schema = z
    .object({
        operation: miniGameOperationSchema,
        userGuess: z.number().int().min(1).max(4).optional(),
    })
    .refine(
        (data) => {
            // If operation is 'guess', userGuess is required
            if (data.operation === "guess") {
                return data.userGuess !== undefined;
            }
            return true;
        },
        {
            message: 'userGuess (1-4) is required when operation is "guess"',
            path: ["userGuess"],
        },
    );

export const miniGame4Schema = z
    .object({
        operation: miniGameOperationSchema,
        userGuess: z.enum(["rock", "paper", "scissors"]).optional(),
    })
    .refine(
        (data) => {
            // If operation is 'guess', userGuess is required
            if (data.operation === "guess") {
                return data.userGuess !== undefined;
            }
            return true;
        },
        {
            message:
                'userGuess (rock/paper/scissors) is required when operation is "guess"',
            path: ["userGuess"],
        },
    );

// ===== SHOP SCHEMAS =====

export const shopItemTypeSchema = z.enum(["gem", "robot", "coin", "game_pass"]);

export const payBySchema = z.enum(["gem", "money"]);

export const shopPurchaseSchema = z
    .object({
        itemType: shopItemTypeSchema,
        itemIndex: z.number().int().min(0, "Item index must be non-negative"),
        payBy: payBySchema,
    })
    .refine(
        (data) => {
            // Validate item index ranges based on item type
            const maxIndexes = {
                gem: 4, // Assuming max gem index
                robot: 10, // Assuming max robot index
                coin: 5, // Assuming max coin index
                game_pass: 2, // Assuming max game pass index
            };

            const maxIndex = maxIndexes[data.itemType];
            return data.itemIndex <= maxIndex;
        },
        {
            message: "Item index exceeds maximum for this item type",
            path: ["itemIndex"],
        },
    );

export const invoiceSchema = z.object({
    invoiceId: z.string().min(1, "Invoice ID cannot be empty"),
});

// ===== FACTORY SCHEMAS =====

export const factoryUpgradeSchema = z.object({
    operation: operationSchema,
});

export const factoryBuildItemSchema = z.object({
    operation: operationSchema,
    itemId: z.string().min(1, "Item ID cannot be empty"),
    secondaryItemId: z.number().int().min(0).optional(),
    padId: z.string().min(1, "Pad ID cannot be empty"),
});

// ===== ENERGY GENERATOR SCHEMAS =====

export const energyGeneratorUpgradeSchema = z.object({
    operation: operationSchema,
});

// ===== MINE SCHEMAS =====

export const mineUpgradeSchema = z.object({
    mineId: z.number().int().min(0).max(2, "Mine ID must be between 0 and 2"),
    operation: operationSchema,
});

// ===== LAB SCHEMAS =====

export const labUpgradeSchema = z.object({
    operation: operationSchema,
});

export const labUpgradeItemSchema = z.object({
    itemId: z.string().min(1, "Item ID is required"),
});

// ===== LAUNCH SITE SCHEMAS =====

export const launchSiteUpgradeSchema = z.object({
    skipWithGem: z.boolean(),
});

export const launchItemSchema = z.object({
    itemType: z.enum(LAUNCHABLE_ITEMS),
});

// ===== PROFILE SCHEMAS =====

export const lootBoxOperationSchema = z.enum([
    "start",
    "end",
    "end-with-gems",
    "end-with-key",
]);

export const profileLootBoxSchema = z.object({
    lootBoxIndex: z
        .number()
        .int()
        .min(0)
        .max(4, "Lootbox index must be between 0 and 4"),
    operation: lootBoxOperationSchema,
});

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
} from "@/constants/mainProfile";
export const updateProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(
            PROFILE_NAME_MIN_LENGTH,
            `Name must be at least ${PROFILE_NAME_MIN_LENGTH} characters`,
        )
        .max(
            PROFILE_NAME_MAX_LENGTH,
            `Name must be at most ${PROFILE_NAME_MAX_LENGTH} characters`,
        )
        .regex(PROFILE_NAME_REGEX, "Name contains invalid characters")
        .refine(
            async (val) => {
                // Check local filter first (fast)
                if (isProfane(val)) return false;
                // Then check all async filters in parallel
                const [hive, profanityDev, sightenginePattern, sightengineML] =
                    await Promise.all([
                        isProfaneHive(val),
                        isProfaneProfanityDev(val),
                        isProfaneSightenginePattern(val),
                        isProfaneSightengineML(val),
                    ]);
                return !(
                    hive ||
                    profanityDev ||
                    sightenginePattern ||
                    sightengineML
                );
            },
            {
                message: "Name contains profane language",
            },
        )
        .optional(),
    profilePictureIndex: z
        .number()
        .int()
        .min(
            PROFILE_PFP_MIN_INDEX,
            `Profile picture index must be at least ${PROFILE_PFP_MIN_INDEX}`,
        )
        .max(
            PROFILE_PFP_MAX_INDEX,
            `Profile picture index must be at most ${PROFILE_PFP_MAX_INDEX}`,
        )
        .optional(),
    representedFlag: z
        .string()
        .refine((val) => ALLOWED_FLAGS.includes(val), {
            message: "Invalid flag code",
        })
        .optional(),
});

export const useReferralCodeSchema = z.object({
    refCode: z.string().min(1, "Referral code cannot be empty"),
});

// ===== PAYMENT SCHEMAS =====

export const paymentCallbackSchema = z.object({
    transactionObject: z.object({
        paylinkId: z.string(),
        meta: z.object({
            customerDetails: z.object({
                additionalJSON: z.string().optional(),
            }),
        }),
    }),
});

export const processInvoiceSchema = z.object({
    invoiceId: z.string().min(1, "Invoice ID cannot be empty"),
});

// ===== TYPE EXPORTS =====

// Export inferred types for use in controllers
export type MiniGame2Input = z.infer<typeof miniGame2Schema>;
export type MiniGame3Input = z.infer<typeof miniGame3Schema>;
export type MiniGame4Input = z.infer<typeof miniGame4Schema>;
export type ShopPurchaseInput = z.infer<typeof shopPurchaseSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type FactoryUpgradeInput = z.infer<typeof factoryUpgradeSchema>;
export type FactoryBuildItemInput = z.infer<typeof factoryBuildItemSchema>;
export type EnergyGeneratorUpgradeInput = z.infer<
    typeof energyGeneratorUpgradeSchema
>;
export type MineUpgradeInput = z.infer<typeof mineUpgradeSchema>;
export type LabUpgradeInput = z.infer<typeof labUpgradeSchema>;
export type LabUpgradeItemInput = z.infer<typeof labUpgradeItemSchema>;

export type LaunchSiteUpgradeInput = z.infer<typeof launchSiteUpgradeSchema>;
export type LaunchItemInput = z.infer<typeof launchItemSchema>;
export type ProfileLootBoxInput = z.infer<typeof profileLootBoxSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UseReferralCodeInput = z.infer<typeof useReferralCodeSchema>;
export type PaymentCallbackInput = z.infer<typeof paymentCallbackSchema>;
export type ProcessInvoiceInput = z.infer<typeof processInvoiceSchema>;

// ===== VALIDATION HELPERS =====

/**
 * Creates a validation middleware for Express routes
 */
export const validateBody = (schema: z.ZodSchema) => {
    return async (req: any, res: any, next: any) => {
        try {
            const validatedData = await schema.parseAsync(req.body);
            req.validatedBody = validatedData;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors = error.issues.map((err: any) => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code,
                }));

                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid input data",
                        details: formattedErrors,
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
};

/**
 * Validates query parameters
 */
export const validateQuery = (schema: z.ZodSchema) => {
    return (req: any, res: any, next: any) => {
        try {
            const validatedData = schema.parse(req.query);
            req.validatedQuery = validatedData;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors = error.issues.map((err: any) => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code,
                }));

                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid query parameters",
                        details: formattedErrors,
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
};

/**
 * Validates URL parameters
 */
export const validateParams = (schema: z.ZodSchema) => {
    return (req: any, res: any, next: any) => {
        try {
            const validatedData = schema.parse(req.params);
            req.validatedParams = validatedData;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors = error.issues.map((err: any) => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code,
                }));

                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid URL parameters",
                        details: formattedErrors,
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
};
