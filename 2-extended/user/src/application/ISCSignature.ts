import { HmacSignatureOptions, HmacSignature } from "./HmacSignature";
import { date, error, http, array, } from 'naughty-util';

const { SECOND } = date;
const { DomainError } = error;
const { CODES } = http;
const { forbidden, } = CODES;

type JSONStringifyable = any;
type ISCSignatureOptions = HmacSignatureOptions & { skew: number };

const unix = () => Math.floor(Date.now() / SECOND);

export class ISCSignature extends HmacSignature {
  #skew;

  constructor(options: ISCSignatureOptions) {
    super({
      algo: options.algo,
      secret: options.secret,
      encoding: options.encoding,
    });
    this.#skew = options.skew;
  }

  #expired(ts) {
    const diff = Math.abs(unix() - ts);
    if (
      !Number.isFinite(diff) ||
      this.#skew < diff
    ) {
      throw new Error('signature is expired');
    }
  }

  #parseTimestamp(ts) {
    if (!ts) throw new TypeError('invalid timestamp');
    const parsed = parseInt(ts, 10);
    if (!Number.isFinite(parsed)) {
      throw new TypeError('invalid timestamp');
    }
    return parsed;
  }
  //@ts-ignore
  sign(path: string, method: string, body?: JSONStringifyable) {
    const ts = unix().toString();
    const payload = [path, method, ts];
    if (body !== undefined) payload.push(body);
    return { signature: super.sign(JSON.stringify(payload)), ts };
  }
  
  //@ts-ignore
  verify(
    payload: [path: string, method: string, ts: string, body?: JSONStringifyable,],
    signature: string
  ) {
    try {
      if (!array.valid(payload, 3)) {
        throw new Error('invalid payload length');
      }
      this.#expired(this.#parseTimestamp(payload[2]));
      super.verify(JSON.stringify(payload), signature);
    } catch (cause) {
      throw new DomainError(
        CODES[forbidden],
        { code: forbidden, cause },
      );
    }
  }

  get skew() {
    return this.#skew;
  }
}