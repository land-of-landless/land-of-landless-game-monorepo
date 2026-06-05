import { NextFunction, Request, Response } from "express";
import LaunchSiteDAO from "@/daos/launchSite.js";
import LaunchSiteService from "@/services/launchSite/LaunchSiteService.js";
import { LaunchSiteUpgradeInput, LaunchItemInput } from "@/validators/schemas.js";
import { LAUNCH_SITE_NOT_FOUND } from "@/api/v1/errors/index.js";
import { ApiResponse } from "../utils/response.ts";

export default class LaunchSiteController {
    static async getLaunchSiteProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.auth!.userId;
            const launchSite = await LaunchSiteDAO.findLaunchSiteByUserId(userId);

            if (!launchSite) {
                return ApiResponse.error(res, 404, "404", "LAUNCH_SITE_NOT_FOUND", LAUNCH_SITE_NOT_FOUND);
            }

            return ApiResponse.success(res, launchSite);
        } catch (error) {
            next(error);
        }
    }

    static async upgradeStart(req: Request<any, any, LaunchSiteUpgradeInput>, res: Response, next: NextFunction) {
        try {
            const upgradeTimer = await LaunchSiteService.upgradeLaunchSiteStart(req.auth!.userId);
            return ApiResponse.success(res, { upgradeTimer });
        } catch (error: any) {
            next(error);
        }
    }

    static async upgradeEnd(req: Request<any, any, LaunchSiteUpgradeInput>, res: Response, next: NextFunction) {
        try {
            const { skipWithGem } = req.body;
            const launchSite = await LaunchSiteService.upgradeLaunchSiteEnd(req.auth!.userId, skipWithGem);
            return ApiResponse.success(res, launchSite);
        } catch (error: any) {
            next(error);
        }
    }

    static async launchItem(req: Request<any, any, LaunchItemInput>, res: Response, next: NextFunction) {
        try {
            const { itemType } = req.body;
            const launchSite = await LaunchSiteService.launchItem(req.auth!.userId, itemType);
            return ApiResponse.success(res, launchSite);
        } catch (error: any) {
            next(error);
        }
    }
}
