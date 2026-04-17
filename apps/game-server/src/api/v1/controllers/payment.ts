import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { WebhookResponseBody } from "@/daos/helioPay";
import { INVALID_PAYMENT_CALLBACK } from "../errors";
import {
    PaymentCallbackInput,
    ProcessInvoiceInput,
} from "@/validators/schemas";
import { ApiResponse } from "../utils/response";
import PaymentService from "@/services/payment/PaymentService";
import ShopService from "@/services/shop/ShopService";

export default class PaymentController {
    static async processPaymentCallback(
        req: Request<ParamsDictionary, any, PaymentCallbackInput>,
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
        req: Request<ParamsDictionary, any, ProcessInvoiceInput>,
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
