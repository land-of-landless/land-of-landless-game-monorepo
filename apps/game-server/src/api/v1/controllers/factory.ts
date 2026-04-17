import { FactoryDAO } from "@/daos/redis/factory";
import FactoryService from "@/services/factory/FactoryService";
import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import {
    FactoryUpgradeInput,
    FactoryBuildItemInput,
} from "@/validators/schemas";
import { ApiResponse } from "../utils/response";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError";
import {
    padIdType,
    FACTORY_SECONDARY_Item_INDEX_Type,
} from "@/constants/factory";
import { Factory_Item_Type } from "@/constants/factory";

export default class FactoryController {
    static async getFactoryProfile(
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const userId = req.params.userId;

            if (_.isArray(userId)) {
                throw ERRORS.VALIDATION("Invalid userId");
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
        req: Request<ParamsDictionary, any, FactoryUpgradeInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const operation = req.body.operation;
            const userId = req.auth!.userId;

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

            throw new Error("Invalid operation");
        } catch (error) {
            next(error);
        }
    }

    static async buildItem(
        req: Request<ParamsDictionary, any, FactoryBuildItemInput>,
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
            const userId = req.auth!.userId;

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

            throw new Error("Invalid operation");
        } catch (error) {
            next(error);
        }
    }
}
