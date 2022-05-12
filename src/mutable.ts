import {
  Async,
  Fetcher,
  FetcherOptions,
  Mutable,
  MutableOptions,
  Proxy,
} from "./core";

export class MutableValue<T> extends Mutable<T> {
  value(value: T) {
    this._setValue(value);
  }
}

export function create<T>(
  source: () => Async<T | Mutable<T>>,
  options?: FetcherOptions<T>
): Fetcher<T>;
export function create<T>(options?: MutableOptions<T>): MutableValue<T>;
export function create<T>(
  ...args:
    | [source: () => Async<T | Mutable<T>>, options?: FetcherOptions<T>]
    | [options?: MutableOptions<T>]
) {
  if (typeof args[0] === "function") {
    return new Fetcher(args[0], args[1]);
  } else {
    return new MutableValue<T>(args[0]);
  }
}

export function resolve<T>(value: T | MutableValue<T>) {
  return new Proxy({ target: value });
}

export function all<T extends any[] | readonly any[]>(mutables: T) {
  return mutables.reduce(
    (acc, val) =>
      acc.bind((arr: any[]) => resolve(val).bind((rval) => [...arr, rval])),
    new Mutable({ initialValue: [] })
  ) as Mutable<{
    [K in keyof T]: T[K] extends Mutable<infer S> ? S : T[K];
  }>;
}
