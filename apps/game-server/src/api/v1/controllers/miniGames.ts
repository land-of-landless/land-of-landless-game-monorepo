import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ApiResponse } from "../utils/response";
import {
    MiniGame2Input,
    MiniGame3Input,
    MiniGame4Input,
} from "@/validators/schemas";
import MiniGamesService from "@/services/miniGame/MiniGamesService";
import _ from "lodash";

export default class MiniGamesController {
    static async runGame1(
        req: Request<ParamsDictionary>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            if (_.isNil(req.auth)) {
                return ApiResponse.error(
                    res,
                    401,
                    "Unauthorized",
                    "Unauthorized",
                );
            }

            const result = await MiniGamesService.runGame1(req.auth.userId);
            return ApiResponse.success(res, result);
        } catch (error) {
            return next(error);
        }
    }

    static async runGame2(
        req: Request<ParamsDictionary, any, MiniGame2Input>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            if (_.isNil(req.auth)) {
                return ApiResponse.error(
                    res,
                    401,
                    "Unauthorized",
                    "Unauthorized",
                );
            }

            const { operation, userGuess } = req.body;
            const result = await MiniGamesService.handleGame2(
                req.auth.userId,
                operation,
                userGuess,
            );
            return ApiResponse.success(res, result);
        } catch (error) {
            return next(error);
        }
    }

    static async runGame3(
        req: Request<ParamsDictionary, any, MiniGame3Input>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            if (_.isNil(req.auth)) {
                return ApiResponse.error(
                    res,
                    401,
                    "Unauthorized",
                    "Unauthorized",
                );
            }

            const { operation, userGuess } = req.body;
            const result = await MiniGamesService.handleGame3(
                req.auth.userId,
                operation,
                userGuess,
            );
            return ApiResponse.success(res, result);
        } catch (error) {
            return next(error);
        }
    }

    static async runGame4(
        req: Request<ParamsDictionary, any, MiniGame4Input>,
        res: Response,
        next: NextFunction,
    ) {
        try {
            if (_.isNil(req.auth)) {
                return ApiResponse.error(
                    res,
                    401,
                    "Unauthorized",
                    "Unauthorized",
                );
            }

            const { operation, userGuess } = req.body;
            const result = await MiniGamesService.handleGame4(
                req.auth.userId,
                operation,
                userGuess,
            );
            return ApiResponse.success(res, result);
        } catch (error) {
            return next(error);
        }
    }
}
