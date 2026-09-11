process.loadEnvFile('.admin.env');
import { NestHttpServer } from "@/transport/http";
import { logger } from "naughty-util";
import { httpLogger } from "@/transport/http/httpLogger";
import { RequestLogger } from "@/transport/http/RequestLogger";
import { ErrorFilter } from "@/transport/http/ErrorFilter";
import ValidationPipe from "@/transport/http/ValidationPipe";
import helmet from "helmet";
import express from "express";
import cookieParser from "cookie-parser";
import config from "./config";
import { AdminModule } from "./module";

const http = config.admin.http;

void async function () {
  const requestLogger = httpLogger.bind(null, logger);
  const server = await new NestHttpServer(AdminModule);

  server
    .name('Admin User Service')
    .pipe(new ValidationPipe())
    .interceptor(new RequestLogger(requestLogger))
    .filter(new ErrorFilter(requestLogger))
    .logger(logger)
    .use(helmet(http.helmet))
    .use(express.json({ limit: http.maxJSONBodySize, }))
    .use(cookieParser(http.cookie.secret))
    .setGlobalPrefix(config.prefix);

  await server.start(http.port);

  const exit = async (code: number, message: any) => {
    const mode = code > 0 ? 'error' : 'log';
    logger[mode]('Application stopped',
      `code ${code},`, `message: ${message}`);
    try {
      await server.stop();
      process.exit(code);
    } catch (e) {
      logger.error(e);
      process.exit(1);
    }
  };

  const shutdown = exit.bind(null, 0);
  const error = exit.bind(null, 1);

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("uncaughtException", error);
}();
