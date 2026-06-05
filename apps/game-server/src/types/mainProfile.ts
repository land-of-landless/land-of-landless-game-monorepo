import { MiniGamesLootBox } from "@/constants/miniGames.js";

export type WorkerBotType = 0 | 1;

export interface MainProfile {
    userId: string;
    profilePictureIndex: number;
    name: string;
    representedFlag?: string;
    refCode: string;
    game_pass: boolean;
    game_pass_purchase_time: string;
    worker_bots: WorkerBotType[];
    lootBoxes: (MiniGamesLootBox | "")[];
    lootBoxesTimers: string[];
    lootBoxesOpeningRate: number;
    lootBox_keys: number;
    lootBoxes_opened: number[];
    coins: number;
    gems: number;
    tickets_type1: number;
    tickets_type2: number;
    xp: number;
    energy: number;
    energy_generation_rate: number;
    energy_max: number;
    energy_updated_at: string;
    mineral: number;
    mineral_generation_rate: number;
    mineral_max: number;
    mineral_updated_at: string;
    atmosphere_trash_type1: number;
    atmosphere_trash_type2: number;
    atmosphere_trash_updated_at: string;
    lastDailyRewardClaimedAt: string;
    dailyRewardClaimCounter: number;
    referredBy: string;
    referrals: number;
}
