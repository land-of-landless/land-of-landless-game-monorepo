import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "@/api/v1/utils/response.js";
import ReferralService from "@/services/mainProfile/ReferralService.js";
import DailyRewardService from "@/services/mainProfile/DailyRewardService.js";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import {
    ProfileLootBoxInput,
    UpdateProfileInput,
    UseReferralCodeInput,
} from "@/validators/schemas.js";
import { ERRORS } from "@/common/errors/appError.js";
import _ from "lodash";
import {
    checkRateLimit,
    referralAndDailyRewardRateLimit,
    userPreferencesRateLimit,
} from "@/utils/customRateLimiters.js";

export default class MainProfileController {
    static async getMainProfile(req: Request<{ userId?: string }>, res: Response, next: NextFunction) {
        try {
            let userId = req.params.userId;
            if (_.isNil(userId)) {
                if (_.isNil(req.auth) || _.isNil(req.auth.userId)) throw ERRORS.UNAUTHORIZED("Unauthorized");
                userId = req.auth.userId;
            }
            const fetchedUserProfile = await ProfileService.getProfile(userId);
            return ApiResponse.success(res, fetchedUserProfile);
        } catch (error) {
            next(error);
        }
    }

    static async updatePreferences(req: Request<unknown, unknown, UpdateProfileInput>, res: Response, next: NextFunction) {
        try {
            const { name, profilePictureIndex, representedFlag } = req.body;
            if (_.isNil(req.auth) || _.isNil(req.auth.userId)) throw ERRORS.UNAUTHORIZED("Unauthorized");
            await checkRateLimit(userPreferencesRateLimit, req.auth.userId);
            const updatedProfile = await ProfileService.updatePreferences(req.auth.userId, name, profilePictureIndex, representedFlag);
            return ApiResponse.success(res, updatedProfile);
        } catch (error) {
            next(error);
        }
    }

    static async openLootBox(req: Request<unknown, unknown, ProfileLootBoxInput>, res: Response, next: NextFunction) {
        try {
            const { lootBoxIndex, operation } = req.body;
            if (operation === "start") {
                const { profile, startToOpenTime } = await ProfileService.openLootBoxStart(req.auth!.userId, lootBoxIndex);
                return ApiResponse.success(res, { profile, startToOpenTime, lootBoxIndex });
            } else if (operation === "end") {
                const { profile, rewards } = await ProfileService.openLootBoxEnd(req.auth!.userId, lootBoxIndex);
                return ApiResponse.success(res, { profile, rewards });
            } else if (operation === "end-with-gems") {
                const { profile, rewards } = await ProfileService.openLootBoxEndWithGems(req.auth!.userId, lootBoxIndex);
                return ApiResponse.success(res, { profile, rewards });
            } else if (operation === "end-with-key") {
                const { profile, rewards } = await ProfileService.openLootBoxEndWithKey(req.auth!.userId, lootBoxIndex);
                return ApiResponse.success(res, { profile, rewards });
            }
        } catch (error) {
            next(error);
        }
    }

    static async claimDailyReward(req: Request, res: Response, next: NextFunction) {
        try {
            if (_.isNil(req.auth) || _.isNil(req.auth.userId)) throw ERRORS.UNAUTHORIZED();
            await checkRateLimit(referralAndDailyRewardRateLimit, req.auth.userId);
            const rewards = await DailyRewardService.claimDailyReward(req.auth.userId);
            return ApiResponse.success(res, rewards);
        } catch (error) {
            next(error);
        }
    }

    static async useReferralCode(req: Request<unknown, unknown, UseReferralCodeInput>, res: Response, next: NextFunction) {
        try {
            const { refCode } = req.body;
            if (_.isNil(req.auth) || _.isNil(req.auth.userId)) throw ERRORS.UNAUTHORIZED("Unauthorized");
            await checkRateLimit(referralAndDailyRewardRateLimit, req.auth.userId);
            const result = await ReferralService.applyReferralCode(req.auth.userId, refCode);
            return ApiResponse.success(res, result);
        } catch (error) {
            next(error);
        }
    }
}
