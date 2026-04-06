import {HTMLElement} from "./HTMLElement";

export class HTMLDialogElement extends HTMLElement {
  constructor(tagName: string = 'DIALOG', ownerDocument?: any) {
    super(tagName, ownerDocument);
  }

  get open(): boolean {
      return this.hasAttribute('open');
  }

  set open(value: boolean) {
      if (value) {
          this.setAttribute('open', '');
      } else {
          this.removeAttribute('open');
      }
  }

  show() {
      this.setAttribute('open', '');
  }

  showModal() {
      this.setAttribute('open', '');
      // In a real browser this also sets up modal blocking behavior,
      // but for DOM parsing this is sufficient.
  }

  close(returnValue?: string) {
      this.removeAttribute('open');
      if (returnValue !== undefined) {
          this.setAttribute('returnValue', returnValue);
      }
      this.dispatchEvent(new Event('close'));
  }

  get returnValue(): string {
      return this.getAttribute('returnValue') || '';
  }

  set returnValue(value: string) {
      this.setAttribute('returnValue', value);
  }
}
