import { HTMLElementBase } from './HTMLElementBase';
import {HTMLElement} from "./HTMLElement";
import { formOwnerFor } from '../../utils/form-owner';
import { isBarredFromValidation, createValidityState } from '../../utils/input-validation';

/**
 * The **`HTMLButtonElement`** class represents an HTML `<button>` element.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLButtonElement)
 */
export class HTMLButtonElement extends HTMLElement {
  private _type: string = 'submit';
  private _disabled: boolean = false;
  private _value: string = '';
  private _validity: any = null;

  constructor(tagName: string = 'BUTTON', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
    this.setAttribute('type', value);
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get value(): string {
    return this._value;
  }

  set value(value: string) {
    this._value = value;
    this.setAttribute('value', value);
  }

  // Override setAttribute to sync with properties
  setAttribute(qualifiedName: string, value: string): void {
    super.setAttribute(qualifiedName, value);

    const name = qualifiedName.toLowerCase();
    switch (name) {
      case 'type':
        this._type = value;
        break;
      case 'disabled':
        this._disabled = true;
        break;
      case 'value':
        this._value = value;
        break;
    }
  }

  // Override removeAttribute to sync with properties
  removeAttribute(qualifiedName: string): void {
    super.removeAttribute(qualifiedName);

    const name = qualifiedName.toLowerCase();
    switch (name) {
      case 'type':
        this._type = 'submit';
        break;
      case 'disabled':
        this._disabled = false;
        break;
      case 'value':
        this._value = '';
        break;
    }
  }

  get form(): HTMLElement | null {
    return formOwnerFor(this);
  }

  get willValidate(): boolean {
    return !isBarredFromValidation(this);
  }

  get validity(): any {
    if (!this._validity) this._validity = createValidityState(this);
    return this._validity;
  }

  get validationMessage(): string {
    return '';
  }

  checkValidity(): boolean {
    if (!this.willValidate) return true;
    return this.validity.valid;
  }

  reportValidity(): boolean {
    return this.checkValidity();
  }

  setCustomValidity(_message: string): void {}
}
