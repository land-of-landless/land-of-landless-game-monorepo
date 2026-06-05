import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/response.ts";
import ProfileAggregationService from "@/services/mainProfile/ProfileAggregationService.js";
import { ERRORS } from "@/common/errors/appError.js";
import _ from "lodash";
import ProfileService from "@/services/mainProfile/ProfileService.js";

export default class GeneralController {
    static async getAllProfiles(req: Request, res: Response, next: NextFunction) {
        try {
            let userId = req.params.userId;
            if (_.isArray(userId)) throw ERRORS.VALIDATION("Invalid userId");
            if (_.isNil(userId)) {
                if (_.isNil(req.auth) || _.isNil(req.auth.userId)) throw ERRORS.UNAUTHORIZED("Unauthorized");
                userId = req.auth.userId;
            }
            const result = await ProfileAggregationService.getAllProfilesForUser(userId as string);
            return ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }

    static async updateAllProfilesForUser(req: Request, res: Response, next: NextFunction) {
        try {
            let userId = req.params.userId;
            if (_.isArray(userId)) throw ERRORS.VALIDATION("Invalid userId");
            if (_.isNil(userId)) {
                if (_.isNil(req.auth) || _.isNil(req.auth.userId)) throw ERRORS.UNAUTHORIZED("Unauthorized");
                userId = req.auth.userId;
            }
            await ProfileService.updateEnergyUpdatedAt(userId as string);
            await ProfileService.updateMineralUpdatedAt(userId as string);
            return ApiResponse.success(res, {});
        } catch (error) {
            next(error);
        }
    }
}
