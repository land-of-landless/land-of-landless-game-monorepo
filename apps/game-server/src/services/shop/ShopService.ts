import {
    SHOP_GEM_ITEMS,
    SHOP_COIN_ITEMS,
    SHOP_PASS_ITEMS,
    SHOP_ROBOT_ITEMS,
    SHOP_MAX_GEM_ITEM_INDEX,
    type ShopItemType,
    type ShopGemItemIndex,
    type ShopPassItemIndex,
    type ShopRobotItemIndex,
    type ShopCoinItemIndex,
} from "@/constants/shop.js";
import { ENERGY_GENERATOR_MAX_ENERGY_VALUE_WITH_GAME_PASS } from "@/constants/energyGenerator.js";
import BillingDAO from "@/daos/redis/billing.js";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import {
    mainProfileRepository,
    billingRepository,
} from "@/daos/redis/repositories/index.js";
import InvoiceService from "@/services/payment/InvoiceService.js";
import type {
    CreateInvoiceResult,
    ProviderInvoice,
    ProviderInvoiceStatus,
} from "@/services/payment/paymentProviderTypes.js";
import { paymentLogger, logger } from "@/utils/logger.js";
import { INVALID_INPUT } from "@/api/v1/errors/index.js";
import { ERRORS } from "@/common/errors/appError.js";

type MoneyPurchaseResult = CreateInvoiceResult & {
    invoiceId: string;
    itemType: ShopItemType;
    itemIndex: number;
};

function parseShopItemType(value: string): ShopItemType {
    if (
        value === "gem" ||
        value === "robot" ||
        value === "game_pass" ||
        value === "coin"
    ) {
        return value;
    }
    throw INVALID_INPUT("Invalid item type");
}

function toMoneyPurchaseResult(
    chargeId: string,
    itemType: ShopItemType,
    itemIndex: number,
    payUrl: string | null,
): MoneyPurchaseResult {
    const url = payUrl ?? "";
    return {
        invoiceId: chargeId,
        chargeId,
        trackId: chargeId,
        itemType,
        itemIndex,
        pageUrl: url,
        payUrl: url,
    };
}

/**
 * ShopService handles purchase flows and shop-related business logic
 */
export default class ShopService {
    /**
     * Calculates the price for an item
     * @param itemType - Type of item
     * @param itemIndex - Index of the item
     * @returns Price in the appropriate currency
     */
    static calculatePrice(itemType: ShopItemType, itemIndex: number): number {
        if (itemType === "gem") {
            return SHOP_GEM_ITEMS[itemIndex as ShopGemItemIndex].cost;
        }
        if (itemType === "game_pass") {
            return SHOP_PASS_ITEMS[itemIndex as ShopPassItemIndex].cost;
        }
        if (itemType === "robot") {
            return SHOP_ROBOT_ITEMS[itemIndex as ShopRobotItemIndex].cost;
        }
        if (itemType === "coin") {
            return SHOP_COIN_ITEMS[itemIndex as ShopCoinItemIndex].cost;
        }

        throw INVALID_INPUT("Invalid item type");
    }

    /**
     * Validates if a user can make a purchase
     * @param userId - User ID
     * @param itemType - Type of item
     * @param itemIndex - Index of the item
     */
    static async validatePurchase(
        userId: string,
        itemType: ShopItemType,
        itemIndex: number,
    ): Promise<void> {
        if (itemType === "game_pass" && itemIndex !== 0) {
            throw INVALID_INPUT("Invalid game pass item index");
        }

        if (itemType === "game_pass") {
            const userProfile = await ProfileService.getProfile(userId);
            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }
            if (userProfile.game_pass) {
                paymentLogger.warn("User tried to buy game pass again", {
                    userId,
                });
                throw INVALID_INPUT("User already has a game pass");
            }
        }
    }

    /**
     * Handles gem-based purchases
     * @param userId - User ID
     * @param itemType - Type of item
     * @param itemIndex - Index of the item
     * @returns Purchase result
     */
    static async purchaseWithGems(
        userId: string,
        itemType: ShopItemType,
        itemIndex: number,
    ): Promise<{ result: string }> {
        if (itemType === "robot") {
            await this.addWorkerRobot(
                userId,
                itemIndex as ShopRobotItemIndex,
            );
        } else if (itemType === "coin") {
            await this.purchaseCoins(
                userId,
                itemIndex as ShopCoinItemIndex,
            );
        } else {
            throw INVALID_INPUT("Invalid item type for gem purchase");
        }

        paymentLogger.info("Gem purchase successful", {
            userId,
            itemType,
            itemIndex,
        });

        return { result: "success" };
    }

    /**
     * Purchases and adds a new worker robot to the user's profile.
     */
    static async addWorkerRobot(
        userId: string,
        workerRobotIndex: ShopRobotItemIndex,
    ) {
        try {
            const fetchedUserProfile = await ProfileService.getProfile(userId);

            if (!fetchedUserProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // The first robot is given by default and cannot be purchased.
            if (workerRobotIndex === 0) {
                throw ERRORS.VALIDATION("Robot already exists");
            }

            // Check if the user already owns this robot.
            if (fetchedUserProfile.worker_bots[workerRobotIndex] === 1) {
                throw ERRORS.VALIDATION("Robot already exists");
            }

            // Get the gem cost from constants and check if the user can afford it.
            const amountOfGemToBePaid = SHOP_ROBOT_ITEMS[workerRobotIndex].cost;

            if (fetchedUserProfile.gems < amountOfGemToBePaid) {
                throw ERRORS.VALIDATION("Not enough gems");
            }

            // Deduct gems and activate the new worker bot.
            fetchedUserProfile.gems -= amountOfGemToBePaid;
            fetchedUserProfile.worker_bots[workerRobotIndex] = 1;

            return await mainProfileRepository.save(fetchedUserProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to add worker robot: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Purchases a pack of coins from the shop using gems.
     */
    static async purchaseCoins(
        userId: string,
        coinItemIndex: ShopCoinItemIndex,
    ) {
        try {
            const fetchedUserProfile = await ProfileService.getProfile(userId);

            if (!fetchedUserProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // Get the gem cost and coin amount from constants.
            const amountOfGemToBePaid = SHOP_COIN_ITEMS[coinItemIndex].cost;
            const amountOfCoinsToBeAdded =
                SHOP_COIN_ITEMS[coinItemIndex].coinAmount;

            // Check if the user has enough gems.
            if (fetchedUserProfile.gems < amountOfGemToBePaid) {
                throw ERRORS.VALIDATION("Not enough gems");
            }

            // Deduct gems and add the purchased coins.
            fetchedUserProfile.gems -= amountOfGemToBePaid;
            fetchedUserProfile.coins += amountOfCoinsToBeAdded;

            return await mainProfileRepository.save(fetchedUserProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to purchase coins: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Adds gems and tickets to a user's profile, typically after a real-money purchase.
     */
    static async addPurchasedGemsToProfile(
        userId: string,
        gemNum: number,
        ticketNum: number,
    ) {
        try {
            const fetchedUserProfile = await ProfileService.getProfile(userId);

            if (!fetchedUserProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // Add the purchased items to the user's profile.
            fetchedUserProfile.tickets_type1 += ticketNum;
            fetchedUserProfile.gems += gemNum;

            await mainProfileRepository.save(fetchedUserProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to add purchased gems to profile: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Activates the game pass for a user, applying all associated benefits.
     */
    static async addPurchasedGamePassToProfile(userId: string) {
        try {
            const fetchedUserProfile = await ProfileService.getProfile(userId);

            if (!fetchedUserProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            // Set game pass status and timestamp.
            fetchedUserProfile.game_pass = true;
            fetchedUserProfile.game_pass_purchase_time =
                new Date().toISOString();

            // Add tickets associated with the game pass purchase.
            fetchedUserProfile.tickets_type1 += SHOP_PASS_ITEMS[0].cost;

            // Unlock the second worker bot as part of the game pass benefits.
            fetchedUserProfile.worker_bots[1] = 1;

            // Increase the user's maximum energy capacity.
            fetchedUserProfile.energy_max =
                ENERGY_GENERATOR_MAX_ENERGY_VALUE_WITH_GAME_PASS;

            await mainProfileRepository.save(fetchedUserProfile);
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to add purchased game pass to profile: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Handles money-based purchases
     * @param userId - User ID
     * @param itemType - Type of item
     * @param itemIndex - Index of the item
     * @returns Invoice details
     */
    static async purchaseWithMoney(
        userId: string,
        itemType: ShopItemType,
        itemIndex: number,
    ): Promise<MoneyPurchaseResult> {
        // Validate purchase
        await this.validatePurchase(userId, itemType, itemIndex);

        // Calculate price
        const amountToBePaid = this.calculatePrice(itemType, itemIndex);

        // Check for existing invoice
        const existingChargeId = await InvoiceService.findExistingInvoice(
            userId,
            itemType,
            itemIndex,
        );

        if (existingChargeId) {
            // Handle existing invoice
            return await this.handleExistingInvoice(
                userId,
                existingChargeId,
                itemType,
                itemIndex,
            );
        }

        // Create new invoice
        const paymentDetails = await InvoiceService.createInvoice(
            userId,
            itemType,
            itemIndex,
            amountToBePaid,
        );

        if (!paymentDetails.chargeId) {
            paymentLogger.error("Failed to create invoice", {
                userId,
                itemType,
                itemIndex,
            });
            throw new Error("Failed to create invoice");
        }

        return {
            invoiceId: paymentDetails.chargeId,
            itemType,
            itemIndex,
            ...paymentDetails, // include other details if needed by controller
        };
    }

    /**
     * Handles an existing invoice by checking its status
     * @param userId - User ID
     * @param chargeId - Existing charge ID
     * @param itemType - Item type
     * @param itemIndex - Item index
     * @returns Invoice details or throws error
     */
    private static async handleExistingInvoice(
        userId: string,
        chargeId: string,
        itemType: ShopItemType,
        itemIndex: number,
    ): Promise<MoneyPurchaseResult> {
        const invoice = await InvoiceService.validateInvoice(chargeId);

        if (invoice.status === "pending" || invoice.status === "paying") {
            return toMoneyPurchaseResult(
                chargeId,
                itemType,
                itemIndex,
                invoice.payUrl,
            );
        }

        if (invoice.status === "paid") {
            await this.handleInvoiceStatus(
                userId,
                chargeId,
                itemType,
                itemIndex,
                invoice.status,
            );
            await InvoiceService.dropInvoice(
                userId,
                chargeId,
                itemType,
                itemIndex,
            );
            paymentLogger.warn("Previous payment processed during retry", {
                userId,
                chargeId,
            });
            throw INVALID_INPUT("a previous payment got processed, try again");
        }

        if (invoice.status === "failed" || invoice.status === "expired") {
            await InvoiceService.dropInvoice(
                userId,
                chargeId,
                itemType,
                itemIndex,
            );
            paymentLogger.warn("Previous payment failed during retry", {
                userId,
                chargeId,
                status: invoice.status,
            });
            throw INVALID_INPUT(
                "previous failed payment got removed, try again",
            );
        }

        return toMoneyPurchaseResult(
            chargeId,
            itemType,
            itemIndex,
            invoice.payUrl,
        );
    }

    /**
     * Main purchase processing method
     * @param userId - User ID
     * @param itemType - Type of item
     * @param itemIndex - Index of the item
     * @param payBy - Payment method ("gem" or "money")
     * @returns Purchase result
     */
    static async processPurchase(
        userId: string,
        itemType: ShopItemType,
        itemIndex: number,
        payBy: "gem" | "money",
    ): Promise<{ result: string } | MoneyPurchaseResult> {
        if (payBy === "gem") {
            return await this.purchaseWithGems(userId, itemType, itemIndex);
        } else if (payBy === "money") {
            return await this.purchaseWithMoney(userId, itemType, itemIndex);
        }

        throw INVALID_INPUT("Invalid payment method");
    }

    /**
     * Gets invoice details
     * @param userId - User ID
     * @param invoiceId - Invoice ID in format "chargeId|itemType|itemIndex"
     * @returns Invoice details from payment provider
     */
    static async getInvoiceDetails(
        _userId: string,
        invoiceId: string,
    ): Promise<ProviderInvoice> {
        const invoiceChunks = invoiceId.split("|");

        if (invoiceChunks.length !== 3) {
            throw INVALID_INPUT("Invalid invoice format");
        }

        const chargeId = invoiceChunks[0];

        return await InvoiceService.validateInvoice(chargeId);
    }

    /**
     * Processes a successfully paid invoice. It moves the invoice from "ongoing" to "finished"
     * and applies the purchased items (gems, game pass) to the user's profile.
     * @param userId - The ID of the user.
     * @param storedTrackId - The unique tracking ID for the transaction.
     * @param storedItemType - The type of item purchased (e.g., "gem", "game_pass").
     * @param storedItemIndex - The index of the specific item within its type.
     */
    static async applyPaidInvoiceToProfile(
        userId: string,
        storedTrackId: string,
        storedItemType: string,
        storedItemIndex: number,
    ) {
        try {
            const billingProfile = await BillingDAO.findBillingById(userId);

            if (!billingProfile) {
                throw ERRORS.NOT_FOUND("Billing not found");
            }

            // Reconstruct the invoice ID to match the format stored in the ongoing list.
            const targetInvoiceId = `${storedTrackId}|${storedItemType}|${storedItemIndex}`;

            const ongoingInvoices = billingProfile.ongoingInvoices;
            const finishedInvoices = billingProfile.finishedInvoices;

            let flag = false;
            // Verify that the invoice exists in the ongoing list before processing.
            for (let i = 0; i < ongoingInvoices.length; i++) {
                if (ongoingInvoices[i] === targetInvoiceId) {
                    flag = true;

                    break;
                }
            }

            // Ensure the invoice is not already processed.
            for (let i = 0; i < finishedInvoices.length; i++) {
                if (finishedInvoices[i] === targetInvoiceId) {
                    throw ERRORS.VALIDATION("Invoice already processed");
                }
            }

            // If the invoice is not found, it might have been processed already or is invalid.
            if (!flag) {
                throw ERRORS.NOT_FOUND("Invoice not found in ongoing list");
            }

            // --- Apply Purchase to User Profile ---
            const itemType = parseShopItemType(storedItemType);

            if (itemType === "gem") {
                if (
                    storedItemIndex < 0 ||
                    storedItemIndex > SHOP_MAX_GEM_ITEM_INDEX
                ) {
                    throw ERRORS.VALIDATION(
                        `Invalid item index: ${storedItemIndex}`,
                    );
                }

                const gemNum =
                    SHOP_GEM_ITEMS[storedItemIndex as ShopGemItemIndex]
                        .gemAmount;

                const ticketNum =
                    SHOP_GEM_ITEMS[storedItemIndex as ShopGemItemIndex].cost;

                // Add the purchased items to the user's main profile.
                await this.addPurchasedGemsToProfile(userId, gemNum, ticketNum);
            } else if (itemType === "game_pass") {
                await this.addPurchasedGamePassToProfile(userId);
            }

            // Add the processed invoice to the list of finished invoices for historical tracking.
            finishedInvoices.push(targetInvoiceId);

            // Remove the processed invoice from the ongoing list.
            for (let i = 0; i < ongoingInvoices.length; i++) {
                if (ongoingInvoices[i] === targetInvoiceId) {
                    ongoingInvoices.splice(i, 1);
                    break;
                }
            }

            billingProfile.ongoingInvoices = ongoingInvoices;
            billingProfile.finishedInvoices = finishedInvoices;
            await billingRepository.save(billingProfile);

            return {};
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[ShopService.applyPaidInvoiceToProfile] Error for userId: ${userId}, trackId: ${storedTrackId}`,
                { error },
            );
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            throw ERRORS.DB_ERROR(
                `Failed to apply paid invoice to profile: ${errorMessage}`,
            );
        }
    }

    /**
     * Handles invoice based on its status
     * @param userId - User ID
     * @param chargeId - Charge ID
     * @param itemType - Item type
     * @param itemIndex - Item index
     * @param status - Transaction status
     */
    static async handleInvoiceStatus(
        userId: string,
        chargeId: string,
        itemType: ShopItemType,
        itemIndex: number,
        status: ProviderInvoiceStatus,
    ): Promise<void> {
        if (status === "paid") {
            await this.applyPaidInvoiceToProfile(
                userId,
                chargeId,
                itemType,
                itemIndex,
            );
            paymentLogger.info("Invoice processed successfully", {
                userId,
                chargeId,
                itemType,
                itemIndex,
            });
        } else if (status === "failed" || status === "expired") {
            await InvoiceService.dropInvoice(
                userId,
                chargeId,
                itemType,
                itemIndex,
            );
            paymentLogger.info("Invoice dropped (terminal status)", {
                userId,
                chargeId,
                status,
            });
        }
    }

    /**
     * Processes an existing invoice by checking its status and handling accordingly
     * @param userId - User ID
     * @param invoiceId - Invoice ID in format "chargeId|itemType|itemIndex"
     */
    static async processInvoice(
        userId: string,
        invoiceId: string,
    ): Promise<{ success: boolean }> {
        const invoiceChunks = invoiceId.split("|");

        const chargeId = invoiceChunks[0];
        const itemType = parseShopItemType(invoiceChunks[1]);
        const itemIndex = parseInt(invoiceChunks[2], 10);

        const invoice = await InvoiceService.validateInvoice(chargeId);

        if (invoice.status === "pending" || invoice.status === "paying") {
            paymentLogger.warn("Invoice processing failed - not paid yet", {
                chargeId,
                status: invoice.status,
            });
            throw ERRORS.NOT_FOUND("Invoice not paid yet");
        }

        await this.handleInvoiceStatus(
            userId,
            chargeId,
            itemType,
            itemIndex,
            invoice.status,
        );

        return { success: true };
    }
}
