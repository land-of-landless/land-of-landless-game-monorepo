import { Router, Request, Response, NextFunction } from "express";
import { auth } from "@colyseus/auth";
import { mineController } from "../controllers/mine.ts";
import {
    validateBody,
    mineUpgradeSchema,
    MineUpgradeInput,
} from "@/validators/schemas.js";

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
    validateBody(mineUpgradeSchema),
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        await mineController.upgrade(req, res, next);
    },
);

export default mineRouter;
