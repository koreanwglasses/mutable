import { Mutable, MutableOptions } from "./mutable";

export interface ProxyOptions<T> extends MutableOptions<T> {
  target?: T | Mutable<T>;
}

export class Proxy<T> extends Mutable<T> {
  constructor(options: ProxyOptions<T> = {}) {
    super(options);

    this._setValue = this._setValue.bind(this);
    this._setError = this._setError.bind(this);

    this.on("detach", () => {
      this._target?.off("value", this._setValue);
      this._target?.off("error", this._setError);
      this._target = undefined;
    });

    if ("target" in options) {
      this._resolveTo(options.target!);
    }
  }

  private _target?: Mutable<T>;
  protected _resolveTo(target: T | Mutable<T>) {
    if (target instanceof Mutable) {
      if (this._target !== target) {
        this._target?.off("value", this._setValue);
        this._target?.off("error", this._setError);

        target.on("value", this._setValue);
        target.on("error", this._setError);

        this._target = target;
      }
    } else {
      this._setValue(target);
    }
  }
}
