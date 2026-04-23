import { Request, Response, NextFunction } from "express";
import { WebhookResponseBody } from "@/daos/helioPay/index.js";
import { INVALID_PAYMENT_CALLBACK } from "../errors/index.ts";
import {
    PaymentCallbackInput,
    ProcessInvoiceInput,
} from "@/validators/schemas.js";
import { ApiResponse } from "../utils/response.ts";
import PaymentService from "@/services/payment/PaymentService.js";
import ShopService from "@/services/shop/ShopService.js";

export default class PaymentController {
    static async processPaymentCallback(
        req: Request<any, any, PaymentCallbackInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const {
                transactionObject: {
                    paylinkId,
                    meta: {
                        customerDetails: { additionalJSON },
                    },
                },
            } = req.body as WebhookResponseBody;

            const result = await PaymentService.handlePaymentCallback(
                paylinkId,
                additionalJSON,
            );

            return ApiResponse.success(res, result);
        } catch (error) {
            next(INVALID_PAYMENT_CALLBACK(error));
        }
    }

    static async processInvoice(
        req: Request<any, any, ProcessInvoiceInput>,
        res: Response,
        next: NextFunction,
    ) {
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
