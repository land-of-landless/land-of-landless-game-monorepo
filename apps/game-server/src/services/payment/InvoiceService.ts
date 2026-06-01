import OxaPay from "@/daos/oxaPay/index.js";
import { BillingDAO } from "@/daos/postgres/billing.js";
import _ from "lodash";
import { paymentLogger } from "@/utils/logger.js";
import {
    PAYMENT_INVALID_USER,
    PAYMENT_INVALID_INVOICE,
} from "@/api/v1/errors/index.js";
import type { ProviderInvoice } from "@/services/payment/paymentProviderTypes.js";
import type { ShopItemType } from "@/constants/shop.js";

/**
 * InvoiceService handles invoice management logic including
 * creation, validation, and status handling.
 */
export default class InvoiceService {
    /**
     * Finds an existing invoice for a specific item
     * @param userId - User ID
     * @param itemType - Type of item
     * @param itemIndex - Index of the item
     * @returns Charge ID if found, empty string otherwise
     */
    static async findExistingInvoice(
        userId: string,
        itemType: ShopItemType,
        itemIndex: number,
    ): Promise<string> {
        const userBillingProfile = await BillingDAO.findBillingById(userId);

        if (_.isNil(userBillingProfile)) {
            paymentLogger.warn("Invoice creation for non-existent user", {
                userId,
            });
            throw PAYMENT_INVALID_USER;
        }

        const ongoingInvoices = userBillingProfile.ongoingInvoices;
        let existingChargeId = "";

        for (let i = 0; i < ongoingInvoices.length; i++) {
            const invoiceInfo = ongoingInvoices[i];
            const invoiceChunks = invoiceInfo.split("|");
            const storedChargeId = invoiceChunks[0];
            const storedItemType = invoiceChunks[1];
            const storedItemIndex = parseInt(invoiceChunks[2]);

            if (itemType === storedItemType && itemIndex === storedItemIndex) {
                existingChargeId = storedChargeId;
                break;
            }
        }

        return existingChargeId;
    }

    /**
     * Creates a new invoice with the payment provider
     * @param userId - User ID
     * @param itemType - Type of item
     * @param itemIndex - Index of the item
     * @param amount - Amount to charge (USD)
     * @returns Payment details including charge ID and payment URL
     */
    static async createInvoice(
        userId: string,
        itemType: ShopItemType,
        itemIndex: number,
        amount: number,
    ) {
        const paymentDetails = await OxaPay.createInvoice({
            userId,
            itemType,
            itemIndex,
            amountUsd: amount,
        });

        paymentLogger.info("Invoice created", {
            userId,
            itemType,
            itemIndex,
            amount,
            chargeId: paymentDetails.chargeId,
        });

        const billingProfile = await BillingDAO.findBillingById(userId);
        if (!billingProfile) {
            throw PAYMENT_INVALID_USER;
        }

        const invoiceId = `${paymentDetails.chargeId}|${itemType}|${itemIndex}`;
        const ongoingInvoices = billingProfile.ongoingInvoices;

        for (let i = 0; i < ongoingInvoices.length; i++) {
            if (ongoingInvoices[i] === invoiceId) {
                ongoingInvoices.splice(i, 1);
                break;
            }
        }

        billingProfile.ongoingInvoices.push(invoiceId);
        await BillingDAO.saveBillingProfile(billingProfile);

        return paymentDetails;
    }

    /**
     * Validates an invoice with the payment provider
     * @param chargeId - The track ID to validate
     * @returns Normalized provider invoice
     */
    static async validateInvoice(chargeId: string): Promise<ProviderInvoice> {
        const invoice = await OxaPay.getPaymentInfo(chargeId);

        if (!invoice.trackId) {
            paymentLogger.warn("Invoice validation failed - missing trackId", {
                chargeId,
            });
            throw new Error("Invalid invoice from payment provider");
        }

        return invoice;
    }

    /**
     * Drops an invoice from ongoing invoices
     * @param userId - User ID
     * @param chargeId - Charge ID (track ID)
     * @param itemType - Item type
     * @param itemIndex - Item index
     */
    static async dropInvoice(
        userId: string,
        chargeId: string,
        itemType: string,
        itemIndex: number,
    ): Promise<void> {
        const billingProfile = await BillingDAO.findBillingById(userId);
        if (!billingProfile) {
            throw PAYMENT_INVALID_USER;
        }

        const invoiceId = `${chargeId}|${itemType}|${itemIndex}`;
        const ongoingInvoices = billingProfile.ongoingInvoices;
        let flag = false;

        for (let i = 0; i < ongoingInvoices.length; i++) {
            if (ongoingInvoices[i] === invoiceId) {
                flag = true;
                ongoingInvoices.splice(i, 1);
                break;
            }
        }

        if (!flag) {
            paymentLogger.warn("Invoice not found in ongoing list", {
                userId,
                invoiceId,
            });
            throw PAYMENT_INVALID_INVOICE;
        }

        billingProfile.ongoingInvoices = ongoingInvoices;
        await BillingDAO.saveBillingProfile(billingProfile);
    }
}
