import axios from "axios";

const oxaPayAxiosInstance = axios.create({
    baseURL: process.env.OXAPAY_BASE_URL, // Replace with your OxaPay API base URL
    timeout: 10000,
});

export default oxaPayAxiosInstance;
