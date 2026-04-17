import { Router, Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { auth } from "@colyseus/auth";
import { mineController } from "../controllers/mine";
import {
    validateBody,
    mineUpgradeSchema,
    MineUpgradeInput,
} from "@/validators/schemas";

const mineRouter = Router();

mineRouter.get(
    "/:userId",
    auth.middleware(),
    async (
        req: Request<ParamsDictionary>,
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
        req: Request<ParamsDictionary, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await mineController.upgrade(req, res, next);
    },
);

export default mineRouter;
