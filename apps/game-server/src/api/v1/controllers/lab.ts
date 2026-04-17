import LabService from "@/services/lab/LabService";
import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ERRORS } from "@/common/errors/appError";
import { LAB_UPGRADE_ITEM_TYPE } from "@/constants/lab";
import { LabUpgradeInput, LabUpgradeItemInput } from "@/validators/schemas";
import { ApiResponse } from "../utils/response";
import _ from "lodash";

export default class LabController {
    static async getLabProfile(
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const userId = req.params.userId;
            if (_.isArray(userId)) {
                throw ERRORS.VALIDATION("Invalid userId");
            }
            const labProfile = await LabService.getLabProfile(userId as string);
            return ApiResponse.success(res, labProfile);
        } catch (error) {
            next(error);
        }
    }

    static async upgradeLab(
        req: Request<ParamsDictionary, any, LabUpgradeInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const operation = req.body.operation;
            const userId = req.auth!.userId;

            if (operation === "start") {
                const startToUpgradeTime =
                    await LabService.upgradeLabStart(userId);

                return ApiResponse.success(res, {
                    status: "success",
                    success: true,
                    startToUpgradeTime,
                });
            } else if (operation === "end") {
                await LabService.upgradeLabEnd(userId, false);

                return ApiResponse.success(res, {
                    status: "success",
                    success: true,
                });
            } else if (operation === "end-with-gem") {
                await LabService.upgradeLabEnd(userId, true);

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

    static async upgradeItem(
        req: Request<ParamsDictionary, any, LabUpgradeItemInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const itemId = req.body.itemId as LAB_UPGRADE_ITEM_TYPE;
            const userId = req.auth!.userId;

            await LabService.upgradeItem(userId, itemId);

            return ApiResponse.success(res, {
                status: "success",
                success: true,
            });
        } catch (error) {
            next(error);
        }
    }
}
