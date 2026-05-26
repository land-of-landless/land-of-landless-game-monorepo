import { DAILY_CLAIM_REWARDS } from "@/constants/mainProfile.js";
import { MiniGamesLootBox } from "@/constants/miniGames.ts";
import { Schema, Entity } from "redis-om";

// 1 is for the new worker bot
export type WorkerBotType = 0 | 1;

export interface MainProfile extends Entity {
    /**
     * userId is the unique identifier for a user
     * it is used to identify a user in the database
     */
    userId: string;

    // preferences: {
    //     /**
    //      * profilePictureIndex is the index of the profile picture the user has
    //      */
    //     profilePictureIndex: number;
    //     /**
    //      * name is the name of the user
    //      */
    //     name: string;
    //     /**
    //      * representedFlag is the country code or custom flag code that the user wants to represent
    //      */
    //     representedFlag?: string;
    // };
    /**
     * profilePictureIndex is the index of the profile picture the user has
     */
    profilePictureIndex: number;
    /**
     * name is the name of the user
     */
    name: string;
    /**
     * representedFlag is the country code or custom flag code that the user wants to represent
     */
    representedFlag?: string;

    /**
     * refCode is the unique identifier for a user
     * it is used to refer to a user
     */
    refCode: string;
    /**
     * game_pass is a boolean that indicates if the user has a game pass
     */
    game_pass: boolean;
    /** game_pass_purchase_time is the time when the user purchased the game pass */
    game_pass_purchase_time: string;
    /*
     * worker_bots is an array of worker bots that the user has
     */
    worker_bots: WorkerBotType[];
    /**
     * lootBoxes is an array of loot boxes that the user has
     */
    lootBoxes: (MiniGamesLootBox | "")[];
    /**
     * lootBoxesTimers is an array of timers for each loot box
     */
    lootBoxesTimers: string[];
    /**
     * lootBoxesOpeningRate is the rate at which the user can open loot boxes
     */
    lootBoxesOpeningRate: number;
    /**
     * lootBox_keys is the number of keys the user has
     */
    lootBox_keys: number;
    /**
     * lootBoxes_opened is an array of the number of times the user has opened each loot box
     */
    lootBoxes_opened: number[];
    /**
     * coins is the number of coins the user has
     */
    coins: number;
    /**
     * gems is the number of gems the user has
     */
    gems: number;
    /**
     * tickets_type1 is the number of type 1 tickets the user has
     */
    tickets_type1: number;
    /**
     * tickets_type2 is the number of type 2 tickets the user has
     */
    tickets_type2: number;
    /**
     * xp is the amount of experience the user has
     */
    xp: number;
    /**
     * energy is the amount of energy the user has
     */
    energy: number;
    /**
     * energy_generation_rate is the rate at which the user generates energy
     */
    energy_generation_rate: number;
    /**
     * energy_max is the maximum amount of energy the user can have
     */
    energy_max: number;
    /**
     * energy_updated_at is the time when the user's energy was last updated
     */
    energy_updated_at: string;
    /**
     * mineral is the amount of mineral the user has
     */
    mineral: number;
    /**
     * the rate which mineral is generated both from explorers and also miners
     */
    mineral_generation_rate: number;
    /**
     * max amount of minerals storable
     */
    mineral_max: number;
    /**
     * the time when the user's mineral was last updated
     */
    mineral_updated_at: string;
    /**
     * normal trash can be anything depending on season and content
     */
    atmosphere_trash_type1: number;
    /**
     * an empty astroid not much different than a trash type 1, but you can treat it differently
     */
    atmosphere_trash_type2: number;
    /**
     * the time when the user's atmosphere trash was last updated
     */
    atmosphere_trash_updated_at: string;
    /**
     * the time when the user's last daily reward was claimed
     */
    lastDailyRewardClaimedAt: string;
    /**
     * the number of consecutive claims
     */
    dailyRewardClaimCounter: number;
    /**
     * the user's referrer's user ID
     */
    referredBy: string;
    /**
     * number of referrals the user has
     */
    referrals: number;
}

export const mainProfileSchema = new Schema<MainProfile>(
    "mainProfile",
    {
        userId: {
            type: "string",
            indexed: true,
        },

        // Profile Metadata
        refCode: {
            type: "string",
            indexed: true,
        },
        referredBy: {
            type: "string",
            indexed: true,
        },
    },
    {
        dataStructure: "JSON",
    }
);

export default mainProfileSchema;
