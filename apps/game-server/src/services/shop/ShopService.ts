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
import BillingDAO from "@/daos/postgres/billing.ts";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import MainProfileDAO from "@/daos/postgres/mainProfile.ts";
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
    )
        return value;
    throw INVALID_INPUT("Invalid item type");
}

function toMoneyPurchaseResult(
    chargeId: string,
    itemType: ShopItemType,
    itemIndex: number,
    payUrl: string | null
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
 * Service for shop purchase flows.
 * Backed by PostgreSQL (BillingDAO + MainProfileDAO).
 */
export default class ShopService {
    static calculatePrice(itemType: ShopItemType, itemIndex: number): number {
        if (itemType === "gem")
            return SHOP_GEM_ITEMS[itemIndex as ShopGemItemIndex].cost;
        if (itemType === "game_pass")
            return SHOP_PASS_ITEMS[itemIndex as ShopPassItemIndex].cost;
        if (itemType === "robot")
            return SHOP_ROBOT_ITEMS[itemIndex as ShopRobotItemIndex].cost;
        if (itemType === "coin")
            return SHOP_COIN_ITEMS[itemIndex as ShopCoinItemIndex].cost;
        throw INVALID_INPUT("Invalid item type");
    }

    static async validatePurchase(
        userId: string,
        itemType: ShopItemType,
        itemIndex: number
    ): Promise<void> {
        if (itemType === "game_pass" && itemIndex !== 0)
            throw INVALID_INPUT("Invalid game pass item index");
        if (itemType === "game_pass") {
            const userProfile = await ProfileService.getProfile(userId);
            if (!userProfile) throw ERRORS.NOT_FOUND("MainProfile not found");
            if (userProfile.game_pass) {
                paymentLogger.warn("User tried to buy game pass again", {
                    userId,
                });
                throw INVALID_INPUT("User already has a game pass");
            }
        }
    }

    static async purchaseWithGems(
        userId: string,
        itemType: ShopItemType,
        itemIndex: number
    ): Promise<{ result: string }> {
        if (itemType === "robot")
            await this.addWorkerRobot(userId, itemIndex as ShopRobotItemIndex);
        else if (itemType === "coin")
            await this.purchaseCoins(userId, itemIndex as ShopCoinItemIndex);
        else throw INVALID_INPUT("Invalid item type for gem purchase");
        paymentLogger.info("Gem purchase successful", {
            userId,
            itemType,
            itemIndex,
        });
        return { result: "success" };
    }

    static async addWorkerRobot(
        userId: string,
        workerRobotIndex: ShopRobotItemIndex
    ) {
        try {
            const profile = await ProfileService.getProfile(userId);
            if (!profile) throw ERRORS.NOT_FOUND("MainProfile not found");
            if (workerRobotIndex === 0)
                throw ERRORS.VALIDATION("Robot already exists");
            if (profile.worker_bots[workerRobotIndex] === 1)
                throw ERRORS.VALIDATION("Robot already exists");
            if (profile.gems < SHOP_ROBOT_ITEMS[workerRobotIndex].cost)
                throw ERRORS.VALIDATION("Not enough gems");
            profile.gems -= SHOP_ROBOT_ITEMS[workerRobotIndex].cost;
            profile.worker_bots[workerRobotIndex] = 1;
            return await MainProfileDAO.saveProfile(profile);
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(
                `Failed to add worker robot: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async purchaseCoins(
        userId: string,
        coinItemIndex: ShopCoinItemIndex
    ) {
        try {
            const profile = await ProfileService.getProfile(userId);
            if (!profile) throw ERRORS.NOT_FOUND("MainProfile not found");
            if (profile.gems < SHOP_COIN_ITEMS[coinItemIndex].cost)
                throw ERRORS.VALIDATION("Not enough gems");
            profile.gems -= SHOP_COIN_ITEMS[coinItemIndex].cost;
            profile.coins += SHOP_COIN_ITEMS[coinItemIndex].coinAmount;
            return await MainProfileDAO.saveProfile(profile);
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(
                `Failed to purchase coins: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async addPurchasedGemsToProfile(
        userId: string,
        gemNum: number,
        ticketNum: number
    ) {
        try {
            const profile = await ProfileService.getProfile(userId);
            if (!profile) throw ERRORS.NOT_FOUND("MainProfile not found");
            profile.tickets_type1 += ticketNum;
            profile.gems += gemNum;
            await MainProfileDAO.saveProfile(profile);
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(
                `Failed to add purchased gems to profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async addPurchasedGamePassToProfile(userId: string) {
        try {
            const profile = await ProfileService.getProfile(userId);
            if (!profile) throw ERRORS.NOT_FOUND("MainProfile not found");
            profile.game_pass = true;
            profile.game_pass_purchase_time = new Date().toISOString();
            profile.tickets_type1 += SHOP_PASS_ITEMS[0].cost;
            profile.worker_bots[1] = 1;
            profile.energy_max =
                ENERGY_GENERATOR_MAX_ENERGY_VALUE_WITH_GAME_PASS;
            await MainProfileDAO.saveProfile(profile);
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            throw ERRORS.DB_ERROR(
                `Failed to add purchased game pass to profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async purchaseWithMoney(
        userId: string,
        itemType: ShopItemType,
        itemIndex: number
    ): Promise<MoneyPurchaseResult> {
        await this.validatePurchase(userId, itemType, itemIndex);
        const amountToBePaid = this.calculatePrice(itemType, itemIndex);
        const existingChargeId = await InvoiceService.findExistingInvoice(
            userId,
            itemType,
            itemIndex
        );
        if (existingChargeId)
            return await this.handleExistingInvoice(
                userId,
                existingChargeId,
                itemType,
                itemIndex
            );
        const paymentDetails = await InvoiceService.createInvoice(
            userId,
            itemType,
            itemIndex,
            amountToBePaid
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
            ...paymentDetails,
        };
    }

    private static async handleExistingInvoice(
        userId: string,
        chargeId: string,
        itemType: ShopItemType,
        itemIndex: number
    ): Promise<MoneyPurchaseResult> {
        const invoice = await InvoiceService.validateInvoice(chargeId);
        if (invoice.status === "pending" || invoice.status === "paying")
            return toMoneyPurchaseResult(
                chargeId,
                itemType,
                itemIndex,
                invoice.payUrl
            );
        if (invoice.status === "paid") {
            await this.handleInvoiceStatus(
                userId,
                chargeId,
                itemType,
                itemIndex,
                invoice.status
            );
            await InvoiceService.dropInvoice(
                userId,
                chargeId,
                itemType,
                itemIndex
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
                itemIndex
            );
            paymentLogger.warn("Previous payment failed during retry", {
                userId,
                chargeId,
                status: invoice.status,
            });
            throw INVALID_INPUT(
                "previous failed payment got removed, try again"
            );
        }
        return toMoneyPurchaseResult(
            chargeId,
            itemType,
            itemIndex,
            invoice.payUrl
        );
    }

    static async processPurchase(
        userId: string,
        itemType: ShopItemType,
        itemIndex: number,
        payBy: "gem" | "money"
    ): Promise<{ result: string } | MoneyPurchaseResult> {
        if (payBy === "gem")
            return await this.purchaseWithGems(userId, itemType, itemIndex);
        else if (payBy === "money")
            return await this.purchaseWithMoney(userId, itemType, itemIndex);
        throw INVALID_INPUT("Invalid payment method");
    }

    static async getInvoiceDetails(
        _userId: string,
        invoiceId: string
    ): Promise<ProviderInvoice> {
        const chunks = invoiceId.split("|");
        if (chunks.length !== 3) throw INVALID_INPUT("Invalid invoice format");
        return await InvoiceService.validateInvoice(chunks[0]);
    }

    static async applyPaidInvoiceToProfile(
        userId: string,
        storedTrackId: string,
        storedItemType: string,
        storedItemIndex: number
    ) {
        try {
            const billingProfile = await BillingDAO.findBillingById(userId);
            if (!billingProfile) throw ERRORS.NOT_FOUND("Billing not found");
            const targetInvoiceId = `${storedTrackId}|${storedItemType}|${storedItemIndex}`;
            const ongoing = billingProfile.ongoingInvoices;
            const finished = billingProfile.finishedInvoices;
            if (finished.includes(targetInvoiceId))
                throw ERRORS.VALIDATION("Invoice already processed");
            if (!ongoing.includes(targetInvoiceId))
                throw ERRORS.NOT_FOUND("Invoice not found in ongoing list");
            const itemType = parseShopItemType(storedItemType);
            if (itemType === "gem") {
                if (
                    storedItemIndex < 0 ||
                    storedItemIndex > SHOP_MAX_GEM_ITEM_INDEX
                )
                    throw ERRORS.VALIDATION(
                        `Invalid item index: ${storedItemIndex}`
                    );
                await this.addPurchasedGemsToProfile(
                    userId,
                    SHOP_GEM_ITEMS[storedItemIndex as ShopGemItemIndex]
                        .gemAmount,
                    SHOP_GEM_ITEMS[storedItemIndex as ShopGemItemIndex].cost
                );
            } else if (itemType === "game_pass") {
                await this.addPurchasedGamePassToProfile(userId);
            }
            finished.push(targetInvoiceId);
            const idx = ongoing.indexOf(targetInvoiceId);
            if (idx !== -1) ongoing.splice(idx, 1);
            billingProfile.ongoingInvoices = ongoing;
            billingProfile.finishedInvoices = finished;
            await BillingDAO.saveBillingProfile(billingProfile);
            return {};
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(
                `[ShopService.applyPaidInvoiceToProfile] Error for userId: ${userId}, trackId: ${storedTrackId}`,
                { error }
            );
            throw ERRORS.DB_ERROR(
                `Failed to apply paid invoice to profile: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    static async handleInvoiceStatus(
        userId: string,
        chargeId: string,
        itemType: ShopItemType,
        itemIndex: number,
        status: ProviderInvoiceStatus
    ): Promise<void> {
        if (status === "paid") {
            await this.applyPaidInvoiceToProfile(
                userId,
                chargeId,
                itemType,
                itemIndex
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
                itemIndex
            );
            paymentLogger.info("Invoice dropped (terminal status)", {
                userId,
                chargeId,
                status,
            });
        }
    }

    static async processInvoice(
        userId: string,
        invoiceId: string
    ): Promise<{ success: boolean }> {
        const chunks = invoiceId.split("|");
        const chargeId = chunks[0];
        const itemType = parseShopItemType(chunks[1]);
        const itemIndex = parseInt(chunks[2], 10);
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
            invoice.status
        );
        return { success: true };
    }
}
