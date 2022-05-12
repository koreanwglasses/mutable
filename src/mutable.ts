import {
  Async,
  Fetcher,
  FetcherOptions,
  Mutable as MutableBase,
  MutableOptions,
  Resolver,
} from "./core";

class Mutable<T> extends MutableBase<T> {
  value(value: T) {
    this._setValue(value);
  }
}

export function create<T>(
  source: () => Async<T | MutableBase<T>>,
  options?: FetcherOptions<T>
): Fetcher<T>;
export function create<T>(options?: MutableOptions<T>): Mutable<T>;
export function create<T>(
  ...args:
    | [source: () => Async<T | MutableBase<T>>, options?: FetcherOptions<T>]
    | [options?: MutableOptions<T>]
) {
  if (typeof args[0] === "function") {
    return new Fetcher(args[0], args[1]);
  } else {
    return new Mutable<T>(args[0]);
  }
}

export function resolve<T>(value: T | Mutable<T>) {
  return new Resolver({ source: value });
}

export function all<T extends any[] | readonly any[]>(mutables: T) {
  return mutables.reduce(
    (acc, val) =>
      acc.bind((arr: any[]) => resolve(val).bind((rval) => [...arr, rval])),
    new MutableBase({ initialValue: [] })
  ) as MutableBase<{
    [K in keyof T]: T[K] extends MutableBase<infer S> ? S : T[K];
  }>;
}
