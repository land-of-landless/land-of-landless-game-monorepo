import { MineDAO } from "@/daos/postgres/mine.js";
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

export default class MineService {
    static async upgradeMinerStart(userId: string, minerId: MineMinerId): Promise<any> {
        try {
            const mineProfile = await MineDAO.findMineByUserId(userId);
            if (!mineProfile) throw ERRORS.NOT_FOUND("Mine profile not found");
            if (mineProfile.upgrade_timer !== "") throw ERRORS.VALIDATION("Another Mine is being upgraded");
            if (minerId > MINE_MAX_MINER_COUNT) throw ERRORS.VALIDATION("Incorrect miner index");
            if (mineProfile.being_upgraded_miner_id !== -1) throw ERRORS.VALIDATION("Another miner is being upgraded");

            const currentLevel = (mineProfile.miners_info as any)[`miner${minerId}`].level;
            if (currentLevel >= MINE_MAX_LEVEL_PER_MINER) throw ERRORS.VALIDATION("Max level reached for miner");

            const targetUpgradeLevel = (currentLevel + 1) as MineUpgradeLevel;
            const { coinCost } = MINE_UPGRADE_INFO[targetUpgradeLevel];

            await ProfileService.deductCoins(userId, coinCost);

            mineProfile.being_upgraded_miner_id = minerId;
            mineProfile.upgrade_timer = new Date().toUTCString();

            await MineDAO.saveMineProfile(mineProfile);
            return mineProfile;
        } catch (error) {
            throw error;
        }
    }

    static async upgradeMinerEnd(userId: string, minerId: MineMinerId, skipWithGem: boolean): Promise<any> {
        try {
            const mineProfile = await MineDAO.findMineByUserId(userId);
            if (!mineProfile) throw ERRORS.NOT_FOUND("Mine profile not found");
            if (mineProfile.upgrade_timer === "") throw ERRORS.VALIDATION("Upgrade not in progress");
            if (mineProfile.being_upgraded_miner_id !== minerId) throw ERRORS.VALIDATION("Incorrect miner index");

            const currentLevel = (mineProfile.miners_info as any)[`miner${minerId}`].level;
            const targetUpgradeLevel = (currentLevel + 1) as MineUpgradeLevel;
            const timeToWait = MINE_UPGRADE_INFO[targetUpgradeLevel].time;
            const startTime = new Date(mineProfile.upgrade_timer);
            const passedTime = Date.now() - startTime.getTime();

            if (skipWithGem) {
                const remainingTime = Math.max(0, timeToWait - passedTime);
                const gemsToPay = turnTimeInMsToGemsToBePaid(remainingTime);
                await ProfileService.deductGems(userId, gemsToPay);
            } else {
                if (passedTime < timeToWait) throw ERRORS.VALIDATION("Not enough time passed");
            }

            mineProfile.being_upgraded_miner_id = -1;
            (mineProfile.miners_info as any)[`miner${minerId}`].level += 1;
            mineProfile.upgrade_timer = "";

            await ProfileService.updateMineralGenerationRate(userId);
            await MineDAO.saveMineProfile(mineProfile);
            return mineProfile;
        } catch (error) {
            throw error;
        }
    }
}
