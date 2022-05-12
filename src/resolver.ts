import { MutableBase, MutableOptions } from "./base";

export interface ResolverOptions<T> extends MutableOptions<T> {
  source?: T | MutableBase<T>;
}

export class Resolver<T> extends MutableBase<T> {
  constructor(options: ResolverOptions<T> = {}) {
    super(options);

    this._setValue = this._setValue.bind(this);
    this._setError = this._setError.bind(this);

    this.on("detach", () => {
      this._source?.off("value", this._setValue);
      this._source?.off("error", this._setError);
    });

    if ("source" in options) {
      this._resolve(options.source!);
    }
  }

  private _source?: MutableBase<T>;
  protected _resolve(value: T | MutableBase<T>) {
    if (value instanceof MutableBase) {
      if (this._source !== value) {
        this._source?.off("value", this._setValue);
        this._source?.off("error", this._setError);

        value.on("value", this._setValue);
        value.on("error", this._setError);

        this._source = value;
      }
    } else {
      this._setValue(value);
    }
  }
}
