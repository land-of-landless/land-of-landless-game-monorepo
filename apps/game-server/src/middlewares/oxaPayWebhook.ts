import { Request, Response, NextFunction } from "express";
import OxaPay from "@/daos/oxaPay/index";
import { PAYMENT_UNAUTHENTICATED_REQUEST } from "@/api/v1/errors/index";
import { paymentLogger } from "@/utils/logger";
import type { OxaPayWebhookPayload } from "@/daos/oxaPay/types";

export type OxaPayWebhookRequest = Request & {
    oxaPayWebhookPayload?: OxaPayWebhookPayload;
};

/**
 * Verifies OxaPay HMAC (sha512) on raw body and attaches parsed payload.
 * Requires express.raw() on the route before this middleware.
 */
export function verifyOxaPayWebhook(
    req: OxaPayWebhookRequest,
    res: Response,
    next: NextFunction,
): void {
    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody)) {
        paymentLogger.warn("OxaPay webhook missing raw body buffer");
        next(PAYMENT_UNAUTHENTICATED_REQUEST);
        return;
    }

    const skipVerify = process.env.OXAPAY_SKIP_WEBHOOK_VERIFY === "true";

    if (!skipVerify) {
        const hmacHeader =
            (req.headers["hmac"] as string | undefined) ??
            (req.headers["HMAC"] as string | undefined);

        if (!OxaPay.verifyWebhookSignature(rawBody, hmacHeader)) {
            paymentLogger.warn("OxaPay webhook HMAC verification failed");
            next(PAYMENT_UNAUTHENTICATED_REQUEST);
            return;
        }
    }

    try {
        req.oxaPayWebhookPayload = OxaPay.parseWebhookPayload(rawBody);
        next();
    } catch (error) {
        paymentLogger.warn("OxaPay webhook invalid JSON", {
            error: error instanceof Error ? error.message : error,
        });
        next(PAYMENT_UNAUTHENTICATED_REQUEST);
    }
}
