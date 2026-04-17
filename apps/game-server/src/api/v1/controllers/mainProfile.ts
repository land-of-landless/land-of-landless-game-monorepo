import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import MainProfileDAO from "../../../daos/redis/mainProfile";
import { ApiResponse } from "../utils/response";
import ReferralService from "@/services/mainProfile/ReferralService";
import DailyRewardService from "@/services/mainProfile/DailyRewardService";
import ProfileService from "@/services/mainProfile/ProfileService";
import {
    ProfileLootBoxInput,
    UpdateProfileInput,
    UseReferralCodeInput,
} from "@/validators/schemas";
import { ERRORS } from "@/common/errors/appError";
import _ from "lodash";
import {
    isProfane,
    isProfaneHive,
    isProfaneProfanityDev,
    isProfaneSightengineML,
    isProfaneSightenginePattern,
} from "@/utils/profanity";
import {
    checkRateLimit,
    referralAndDailyRewardRateLimit,
    userPreferencesRateLimit,
} from "@/utils/customRateLimiters";
import { convertMsToStringTime } from "@/utils/time";

/**
 * Controller class for handling profile-related API endpoints
 */
export default class MainProfileController {
    /**
     * Retrieves the main profile for a user.
     * Uses userId from params if present, otherwise falls back to authenticated user's ID.
     * @param req - Express request object
     * @param res - Express response object
     * @param next - Express next function for middleware chain
     */
    static async getMainProfile(
        req: Request<ParamsDictionary>,
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

            const fetchedUserProfile =
                await MainProfileDAO.findProfileByUserId(userId);

            return ApiResponse.success(res, fetchedUserProfile);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Updates the user's profile information (name and/or profile picture)
     * @param req - Express request object with authenticated user and profile data
     * @param res - Express response object
     * @param next - Express next function for middleware chain
     */
    static async updatePreferences(
        req: Request<ParamsDictionary, any, UpdateProfileInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { name, profilePictureIndex, representedFlag } = req.body;

            if (_.isNil(req.auth) || _.isNil(req.auth.userId)) {
                throw ERRORS.UNAUTHORIZED("Unauthorized");
            }

            // apply rate limit consumption
            await checkRateLimit(userPreferencesRateLimit, req.auth.userId);

            // utilize updatePreferences service
            const updatedProfile = await ProfileService.updatePreferences(
                req.auth.userId,
                name,
                profilePictureIndex,
                representedFlag,
            );

            return ApiResponse.success(res, updatedProfile);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles loot box operations (start, end, end-with-gems, end-with-key)
     * @param req - Express request object with authenticated user and loot box operation data
     * @param res - Express response object
     * @param next - Express next function for middleware chain
     */
    static async openLootBox(
        req: Request<ParamsDictionary, any, ProfileLootBoxInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { lootBoxIndex, operation } = req.body;

            let updatedProfile = {};

            if (operation === "start") {
                updatedProfile = await ProfileService.openLootBoxStart(
                    req.auth!.userId,
                    lootBoxIndex,
                );
            } else if (operation === "end") {
                updatedProfile = await ProfileService.openLootBoxEnd(
                    req.auth!.userId,
                    lootBoxIndex,
                );
            } else if (operation === "end-with-gems") {
                updatedProfile = await ProfileService.openLootBoxEndWithGems(
                    req.auth!.userId,
                    lootBoxIndex,
                );
            } else if (operation === "end-with-key") {
                updatedProfile = await ProfileService.openLootBoxEndWithKey(
                    req.auth!.userId,
                    lootBoxIndex,
                );
            }

            return ApiResponse.success(res, updatedProfile);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles the daily reward claim for a user
     * @param req - Express request object with authenticated user
     * @param res - Express response object
     * @param next - Express next function for middleware chain
     */
    static async claimDailyReward(
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            if (_.isNil(req.auth) || _.isNil(req.auth.userId)) {
                throw ERRORS.UNAUTHORIZED();
            }

            // rate limit the amount of time user can interact
            await checkRateLimit(
                referralAndDailyRewardRateLimit,
                req.auth.userId,
            );

            const rewards = await DailyRewardService.claimDailyReward(
                req.auth.userId,
            );

            return ApiResponse.success(res, rewards);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles a user applying a referral code.
     * @param req - Express request object with authenticated user and referral code
     * @param res - Express response object
     * @param next - Express next function for middleware chain
     */
    static async useReferralCode(
        req: Request<ParamsDictionary, any, UseReferralCodeInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { refCode } = req.body;

            if (_.isNil(req.auth) || _.isNil(req.auth.userId)) {
                throw ERRORS.UNAUTHORIZED("Unauthorized");
            }

            // rate limit the amount of time user can interact
            await checkRateLimit(
                referralAndDailyRewardRateLimit,
                req.auth.userId,
            );

            const result = await ReferralService.applyReferralCode(
                req.auth.userId,
                refCode,
            );

            return ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }
}
