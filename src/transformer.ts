import { Mutable, Async, MutableEvents, MutableOptions } from "./mutable";

export class Transformer<S, T> extends Mutable<T> {
  constructor(
    readonly source: Mutable<S>,
    readonly transform: (value: S) => Async<T>,
    options?: MutableOptions<T>
  ) {
    super(options);

    const valueListener: MutableEvents<S>["value"] = async (value) => {
      try {
        this.value(await this.transform(value));
      } catch (error) {
        this.error(error);
      }
    };

    const errorListener: MutableEvents<S>["error"] = (error) =>
      this.error(error);

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
