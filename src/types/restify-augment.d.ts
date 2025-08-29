import "restify";

declare module "restify" {
    interface Request {
        query?: {
            limit?: string | number;
            offset?: string | number;
            [k: string]: unknown;
        };
        params?: {
            id?: string | number
        }
    }
}