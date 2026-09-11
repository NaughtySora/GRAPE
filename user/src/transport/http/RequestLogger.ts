import { tap } from 'rxjs';
import {
  CallHandler, ExecutionContext,
  Injectable, NestInterceptor,
} from '@nestjs/common';
import { type HttpLogger } from './httpLogger';

@Injectable()
export class RequestLogger implements NestInterceptor {
  constructor(private readonly logger: HttpLogger) { }

  intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp();
    return next
      .handle()
      .pipe(tap(() => void this.logger(http.getRequest(), http.getResponse(),
      )));
  }
}