import axios from "axios";
import { appConfig } from "@/config/environment.js";

const HelioPayAxiosInstance = axios.create({
    baseURL: appConfig.helio.baseUrl,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        cacheControl: "no-cache",
        Authorization: `Bearer ${appConfig.helio.apiSecret}`,
    },
    timeout: 10000,
});

export default HelioPayAxiosInstance;
