import { Request, Response, NextFunction } from "express";

function normalizeIp(ip?: string | string[]) {
    if (!ip) return undefined;

    const value = Array.isArray(ip) ? ip[0] : ip;

    return value.replace("::ffff:", "").trim();
}

function extractClientIp(req: Request): string | undefined {
    const cfIp = req.headers["cf-connecting-ip"];
    if (cfIp) return normalizeIp(cfIp);

    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        const first = Array.isArray(forwarded)
            ? forwarded[0]
            : forwarded.split(",")[0];
        return normalizeIp(first);
    }

    if (req.ip) return normalizeIp(req.ip);

    const socketIp = req.socket?.remoteAddress;
    if (socketIp) return normalizeIp(socketIp);

    return undefined;
}

export function clientIpMiddleware(
    req: Request & { clientIp?: string },
    _res: Response,
    next: NextFunction,
) {
    req.clientIp = extractClientIp(req);
    next();
}
