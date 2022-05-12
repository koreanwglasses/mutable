import { Mutable, MutableOptions } from "./mutable";

export interface ResolverOptions<T> extends MutableOptions<T> {
  source?: T | Mutable<T>;
}

export class Resolver<T> extends Mutable<T> {
  constructor(options: ResolverOptions<T> = {}) {
    super(options);

    this._setValue = this._setValue.bind(this);
    this._setError = this._setError.bind(this);

    this.on("detach", () => {
      this._source?.off("value", this._setValue);
      this._source?.off("error", this._setError);
      this._source = undefined;
    });

    if ("source" in options) {
      this._resolve(options.source!);
    }
  }

  private _source?: Mutable<T>;
  protected _resolve(value: T | Mutable<T>) {
    if (value instanceof Mutable) {
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
