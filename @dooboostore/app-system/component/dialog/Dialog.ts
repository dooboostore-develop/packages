import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '../ComponentBase';
import { OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';
import template from './dialog.html'

export namespace Dialog {
  export const selector = 'System:Dialog';
  export type Attribute = {
    show?: null;
    class?: string;
    close?: () => void
    toggle?: (element:HTMLDialogElement) => void
  }


  @Component({
    template,
    // styles: style,
    selector: `${selector}`
  })
  export class Dialog extends ComponentBase<Attribute> {
    private element?: HTMLDialogElement;

    closeDialog() {
      if (this.element) {
        this.element.close();
        this.attribute?.toggle?.(this.element);
      }
    }

    destroyDialog() {
      this.attribute?.close?.();
    }

    onInitElement(element: HTMLDialogElement) {
      this.element = element;
      if (this.hasAttribute('show')) {
        this.element.showModal();
      }
      this.attribute?.toggle?.(this.element);
    }

    showModal() {
      this.element?.showModal();
      if (this.element)
      this.attribute?.toggle?.(this.element);
    }

    show() {
      this.element?.show();
      if (this.element)
      this.attribute?.toggle?.(this.element);
    }

    close() {
      this.element?.close();
    }

    onChangeAttrRender(name: string, value: any, other: OtherData) {
      super.onChangeAttrRender(name, value, other);
      if (this.equalsAttributeName(name, 'show') && this.element) {
        if (this.hasAttribute('show')) {
          this.showModal();
        } else {
          this.close();
        }
      }
    }
  }
}
