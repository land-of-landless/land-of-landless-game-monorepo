import ProfileService from "@/services/mainProfile/ProfileService";
import { REFERRAL_REWARDS } from "@/constants/mainProfile";
import {
    REFERRAL_ALREADY_USED,
    REFERRAL_CODE_INVALID,
    REFERRAL_SELF_USE,
    PROFILE_NOT_FOUND,
} from "@/api/v1/errors/index";
import _ from "lodash";

export default class ReferralService {
    /**
     * Applies a referral code to a user's profile.
     * @param userId - The ID of the user applying the code (referee).
     * @param refCode - The referral code being applied.
     * @returns The updated referee profile.
     */
    static async applyReferralCode(userId: string, refCode: string) {
        // 1. Fetch Referee Profile
        const refereeProfile = await ProfileService.getProfile(userId);
        if (!refereeProfile) {
            throw PROFILE_NOT_FOUND;
        }

        // 2. Check if already referred
        if (refereeProfile.referredBy !== "") {
            throw REFERRAL_ALREADY_USED;
        }

        // 3. Fetch Referrer Profile
        const referrerProfile =
            await ProfileService.findProfileByRefCode(refCode);
        if (_.isNil(referrerProfile)) {
            throw REFERRAL_CODE_INVALID;
        }

        // 4. Check for Self-Referral
        if (referrerProfile.userId === userId) {
            throw REFERRAL_SELF_USE;
        }

        // 6. Mark as Used
        refereeProfile.referredBy = referrerProfile.userId;

        // 5. Apply Rewards

        // 1. apply referrer rewards
        referrerProfile.gems += REFERRAL_REWARDS.REFERRER.gems;
        referrerProfile.coins += REFERRAL_REWARDS.REFERRER.coins;
        referrerProfile.energy = Math.min(
            referrerProfile.energy + REFERRAL_REWARDS.REFERRER.energy,
            referrerProfile.energy_max,
        );

        // 2. apply referee rewards
        refereeProfile.coins += REFERRAL_REWARDS.REFEREE.coins;
        refereeProfile.gems += REFERRAL_REWARDS.REFEREE.gems;
        refereeProfile.energy = Math.min(
            refereeProfile.energy + REFERRAL_REWARDS.REFEREE.energy,
            refereeProfile.energy_max,
        );

        // 7. Save Profiles
        // Note: MainProfileDAO needs to expose a save method or we use updateProfileInfo/createProfile
        // Ideally, MainProfileDAO should have a generic save method.
        // For now, we'll assume we can use a method we'll add to MainProfileDAO called 'saveProfile'
        await ProfileService.saveProfile(refereeProfile);
        await ProfileService.saveProfile(referrerProfile);

        return refereeProfile;
    }
}
