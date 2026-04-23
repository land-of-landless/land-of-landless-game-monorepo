import { Router, Request, Response, NextFunction } from "express";
import { auth } from "@colyseus/auth";
import GeneralController from "../controllers/general.ts";

const generalProfileRouter = Router();

generalProfileRouter.get(
    "/all-user-profiles/:userId",
    auth.middleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        await GeneralController.getAllProfiles(req, res, next);
    },
);

generalProfileRouter.get(
    "/all-user-profiles/authenticated",
    auth.middleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        await GeneralController.getAllProfiles(req, res, next);
    },
);

generalProfileRouter.post(
    "/update-all-profiles/authenticated",
    auth.middleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        await GeneralController.updateAllProfilesForUser(req, res, next);
    },
);

generalProfileRouter.post(
    "/update-all-profiles/:userId",
    auth.middleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        await GeneralController.updateAllProfilesForUser(req, res, next);
    },
);

export default generalProfileRouter;
