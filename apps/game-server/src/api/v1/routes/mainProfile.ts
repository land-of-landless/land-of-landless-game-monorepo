// import router from express
import { auth } from "@colyseus/auth";
import { Router, Request, Response, NextFunction } from "express";
import ProfileController from "@/api/v1/controllers/mainProfile";
import {
    validateBody,
    PROFILE_LOOT_BOX_SCHEMA,
    UPDATE_PROFILE_SCHEMA,
    USE_REFERRAL_CODE_SCHEMA,
} from "@/validators/schemas";

const MAIN_PROFILE_ROUTER = Router();

MAIN_PROFILE_ROUTER.get(
    "/authenticated",
    auth.middleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        await ProfileController.getMainProfile(req, res, next);
    }
);

MAIN_PROFILE_ROUTER.get(
    "/:userId",
    auth.middleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        await ProfileController.getMainProfile(req, res, next);
    }
);

MAIN_PROFILE_ROUTER.post(
    "/update-preferences",
    auth.middleware(),
    validateBody(UPDATE_PROFILE_SCHEMA),
    async (req: Request, res: Response, next: NextFunction) => {
        await ProfileController.updatePreferences(req, res, next);
    }
);

/**
 * open the lootbox
 * has modes like start, end, end-with-gems, end-with-key
 */
MAIN_PROFILE_ROUTER.post(
    "/loot-box/open",
    auth.middleware(),
    validateBody(PROFILE_LOOT_BOX_SCHEMA),
    async (req: Request, res: Response, next: NextFunction) => {
        await ProfileController.openLootBox(req, res, next);
    }
);

MAIN_PROFILE_ROUTER.post(
    "/daily-reward/claim",
    auth.middleware(),
    async (req: Request, res: Response, next: NextFunction) => {
        await ProfileController.claimDailyReward(req, res, next);
    }
);

MAIN_PROFILE_ROUTER.post(
    "/referral/use",
    auth.middleware(),
    validateBody(USE_REFERRAL_CODE_SCHEMA),
    async (req: Request, res: Response, next: NextFunction) => {
        await ProfileController.useReferralCode(req, res, next);
    }
);

export default MAIN_PROFILE_ROUTER;
