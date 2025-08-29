import { Request, Response, Next, Server } from "restify";
import { ZodError } from "zod";

export function attachErrorHandler(server: Server) {
    server.on("restifyError", (_req: Request, res: Response, err: any, cb: Next) => {
        if (err instanceof ZodError) {
            const errorResponse = { error: "ValidationError", vars: [], messages: [] }
            err.issues.forEach((issue) => {
                errorResponse.vars.push(issue?.path[0] as never);
                errorResponse.messages.push(issue.message as never);
            })
            // res.send(400, { error: "ValidationError", issues: err.issues });
            res.send(400, errorResponse);
            return cb();
        }
        const status = err?.statusCode ?? 500;
        res.send(status, {
            error: err?.name ?? "Error",
            message: err?.message ?? "Internal error",
        });
        return cb();
    });
}
