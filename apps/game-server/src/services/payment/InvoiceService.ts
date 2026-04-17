import HelioPay, { GETChargeDetails } from "@/daos/helioPay";
import BillingDAO from "@/daos/redis/billing";
import _ from "lodash";
import { SHOP_PASS_ITEMS_INDEX } from "@/constants/shop";
import { paymentLogger } from "@/utils/logger";
import {
    PAYMENT_INVALID_USER,
    PAYMENT_INVALID_INVOICE,
    PAYMENT_INVOICE_NOT_PAID,
} from "@/api/v1/errors/index";
import { appConfig } from "@/config/environment";

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
        itemType: string,
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
     * @param amount - Amount to charge
     * @returns Payment details including charge ID
     */
    static async createInvoice(
        userId: string,
        itemType: string,
        itemIndex: number,
        amount: number,
    ) {
        const paymentDetails = await HelioPay.generateCharge(
            userId,
            itemType,
            itemIndex,
            appConfig.helio.payLink,
            amount,
        );

        paymentLogger.info("Invoice created", {
            userId,
            itemType,
            itemIndex,
            amount,
            chargeId: paymentDetails.chargeId,
        });

        // Sync with user billing profile
        const billingProfile = await BillingDAO.findBillingById(userId);
        if (!billingProfile) {
            throw PAYMENT_INVALID_USER;
        }

        const invoiceId = `${paymentDetails.chargeId}|${itemType}|${itemIndex}`;
        const ongoingInvoices = billingProfile.ongoingInvoices;

        // To prevent duplicates, remove any existing instance of the same invoice ID.
        for (let i = 0; i < ongoingInvoices.length; i++) {
            if (ongoingInvoices[i] === invoiceId) {
                ongoingInvoices.splice(i, 1);
                break;
            }
        }

        // Add the new invoice ID to the list.
        billingProfile.ongoingInvoices.push(invoiceId);
        await BillingDAO.saveBillingProfile(billingProfile);

        return paymentDetails;
    }

    /**
     * Validates an invoice with the payment provider
     * @param chargeId - The charge ID to validate
     * @returns Charge details
     * @throws Error if invoice is invalid
     */
    static async validateInvoice(chargeId: string): Promise<GETChargeDetails> {
        const chargeDetail = await HelioPay.fetchCharge(chargeId);

        // Check if invoice is valid
        if (!_.isNil(chargeDetail.code) && chargeDetail.code !== 200) {
            paymentLogger.warn("Invoice validation failed", {
                chargeId,
                code: chargeDetail.code,
            });
            throw PAYMENT_INVALID_INVOICE;
        }

        return chargeDetail;
    }

    /**
     * Drops an invoice from ongoing invoices
     * @param userId - User ID
     * @param chargeId - Charge ID
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

        // Find the invoice in the array and remove it.
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
            // We can decide whether to throw or just log.
            // For consistency with original logic:
            throw PAYMENT_INVALID_INVOICE;
        }

        billingProfile.ongoingInvoices = ongoingInvoices;
        await BillingDAO.saveBillingProfile(billingProfile);
    }
}
