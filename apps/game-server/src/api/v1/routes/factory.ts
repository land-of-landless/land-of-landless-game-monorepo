import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import FactoryController from "../controllers/factory.ts";
import { auth } from "@colyseus/auth";
import {
    validateBody,
    FACTORY_UPGRADE_SCHEMA,
    FACTORY_BUILD_ITEM_SCHEMA,
    FactoryUpgradeInput,
    FactoryBuildItemInput,
} from "@/validators/schemas";

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
    validateBody(FACTORY_UPGRADE_SCHEMA),
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
    validateBody(FACTORY_BUILD_ITEM_SCHEMA),
    async (
        req: Request<any, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await FactoryController.buildItem(req, res, next);
    },
);

export default factoryRouter;
