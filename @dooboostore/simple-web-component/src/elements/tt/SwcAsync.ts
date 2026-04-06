// import {SwcUtils} from '../../utils/Utils';
// import {ActionExpression, FunctionUtils} from '@dooboostore/core';
// import {ConvertUtils} from '@dooboostore/core-web';
// import {elementDefine} from "../../decorators";
//
// export default async (w: Window) => {
//   const tagName = 'swc-async';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//
//   @elementDefine(tagName, { window: w })
//   class SwcAsync extends w.HTMLElement {
//     private _value: any;
//     private _replaceWrapStart: string | null = null;
//     private _replaceWrapEnd: string | null = null;
//     private _nodes: Node[] = [];
//     resultValue?: any;
//
//     static get observedAttributes() {
//       return ['value', 'replace-wrap-start', 'replace-wrap-end'];
//     }
//
//     get value(): boolean {
//       return this._value;
//     }
//
//     set value(nv: any) {
//       this.executeAsync(nv);
//     }
//
//     connectedCallback() {
//       if (this.hasAttribute('value')) {
//         this.executeAsync(this._value);
//       }
//     }
//
//     attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
//       switch (name) {
//         case 'value':
//           this._value = newValue;
//           this.executeAsync(this._value);
//           break;
//         case 'replace-wrap-start':
//           this._replaceWrapStart = newValue;
//           break;
//         case 'replace-wrap-end':
//           this._replaceWrapEnd = newValue;
//           break;
//       }
//     }
//
//     private executeAsync(result: any = this._value) {
//       if (result === undefined || result === null) {
//         this.refresh('default');
//         return;
//       }
//       if (result instanceof Promise) {
//         this.refresh('loading');
//         result
//           .then(v => {
//             this.resultValue = v;
//             this.refresh('success');
//           })
//           .catch(e => {
//             console.error('[SWC-ASYNC] Promise rejected:', e);
//             this.resultValue = e;
//             this.refresh('error');
//           });
//       } else {
//         this.resultValue = result;
//         this.refresh('success');
//       }
//     }
//
//     private replaceExpressions(html: string, groupArgs: any, context: any, wrap: { start: string, end: string }): string {
//       let config: any = undefined;
//       if (wrap) {
//         config = {
//           expression: {
//             replace: {start: `${wrap.start}`, end: `${wrap.end}`},
//             callReturn: {start: `${wrap.start}=`, end: `${wrap.end}`},
//             call: {start: `${wrap.start}@`, end: `${wrap.end}`}
//           }
//         };
//       }
//       const ae = new ActionExpression(html, config);
//       const win = this.ownerDocument?.defaultView || window;
//       for (const expr of ae.getExpressions('replace')) {
//         try {
//           const value = FunctionUtils.executeReturn({
//             script: ConvertUtils.decodeHtmlEntity(expr.script, win.document),
//             context,
//             args: groupArgs
//           });
//           ae.replace(expr, String(value));
//         } catch (e) {
//           console.error(`[SWC] Failed to execute ${expr.original}:`, e);
//         }
//       }
//       return ae.getUnprocessedTemplate();
//     }
//
//     refresh(state: string = 'default') {
//       this.cleanup();
//       const portal = SwcUtils.getParentContainer(this);
//       if (!portal) return;
//       const win = this.ownerDocument?.defaultView || window;
//       const helperSet = SwcUtils.getHelperAndHostSet(win, this);
//       // HTMLElement에서는 children에서 template[is=swc-...] 찾기
//       const t = Array.from(this.children).find(
//         (el): el is HTMLTemplateElement => el.tagName === 'TEMPLATE' && el.getAttribute('is') === `swc-${state}`
//       );
//       if (t) {
//         let htmlString = t.innerHTML;
//         const groupArgs = {...helperSet, $value: this._value, $state: state, $templateHost: this};
//         htmlString = this.replaceExpressions(htmlString, groupArgs, this, {start: this._replaceWrapStart ?? '{#{', end: this._replaceWrapEnd ?? '}#}'});
//         const temp = this.ownerDocument?.createElement('template') || document.createElement('template');
//         temp.innerHTML = htmlString;
//         const content = temp.content;
//         this._nodes = Array.from(content.childNodes);
//         this._nodes.forEach((node: any) => {
//           if (node instanceof HTMLElement) (node as any).__template_swc_host = this;
//         });
//         portal.insertBefore(content, this.nextSibling);
//       }
//     }
//
//     private cleanup() {
//       this._nodes.forEach(n => n.parentElement?.removeChild(n));
//       this._nodes = [];
//     }
//
//     disconnectedCallback() {
//       this.cleanup();
//     }
//   }
//
//   return w.customElements.whenDefined(tagName);
// }