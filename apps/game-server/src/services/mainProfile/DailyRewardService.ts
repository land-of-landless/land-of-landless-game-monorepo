import ProfileService from "@/services/mainProfile/ProfileService";
import { mainProfileRepository } from "@/daos/redis/repositories/index";
import { ERRORS } from "@/common/errors/appError";
import {
    DAILY_REWARD_COOLDOWN_HOURS,
    DAILY_CLAIM_REWARDS,
    DAILY_REWARD_MAX_CONSECUTIVE_HOURS,
    DAILY_REWARD_CLAIM_COUNTER,
    DAILY_REWARD_RESET_CYCLE_DAYS,
} from "@/constants/mainProfile";
import logger from "@/utils/logger";

export default class DailyRewardService {
    /**
     * Allows a user to claim their daily reward if the cooldown period has passed.
     * @param userId - The ID of the user claiming the reward.
     * @returns An object containing the claimed coins and gems.
     */
    static async claimDailyReward(userId: string): Promise<{
        coins: number;
        gems: number;
        newLastDailyRewardClaimedAt: string;
    }> {
        try {
            const userProfile = await ProfileService.getProfile(userId);

            if (!userProfile) {
                throw ERRORS.NOT_FOUND("MainProfile not found");
            }

            if (userProfile.lastDailyRewardClaimedAt === "") {
                userProfile.dailyRewardClaimCounter = 1;
            } else {
                const lastClaimedDate = new Date(
                    userProfile.lastDailyRewardClaimedAt,
                );
                const currentDate = new Date();
                const hoursSinceLastClaim = Math.floor(
                    (currentDate.getTime() - lastClaimedDate.getTime()) /
                        (1000 * 60 * 60),
                );

                if (hoursSinceLastClaim < DAILY_REWARD_COOLDOWN_HOURS) {
                    throw ERRORS.VALIDATION(
                        "Daily reward is not available yet.",
                    );
                } else if (
                    hoursSinceLastClaim >= DAILY_REWARD_MAX_CONSECUTIVE_HOURS
                ) {
                    userProfile.dailyRewardClaimCounter = 1;
                } else {
                    // if none of above conditions it means it is the consecutive day and we can consider a bump in counter
                    // check if counter has reached max to reset it
                    if (
                        userProfile.dailyRewardClaimCounter >=
                        DAILY_REWARD_RESET_CYCLE_DAYS
                    ) {
                        userProfile.dailyRewardClaimCounter = 1;
                    } else {
                        userProfile.dailyRewardClaimCounter += 1;
                    }
                }
            }

            let claimedRewards = {
                coins: DAILY_CLAIM_REWARDS[
                    userProfile.dailyRewardClaimCounter as DAILY_REWARD_CLAIM_COUNTER
                ].coins,
                gems: DAILY_CLAIM_REWARDS[
                    userProfile.dailyRewardClaimCounter as DAILY_REWARD_CLAIM_COUNTER
                ].gems,
            };

            userProfile.coins += claimedRewards.coins;
            userProfile.gems += claimedRewards.gems;
            userProfile.lastDailyRewardClaimedAt = new Date().toUTCString();

            await mainProfileRepository.save(userProfile);

            return {
                coins: claimedRewards.coins,
                gems: claimedRewards.gems,
                newLastDailyRewardClaimedAt:
                    userProfile.lastDailyRewardClaimedAt,
            };
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            logger.error(
                `[DailyRewardService.claimDailyReward] Error for userId: ${userId}`,
                { error },
            );
            throw ERRORS.DB_ERROR(
                `Failed to claim daily reward: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }
}
