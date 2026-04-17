const msInASecond = 1000;
const msInAMinute = msInASecond * 60;
const msInAnHour = msInAMinute * 60;
const msInADay = msInAnHour * 24;

export const convertMsToStringTime = (timeInMs: number) => {
    let finalResult: string[] = [];
    let isStringStarted = false;
    // calculate days in given time
    let days = Math.floor(timeInMs / msInADay);
    timeInMs -= days * msInADay;

    if (days > 0) {
        isStringStarted = true;
        finalResult.push(`${days} day${days > 1 ? "s" : ""}`);
    }

    // calculate hours in given time
    let hours = Math.floor(timeInMs / msInAnHour);
    timeInMs -= hours * msInAnHour;

    if (hours > 0) {
        finalResult.push(`${hours} hour${hours > 1 ? "s" : ""}`);
        isStringStarted = true;
    }

    // calculate minutes in given time
    let minutes = Math.floor(timeInMs / msInAMinute);
    timeInMs -= minutes * msInAMinute;

    if (minutes > 0) {
        finalResult.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
        isStringStarted = true;
    }

    // calculate seconds in given time
    let seconds = Math.floor(timeInMs / msInASecond);
    timeInMs -= seconds * msInASecond;

    if (seconds > 0) {
        finalResult.push(`${seconds} second${seconds > 1 ? "s" : ""}`);
        isStringStarted = true;
    }

    return finalResult.join(", ");
};
