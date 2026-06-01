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
        const mineProfile = await MineDAO.findMineByUserId(userId);
        if (!mineProfile) throw ERRORS.NOT_FOUND("Mine profile not found");
        // ... implementation
        await MineDAO.saveMineProfile(mineProfile);
        return mineProfile;
    }

    static async upgradeMinerEnd(userId: string, minerId: MineMinerId, skipWithGem: boolean): Promise<any> {
        const mineProfile = await MineDAO.findMineByUserId(userId);
        if (!mineProfile) throw ERRORS.NOT_FOUND("Mine profile not found");
        // ... implementation
        await MineDAO.saveMineProfile(mineProfile);
        return mineProfile;
    }
}
