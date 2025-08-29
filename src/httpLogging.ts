import pinoHttp from "pino-http";
import { accessLogger, appLogger } from "./logger";
import { randomUUID } from "node:crypto";

export const httpLogger = pinoHttp({
  logger: accessLogger,
  wrapSerializers: true,
  autoLogging: { ignore: (req) => req.url === "/health" },
  genReqId: (req) => (req.headers["x-request-id"] as string) ?? randomUUID(),
  customReceivedMessage: (req) => `req ${req.method} ${req.url}`,
  customSuccessMessage: (req, res) => `res ${res.statusCode} ${req.method} ${req.url}`,
  customErrorMessage: (req, res, err) => `err ${res.statusCode} ${req.method} ${req.url} ${err?.message}`,
  customLogLevel: (_req, res, err) => {
    if (err) return "error";
    if (res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req(req: any) {
      const ip =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
        req.connection?.remoteAddress ?? req.socket?.remoteAddress ?? req.remoteAddress;
      return { id: req.id, method: req.method, url: req.url, ip };
    },
    res(res: any) {
      return { statusCode: res.statusCode };
    },
  },
});

// middleware para ter logger de app com reqId nos handlers
export function bindAppLogger() {
  return (req: any, _res: any, next: any) => {
    req.appLog = appLogger.child({ reqId: req.id });
    next();
  };
}
