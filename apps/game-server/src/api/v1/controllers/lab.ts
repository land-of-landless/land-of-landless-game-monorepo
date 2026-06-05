import LabService from "@/services/lab/LabService.js";
import { Request, Response, NextFunction } from "express";
import { ERRORS } from "@/common/errors/appError.js";
import { LabUpgradeItem } from "@/constants/lab.js";
import { LabUpgradeInput, LabUpgradeItemInput } from "@/validators/schemas.js";
import { ApiResponse } from "../utils/response.ts";
import _ from "lodash";

export default class LabController {
    static async getLabProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId;
            if (_.isArray(userId)) throw ERRORS.VALIDATION("Invalid userId");
            const labProfile = await LabService.getLabProfile(userId as string);
            return ApiResponse.success(res, labProfile);
        } catch (error) {
            next(error);
        }
    }

    static async upgradeLab(
        req: Request<any, any, LabUpgradeInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const operation = req.body.operation;
            const userId = req.auth!.userId;

            if (operation === "start") {
                const startToUpgradeTime = await LabService.upgradeLabStart(userId);
                return ApiResponse.success(res, { status: "success", success: true, startToUpgradeTime });
            } else if (operation === "end") {
                await LabService.upgradeLabEnd(userId, false);
                return ApiResponse.success(res, { status: "success", success: true });
            } else if (operation === "end-with-gem") {
                await LabService.upgradeLabEnd(userId, true);
                return ApiResponse.success(res, { status: "success", success: true });
            }

            throw ERRORS.VALIDATION("Invalid operation");
        } catch (error) {
            next(error);
        }
    }

    static async upgradeItem(
        req: Request<any, any, LabUpgradeItemInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const itemId = req.body.itemId as LabUpgradeItem;
            const userId = req.auth!.userId;
            await LabService.upgradeItem(userId, itemId);
            return ApiResponse.success(res, { status: "success", success: true });
        } catch (error) {
            next(error);
        }
    }
}
