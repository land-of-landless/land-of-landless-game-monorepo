import MineDAO from "@/daos/postgres/mine.ts";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import {
    MINE_MAX_MINER_COUNT,
    MINE_MAX_LEVEL_PER_MINER,
    MineMinerId,
    MINE_UPGRADE_INFO,
    MineUpgradeLevel,
} from "@/constants/mine.js";
import { turnTimeInMsToGemsToBePaid } from "@/utils/index.js";
import { ERRORS } from "@/common/errors/appError.js";

/**
 * Service class for handling Mine business logic.
 * Backed by PostgreSQL via MineDAO (drizzle-orm).
 */
export default class MineService {
    /**
     * Starts the upgrade process for a specific mineral miner.
     */
    static async upgradeMinerStart(userId: string, minerId: MineMinerId) {
        try {
            const mineProfile = await MineDAO.findMineByUserId(userId);

            if (!mineProfile) {
                throw ERRORS.NOT_FOUND("Mine profile not found");
            }

            if (mineProfile.upgrade_timer !== "") {
                throw ERRORS.VALIDATION("Another Mine is being upgraded");
            }

            let fetched_miners_info = mineProfile.miners_info;

            if (minerId > MINE_MAX_MINER_COUNT) {
                throw ERRORS.VALIDATION("incorrect miner index");
            }

            if (mineProfile.being_upgraded_miner_id !== -1) {
                throw ERRORS.VALIDATION("Another miner is being upgraded");
            }

            if (
                fetched_miners_info[`miner${minerId}`].level >=
                MINE_MAX_LEVEL_PER_MINER
            ) {
                throw ERRORS.VALIDATION("Max level reached for miner");
            }

            mineProfile.being_upgraded_miner_id = minerId;

            let targetUpgradeLevel = (fetched_miners_info[`miner${minerId}`]
                .level + 1) as MineUpgradeLevel;

            let { coinCost: coinsToBePaid } =
                MINE_UPGRADE_INFO[targetUpgradeLevel];

            let now = new Date();
            mineProfile.upgrade_timer = now.toISOString();

            await ProfileService.deductCoins(userId, coinsToBePaid);
            await ProfileService.updateMineralGenerationRate(userId);

            await MineDAO.saveMineProfile(mineProfile);
            return mineProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to start miner upgrade: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Completes the upgrade process for a specific mineral miner.
     */
    static async upgradeMinerEnd(
        userId: string,
        minerId: MineMinerId,
        skipWithGem: boolean
    ) {
        try {
            const mineProfile = await MineDAO.findMineByUserId(userId);

            if (!mineProfile) {
                throw ERRORS.NOT_FOUND("Mine profile not found");
            }

            if (mineProfile.upgrade_timer === "") {
                throw ERRORS.VALIDATION("Upgrade isn't in progress");
            }

            if (mineProfile.being_upgraded_miner_id !== minerId) {
                throw ERRORS.VALIDATION("Incorrect miner index");
            }

            let fetched_miners_info = mineProfile.miners_info;

            if (
                fetched_miners_info[`miner${minerId}`].level >=
                MINE_MAX_LEVEL_PER_MINER
            ) {
                throw ERRORS.VALIDATION("Max level reached");
            }

            let targetUpgradeLevel = (fetched_miners_info[`miner${minerId}`]
                .level + 1) as MineUpgradeLevel;

            let timeToWait = MINE_UPGRADE_INFO[targetUpgradeLevel].time;

            let now = new Date();
            let startTime = new Date(mineProfile.upgrade_timer);
            let passedTime = Math.floor(now.getTime() - startTime.getTime());

            if (passedTime < 0) {
                throw ERRORS.VALIDATION("Invalid time");
            }

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

            mineProfile.being_upgraded_miner_id = -1;
            mineProfile.miners_info[`miner${minerId}`].level += 1;
            mineProfile.upgrade_timer = "";

            await ProfileService.updateMineralGenerationRate(userId);

            await MineDAO.saveMineProfile(mineProfile);
            return mineProfile;
        } catch (error) {
            if (error instanceof Error && "code" in error) {
                throw error;
            }
            throw ERRORS.DB_ERROR(
                `Failed to complete miner upgrade: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }
}
