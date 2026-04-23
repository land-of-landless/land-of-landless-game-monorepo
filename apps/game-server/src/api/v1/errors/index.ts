import { AppError } from "@/common/errors/appError.js";
import _ from "lodash";

//
//
// general errors starting with "99"
//
//
export const UNKNOWN_ERROR = (error: any) =>
    new AppError(_.isNil(error.message) ? "unknown error" : error.message, {
        httpCode: 400,
        code: 9900,
        status: "UNKNOWN_ERROR",
        error_obj: error,
    });

// validation error
export const INVALID_INPUT = (errors: any) =>
    new AppError("Invalid input", {
        httpCode: 400,
        code: 9901,
        status: "invalid input",
        error_obj: errors,
    });

export const INVALID_SOURCE_IP = (error: any) =>
    new AppError(_.isNil(error.message) ? "unknown error" : error.message, {
        httpCode: 400,
        code: 9902,
        status: "invalid source IP",
        error_obj: error,
    });

// Call back error
export const INVALID_PAYMENT_CALLBACK = (error: any) =>
    new AppError(_.isNil(error.message) ? "unknown error" : error.message, {
        httpCode: 400,
        code: 9903,
        status: "invalid input",
        error_obj: error,
    });

//
//
// profile errors starting with "10"
//
//
export const PROFILE_NOT_FOUND = new AppError("Profile not found", {
    httpCode: 404,
    code: 1001,
    status: "profile not found",
});

export const NOT_ENOUGH_ENERGY = new AppError("not enough energy", {
    httpCode: 400,
    code: 1002,
    status: "not enough energy",
});

export const NOT_ENOUGH_COINS = new AppError("not enough coins", {
    httpCode: 400,
    code: 1007,
    status: "not enough coins",
});

export const NOT_ENOUGH_MINERALS = new AppError("not enough minerals", {
    httpCode: 400,
    code: 1008,
    status: "not enough minerals",
});

export const NOT_ENOUGH_SPACE_FOR_LOOTBOX = new AppError(
    "not enough space for loot box",
    {
        httpCode: 400,
        code: 1003,
        status: "not enough space for loot box",
    },
);

export const LOOTBOX_NOT_FOUND = new AppError("loot box not found", {
    httpCode: 404,
    code: 1004,
    status: "loot box not found",
});

export const LOOTBOX_ALREADY_OPENED = new AppError("loot box already opened", {
    httpCode: 400,
    code: 1005,
    status: "loot box already opened",
});

export const LOOTBOX_IS_NOT_OPENED = new AppError("loot box is not opened", {
    httpCode: 400,
    code: 1006,
    status: "first open the loot box",
});

//
// Launch Site errors starting with "11"
//
export const LAUNCH_SITE_NOT_FOUND = new AppError("Launch site not found", {
    httpCode: 404,
    code: 1101,
    status: "launch site not found",
});

export const LAUNCH_SITE_UPGRADE_IN_PROGRESS = new AppError(
    "Upgrade already in progress",
    {
        httpCode: 400,
        code: 1102,
        status: "upgrade in progress",
    },
);

export const INSUFFICIENT_RESOURCES = new AppError(
    "Insufficient resources for upgrade",
    {
        httpCode: 400,
        code: 1103,
        status: "insufficient resources",
    },
);

export const LAUNCH_SITE_MAX_LEVEL_REACHED = new AppError(
    "Launch site is at maximum level",
    {
        httpCode: 400,
        code: 1104,
        status: "max level reached",
    },
);

export const INSUFFICIENT_GEMS = new AppError("Not enough gems", {
    httpCode: 400,
    code: 1105,
    status: "insufficient gems",
});

//
//
// Payment Errors starting with 20
//
//

/*
 * When incoming request doesn't have credentials required
 */
export const PAYMENT_UNAUTHENTICATED_REQUEST = new AppError(
    "Payment callback - unauthenticated request",
    {
        httpCode: 401,
        code: 2001,
        status: "unauthenticated request",
    },
);

export const PAYMENT_INVALID_PAYLINK = new AppError("Invalid paylinkId", {
    httpCode: 400,
    code: 2002,
    status: "invalid paylink",
});

export const PAYMENT_INVALID_USER = new AppError("Invalid user", {
    httpCode: 400,
    code: 2003,
    status: "invalid user",
});

export const PAYMENT_INVALID_INVOICE = new AppError("Invoice is invalid", {
    httpCode: 400,
    code: 2004,
    status: "invalid invoice",
});

export const PAYMENT_INVOICE_NOT_PAID = new AppError("Invoice is not paid", {
    httpCode: 400,
    code: 2005,
    status: "invoice not paid",
});

//
//
// MiniGames Errors starting with 30
//
//

export const MINIGAME_INVALID_OPERATION = new AppError(
    "Invalid operation provided",
    {
        httpCode: 400,
        code: 3001,
        status: "invalid operation",
    },
);

export const MINIGAME_MISSING_GUESS = new AppError(
    "userGuess is required when operation is 'guess'",
    {
        httpCode: 400,
        code: 3002,
        status: "missing guess",
    },
);

//
//
// Referral Errors starting with 40
//
//

export const REFERRAL_ALREADY_USED = new AppError(
    "Referral code already used",
    {
        httpCode: 400,
        code: 4001,
        status: "referral already used",
    },
);

export const REFERRAL_CODE_INVALID = new AppError("Invalid referral code", {
    httpCode: 404,
    code: 4002,
    status: "invalid referral code",
});

export const REFERRAL_SELF_USE = new AppError(
    "You cannot use your own referral code",
    {
        httpCode: 400,
        code: 4003,
        status: "self referral",
    },
);
