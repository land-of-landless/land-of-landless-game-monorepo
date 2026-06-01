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
import { BillingDAO } from "@/daos/postgres/billing.js";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import { MainProfileDAO } from "@/daos/postgres/mainProfile.js";
import InvoiceService from "@/services/payment/InvoiceService.js";
import type {
    CreateInvoiceResult,
    ProviderInvoice,
    ProviderInvoiceStatus,
} from "@/services/payment/paymentProviderTypes.js";
import { paymentLogger, logger } from "@/utils/logger.js";
import { INVALID_INPUT } from "@/api/v1/errors/index.js";
import { ERRORS } from "@/common/errors/appError.js";
import _ from "lodash";

type MoneyPurchaseResult = any;

const parseShopItemType = (type: string): ShopItemType => {
    if (["gem", "coin", "game_pass", "robot"].includes(type)) {
        return type as ShopItemType;
    }
    throw INVALID_INPUT("Invalid shop item type");
};

const toMoneyPurchaseResult = (
    chargeId: string,
    itemType: ShopItemType,
    itemIndex: number,
    payUrl: string,
): any => ({
    chargeId,
    itemType,
    itemIndex,
    payUrl,
});

export default class ShopService {
    private static async addPurchasedGemsToProfile(
        userId: string,
        gemAmount: number,
        ticketAmount: number,
    ): Promise<void> {
        const fetchedUserProfile = await ProfileService.getProfile(userId);
        fetchedUserProfile.gems += gemAmount;
        fetchedUserProfile.tickets_type1 += ticketAmount;
        await MainProfileDAO.saveProfile(fetchedUserProfile);
    }

    private static async addPurchasedGamePassToProfile(
        userId: string,
    ): Promise<void> {
        const fetchedUserProfile = await ProfileService.getProfile(userId);
        fetchedUserProfile.game_pass = true;
        fetchedUserProfile.energy_max =
            ENERGY_GENERATOR_MAX_ENERGY_VALUE_WITH_GAME_PASS;
        fetchedUserProfile.game_pass_purchase_time = new Date().toISOString();
        await MainProfileDAO.saveProfile(fetchedUserProfile);
    }

    static async purchaseWithGems(
        userId: string,
        itemType: ShopItemType,
        itemIndex: number,
    ): Promise<{ result: string }> {
        const fetchedUserProfile = await ProfileService.getProfile(userId);

        if (itemType === "coin") {
            const coinItem: any =
                SHOP_COIN_ITEMS[itemIndex as ShopCoinItemIndex];
            if (!coinItem) throw INVALID_INPUT("Invalid coin item");

            await ProfileService.deductGems(userId, coinItem.cost);
            fetchedUserProfile.coins += coinItem.coinAmount;
            await MainProfileDAO.saveProfile(fetchedUserProfile);
        } else if (itemType === "robot") {
            const robotItem: any =
                SHOP_ROBOT_ITEMS[itemIndex as ShopRobotItemIndex];
            if (!robotItem) throw INVALID_INPUT("Invalid robot item");

            await ProfileService.deductGems(userId, robotItem.cost);
            fetchedUserProfile.worker_bots.push(0);
            await MainProfileDAO.saveProfile(fetchedUserProfile);
        } else {
            throw INVALID_INPUT("This item cannot be purchased with gems");
        }

        return { result: "Purchase successful" };
    }

    static async purchaseWithMoney(
        userId: string,
        itemType: ShopItemType,
        itemIndex: number,
    ): Promise<any> {
        const chargeId = await InvoiceService.findExistingInvoice(
            userId,
            itemType,
            itemIndex,
        );

        if (chargeId) {
            return await this.handleExistingInvoice(
                userId,
                chargeId,
                itemType,
                itemIndex,
            );
        }

        let amount = 0;
        if (itemType === "gem") {
            const gemItem = SHOP_GEM_ITEMS[itemIndex as ShopGemItemIndex];
            if (!gemItem) throw INVALID_INPUT("Invalid gem item");
            amount = gemItem.cost;
        } else if (itemType === "game_pass") {
            const passItem =
                SHOP_PASS_ITEMS[itemIndex as ShopPassItemIndex];
            if (!passItem) throw INVALID_INPUT("Invalid game pass");
            amount = passItem.cost;
        } else {
            throw INVALID_INPUT("This item cannot be purchased with money");
        }

        const paymentDetails = await InvoiceService.createInvoice(
            userId,
            itemType,
            itemIndex,
            amount,
        );

        return toMoneyPurchaseResult(
            paymentDetails.chargeId,
            itemType,
            itemIndex,
            paymentDetails.payUrl,
        );
    }

    private static async handleExistingInvoice(
        userId: string,
        chargeId: string,
        itemType: ShopItemType,
        itemIndex: number,
    ): Promise<any> {
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

    static async processPurchase(
        userId: string,
        itemType: ShopItemType,
        itemIndex: number,
        payBy: "gem" | "money",
    ): Promise<{ result: string } | any> {
        if (payBy === "gem") {
            return await this.purchaseWithGems(userId, itemType, itemIndex);
        } else if (payBy === "money") {
            return await this.purchaseWithMoney(userId, itemType, itemIndex);
        }

        throw INVALID_INPUT("Invalid payment method");
    }

    static async getInvoiceDetails(
        _userId: string,
        invoiceId: string,
    ): Promise<ProviderInvoice> {
        const invoiceChunks = invoiceId.split("|");
        if (invoiceChunks.length !== 3) throw INVALID_INPUT("Invalid invoice format");
        const chargeId = invoiceChunks[0];
        return await InvoiceService.validateInvoice(chargeId);
    }

    static async applyPaidInvoiceToProfile(
        userId: string,
        storedTrackId: string,
        storedItemType: string,
        storedItemIndex: number,
    ) {
        try {
            const billingProfile = await BillingDAO.findBillingById(userId);
            if (!billingProfile) throw ERRORS.NOT_FOUND("Billing not found");
            const targetInvoiceId = `${storedTrackId}|${storedItemType}|${storedItemIndex}`;
            const ongoingInvoices = billingProfile.ongoingInvoices;
            const finishedInvoices = billingProfile.finishedInvoices;

            let flag = false;
            for (let i = 0; i < ongoingInvoices.length; i++) {
                if (ongoingInvoices[i] === targetInvoiceId) {
                    flag = true;
                    break;
                }
            }

            for (let i = 0; i < finishedInvoices.length; i++) {
                if (finishedInvoices[i] === targetInvoiceId) {
                    throw ERRORS.VALIDATION("Invoice already processed");
                }
            }

            if (!flag) throw ERRORS.NOT_FOUND("Invoice not found in ongoing list");

            const itemType = parseShopItemType(storedItemType);
            if (itemType === "gem") {
                if (storedItemIndex < 0 || storedItemIndex > SHOP_MAX_GEM_ITEM_INDEX) {
                    throw ERRORS.VALIDATION(`Invalid item index: ${storedItemIndex}`);
                }
                const gemItem: any = SHOP_GEM_ITEMS[storedItemIndex as ShopGemItemIndex];
                await this.addPurchasedGemsToProfile(userId, gemItem.gemAmount, gemItem.cost);
            } else if (itemType === "game_pass") {
                await this.addPurchasedGamePassToProfile(userId);
            }

            finishedInvoices.push(targetInvoiceId);
            for (let i = 0; i < ongoingInvoices.length; i++) {
                if (ongoingInvoices[i] === targetInvoiceId) {
                    ongoingInvoices.splice(i, 1);
                    break;
                }
            }

            billingProfile.ongoingInvoices = ongoingInvoices;
            billingProfile.finishedInvoices = finishedInvoices;
            await BillingDAO.saveBillingProfile(billingProfile);

            return {};
        } catch (error) {
            if (error instanceof Error && "code" in error) throw error;
            logger.error(`[ShopService.applyPaidInvoiceToProfile] Error for userId: ${userId}, trackId: ${storedTrackId}`, { error });
            throw ERRORS.DB_ERROR(`Failed to apply paid invoice to profile: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    static async handleInvoiceStatus(
        userId: string,
        chargeId: string,
        itemType: ShopItemType,
        itemIndex: number,
        status: ProviderInvoiceStatus,
    ): Promise<void> {
        if (status === "paid") {
            await this.applyPaidInvoiceToProfile(userId, chargeId, itemType, itemIndex);
        } else if (status === "failed" || status === "expired") {
            await InvoiceService.dropInvoice(userId, chargeId, itemType, itemIndex);
        }
    }

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
            throw ERRORS.NOT_FOUND("Invoice not paid yet");
        }

        await this.handleInvoiceStatus(userId, chargeId, itemType, itemIndex, invoice.status);
        return { success: true };
    }
}
