import { gemsPerMinute } from "@/constants/mainProfile";

/**
 * Converts time in milliseconds to the number of gems to be paid
 * @param timeInMs - Time duration in milliseconds
 * @returns Number of gems calculated based on the time duration and gems per minute rate
 * @throws Error if timeInMs is negative
 */
export const turnTimeInMsToGemsToBePaid = (timeInMs: number): number => {
    if (timeInMs < 0) {
        throw new Error("Time in milliseconds cannot be negative");
    }

    if (!Number.isFinite(timeInMs)) {
        throw new Error("Time in milliseconds must be a finite number");
    }

    const timeInMinutes = timeInMs / 1000 / 60;
    const gemsToPay = Math.ceil(timeInMinutes) * gemsPerMinute;

    return gemsToPay;
};
