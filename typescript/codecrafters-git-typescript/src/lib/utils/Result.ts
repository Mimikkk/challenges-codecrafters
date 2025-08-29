type Okkable<T> = T | (() => T) | Result<T, never>;
type Errable<E> = E | (() => E) | Result<never, E>;

const isEmpty = (value: unknown): value is undefined | null | "" =>
  value === undefined || value === null || value === "";

export class Result<T, E> {
  private constructor(
    private readonly ok: boolean,
    public readonly value: T,
    public readonly error: E,
  ) {}

  static ok<T>(value: Okkable<T>): Result<T, never> {
    if (value instanceof Result) {
      return value;
    }

    return new Result<T, never>(true, value instanceof Function ? value() : value, undefined!);
  }

  static err<E>(error: Errable<E>): Result<never, E> {
    if (error instanceof Result) {
      return error;
    }

    return new Result<never, E>(false, undefined!, error instanceof Function ? error() : error);
  }

  static when<T, E>(
    predicate: (() => boolean) | boolean,
    ok: Okkable<T>,
    err: Errable<E>,
  ): Result<T, E> {
    if (predicate instanceof Function ? predicate() : predicate) {
      return Result.ok(ok);
    }

    return Result.err(err);
  }

  static maybe<T, E>(value: T, error: Errable<E>): Result<NonNullable<T>, E> {
    if (!isEmpty(value)) {
      return Result.ok<NonNullable<T>>(value as NonNullable<T>);
    }

    return Result.err(error);
  }

  isOk(): this is Result<T, never> {
    return this.ok;
  }

  isErr(): this is Result<never, E> {
    return !this.ok;
  }

  map<U extends unknown | Result<unknown, unknown>>(
    fn: (value: T) => U,
  ): Result<
    U extends Result<infer T, infer _> ? T : U,
    U extends Result<infer _, infer NewE> ? NewE | E : E
  > {
    if (this.ok) {
      const result = fn(this.value as T);

      if (result instanceof Result) {
        return result;
      }

      return Result.ok(result as never);
    }

    return Result.err(this.error as never);
  }

  mapOr<U>(fn: (value: T) => U, defaultValue: U): U {
    if (this.isOk()) {
      return fn(this.value);
    }

    return defaultValue;
  }

  match<U>(ok: (value: T) => U, err: (error: E) => U): U {
    if (this.isOk()) {
      return ok(this.value);
    }

    return err(this.error);
  }
}
