// StylePropertyMap implementation
import {HTMLElementBase} from "../elements";

export class StylePropertyMapImpl implements StylePropertyMap {
  [key: string]: any;

  constructor(private element: HTMLElementBase) {
  }

  size: number;

  get(property: string): undefined | CSSStyleValue {
    throw new Error("Method not implemented.");
  }

  getAll(property: string): CSSStyleValue[] {
    throw new Error("Method not implemented.");
  }

  has(property: string): boolean {
    throw new Error("Method not implemented.");
  }

  forEach(callbackfn: (value: CSSStyleValue[], key: string, parent: StylePropertyMapReadOnly) => void, thisArg?: any): void {
    throw new Error("Method not implemented.");
  }

  entries(): StylePropertyMapReadOnlyIterator<[string, Iterable<CSSStyleValue>]> {
    throw new Error("Method not implemented.");
  }

  keys(): StylePropertyMapReadOnlyIterator<string> {
    throw new Error("Method not implemented.");
  }

  values(): StylePropertyMapReadOnlyIterator<Iterable<CSSStyleValue>> {
    throw new Error("Method not implemented.");
  }

  [Symbol.iterator](): StylePropertyMapReadOnlyIterator<[string, Iterable<CSSStyleValue>]> {
    throw new Error("Method not implemented.");
  }

  set(property: string, ...values: (string | any)[]): void {
    const value = values[0];
    this.element.style.setProperty(property, String(value));
  }

  append(property: string, ...values: (string | any)[]): void {
    this.set(property, ...values);
  }

  delete(property: string): void {
    this.element.style.removeProperty(property);
  }

  clear(): void {
    this.element.style.cssText = '';
  }
}