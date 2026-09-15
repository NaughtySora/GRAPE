import { SetMetadata } from "@nestjs/common";

export const key = 'roles';

export const Roles = (...roles: string[]) =>
  SetMetadata(key, new Set(roles));