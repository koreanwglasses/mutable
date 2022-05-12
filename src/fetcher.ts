import { MutableBase, Async, MutableOptions, Resolver } from ".";

export interface FetcherOptions<T> extends MutableOptions<T> {
  /**
   * By default, a mutable source only fetches once a client
   * is attached. To fetch immediately, set `lazy` to false
   */
  lazy?: boolean;
}

export class Fetcher<T> extends Resolver<T> {
  constructor(
    readonly fetch: () => Async<T | MutableBase<T>>,
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
      this._resolve(await this.fetch());
    } catch (error) {
      this._setError(error);
    }
  }
}
