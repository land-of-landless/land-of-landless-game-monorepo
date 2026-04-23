import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/response.ts";
import ProfileAggregationService from "@/services/mainProfile/ProfileAggregationService.js";
import { ERRORS } from "@/common/errors/appError.js";
import _ from "lodash";
import ProfileService from "@/services/mainProfile/ProfileService.js";

/**
 * Controller class for handling general profile-related API endpoints
 * This controller handles operations that span across multiple profile types/DAOs
 */
export default class GeneralController {
    /**
     * Retrieves all profile types for a user.
     * Uses userId from params if present, otherwise falls back to authenticated user's ID.
     * @param req - Express request object
     * @param res - Express response object
     * @param next - Express next function for middleware chain
     */
    static async getAllProfiles(
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
                    throw ERRORS.UNAUTHORIZED("Unauthorized");
                }
                userId = req.auth.userId;
            }

            const result =
                await ProfileAggregationService.getAllProfilesForUser(
                    userId as string,
                );

            return ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }

    // TODO: extend the logic and scope of this
    /**
     * Updates all profile types for a specific authenticated user based on time
     * This includes both increases (energy, minerals) and decreases (satellites, explorers)
     * @param req - Express request object with authenticated user
     * @param res - Express response object
     * @param next - Express next function for middleware chain
     */
    static async updateAllProfilesForUser(
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
                    throw ERRORS.UNAUTHORIZED("Unauthorized");
                }
                userId = req.auth.userId;
            }

            // Use the comprehensive update service
            await ProfileService.updateEnergyUpdatedAt(userId as string);
            await ProfileService.updateMineralUpdatedAt(userId as string);

            return ApiResponse.success(res, {});
        } catch (error) {
            next(error);
        }
    }
}
