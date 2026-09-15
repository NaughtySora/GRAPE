import { misc } from "naughty-util";
import { randomInt, randomUUID } from "node:crypto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

const helpers = {
  email: () => `user${Math.random()
    .toString(16).substring(1)}@gmail.com`,
  uuid: randomUUID,
  int() {
    return randomInt(Math.pow(2, 48) - 1).toString();
  },
  username() {
    return `Test-name-${this.uuid()}`;
  }
} as const;

const check = async (dto, obj) => await validate(
  plainToInstance(dto, obj),
  { whitelist: true, forbidNonWhitelisted: true, }
);

const validation = {
  async expectError(dto, target, expected) {
    const run = check.bind(null, dto);
    const tests = await Promise.all(target.map(item => run(item)));
    if (tests.length === 1 && tests[0].length === 0) return;
    expected.forEach((item, idx) => {
      const isArray = Array.isArray(tests[idx]);
      if (isArray) {
        const first = tests[idx].shift();
        if (first?.constraints) {
          return void expect(first?.constraints).toStrictEqual(item);
        }
        const errors = first?.children[0];
        if (errors?.constraints) {
          return void expect(errors?.constraints).toStrictEqual(item);
        }
        const constraints = errors.children.reduce((acc, error) => {
          return Object.assign(acc, error.constraints);
        }, {});
        expect(constraints).toStrictEqual(item);
      } else {
        expect(tests[idx][0].constraints).toStrictEqual(item);
      }
    });
  },
  async expectValid(dto, target) {
    const run = check.bind(null, dto);
    const tests = await Promise.all(target.map(item => run(item)));
    tests.forEach(item => expect(item).toStrictEqual([]));
  },
};

const random: typeof misc.random & typeof helpers = misc.random.bind(null);

Object.assign(random, helpers);

export default {
  date: {
    iso: (delay = 0) => new Date(Date.now() + delay).toISOString(),
    in: (delay = 0) => Date.now() + delay,
  },
  random,
  validation,
};
