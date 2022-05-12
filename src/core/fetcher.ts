import { Mutable, Async, MutableOptions, Proxy } from ".";

export interface FetcherOptions<T> extends MutableOptions<T> {
  /**
   * By default, a fether only executes `fetch` once a client
   * is attached. To fetch immediately, set `lazy` to false
   */
  lazy?: boolean;
}

export class Fetcher<T> extends Proxy<T> {
  constructor(
    readonly fetch: () => Async<T | Mutable<T>>,
    options: FetcherOptions<T> = {}
  ) {
    super(options);

    const { lazy = true } = options;
    if (lazy) {
      this.once("attach", () => this.refresh());
    } else {
      this.refresh();
    }
  }

  async refresh() {
    try {
      this._resolveTo(await this.fetch());
    } catch (error) {
      this._setError(error);
    }
  }
}
