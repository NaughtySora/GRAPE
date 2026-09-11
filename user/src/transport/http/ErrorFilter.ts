import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { type HttpLogger } from "./httpLogger";
import { http, reflection } from "naughty-util";

const CODES = http.CODES;
const { inspect } = reflection;

@Catch()
export class ErrorFilter implements ExceptionFilter {
  constructor(private readonly logger: HttpLogger) { }

  catch(e: any, context: ArgumentsHost) {
    const protocol = context.switchToHttp();
    const res = protocol.getResponse();
    this.logger(protocol.getRequest(), res);
    const { message, status, code = status, response } = e;
    const statusCode = code ?? 400;
    res.status(statusCode).send({
      statusCode,
      message: code ? message : CODES[statusCode],
      error: response?.error ?? CODES[statusCode],
    });
    inspect(e);
  }
}