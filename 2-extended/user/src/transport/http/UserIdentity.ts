import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface Identity {
  id: string;
  role: string;
}

export const UserIdentity = createParamDecorator(
  (_, ctx: ExecutionContext): Identity => ctx.switchToHttp().getRequest().identity,
);