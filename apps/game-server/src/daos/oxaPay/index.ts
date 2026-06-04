import crypto from "crypto";
import oxaPayAxiosInstance from "@/axios/oxaPayAxiosInstance";
import { appConfig, isDevelopment } from "@/config/environment";
import { paymentLogger } from "@/utils/logger";
import type { AdditionalJson } from "@/constants/payment";
import type { ShopItemType } from "@/constants/shop";
import type {
    CreateInvoiceResult,
    ProviderInvoice,
} from "@/services/payment/paymentProviderTypes";
import type {
    OxaPayApiResponse,
    OxaPayCreateInvoiceData,
    OxaPayNormalizedStatus,
    OxaPayPaymentInfoData,
    OxaPayWebhookPayload,
} from "./types";

export type { OxaPayWebhookPayload } from "./types";

function pickTrackId(data: {
    track_id?: string;
    trackId?: string;
}): string | undefined {
    return data.track_id ?? data.trackId;
}

function pickPayLink(data: {
    pay_link?: string;
    payLink?: string;
    payment_url?: string;
    paymentUrl?: string;
}): string | undefined {
    return data.pay_link ?? data.payLink ?? data.payment_url ?? data.paymentUrl;
}

export function normalizeOxaPayStatus(
    rawStatus: string | undefined,
): OxaPayNormalizedStatus {
    if (!rawStatus) {
        return "pending";
    }

    const normalized = rawStatus.trim().toLowerCase();

    if (
        normalized === "paid" ||
        normalized === "confirmed" ||
        normalized === "complete" ||
        normalized === "completed"
    ) {
        return "paid";
    }

    if (normalized === "paying" || normalized === "confirming") {
        return "paying";
    }

    if (
        normalized === "expired" ||
        normalized === "timeout" ||
        normalized === "cancelled" ||
        normalized === "canceled"
    ) {
        return "expired";
    }

    if (
        normalized === "failed" ||
        normalized === "underpaid" ||
        normalized === "under_paid" ||
        normalized === "rejected"
    ) {
        return "failed";
    }

    return "pending";
}

function toProviderInvoice(
    trackId: string,
    data: OxaPayPaymentInfoData,
): ProviderInvoice {
    const amountRaw = data.amount;
    const amount =
        amountRaw === undefined || amountRaw === null
            ? null
            : typeof amountRaw === "number"
              ? amountRaw
              : parseFloat(String(amountRaw));

    return {
        trackId,
        payUrl: pickPayLink(data) ?? null,
        status: normalizeOxaPayStatus(data.status),
        amount: Number.isFinite(amount) ? amount : null,
        currency: data.currency ?? null,
        orderId: data.order_id ?? data.orderId ?? null,
    };
}

function assertApiSuccess<T>(
    response: OxaPayApiResponse<T>,
    context: string,
): T {
    if (response.error) {
        throw new Error(
            response.error.message ||
                response.message ||
                `OxaPay ${context} failed`,
        );
    }

    if (!response.data) {
        throw new Error(
            response.message || `OxaPay ${context} returned no data`,
        );
    }

    return response.data;
}

export default class OxaPay {
    static formatAmountForApi(amountUsd: number): number {
        if (amountUsd <= 0) {
            throw new Error("Invalid amount");
        }

        return isDevelopment() ? amountUsd / 1000 : amountUsd;
    }

    static buildOrderId(payload: AdditionalJson): string {
        return JSON.stringify(payload);
    }

    static parseOrderId(orderId: string): AdditionalJson {
        return JSON.parse(orderId) as AdditionalJson;
    }

    static async createInvoice(params: {
        userId: string;
        itemType: ShopItemType;
        itemIndex: number;
        amountUsd: number;
    }): Promise<CreateInvoiceResult> {
        const { userId, itemType, itemIndex, amountUsd } = params;
        const amount = this.formatAmountForApi(amountUsd);

        const orderId = this.buildOrderId({ userId, itemType, itemIndex });

        const body: Record<string, unknown> = {
            amount,
            currency: appConfig.oxapay.defaultCurrency,
            order_id: orderId,
            callback_url: appConfig.oxapay.callbackUrl,
            description: `Shop purchase: ${itemType} #${itemIndex}`,
        };

        if (appConfig.oxapay.returnUrl) {
            body.return_url = appConfig.oxapay.returnUrl;
        }

        if (appConfig.oxapay.sandbox) {
            body.sandbox = true;
        }

        try {
            const response = await oxaPayAxiosInstance.post<
                OxaPayApiResponse<OxaPayCreateInvoiceData>
            >("/v1/payment/invoice", body);

            const data = assertApiSuccess(response.data, "createInvoice");
            const trackId = pickTrackId(data);
            const payUrl = pickPayLink(data);

            if (!trackId || !payUrl) {
                paymentLogger.error("OxaPay createInvoice missing fields", {
                    trackId: trackId ? "***" : undefined,
                    hasPayUrl: Boolean(payUrl),
                });
                throw new Error("OxaPay createInvoice missing track_id or pay_link");
            }

            paymentLogger.info("OxaPay invoice created", {
                userId,
                itemType,
                itemIndex,
                amount,
            });

            return {
                trackId,
                payUrl,
                chargeId: trackId,
                pageUrl: payUrl,
            };
        } catch (error) {
            paymentLogger.error("OxaPay createInvoice failed", {
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }

    static async getPaymentInfo(trackId: string): Promise<ProviderInvoice> {
        try {
            const response = await oxaPayAxiosInstance.get<
                OxaPayApiResponse<OxaPayPaymentInfoData>
            >(`/v1/payment/${encodeURIComponent(trackId)}`);

            const data = assertApiSuccess(response.data, "getPaymentInfo");
            const resolvedTrackId = pickTrackId(data) ?? trackId;

            return toProviderInvoice(resolvedTrackId, data);
        } catch (error) {
            paymentLogger.error("OxaPay getPaymentInfo failed", {
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }

    static verifyWebhookSignature(
        rawBody: Buffer,
        hmacHeader: string | undefined,
    ): boolean {
        if (!hmacHeader) {
            return false;
        }

        const expected = crypto
            .createHmac("sha512", appConfig.oxapay.merchantApiKey)
            .update(rawBody)
            .digest("hex");

        const received = hmacHeader.trim();

        try {
            return crypto.timingSafeEqual(
                Buffer.from(expected, "hex"),
                Buffer.from(received, "hex"),
            );
        } catch {
            return expected === received;
        }
    }

    static parseWebhookPayload(rawBody: Buffer): OxaPayWebhookPayload {
        return JSON.parse(rawBody.toString("utf8")) as OxaPayWebhookPayload;
    }

    static webhookPayloadToProviderInvoice(
        payload: OxaPayWebhookPayload,
    ): ProviderInvoice {
        const trackId =
            payload.track_id ?? payload.trackId ?? "";

        return {
            trackId,
            payUrl: null,
            status: normalizeOxaPayStatus(payload.status),
            amount:
                payload.amount === undefined
                    ? null
                    : typeof payload.amount === "number"
                      ? payload.amount
                      : parseFloat(String(payload.amount)),
            currency:
                typeof payload.currency === "string"
                    ? payload.currency
                    : null,
            orderId:
                (typeof payload.order_id === "string"
                    ? payload.order_id
                    : undefined) ??
                (typeof payload.orderId === "string"
                    ? payload.orderId
                    : null),
        };
    }
}
