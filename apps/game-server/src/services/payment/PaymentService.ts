import OxaPay from "@/daos/oxaPay/index.js";
import { BillingDAO } from "@/daos/postgres/billing.js";
import ShopService from "@/services/shop/ShopService.js";
import { AdditionalJson } from "@/constants/payment.js";
import _ from "lodash";
import { paymentLogger } from "@/utils/logger.js";
import {
    PAYMENT_INVALID_USER,
    PAYMENT_INVALID_INVOICE,
    PAYMENT_INVOICE_NOT_PAID,
    INVALID_INPUT,
} from "@/api/v1/errors/index.js";
import type {
    ProviderInvoice,
    ProviderInvoiceStatus,
} from "@/services/payment/paymentProviderTypes.js";

/**
 * PaymentService handles payment processing and validation logic.
 */
export default class PaymentService {
    /**
     * Validates payment callback data from OxaPay webhook order_id
     */
    static validatePaymentCallback(orderId: string | null | undefined): AdditionalJson {
        if (_.isNil(orderId) || orderId === "") {
            paymentLogger.warn("Payment callback missing order_id");
            throw INVALID_INPUT("Invalid order_id");
        }

        try {
            return OxaPay.parseOrderId(orderId);
        } catch {
            paymentLogger.warn("Payment callback invalid order_id JSON");
            throw INVALID_INPUT("Invalid order_id");
        }
    }

    static async verifyInvoiceInOngoingList(
        userId: string,
        itemType: string,
        itemIndex: number,
        expectedTrackId?: string,
    ): Promise<string> {
        const userBillingProfile = await BillingDAO.findBillingById(userId);

        if (_.isNil(userBillingProfile)) {
            paymentLogger.warn("Payment verification for non-existent user", {
                userId,
            });
            throw PAYMENT_INVALID_USER;
        }

        const ongoingInvoices = userBillingProfile.ongoingInvoices;
        let targetChargeId = "";

        for (let i = 0; i < ongoingInvoices.length; i++) {
            const invoiceInfo = ongoingInvoices[i];
            const invoiceChunks = invoiceInfo.split("|");
            const storedChargeId = invoiceChunks[0];
            const storedItemType = invoiceChunks[1];
            const storedItemIndex = parseInt(invoiceChunks[2]);

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

        if (
            expectedTrackId &&
            targetChargeId !== expectedTrackId
        ) {
            paymentLogger.warn("Payment track_id mismatch with ongoing invoice", {
                userId,
                expectedTrackId,
            });
            throw INVALID_INPUT("Invalid request - invoice mismatch");
        }

        return targetChargeId;
    }

    static assertInvoicePaid(invoice: ProviderInvoice): void {
        if (invoice.status !== "paid") {
            paymentLogger.warn("Payment invoice not paid", {
                status: invoice.status,
            });
            throw PAYMENT_INVOICE_NOT_PAID;
        }
    }

    /**
     * Verifies invoice status with payment provider
     */
    static async verifyInvoiceStatus(
        chargeId: string,
    ): Promise<ProviderInvoice> {
        let invoice: ProviderInvoice;

        try {
            invoice = await OxaPay.getPaymentInfo(chargeId);
        } catch {
            paymentLogger.warn("Payment invoice fetch failed", { chargeId });
            throw PAYMENT_INVALID_INVOICE;
        }

        if (!invoice.trackId) {
            throw PAYMENT_INVALID_INVOICE;
        }

        this.assertInvoicePaid(invoice);

        return invoice;
    }

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
     */
    static async handlePaymentCallback(
        trackId: string,
        orderId: string | null | undefined,
        webhookStatus?: ProviderInvoiceStatus,
    ): Promise<{ success: boolean }> {
        paymentLogger.info("Starting payment callback processing", {
            trackId,
            webhookStatus,
        });

        const { userId, itemType, itemIndex } =
            this.validatePaymentCallback(orderId);

        const targetChargeId = await this.verifyInvoiceInOngoingList(
            userId,
            itemType,
            itemIndex,
            trackId,
        );

        const statusToFulfill =
            webhookStatus === "paid"
                ? "paid"
                : (
                      await OxaPay.getPaymentInfo(targetChargeId)
                  ).status;

        if (statusToFulfill === "pending" || statusToFulfill === "paying") {
            paymentLogger.info("Payment callback acknowledged (not paid yet)", {
                userId,
                chargeId: targetChargeId,
                status: statusToFulfill,
            });
            return { success: true };
        }

        if (statusToFulfill !== "paid") {
            paymentLogger.info("Payment callback ignored (terminal non-paid status)", {
                userId,
                chargeId: targetChargeId,
                status: statusToFulfill,
            });
            return { success: true };
        }

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

        return { success: true };
    }
}
