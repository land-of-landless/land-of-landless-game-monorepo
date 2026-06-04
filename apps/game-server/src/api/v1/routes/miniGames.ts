import { auth } from "@colyseus/auth";
import { Router, Request, Response, NextFunction } from "express";
import MiniGamesController from "../controllers/miniGames.ts";
import {
    validateBody,
    MINI_GAME_1_SCHEMA,
    MINI_GAME_2_SCHEMA,
    MiniGame2Input,
    MINI_GAME_3_SCHEMA,
    MiniGame3Input,
    MINI_GAME_4_SCHEMA,
    MiniGame4Input,
} from "@/validators/schemas";

const miniGamesRouter = Router();

miniGamesRouter.post(
    "/game1",
    auth.middleware(),
    // validateBody(MINI_GAME_1_SCHEMA),
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        await MiniGamesController.runGame1(req, res, next);
    },
);

miniGamesRouter.post(
    "/game2",
    auth.middleware(),
    validateBody(MINI_GAME_2_SCHEMA),
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        await MiniGamesController.runGame2(req, res, next);
    },
);

miniGamesRouter.post(
    "/game3",
    auth.middleware(),
    validateBody(MINI_GAME_3_SCHEMA),
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        await MiniGamesController.runGame3(req, res, next);
    },
);

miniGamesRouter.post(
    "/game4",
    auth.middleware(),
    validateBody(MINI_GAME_4_SCHEMA),
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        await MiniGamesController.runGame4(req, res, next);
    },
);

export default miniGamesRouter;
