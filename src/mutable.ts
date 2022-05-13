import { Mutable, MutableOptions, Proxy } from "./core";

export class MutableValue<T> extends Mutable<T> {
  value(value: T) {
    this._setValue(value);
  }
}

const VOID = Symbol("VOID") as any;

export const mutable = Object.assign(
  function <T>(value: T = VOID, options?: MutableOptions<T>) {
    if (value === VOID) {
      return new MutableValue<T>(options);
    } else {
      return new MutableValue<T>({ ...options, initialValue: value });
    }
  },
  {
    resolve<T>(value: T | MutableValue<T>) {
      return new Proxy({ target: value });
    },

    all<T extends any[] | readonly any[]>(mutables: T) {
      return mutables.reduce(
        (acc, val) =>
          acc.bind((arr: any[]) =>
            mutable.resolve(val).bind((rval) => [...arr, rval])
          ),
        new Mutable({ initialValue: [] })
      ) as Mutable<{
        [K in keyof T]: T[K] extends Mutable<infer S> ? S : T[K];
      }>;
    },
  }
);
