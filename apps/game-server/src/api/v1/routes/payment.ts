import { Router, Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import PaymentController from "../controllers/payment";
import { INVALID_SOURCE_IP, PAYMENT_UNAUTHENTICATED_REQUEST } from "../errors";
import { auth } from "@colyseus/auth";
import { appConfig, isDevelopment } from "@/config/environment";
import {
    validateBody,
    paymentCallbackSchema,
    processInvoiceSchema,
    ProcessInvoiceInput,
} from "@/validators/schemas";
import { WebhookResponseBody } from "@/daos/helioPay";

const paymentRouter = Router();

// const paymentCallbackAllowList: string[] =
//     process.env.ALLOWED_IPS_FOR_PAYMENT_CALLBACK.split(",");

paymentRouter.post(
    "/callback",
    // body("transactionObject.meta.customerDetails.additionalJSON.userId")
    //     .notEmpty()
    //     .trim()
    //     .escape()
    //     .isString(),
    // body("transactionObject.meta.customerDetails.additionalJSON.itemType")
    //     .notEmpty()
    //     .trim()
    //     .escape()
    //     .isString()
    //     .isIn(itemTypeInputs),
    // body("transactionObject.meta.customerDetails.additionalJSON.itemIndex")
    //     .notEmpty()
    //     .trim()
    //     .escape()
    //     .isInt()
    //     .isIn(itemIndexInputs),

    async (
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) => {
        // check in header for global webhook secret
        if (!isDevelopment()) {
            let incomingAuthHeader = req.headers["authorization"];

            // drop the bearer from beginning
            if (incomingAuthHeader) {
                incomingAuthHeader = incomingAuthHeader.split(" ")[1];
            }

            const webhookSecret = appConfig.helio.webhookSecret;
            if (incomingAuthHeader !== webhookSecret) {
                return next(PAYMENT_UNAUTHENTICATED_REQUEST);
            }
        }

        await PaymentController.processPaymentCallback(req, res, next);
    },
);

paymentRouter.post(
    "/process-invoice",
    auth.middleware(),
    validateBody(processInvoiceSchema),
    async (
        req: Request<ParamsDictionary, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await PaymentController.processInvoice(req, res, next);
    },
);

export default paymentRouter;
