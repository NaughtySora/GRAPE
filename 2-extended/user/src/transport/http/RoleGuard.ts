import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { error, http } from "naughty-util";
import { key } from './Roles';

const { DomainError, } = error;
const { CODES, } = http;
const { forbidden, unauthorized } = CODES;

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const roles = this.reflector.get<Set<string>>(
      key,
      context.getHandler(),
    );
    if (!roles || roles.size === 0) return true;
    const user = req?.user;
    if (!user) {
      throw new DomainError(
        CODES[unauthorized],
        { details: { user }, code: unauthorized },
      );
    }
    const role = user?.role;
    if (!role || !roles.has(role)) {
      throw new DomainError(
        CODES[forbidden],
        { details: { user }, code: forbidden },
      );
    }
    return true;
  }
}
