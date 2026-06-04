import { Router, Request, Response, NextFunction } from "express";
import { auth } from "@colyseus/auth";
import { mineController } from "../controllers/mine.ts";
import {
    validateBody,
    MINE_UPGRADE_SCHEMA,
    MineUpgradeInput,
} from "@/validators/schemas";

const mineRouter = Router();

mineRouter.get(
    "/:userId",
    auth.middleware(),
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        await mineController.getMineProfile(req, res, next);
    },
);

mineRouter.post(
    "/upgrade",
    auth.middleware(),
    validateBody(MINE_UPGRADE_SCHEMA),
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        await mineController.upgrade(req, res, next);
    },
);

export default mineRouter;
