// import pino from "pino";

// export const logger = pino({
//   level: process.env.LOG_LEVEL || "info",
//   redact: { paths: ["req.headers.authorization", "password", "body.senha"], remove: true }
// });

import fs from "node:fs";
import pino, { LoggerOptions } from "pino";

fs.mkdirSync("logs", { recursive: true });

const base: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  msgPrefix: "api ",
  redact: { paths: ["req.headers.authorization", "password", "body.senha"], remove: true },
};

const isDev = process.env.NODE_ENV !== "production";

export const appLogger = isDev
  ? pino({
      ...base,
      transport: {
        targets: [
          { target: "pino-pretty", options: { translateTime: "SYS:standard" } },             // console
          { target: "pino/file", options: { destination: "logs/app.log", mkdir: true } },    // arquivo
          { target: "pino/file", options: { destination: "logs/error.log", mkdir: true }, level: "error" },
        ],
      },
    })
  : pino({
      ...base,
      transport: {
        targets: [
          { target: "pino/file", options: { destination: "logs/app.log", mkdir: true } },
          { target: "pino/file", options: { destination: "logs/error.log", mkdir: true }, level: "error" },
        ],
      },
    });

// use o MESMO logger para access log, mudando apenas o destino quando quiser separar
export const accessLogger = isDev
  ? pino({
      ...base,
      transport: {
        targets: [
          { target: "pino-pretty", options: { translateTime: "SYS:standard" } },             // console
          { target: "pino/file", options: { destination: "logs/access.log", mkdir: true } }, // arquivo
        ],
      },
    })
  : pino({
      ...base,
      transport: { targets: [{ target: "pino/file", options: { destination: "logs/access.log", mkdir: true } }] },
    });
