import { Mutable, Async, MutableEvents, MutableOptions, Resolver } from ".";

export class Transformer<S, T> extends Resolver<T> {
  constructor(
    readonly source: Mutable<S>,
    readonly transform: (value: S) => Async<T | Mutable<T>>,
    options?: MutableOptions<T>
  ) {
    super(options);

    const valueListener: MutableEvents<S>["value"] = async (value) => {
      try {
        this._resolve(await this.transform(value));
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
  }
}
