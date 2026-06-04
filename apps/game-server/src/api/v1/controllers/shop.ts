import { Request, Response, NextFunction } from "express";
import { ShopPurchaseInput } from "@/validators/schemas";
import { ApiResponse } from "../utils/response.ts";
import ShopService from "@/services/shop/ShopService";
import BillingDAO from "@/daos/redis/billing";
import {
    billingInvoiceFetchRateLimit,
    billingPurchaseRateLimit,
    checkRateLimit,
} from "@/utils/customRateLimiters";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError";

export default class ShopController {
    static async purchase(
        req: Request<any, any, ShopPurchaseInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { itemType, itemIndex: itemIndexStr, payBy } = req.body;
            const itemIndex = +itemIndexStr;

            if (_.isNil(req.auth) || _.isNil(req.auth.userId)) {
                throw ERRORS.UNAUTHORIZED();
            }
            const userId = req.auth.userId;

            // check rate limits
            await checkRateLimit(billingPurchaseRateLimit, userId);

            const result = await ShopService.processPurchase(
                userId,
                itemType,
                itemIndex,
                payBy,
            );

            return ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }

    static async getInvoice(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { invoiceId }: { invoiceId: string } = req.body;

            if (_.isNil(req.auth) || _.isNil(req.auth.userId)) {
                throw ERRORS.UNAUTHORIZED();
            }
            const userId = req.auth.userId;

            // check rate limits
            await checkRateLimit(billingInvoiceFetchRateLimit, userId);

            const invoiceDetail = await ShopService.getInvoiceDetails(
                userId,
                invoiceId,
            );

            return ApiResponse.success(res, invoiceDetail);
        } catch (error) {
            next(error);
        }
    }

    static async getBillingInfo(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const userId = req.auth!.userId;
            const userBillingInfo = await BillingDAO.findBillingById(userId);

            return ApiResponse.success(res, userBillingInfo);
        } catch (error) {
            next(error);
        }
    }
}
