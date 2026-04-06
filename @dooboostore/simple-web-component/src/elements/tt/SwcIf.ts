// import {SwcUtils} from '../../utils/Utils';
// import {ActionExpression, FunctionUtils} from '@dooboostore/core';
// import {ConvertUtils} from '@dooboostore/core-web';
// import {elementDefine, getAttributeValue} from '../../decorators';
//
// export default async (w: Window) => {
//   const tagName = 'swc-if';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   @elementDefine(tagName, { window: w })
//   class SwcIf extends w.HTMLElement {
//
//     private _value: any;
//     private _replaceWrapStart: string | null = null;
//     private _replaceWrapEnd: string | null = null;
//     private _skipIfSame: string | null = null;
//     private _nodes: Node[] = [];
//
//     static get observedAttributes() {
//       return ['value', 'replace-wrap-start', 'replace-wrap-end', 'skip-if-same'];
//     }
//
//     get value(): boolean {
//       return this._value;
//     }
//
//     set value(nv: any) {
//       this.refresh(nv);
//     }
//
//     connectedCallback() {
//       if (!this.id) {
//         throw new Error('[SWC] SwcIf must have an "id" attribute for reliable cleanup.');
//       }
//       if (this.hasAttribute('value')) {
//         this.refresh();
//       }
//     }
//
//     attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
//       switch (name) {
//         case 'value':
//           this._value = newValue;
//           this.refresh(this._value);
//           break;
//         case 'replace-wrap-start':
//           this._replaceWrapStart = newValue;
//           break;
//         case 'replace-wrap-end':
//           this._replaceWrapEnd = newValue;
//           break;
//         case 'skip-if-same':
//           this._skipIfSame = newValue;
//           break;
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
//     refresh(value?: any) {
//       if (!this.id) return;
//       const targetValue = value !== undefined ? value : (getAttributeValue(this, 'value') ?? this._value);
//       if (this.hasAttribute('skip-if-same') && this._value === targetValue && (this._nodes.length > 0 || this.nextSibling)) {
//         if (this._value === targetValue && this._nodes.length > 0) return;
//       }
//       this.cleanup();
//       this._value = targetValue;
//       const portal = this.parentElement;
//       if (!portal || !this._value) return;
//       const win = this.ownerDocument?.defaultView || window;
//       const helperSet = SwcUtils.getHelperAndHostSet(win, this);
//       let htmlString = this.innerHTML;
//       const groupArgs = {...helperSet, $value: this._value, $templateHost: this};
//       htmlString = this.replaceExpressions(htmlString, groupArgs, this, {start: this._replaceWrapStart ?? '{#{', end: this._replaceWrapEnd ?? '}#}'});
//       const result = this.ownerDocument?.createElement('template') || document.createElement('template');
//       result.innerHTML = htmlString;
//       const processedFragment = result.content;
//       this._nodes = Array.from(processedFragment.childNodes);
//       this._nodes.forEach((node: any) => {
//         if (node instanceof HTMLElement) (node as any).__swc_template_host = this;
//       });
//       const endpointText = `swc-if endpoint id:${this.id}`;
//       const endpoint = this.ownerDocument?.createComment(endpointText) || document.createComment(endpointText);
//       processedFragment.appendChild(endpoint);
//       this._nodes.push(endpoint);
//       portal.insertBefore(processedFragment, this.nextSibling);
//     }
//
//     private cleanup() {
//       if (this.id) {
//         const portal = this.parentElement;
//         if (portal) {
//           const endpointText = `swc-if endpoint id:${this.id}`;
//           let current = this.nextSibling;
//           const toRemove: Node[] = [];
//           while (current) {
//             toRemove.push(current);
//             if (current.nodeType === 8 && (current as Comment).data === endpointText) {
//               toRemove.forEach(n => {
//                 const realNode = (n as any).__upgraded_instance || n;
//                 if (realNode.parentElement) {
//                   realNode.parentElement.removeChild(realNode);
//                 }
//               });
//               break;
//             }
//             current = current.nextSibling;
//           }
//         }
//       }
//       this._nodes = [];
//     }
//
//     disconnectedCallback() {
//       this.cleanup();
//     }
//   }
//
// }