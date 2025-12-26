/**
 * Result type for treating errors as data
 * Inspired by Rust's Result type and functional programming patterns
 */

/**
 * Success variant of Result
 */
export type Ok<T> = {
    readonly ok: true;
    readonly value: T;
  };
  
  /**
   * Error variant of Result
   */
  export type Err<E> = {
    readonly ok: false;
    readonly error: E;
  };
  
  /**
   * Result type that represents either success (Ok) or failure (Err)
   * Forces explicit error handling at the type level
   */
  export type Result<T, E = Error> = Ok<T> | Err<E>;
  
  /**
   * Creates an Ok result
   */
  export function ok<T>(value: T): Ok<T> {
    return { ok: true, value };
  }
  
  /**
   * Creates an Err result
   */
  export function err<E>(error: E): Err<E> {
    return { ok: false, error };
  }
  
  /**
   * Type guard to check if a Result is Ok
   */
  export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
    return result.ok === true;
  }
  
  /**
   * Type guard to check if a Result is Err
   */
  export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
    return result.ok === false;
  }
  
  /**
   * Wraps a Promise to return a Result instead of throwing
   * Useful for converting async functions to Result-based APIs
   */
  export async function wrap<T, E = Error>(
    promise: Promise<T>
  ): Promise<Result<T, E>> {
    try {
      const value = await promise;
      return ok(value);
    } catch (error) {
      return err(error as E);
    }
  }
  
  /**
   * Wraps a synchronous function to return a Result instead of throwing
   */
  export function wrapSync<T, E = Error>(fn: () => T): Result<T, E> {
    try {
      const value = fn();
      return ok(value);
    } catch (error) {
      return err(error as E);
    }
  }
  
  /**
   * Maps the value of an Ok result, leaving Err unchanged
   */
  export function map<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => U
  ): Result<U, E> {
    if (isOk(result)) {
      return ok(fn(result.value));
    }
    return result;
  }
  
  /**
   * Maps the error of an Err result, leaving Ok unchanged
   */
  export function mapErr<T, E, F>(
    result: Result<T, E>,
    fn: (error: E) => F
  ): Result<T, F> {
    if (isErr(result)) {
      return err(fn(result.error));
    }
    return result;
  }
  
  /**
   * Chains Result operations (flatMap)
   * If the result is Ok, applies the function; otherwise returns the Err
   */
  export function andThen<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>
  ): Result<U, E> {
    if (isOk(result)) {
      return fn(result.value);
    }
    return result;
  }
  
  /**
   * Unwraps the value from an Ok result, or throws if Err
   * Use sparingly - prefer explicit error handling
   */
  export function unwrap<T, E>(result: Result<T, E>): T {
    if (isOk(result)) {
      return result.value;
    }
    throw result.error;
  }
  
  /**
   * Unwraps the value from an Ok result, or returns the default if Err
   */
  export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    if (isOk(result)) {
      return result.value;
    }
    return defaultValue;
  }
  
  /**
   * Unwraps the error from an Err result, or throws if Ok
   * Use sparingly - prefer explicit error handling
   */
  export function unwrapErr<T, E>(result: Result<T, E>): E {
    if (isErr(result)) {
      return result.error;
    }
    throw new Error('Called unwrapErr on an Ok result');
  }
  