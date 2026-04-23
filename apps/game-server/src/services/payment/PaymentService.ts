import HelioPay, { GETChargeDetails } from "@/daos/helioPay/index.js";
import BillingDAO from "@/daos/redis/billing.js";
import ShopService from "@/services/shop/ShopService.js";
import { AdditionalJson } from "@/constants/payment.js";
import _ from "lodash";
import { paymentLogger } from "@/utils/logger.js";
import {
    PAYMENT_INVALID_PAYLINK,
    PAYMENT_INVALID_USER,
    PAYMENT_INVALID_INVOICE,
    PAYMENT_INVOICE_NOT_PAID,
    INVALID_INPUT,
} from "@/api/v1/errors/index.js";
import { appConfig } from "@/config/environment.js";

/**
 * PaymentService handles payment processing and validation logic.
 * This service is framework-agnostic and can be used from controllers,
 * WebSocket handlers, or other contexts.
 */
export default class PaymentService {
    /**
     * Validates payment callback data from webhook
     * @param paylinkId - The paylink ID from the webhook
     * @param additionalJSON - Additional JSON data containing userId, itemType, itemIndex
     * @returns Parsed additional data
     * @throws Error if validation fails
     */
    static validatePaymentCallback(
        paylinkId: string,
        additionalJSON: string | null | undefined,
    ): AdditionalJson {
        if (_.isNil(additionalJSON)) {
            paymentLogger.warn("Payment callback missing additionalJSON");
            throw INVALID_INPUT("Invalid additionalJSON");
        }

        const parsedData = JSON.parse(additionalJSON) as AdditionalJson;

        if (paylinkId !== appConfig.helio.payLink) {
            paymentLogger.warn("Payment callback with invalid paylinkId", {
                paylinkId,
            });
            throw PAYMENT_INVALID_PAYLINK;
        }

        return parsedData;
    }

    /**
     * Verifies that a charge ID exists in user's ongoing invoices
     * @param userId - User ID
     * @param itemType - Type of item being purchased
     * @param itemIndex - Index of the item
     * @returns The charge ID if found
     * @throws Error if user not found or invoice not found
     */
    static async verifyInvoiceInOngoingList(
        userId: string,
        itemType: string,
        itemIndex: number,
    ): Promise<string> {
        const userBillingProfile = await BillingDAO.findBillingById(userId);

        if (_.isNil(userBillingProfile)) {
            paymentLogger.warn("Payment verification for non-existent user", {
                userId,
            });
            throw PAYMENT_INVALID_USER;
        }

        const ongoingInvoices = userBillingProfile.ongoingInvoices;
        let targetChargeId: string = "";

        for (let i = 0; i < ongoingInvoices.length; i++) {
            const invoiceInfo = ongoingInvoices[i];
            const invoiceChunks = invoiceInfo.split("|");
            const storedChargeId = invoiceChunks[0];
            const storedItemType = invoiceChunks[1];
            const storedItemIndex = parseInt(invoiceChunks[2]);

            // Find the one that matches
            if (itemType === storedItemType && itemIndex === storedItemIndex) {
                targetChargeId = storedChargeId;
                break;
            }
        }

        if (!targetChargeId) {
            paymentLogger.warn("Payment invoice not found in ongoing list", {
                userId,
                itemType,
                itemIndex,
            });
            throw INVALID_INPUT("Invalid request - invoice not found");
        }

        return targetChargeId;
    }

    /**
     * Verifies invoice status with payment provider
     * @param chargeId - The charge ID to verify
     * @returns Charge details from payment provider
     * @throws Error if invoice is invalid or not paid
     */
    static async verifyInvoiceStatus(
        chargeId: string,
    ): Promise<GETChargeDetails> {
        const chargeDetail = await HelioPay.fetchCharge(chargeId);

        // Check if invoice is valid
        if (!_.isNil(chargeDetail.code) && chargeDetail.code !== 200) {
            paymentLogger.warn("Payment invoice invalid code from provider", {
                chargeId,
                code: chargeDetail.code,
            });
            throw PAYMENT_INVALID_INVOICE;
        }

        // Check if paylinkTx is null
        if (_.isNil(chargeDetail.paylinkTx)) {
            paymentLogger.warn("Payment invoice missing paylinkTx", {
                chargeId,
            });
            throw PAYMENT_INVOICE_NOT_PAID;
        }

        // Check if it's Paid
        if (chargeDetail.paylinkTx.meta.transactionStatus !== "SUCCESS") {
            paymentLogger.warn("Payment invoice not successful", {
                chargeId,
                status: chargeDetail.paylinkTx.meta.transactionStatus,
            });
            throw PAYMENT_INVOICE_NOT_PAID;
        }

        return chargeDetail;
    }

    /**
     * Processes a successful payment by applying it to the user's profile
     * @param userId - User ID
     * @param chargeId - The charge ID
     * @param itemType - Type of item purchased
     * @param itemIndex - Index of the item
     */
    static async processSuccessfulPayment(
        userId: string,
        chargeId: string,
        itemType: string,
        itemIndex: number,
    ): Promise<void> {
        await ShopService.applyPaidInvoiceToProfile(
            userId,
            chargeId,
            itemType,
            itemIndex,
        );
    }

    /**
     * Complete payment callback flow: validate, verify, and process
     * @param paylinkId - Paylink ID from webhook
     * @param additionalJSON - Additional JSON data
     * @returns Success status
     */
    static async handlePaymentCallback(
        paylinkId: string,
        additionalJSON: string | null | undefined,
    ): Promise<{ success: boolean }> {
        // Step 1: Validate callback data
        paymentLogger.info("Starting payment callback processing", {
            paylinkId,
        });
        const { userId, itemType, itemIndex } = this.validatePaymentCallback(
            paylinkId,
            additionalJSON,
        );

        // Step 2: Verify invoice exists in user's ongoing invoices
        const targetChargeId = await this.verifyInvoiceInOngoingList(
            userId,
            itemType,
            itemIndex,
        );

        // Step 3: Verify invoice status with payment provider
        const chargeDetail = await this.verifyInvoiceStatus(targetChargeId);

        // Step 4: Process successful payment
        if (chargeDetail.paylinkTx!.meta.transactionStatus === "SUCCESS") {
            await this.processSuccessfulPayment(
                userId,
                targetChargeId,
                itemType,
                itemIndex,
            );
            paymentLogger.info("Payment processed successfully", {
                userId,
                chargeId: targetChargeId,
                itemType,
                itemIndex,
            });
        }

        return { success: true };
    }
}
