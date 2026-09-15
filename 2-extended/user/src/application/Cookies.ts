import { Injectable } from "@nestjs/common";
import { Response, Request } from "express";

@Injectable()
export class Cookies {
  constructor(private readonly options) { }

  getOptions(key: string) {
    if (!Object.hasOwn(this.options, key)) {
      throw new Error(`No cookie options for key ${key}`);
    }
    return this.options[key]();
  }

  set(res: Response, key: string, value: string) {
    res.cookie(key, value, this.getOptions(key));
  }

  get(req: Request, key: string) {
    return req.cookies[key];
  }

  getSigned(req: Request, key: string) {
    return req.signedCookies[key];
  }

  delete(res: Response, key: string) {
    res.clearCookie(key);
  }
}