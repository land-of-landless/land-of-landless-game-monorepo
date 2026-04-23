import { auth } from "@colyseus/auth";
import { Router, Request, Response, NextFunction } from "express";
import MiniGamesController from "../controllers/miniGames.ts";
import {
    validateBody,
    miniGame1Schema,
    miniGame2Schema,
    MiniGame2Input,
    miniGame3Schema,
    MiniGame3Input,
    miniGame4Schema,
    MiniGame4Input,
} from "@/validators/schemas.js";

const miniGamesRouter = Router();

miniGamesRouter.post(
    "/game1",
    auth.middleware(),
    // validateBody(miniGame1Schema),
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
    validateBody(miniGame2Schema),
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
    validateBody(miniGame3Schema),
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
    validateBody(miniGame4Schema),
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        await MiniGamesController.runGame4(req, res, next);
    },
);

export default miniGamesRouter;
