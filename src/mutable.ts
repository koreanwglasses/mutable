import { TypedEmitter } from "tiny-typed-emitter";
import { Transformer } from "./transformer";

export type Async<T> = T | Promise<T>;

export interface MutableEvents<T> {
  /**
   * See node docs
   * @internal
   */
  newListener: <K extends keyof MutableEvents<T>>(
    eventName: K,
    listener: MutableEvents<T>[K]
  ) => void;

  /**
   * See node docs
   * @internal
   */
  removeListener: <K extends keyof MutableEvents<T>>(
    eventName: K,
    listener: MutableEvents<T>[K]
  ) => void;

  /**
   * Emitted when the value of the mutable has changed or initialized
   */
  value: (value: T) => void;

  /**
   * Emitted when an error occurs while attempting to update the
   * mutable
   */
  error: (error: unknown) => void;

  /**
   * Emitted when all clients (i.e. listeners for the "value" event) have detached
   */
  detach: () => void;

  /**
   * Emitted when a new client (i.e. a listener for the "value" event) has attached when there previously were none
   */
  attach: () => void;
}

export type PublicEvents<T> = Omit<
  MutableEvents<T>,
  "newListener" | "removeListener"
>;

export interface MutableOptions<T> {
  initialValue?: T;
  compare?: (a: T, b: T) => number;
}

export enum MutableState {
  Pending,
  Resolved,
  Rejected,
}

export class Mutable<T> {
  private _emitter = new TypedEmitter<MutableEvents<T>>();

  private _internal:
    | {
        state: MutableState.Pending;
      }
    | { state: MutableState.Resolved; value: T }
    | { state: MutableState.Rejected; error: unknown } = {
    state: MutableState.Pending,
  };

  constructor(options: MutableOptions<T> = {}) {
    if ("initialValue" in options) {
      this._internal = {
        state: MutableState.Resolved,
        value: options.initialValue!,
      };
    }

    this._emitter.on("newListener", (eventName, listener) => {
      if (
        eventName === "value" &&
        this._internal.state === MutableState.Resolved
      ) {
        (listener as MutableEvents<T>["value"])(this._internal.value);
      }

      if (
        eventName === "error" &&
        this._internal.state === MutableState.Rejected
      ) {
        (listener as MutableEvents<T>["error"])(this._internal.error);
      }

      if (eventName === "value" && this._emitter.listenerCount("value") === 1) {
        this._emitter.emit("attach");
      }
    });

    this._emitter.on("removeListener", (eventName) => {
      if (eventName === "value" && this._emitter.listenerCount("value") === 0) {
        this._emitter.emit("detach");
      }
    });
  }

  on<K extends keyof PublicEvents<T>>(
    eventName: K,
    listener: MutableEvents<T>[K]
  ) {
    this._emitter.on(eventName, listener);
  }

  once<K extends keyof PublicEvents<T>>(
    eventName: K,
    listener: MutableEvents<T>[K]
  ) {
    this._emitter.once(eventName, listener);
  }

  off<K extends keyof PublicEvents<T>>(
    eventName: K,
    listener: MutableEvents<T>[K]
  ) {
    this._emitter.off(eventName, listener);
  }

  value(value: T) {
    if (
      this._internal.state !== MutableState.Resolved ||
      JSON.stringify(this._internal.value) !== JSON.stringify(value)
    ) {
      this._emitter.emit("value", value);
    }

    this._internal = { state: MutableState.Resolved, value };
  }

  error(error: unknown) {
    this._emitter.emit("error", error);
    this._internal = { state: MutableState.Rejected, error };
  }

  bind<U>(transform: (value: T) => Promise<U>): Transformer<T, U> {
    return new Transformer(this, transform);
  }
}
