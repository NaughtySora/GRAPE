import { palette, http, misc } from "naughty-util";
import { Request, Response } from "express";

const { COLORS, dye } = palette;
const { yellow, green, blue, red } = COLORS;
const { parseURL } = http;
const { inRange, timestamp } = misc;

const codeColor = (code: number) => {
  if (inRange(code, 200, 299)) return green;
  if (inRange(code, 300, 399)) return blue;
  return red;
};

const codeLog = (code: number) => {
  if (inRange(code, 200, 299)) return 'log';
  if (inRange(code, 300, 399)) return 'info';
  return 'error';
};

export const httpLogger = (logger: Pick<Console, "log">, req: Request, res: Response) => {
  const stop = timestamp();
  const { url, method, headers, socket, } = req;
  const ip = socket.remoteAddress ?? headers['x-forwarded-for'] ?? null;
  const { 1: port } = (headers?.host ?? "").split(':');
  const parsed = parseURL(url);
  if (!parsed) return;
  const { pathname: path, searchParams } = parsed;
  res.once('finish', () => {
    logger[codeLog(res.statusCode)]([
      [dye(yellow, 'path: '), path],
      [dye(codeColor(res.statusCode), 'code: '), res.statusCode],
      [dye(yellow, 'port: '), port ?? null],
      [dye(yellow, 'method: '), method],
      [dye(yellow, 'search: '), JSON.stringify(Object.fromEntries(searchParams))],
      [dye(yellow, 'ms: '), stop().seconds.toString()],
      [dye(yellow, 'ip: '), ip],
      [dye(yellow, 'agent: '), headers['user-agent'] ?? null],
      [dye(yellow, 'referrer: '), headers['referer'] ?? null],
    ].map(entry => `${entry[0]}${entry[1]}`).join(' '));
  });
};

export type HttpLogger = (req: Request, res: Response) => void;