// import router from express
import { auth } from "@colyseus/auth";
import { Router, Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import ProfileController from "@/api/v1/controllers/mainProfile";
import {
    validateBody,
    profileLootBoxSchema,
    ProfileLootBoxInput,
    updateProfileSchema,
    UpdateProfileInput,
    useReferralCodeSchema,
    UseReferralCodeInput,
} from "@/validators/schemas";

const mainProfileRouter = Router();

mainProfileRouter.get(
    "/authenticated",
    auth.middleware(),
    async (
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) => {
        await ProfileController.getMainProfile(req, res, next);
    },
);

mainProfileRouter.get(
    "/:userId",
    auth.middleware(),
    async (
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) => {
        await ProfileController.getMainProfile(req, res, next);
    },
);

mainProfileRouter.post(
    "/update-preferences",
    auth.middleware(),
    validateBody(updateProfileSchema),
    async (
        req: Request<ParamsDictionary, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await ProfileController.updatePreferences(req, res, next);
    },
);

mainProfileRouter.post(
    "/lootbox/open",
    auth.middleware(),
    validateBody(profileLootBoxSchema),
    async (
        req: Request<ParamsDictionary, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await ProfileController.openLootBox(req, res, next);
    },
);

mainProfileRouter.post(
    "/daily-reward/claim",
    auth.middleware(),
    async (
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) => {
        await ProfileController.claimDailyReward(req, res, next);
    },
);

mainProfileRouter.post(
    "/referral/use",
    auth.middleware(),
    validateBody(useReferralCodeSchema),
    async (
        req: Request<ParamsDictionary, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await ProfileController.useReferralCode(req, res, next);
    },
);

export default mainProfileRouter;
