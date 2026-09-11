process.loadEnvFile('.integration.env');
import { NestHttpServer } from "@/transport/http";
import { logger } from "naughty-util";
import { httpLogger } from "@/transport/http/httpLogger";
import { RequestLogger } from "@/transport/http/RequestLogger";
import { ErrorFilter } from "@/transport/http/ErrorFilter";
import ValidationPipe from "@/transport/http/ValidationPipe";
import { IntegrationModule } from "./module";
import config from "./config";

const http = config.integration.http;

void async function () {
  const requestLogger = httpLogger.bind(null, logger);
  const server = await new NestHttpServer(IntegrationModule);

  server
    .name('Integration User Service')
    .pipe(new ValidationPipe())
    .interceptor(new RequestLogger(requestLogger))
    .filter(new ErrorFilter(requestLogger))
    .logger(logger)
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
