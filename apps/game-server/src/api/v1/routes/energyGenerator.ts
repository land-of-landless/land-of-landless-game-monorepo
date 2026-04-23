import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import EnergyGeneratorController from "../controllers/energyGenerator.ts";
import { auth } from "@colyseus/auth";
import {
    validateBody,
    energyGeneratorUpgradeSchema,
    EnergyGeneratorUpgradeInput,
} from "@/validators/schemas.js";

const energyGeneratorRouter = Router();

energyGeneratorRouter.get(
    "/:userId",
    auth.middleware(),
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        await EnergyGeneratorController.getEnergyGeneratorProfile(
            req,
            res,
            next,
        );
    },
);

energyGeneratorRouter.post(
    "/upgrade",
    auth.middleware(),
    validateBody(energyGeneratorUpgradeSchema),
    async (
        req: Request<any, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await EnergyGeneratorController.upgradeEnergyGenerator(req, res, next);
    },
);

energyGeneratorRouter.post(
    "/add-panel",
    auth.middleware(),
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        await EnergyGeneratorController.addPanel(req, res, next);
    },
);

export default energyGeneratorRouter;
