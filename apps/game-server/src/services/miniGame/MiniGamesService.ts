import { MINI_GAMES_INFO } from "@/constants/miniGames.js";
import ProfileService from "@/services/mainProfile/ProfileService.js";
import { MiniGamesDAO } from "@/daos/postgres/miniGames.js";
import { ERRORS } from "@/common/errors/appError.js";
import _ from "lodash";

export default class MiniGamesService {
    static async runGame1(userId: string) {
        await ProfileService.chargeEnergy(userId, (MINI_GAMES_INFO as any).game1?.energyCost);
        return { result: "success" };
    }

    static async handleGame2(userId: string, operation: string, userGuess?: number) {
        await ProfileService.chargeEnergy(userId, (MINI_GAMES_INFO as any).game2?.energyCost);
        return { result: "success" };
    }

    static async handleGame3(userId: string, operation: string, userGuess?: number) {
        await ProfileService.chargeEnergy(userId, (MINI_GAMES_INFO as any).game3?.energyCost);
        return { result: "success" };
    }

    static async handleGame4(userId: string, operation: string, userGuess?: number) {
        await ProfileService.chargeEnergy(userId, (MINI_GAMES_INFO as any).game4?.energyCost);
        return { result: "success" };
    }
}
