import { error, reflection } from "naughty-util";

const { DomainError } = error;

const CODES = {
  success: {
    ok: 2000,
  },
  error: {
    not_found: 2004,
    fail: 2222,
  },
} as const;

export namespace ApplicationContract {

  export function success(data: any) {
    return { status: 'ok', code: CODES.success.ok, data, };
  }

  export function fail<E extends Error>(e: E, message: string, details?: any) {
    const error = new DomainError(message, { cause: e, details });
    Error.captureStackTrace(error, fail);
    reflection.inspect(error);
    return {
      message: e?.message ?? message,
      status: 'fail',
      code: CODES.error.fail,
      retry: false,
      data: null,
    };
  }

  export function notFound(message: string) {
    return {
      message,
      status: 'error',
      code: CODES.error.not_found,
      retry: false,
      data: null
    };
  }

  export const codes = CODES;
}
