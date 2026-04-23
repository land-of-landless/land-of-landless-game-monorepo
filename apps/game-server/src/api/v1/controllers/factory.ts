import { FactoryDAO } from "@/daos/redis/factory.js";
import FactoryService from "@/services/factory/FactoryService.js";
import { NextFunction, Request, Response } from "express";
import {
    FactoryUpgradeInput,
    FactoryBuildItemInput,
} from "@/validators/schemas.js";
import { ApiResponse } from "../utils/response.ts";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError.js";
import {
    padIdType,
    FACTORY_SECONDARY_Item_INDEX_Type,
    Factory_Item_Type,
} from "@/constants/factory.js";

export default class FactoryController {
    static async getFactoryProfile(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            let userId = req.params.userId;

            if (_.isArray(userId)) {
                throw ERRORS.VALIDATION("Invalid userId");
            }

            if (_.isNil(userId)) {
                if (_.isNil(req.auth) || _.isNil(req.auth.userId)) {
                    throw ERRORS.UNAUTHORIZED();
                }
                userId = req.auth.userId;
            }

            const factoryProfile = await FactoryDAO.findFactoryByUserId(
                userId as string,
            );
            return ApiResponse.success(res, factoryProfile);
        } catch (error) {
            next(error);
        }
    }

    static async upgradeFactory(
        req: Request<any, any, FactoryUpgradeInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const operation = req.body.operation;

            if (_.isNil(req.auth) || _.isNil(req.auth.userId)) {
                throw ERRORS.UNAUTHORIZED();
            }
            const userId = req.auth.userId;

            if (operation === "start") {
                const startToUpgradeTime =
                    await FactoryService.upgradeFactoryStart(userId);

                return ApiResponse.success(res, {
                    status: "success",
                    success: true,
                    startToUpgradeTime,
                });
            } else if (operation === "end") {
                await FactoryService.upgradeFactoryEnd(userId, false);

                return ApiResponse.success(res, {
                    status: "success",
                    success: true,
                });
            } else if (operation === "end-with-gem") {
                await FactoryService.upgradeFactoryEnd(userId, true);

                return ApiResponse.success(res, {
                    status: "success",
                    success: true,
                });
            }

            throw ERRORS.VALIDATION("Invalid operation");
        } catch (error) {
            next(error);
        }
    }

    static async buildItem(
        req: Request<any, any, FactoryBuildItemInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const operation = req.body.operation;
            const itemId = req.body.itemId as Factory_Item_Type;
            const secondaryItemId = (
                req.body.secondaryItemId ? req.body.secondaryItemId : 0
            ) as FACTORY_SECONDARY_Item_INDEX_Type;
            const padId = req.body.padId as unknown as padIdType;

            if (_.isNil(req.auth) || _.isNil(req.auth.userId)) {
                throw ERRORS.UNAUTHORIZED();
            }
            const userId = req.auth.userId;

            if (operation === "start") {
                const startToUpgradeTime = await FactoryService.buildItemStart(
                    userId,
                    itemId,
                    padId,
                    secondaryItemId,
                );

                return ApiResponse.success(res, {
                    status: "success",
                    success: true,
                    startToUpgradeTime,
                });
            } else if (operation === "end") {
                await FactoryService.buildItemEnd(userId, itemId, padId, false);

                return ApiResponse.success(res, {
                    status: "success",
                    success: true,
                });
            } else if (operation === "end-with-gem") {
                await FactoryService.buildItemEnd(userId, itemId, padId, true);

                return ApiResponse.success(res, {
                    status: "success",
                    success: true,
                });
            }

            throw ERRORS.VALIDATION("Invalid operation");
        } catch (error) {
            next(error);
        }
    }
}
