import { Mutable, Async, MutableEvents, MutableOptions, Proxy } from ".";

export interface TransformerOptions<T> extends MutableOptions<T> {
  /**
   * By default, a transformer only executes `transform` once a client
   * is attached. To compute as soon as `source` resolves, set `lazy` to false
   */
  lazy?: boolean;
}

export class Transformer<S, T> extends Proxy<T> {
  constructor(
    readonly source: Mutable<S>,
    readonly transform: (value: S) => Async<T | Mutable<T>>,
    options: TransformerOptions<T> = {}
  ) {
    super(options);
    const { lazy = true } = options;

    const valueListener: MutableEvents<S>["value"] = async (value) => {
      try {
        this._resolveTo(await this.transform(value));
      } catch (error) {
        this._setError(error);
      }
    };

    const errorListener: MutableEvents<S>["error"] = (error) =>
      this._setError(error);

    this.on("attach", () => {
      this.source.on("value", valueListener);
      this.source.on("error", errorListener);
    });

    this.on("detach", () => {
      this.source.off("value", valueListener);
      this.source.off("error", errorListener);
    });

    if (!lazy) {
      this.source.once("value", valueListener);
    }
  }
}
