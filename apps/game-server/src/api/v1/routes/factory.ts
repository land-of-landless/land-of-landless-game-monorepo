import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import FactoryController from "../controllers/factory.ts";
import { auth } from "@colyseus/auth";
import {
    validateBody,
    factoryUpgradeSchema,
    factoryBuildItemSchema,
    FactoryUpgradeInput,
    FactoryBuildItemInput,
} from "@/validators/schemas.js";

const factoryRouter = Router();

factoryRouter.get(
    "/:userId",
    auth.middleware(),
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        await FactoryController.getFactoryProfile(req, res, next);
    },
);

factoryRouter.post(
    "/upgrade",
    auth.middleware(),
    validateBody(factoryUpgradeSchema),
    async (
        req: Request<any, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await FactoryController.upgradeFactory(req, res, next);
    },
);

factoryRouter.post(
    "/build-item",
    auth.middleware(),
    validateBody(factoryBuildItemSchema),
    async (
        req: Request<any, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await FactoryController.buildItem(req, res, next);
    },
);

export default factoryRouter;
