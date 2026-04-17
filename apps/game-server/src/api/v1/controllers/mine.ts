import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { MineDAO } from "@/daos/redis/mine";
import MineService from "@/services/mine/MineService";
import { MineUpgradeInput } from "@/validators/schemas";
import { MINE_MINER_ID_TYPE } from "@/constants/mine";
import { ApiResponse } from "../utils/response";
import _ from "lodash";
import { ERRORS } from "@/common/errors/appError";

export class mineController {
    static async getMineProfile(
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const userId = req.params.userId;

            if (_.isArray(userId)) {
                throw ERRORS.VALIDATION("Invalid userId");
            }

            const mineProfile = await MineDAO.findMineByUserId(
                userId as string,
            );
            return ApiResponse.success(res, mineProfile);
        } catch (error) {
            next(error);
        }
    }

    static async upgrade(
        req: Request<ParamsDictionary, any, MineUpgradeInput>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const operation = req.body.operation;
            const mineId = req.body.mineId as MINE_MINER_ID_TYPE;
            const userId = req.auth!.userId;

            if (operation === "start") {
                const startToUpgradeTime = await MineService.upgradeMinerStart(
                    userId,
                    mineId,
                );
                return ApiResponse.success(res, {
                    status: "success",
                    success: true,
                    startToUpgradeTime,
                });
            } else if (operation === "end") {
                await MineService.upgradeMinerEnd(userId, mineId, false);
                return ApiResponse.success(res, {
                    status: "success",
                    success: true,
                });
            } else if (operation === "end-with-gem") {
                await MineService.upgradeMinerEnd(userId, mineId, true);
                return ApiResponse.success(res, {
                    status: "success",
                    success: true,
                });
            }

            throw new Error("Invalid operation");
        } catch (error) {
            next(error);
        }
    }
}
