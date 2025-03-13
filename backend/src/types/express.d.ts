declare namespace Express {
    export interface Request {
        user?: {
            sub: number;
            email: string;
            role: string;
            iat?: number;
            exp?: number;
            // add any other properties that are in your JWT payload
        }
    }
} 