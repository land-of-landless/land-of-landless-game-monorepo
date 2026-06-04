import ProfileService from "@/services/mainProfile/ProfileService";
import { REFERRAL_REWARDS, ReferralRewards } from "@/constants/mainProfile";
import {
    REFERRAL_ALREADY_USED,
    REFERRAL_CODE_INVALID,
    REFERRAL_SELF_USE,
} from "@/api/v1/errors/index";
import { MainProfile } from "@/models/redis/mainProfile";

// TODO: implement a better logic for handling referral system and prizes
// ideally referer would not get an immediate reward but rather get their rewards when the new user reaches certain milestones
// for example:
// - when the new user signs up -> referee gets some prizes, referer gets nothing
// - when the new user levels up to level 5 -> referer gets some prizes

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

        // 2. Check if already referred
        if (refereeProfile.referredBy !== "") {
            throw REFERRAL_ALREADY_USED;
        }

        // 3. Fetch Referrer Profile
        const referrerProfile =
            await ProfileService.findProfileByRefCode(refCode);
        if (!referrerProfile) {
            throw REFERRAL_CODE_INVALID;
        }

        // 4. Check for Self-Referral
        if (referrerProfile.userId === userId) {
            throw REFERRAL_SELF_USE;
        }

        // 5. Link profiles and Apply Rewards
        refereeProfile.referredBy = referrerProfile.userId;

        this.applyReferralRewards(refereeProfile, "referee");

        // this.applyReferralRewards(referrerProfile, "referrer");
        // after the referred user is active later system automatically should apply referrer's reward on specific milestones
        // for example:
        // - when the new user levels up to level 5 -> referrer gets some prizes
        // the idea of active user depends on our definition of course! like xp wise or similar

        // 6. Persist changes
        await ProfileService.saveProfile(refereeProfile);

        return refereeProfile;
    }

    private static applyReferralRewards(
        profile: MainProfile,
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
            // it's a good idea to consider sth more than
            // normal prizes for sucessful referals
            // like special loot box or ticket or similar
            profile.gems += REFERRAL_REWARDS.referrer.gems;
            profile.coins += REFERRAL_REWARDS.referrer.coins;
            profile.energy = Math.min(
                profile.energy + REFERRAL_REWARDS.referrer.energy,
                profile.energy_max
            );
        }
    }
}
