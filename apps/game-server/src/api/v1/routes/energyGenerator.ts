import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import EnergyGeneratorController from "../controllers/energyGenerator.ts";
import { auth } from "@colyseus/auth";
import {
    validateBody,
    ENERGY_GENERATOR_UPGRADE_SCHEMA,
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
    validateBody(ENERGY_GENERATOR_UPGRADE_SCHEMA),
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
