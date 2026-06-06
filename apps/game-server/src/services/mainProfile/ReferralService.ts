import ProfileService from "@/services/mainProfile/ProfileService.js";
import { REFERRAL_REWARDS } from "@/constants/mainProfile.js";
import {
    REFERRAL_ALREADY_USED,
    REFERRAL_CODE_INVALID,
    REFERRAL_SELF_USE,
} from "@/api/v1/errors/index.js";
import MainProfileDAO from "@/daos/postgres/mainProfile.ts";

/**
 * Service for referral code operations.
 * Profile reads via ProfileService, saves via postgres MainProfileDAO.
 */
export default class ReferralService {
    static async applyReferralCode(userId: string, refCode: string) {
        const refereeProfile = await ProfileService.getProfile(userId);

        if (refereeProfile.referredBy !== "") {
            throw REFERRAL_ALREADY_USED;
        }

        const referrerProfile =
            await ProfileService.findProfileByRefCode(refCode);
        if (!referrerProfile) {
            throw REFERRAL_CODE_INVALID;
        }

        if (referrerProfile.userId === userId) {
            throw REFERRAL_SELF_USE;
        }

        refereeProfile.referredBy = referrerProfile.userId;
        this.applyReferralRewards(refereeProfile, "referee");

        await MainProfileDAO.saveProfile(refereeProfile);
        return refereeProfile;
    }

    private static applyReferralRewards(
        profile: any,
        type: "referee" | "referrer"
    ) {
        if (type === "referee") {
            profile.gems += REFERRAL_REWARDS.referee.gems;
            profile.coins += REFERRAL_REWARDS.referee.coins;
            profile.energy = Math.min(
                profile.energy + REFERRAL_REWARDS.referee.energy,
                profile.energy_max
            );
        } else {
            profile.gems += REFERRAL_REWARDS.referrer.gems;
            profile.coins += REFERRAL_REWARDS.referrer.coins;
            profile.energy = Math.min(
                profile.energy + REFERRAL_REWARDS.referrer.energy,
                profile.energy_max
            );
        }
    }
}
