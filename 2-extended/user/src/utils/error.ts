
interface ErrorUtils {
  throwNullable(condition: unknown, e?: Error): asserts condition;
}

const error: ErrorUtils = {
  throwNullable(
    condition,
    e = new Error('Value is null or undefined')
  ) { if (condition == null) throw e; }
};

export default error;
