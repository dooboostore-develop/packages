// import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
// import { ComponentBase } from '../ComponentBase';
// import { OtherData } from '@dooboostore/dom-render/lifecycle/OnChangeAttrRender';
// import template from './dialog.html'
//
// export namespace Dialog {
//   export const selector = 'System:Dialog';
//   export type Attribute<D> = {
//     show?: null;
//     backdropClickClose?: null;
//     class?: string;
//     close?: () => void
//     toggle?: (element:HTMLDialogElement) => void,
//     data?: D
//   }
//
//
//   @Component({
//     template,
//     // styles: style,
//     selector: `${selector}`
//   })
//   export class Dialog<D = any> extends ComponentBase<Attribute<D>> {
//     private element?: HTMLDialogElement;
//
//     closeDialog() {
//       if (this.element) {
//         this.element.close();
//         this.getAttribute('toggle')?.(this.element);
//       }
//     }
//
//     destroyDialog() {
//       this.getAttribute('close')?.();
//     }
//
//     onInitElement(element: HTMLDialogElement) {
//       this.element = element;
//       if (this.hasAttribute('show')) {
//         this.element.showModal();
//       }
//       this.getAttribute('toggle')?.(this.element);
//
//       this.element.addEventListener('click', (event) => {
//         if (this.getAttribute('backdropClickClose') !== null) {
//           if (event.target === this.element) {
//             this.closeDialog();
//           }
//         }
//       });
//     }
//
//     showModal() {
//       this.element?.showModal();
//       if (this.element)
//       this.getAttribute('toggle')?.(this.element);
//     }
//
//     show() {
//       this.element?.show();
//       if (this.element)
//       this.getAttribute('toggle')?.(this.element);
//     }
//
//     close() {
//       this.element?.close();
//     }
//     setData(data?: D | null) {
//
//     }
//     onChangeAttrRender(name: string, value: any, other: OtherData) {
//       super.onChangeAttrRender(name, value, other);
//       if (this.equalsAttributeName(name, 'show') && this.element) {
//         if (this.hasAttribute('show')) {
//           this.showModal();
//         } else {
//           this.close();
//         }
//       } else if (name === 'data') {
//         this.setData(this.getAttribute('data'))
//       }
//     }
//   }
// }
