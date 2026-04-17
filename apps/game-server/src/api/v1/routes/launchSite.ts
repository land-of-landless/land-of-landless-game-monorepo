/**
 * Launch Site API Routes
 * Defines the REST API endpoints for launch site operations including:
 * - Retrieving launch site profile
 * - Starting and completing launch site upgrades
 * - Launching items from the launch site
 */

import { Router, Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { auth } from "@colyseus/auth";
import LaunchSiteController from "../controllers/launchSite";
import {
    validateBody,
    launchSiteUpgradeSchema,
    launchItemSchema,
    LaunchSiteUpgradeInput,
    LaunchItemInput,
} from "@/validators/schemas";

const router = Router();

// GET /launch-site/profile - Retrieve the authenticated user's launch site profile
router.get(
    "/profile",
    auth.middleware(),
    async (
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) => {
        await LaunchSiteController.getLaunchSiteProfile(req, res, next);
    },
);

// POST /launch-site/upgrade/start - Initiate the launch site upgrade process
router.post(
    "/upgrade/start",
    auth.middleware(),
    async (
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) => {
        await LaunchSiteController.upgradeStart(req, res, next);
    },
);

// POST /launch-site/upgrade/end - Complete the launch site upgrade (with optional gem skip)
router.post(
    "/upgrade/end",
    auth.middleware(),
    validateBody(launchSiteUpgradeSchema),
    async (
        req: Request<ParamsDictionary, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await LaunchSiteController.upgradeEnd(req, res, next);
    },
);

// POST /launch-site/launch - Launch an item from the launch site with success chance calculation
router.post(
    "/launch",
    auth.middleware(),
    validateBody(launchItemSchema),
    async (
        req: Request<ParamsDictionary, any, any>,
        res: Response,
        next: NextFunction,
    ) => {
        await LaunchSiteController.launchItem(req, res, next);
    },
);

export default router;
