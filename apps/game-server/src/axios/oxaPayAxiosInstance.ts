import axios from "axios";
import { appConfig } from "@/config/environment.js";

const oxaPayAxiosInstance = axios.create({
    baseURL: appConfig.oxapay.baseUrl,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        merchant_api_key: appConfig.oxapay.merchantApiKey,
    },
    timeout: 15000,
});

export default oxaPayAxiosInstance;
