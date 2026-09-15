import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { key } from './JWTToken';
import { JWT } from '@/application/JWT';
import { error, http } from 'naughty-util';

const { DomainError, } = error;
const { CODES } = http;
const unauthorized = CODES.unauthorized;

@Injectable()
export class JWTGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JWT,
  ) { }

  parseBearer(headers: Record<string, string>) {
    const auth = headers.authorization;
    if (!auth) {
      throw new DomainError(
        CODES[unauthorized],
        { code: unauthorized },
      );
    }
    const parts = auth.split(" ");
    if (parts[0] !== "Bearer") {
      throw new DomainError(
        CODES[unauthorized],
        { code: unauthorized },
      );
    }
    const token = parts[1];
    if (!token) {
      throw new DomainError(
        CODES[unauthorized],
        { code: unauthorized },
      );
    }
    return token;
  }

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const type = this.reflector.get<string>(key, context.getHandler());
    req.identity = this.jwt.verify(this.parseBearer(req.headers), type);
    return true;
  }
}