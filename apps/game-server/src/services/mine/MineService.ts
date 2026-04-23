import { MineDAO } from "@/daos/redis/mine.js";
import { mineRepository } from "@/daos/redis/repositories/index.js";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import {
    MINE_MAX_MINER_COUNT,
    MINE_MAX_LEVEL_PER_MINER,
    MINE_MINER_ID_TYPE,
    MINE_UPGRADE_INFO,
    MINE_UPGRADE_LEVEL_TYPE,
} from "@/constants/mine.js";
import { turnTimeInMsToGemsToBePaid } from "@/utils/index.js";
import { ERRORS } from "@/common/errors/appError.js";

/**
 * Service class for handling Mine business logic.
 */
export default class MineService {
    /**
     * Starts the upgrade process for a specific mineral miner.
     * @param userId - The ID of the user.
     * @param minerId - The index of the miner to upgrade.
     * @returns The updated Mine entity.
     */
    static async upgradeMinerStart(
        userId: string,
        minerId: MINE_MINER_ID_TYPE,
    ) {
        try {
            const mineProfile = await MineDAO.findMineByUserId(userId);

            if (!mineProfile) {
                throw ERRORS.NOT_FOUND("Mine profile not found");
            }

            // --- Validation Checks ---
            // Ensure no other miner upgrade is already in progress.
            if (mineProfile.upgrade_timer !== "") {
                throw ERRORS.VALIDATION("Another Mine is being upgraded");
            }

            let fetched_miners_info = mineProfile.miners_info;

            // Validate the provided miner ID.
            if (minerId > MINE_MAX_MINER_COUNT) {
                throw ERRORS.VALIDATION("incorrect miner index");
            }

            // Ensure the upgrade slot is free.
            if (mineProfile.being_upgraded_miner_id !== -1) {
                throw ERRORS.VALIDATION("Another miner is being upgraded");
            }

            // Check if the target miner has already reached its maximum level.
            if (
                fetched_miners_info[`miner${minerId}`].level >=
                MINE_MAX_LEVEL_PER_MINER
            ) {
                throw ERRORS.VALIDATION("Max level reached for miner");
            }

            // --- Process Upgrade ---
            // Set which miner is being upgraded.
            mineProfile.being_upgraded_miner_id = minerId;

            // Determine the target level and get the cost from constants.
            // level is checked and is in normal range so it's alright
            let targetUpgradeLevel = (fetched_miners_info[`miner${minerId}`]
                .level + 1) as MINE_UPGRADE_LEVEL_TYPE;

            // Deduct the coin cost for the upgrade.
            let { coinCost: coinsToBePaid } =
                MINE_UPGRADE_INFO[targetUpgradeLevel];

            // set timer
            let now = new Date();
            mineProfile.upgrade_timer = now.toUTCString();

            // Deduct coins and update the user's mineral generation rate.
            await ProfileService.deductCoins(userId, coinsToBePaid);

            await ProfileService.updateMineralGenerationRate(userId);

            // Persist the changes to the database.
            await mineRepository.save(mineProfile);
            return mineProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to start miner upgrade: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }

    /**
     * Completes the upgrade process for a specific mineral miner.
     * @param userId - The ID of the user.
     * @param minerId - The index of the miner being upgraded.
     * @param skipWithGem - A boolean indicating whether to use gems to finish the upgrade instantly.
     * @returns The updated Mine entity.
     */
    static async upgradeMinerEnd(
        userId: string,
        minerId: MINE_MINER_ID_TYPE,
        skipWithGem: boolean,
    ) {
        try {
            const mineProfile = await MineDAO.findMineByUserId(userId);

            if (!mineProfile) {
                throw ERRORS.NOT_FOUND("Mine profile not found");
            }

            // --- Validation Checks ---
            // Ensure an upgrade is actually in progress.
            if (mineProfile.upgrade_timer === "") {
                throw ERRORS.VALIDATION("Upgrade isn't in progress");
            }

            // Ensure the miner being completed is the one that was started.
            if (mineProfile.being_upgraded_miner_id !== minerId) {
                throw ERRORS.VALIDATION("Incorrect miner index");
            }

            let fetched_miners_info = mineProfile.miners_info;

            // Check if the miner has already reached its maximum level.
            if (
                fetched_miners_info[`miner${minerId}`].level >=
                MINE_MAX_LEVEL_PER_MINER
            ) {
                throw ERRORS.VALIDATION("Max level reached");
            }

            // --- Timer and Gem Skip Logic ---

            let targetUpgradeLevel = (fetched_miners_info[`miner${minerId}`]
                .level + 1) as MINE_UPGRADE_LEVEL_TYPE;

            // Get the required time for the upgrade.
            let timeToWait = MINE_UPGRADE_INFO[targetUpgradeLevel].time;

            // Calculate the time elapsed since the upgrade started.
            let now = new Date();
            let startTime = new Date(mineProfile.upgrade_timer);
            let passedTime = Math.floor(now.getTime() - startTime.getTime());

            if (passedTime < 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }

            // Handle the case where a user uses gems to finish instantly.
            if (skipWithGem) {
                if (passedTime >= timeToWait) {
                    throw ERRORS.VALIDATION("Already ended");
                }

                let remainingTime = timeToWait - passedTime;
                let gemsToBePaid = turnTimeInMsToGemsToBePaid(remainingTime);

                await ProfileService.deductGems(userId, gemsToBePaid);
            } else {
                if (passedTime < timeToWait) {
                    throw ERRORS.VALIDATION("Not enough time passed");
                }
            }

            // --- Update Profile ---
            mineProfile.being_upgraded_miner_id = -1;
            mineProfile.miners_info[`miner${minerId}`].level += 1;
            mineProfile.upgrade_timer = "";

            await ProfileService.updateMineralGenerationRate(userId);

            // Persist the changes to the database.
            await mineRepository.save(mineProfile);
            return mineProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to complete miner upgrade: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            );
        }
    }
}
