
import { ISCSignature } from '@/application/ISCSignature';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { http } from 'naughty-util';

@Injectable()
export class HMACGuard implements CanActivate {
  constructor(
    private readonly signature: ISCSignature,
  ) { }

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { headers, method, path, query } = req;
    this.signature.verify(
      [http.query(path, query), method, headers.ts, req.body],
      headers.signature
    );
    return true;
  }
}
