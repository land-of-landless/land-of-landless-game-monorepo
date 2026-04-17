declare namespace Express {
    export interface Request {
        auth?: {
            userId: string;
            iat: number;
        };
        clientIp?: string;
    }
}
