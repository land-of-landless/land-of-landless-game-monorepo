import { Router, Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { auth } from "@colyseus/auth";
import LabController from "../controllers/lab";
import {
    validateBody,
    labUpgradeSchema,
    labUpgradeItemSchema,
    LabUpgradeInput,
    LabUpgradeItemInput,
} from "@/validators/schemas";

const labRouter = Router();

labRouter.get(
    "/:userId",
    auth.middleware(),
    async (
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) => {
        await LabController.getLabProfile(req, res, next);
    },
);

labRouter.post(
    "/upgrade",
    auth.middleware(),
    validateBody(labUpgradeSchema),
    async (
        req: Request<ParamsDictionary, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await LabController.upgradeLab(req, res, next);
    },
);

labRouter.post(
    "/upgrade-item",
    auth.middleware(),
    validateBody(labUpgradeItemSchema),
    async (
        req: Request<ParamsDictionary, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await LabController.upgradeItem(req, res, next);
    },
);

export default labRouter;
