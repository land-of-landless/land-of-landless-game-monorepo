import { Request, Response, NextFunction } from "express";
import { INVALID_PAYMENT_CALLBACK } from "../errors/index.ts";
import { ProcessInvoiceInput } from "@/validators/schemas.js";
import PaymentService from "@/services/payment/PaymentService.js";
import ShopService from "@/services/shop/ShopService.js";
import { ApiResponse } from "../utils/response.ts";
import type { OxaPayWebhookRequest } from "@/middlewares/oxaPayWebhook.js";
import { normalizeOxaPayStatus } from "@/daos/oxaPay/index.js";

export default class PaymentController {
    static async processPaymentCallback(req: OxaPayWebhookRequest, res: Response, next: NextFunction) {
        try {
            const payload = req.oxaPayWebhookPayload;
            if (!payload) return next(INVALID_PAYMENT_CALLBACK(new Error("Missing webhook payload")));
            const trackId = payload.track_id ?? payload.trackId ?? "";
            const orderId =
                (typeof payload.order_id === "string" ? payload.order_id : undefined) ??
                (typeof payload.orderId === "string" ? payload.orderId : undefined);
            const webhookStatus = normalizeOxaPayStatus(payload.status);
            await PaymentService.handlePaymentCallback(trackId, orderId, webhookStatus);
            return res.status(200).send("ok");
        } catch (error) {
            next(INVALID_PAYMENT_CALLBACK(error));
        }
    }

    static async processInvoice(req: Request<any, any, ProcessInvoiceInput>, res: Response, next: NextFunction) {
        try {
            const { invoiceId } = req.body;
            const userId = req.auth!.userId;
            const result = await ShopService.processInvoice(userId, invoiceId);
            return ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }
}
