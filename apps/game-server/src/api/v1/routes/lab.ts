import { Router, Request, Response, NextFunction } from "express";
import { auth } from "@colyseus/auth";
import LabController from "../controllers/lab.ts";
import {
    validateBody,
    LAB_UPGRADE_SCHEMA,
    LAB_UPGRADE_ITEM_SCHEMA,
    LabUpgradeInput,
    LabUpgradeItemInput,
} from "@/validators/schemas.js";

const labRouter = Router();

labRouter.get(
    "/:userId",
    auth.middleware(),
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        await LabController.getLabProfile(req, res, next);
    },
);

labRouter.post(
    "/upgrade",
    auth.middleware(),
    validateBody(LAB_UPGRADE_SCHEMA),
    async (
        req: Request<any, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await LabController.upgradeLab(req, res, next);
    },
);

labRouter.post(
    "/upgrade-item",
    auth.middleware(),
    validateBody(LAB_UPGRADE_ITEM_SCHEMA),
    async (
        req: Request<any, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await LabController.upgradeItem(req, res, next);
    },
);

export default labRouter;
