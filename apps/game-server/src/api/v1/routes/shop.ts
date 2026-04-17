import { Router, Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import ShopController from "../controllers/shop";
import { auth } from "@colyseus/auth";
import {
    validateBody,
    shopPurchaseSchema,
    invoiceSchema,
    ShopPurchaseInput,
    InvoiceInput,
} from "@/validators/schemas";

const shopRouter = Router();

shopRouter.post(
    "/purchase",
    auth.middleware(),
    validateBody(shopPurchaseSchema),
    async (
        req: Request<ParamsDictionary, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        // Validation is now handled by Zod middleware
        // Input validation and sanitization is automatically done
        await ShopController.purchase(req, res, next);
    },
);

shopRouter.post(
    "/invoice-info",
    auth.middleware(),
    validateBody(invoiceSchema),
    async (
        req: Request<ParamsDictionary, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await ShopController.getInvoice(req, res, next);
    },
);

shopRouter.get(
    "/billing-info",
    auth.middleware(),
    async (
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) => {
        await ShopController.getBillingInfo(req, res, next);
    },
);

export default shopRouter;
