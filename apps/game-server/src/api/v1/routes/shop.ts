import { Router, Request, Response, NextFunction } from "express";
import ShopController from "../controllers/shop.ts";
import { auth } from "@colyseus/auth";
import {
    validateBody,
    SHOP_PURCHASE_SCHEMA,
    INVOICE_SCHEMA,
    ShopPurchaseInput,
    InvoiceInput,
} from "@/validators/schemas";

const shopRouter = Router();

shopRouter.post(
    "/purchase",
    auth.middleware(),
    validateBody(SHOP_PURCHASE_SCHEMA),
    async (
        req: Request<any, any, any>,
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
    validateBody(INVOICE_SCHEMA),
    async (
        req: Request<any, any, any>,
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
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        await ShopController.getBillingInfo(req, res, next);
    },
);

export default shopRouter;
