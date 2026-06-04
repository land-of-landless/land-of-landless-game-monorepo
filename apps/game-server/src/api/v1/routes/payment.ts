import express, { Router, Request, Response, NextFunction } from "express";
import PaymentController from "../controllers/payment.ts";
import { auth } from "@colyseus/auth";
import {
    validateBody,
    PROCESS_INVOICE_SCHEMA,
} from "@/validators/schemas";
import {
    verifyOxaPayWebhook,
    OxaPayWebhookRequest,
} from "@/middlewares/oxaPayWebhook";

const paymentRouter = Router();

paymentRouter.post(
    "/callback",
    express.raw({ type: "application/json" }),
    verifyOxaPayWebhook,
    async (req: OxaPayWebhookRequest, res: Response, next: NextFunction) => {
        await PaymentController.processPaymentCallback(req, res, next);
    },
);

paymentRouter.post(
    "/process-invoice",
    auth.middleware(),
    validateBody(PROCESS_INVOICE_SCHEMA),
    async (req: Request, res: Response, next: NextFunction) => {
        await PaymentController.processInvoice(req, res, next);
    },
);

export default paymentRouter;
