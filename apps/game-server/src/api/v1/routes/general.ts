import { Router, Request, Response, NextFunction } from "express";
import { auth } from "@colyseus/auth";
import { ParamsDictionary } from "express-serve-static-core";
import GeneralController from "../controllers/general";

const generalProfileRouter = Router();

generalProfileRouter.get(
    "/all-user-profiles/:userId",
    auth.middleware(),
    async (
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) => {
        await GeneralController.getAllProfiles(req, res, next);
    },
);

generalProfileRouter.get(
    "/all-user-profiles/authenticated",
    auth.middleware(),
    async (
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) => {
        await GeneralController.getAllProfiles(req, res, next);
    },
);

generalProfileRouter.post(
    "/update-all-profiles/authenticated",
    auth.middleware(),
    async (
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) => {
        await GeneralController.updateAllProfilesForUser(req, res, next);
    },
);

generalProfileRouter.post(
    "/update-all-profiles/:userId",
    auth.middleware(),
    async (
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) => {
        await GeneralController.updateAllProfilesForUser(req, res, next);
    },
);

export default generalProfileRouter;
