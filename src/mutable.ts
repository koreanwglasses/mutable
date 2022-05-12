import { MutableBase } from ".";

export class Mutable<T> extends MutableBase<T> {
  value(value: T) {
    this._setValue(value);
  }
}
