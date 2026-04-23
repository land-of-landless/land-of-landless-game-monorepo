import { Router, Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/response.ts";

const systemHealthRouter = Router();

systemHealthRouter.get(
    "/ip",
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            return ApiResponse.success(res, req.clientIp);
        } catch (error) {
            return next(error);
        }
    },
);

systemHealthRouter.get(
    "/ping",
    async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            return ApiResponse.success(res, "pong");
        } catch (error) {
            return next(error);
        }
    },
);

export default systemHealthRouter;
