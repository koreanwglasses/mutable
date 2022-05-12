import { Mutable, Async, MutableOptions } from "./mutable";

export interface FetcherOptions<T> extends MutableOptions<T> {
  /**
   * By default, a mutable source only fetches once a client
   * is attached. To fetch immediately, set `lazy` to false
   */
  lazy?: boolean;
}

export class Fetcher<T> extends Mutable<T> {
  constructor(readonly fetch: () => Async<T>, options: FetcherOptions<T> = {}) {
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
      this.value(await this.fetch());
    } catch (error) {
      this.error(error);
    }
  }
}
