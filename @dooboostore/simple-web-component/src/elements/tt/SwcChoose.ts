// import {SwcUtils} from '../../utils/Utils';
// import {ActionExpression, FunctionUtils} from '@dooboostore/core';
// import {ConvertUtils} from '@dooboostore/core-web';
// import {elementDefine, getAttributeValue, getElementConfig} from '../../decorators';
//
// export default async (w: Window)=> {
//   const tagName = 'swc-choose';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   @elementDefine(tagName, { window: w })
//   class SwcChoose extends w.HTMLElement {
//     private _value: any;
//     private _replaceWrapStart: string | null = null;
//     private _replaceWrapEnd: string | null = null;
//     private _nodes: Node[] = [];
//     private _previousTemplate: HTMLTemplateElement | null = null;
//
//     static get observedAttributes() {
//       return ['value', 'replace-wrap-start', 'replace-wrap-end'];
//     }
//
//     get value(): any {
//       return this._value;
//     }
//
//     set value(nv: any) {
//       this._value = nv;
//       this.refresh(this._value);
//     }
//
//     connectedCallback() {
//       this.style.display = 'none';
//       if (!this.id) {
//         throw new Error('[SWC] SwcChoose must have an "id" attribute for reliable cleanup.');
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
//       value = value ?? getAttributeValue(this, 'value') ?? this._value;
//       const portal = SwcUtils.getParentContainer(this);
//       if (!portal) return;
//       const win = (getElementConfig(this).window ?? this.ownerDocument?.defaultView) || window;
//       const helperSet = SwcUtils.getHelperAndHostSet(win, this);
//       const groupArgs = {...helperSet, $value: value, $templateHost: this};
//       // HTMLElement에서는 children에서 template 찾기
//       const templates = Array.from(this.children).filter(
//         (el): el is HTMLTemplateElement => el.tagName === 'TEMPLATE'
//       );
//       let selected: HTMLTemplateElement | null = null;
//       for (const t of templates) {
//         if (t.getAttribute('is') === 'swc-when') {
//           const attrVal = t.getAttribute('test') || '';
//           let matches = false;
//           const result = FunctionUtils.executeReturn({
//             script: attrVal,
//             context: t,
//             args: groupArgs
//           });
//           matches = !!result;
//           if (matches) {
//             selected = t;
//             break;
//           }
//         }
//       }
//       const target = selected || (templates.find(t => t.getAttribute('is') === 'swc-otherwise') ?? null);
//       const skipValue = target?.getAttribute?.('skip-if-same');
//       const skipValue2 = this._previousTemplate?.getAttribute?.('skip-if-same');
//       const hasSkipIfSame = target?.hasAttribute?.('skip-if-same');
//       const isSame = this._previousTemplate === target;
//       if (hasSkipIfSame && isSame) {
//         return;
//       }
//       this.cleanup();
//       this._previousTemplate = target;
//       if (target) {
//         let htmlString = target.innerHTML;
//         htmlString = this.replaceExpressions(htmlString, groupArgs, this, {start: this._replaceWrapStart ?? '{#{', end: this._replaceWrapEnd ?? '}#}'});
//         const result = this.ownerDocument?.createElement('template') || document.createElement('template');
//         result.innerHTML = htmlString;
//         const processedFragment = result.content;
//         this._nodes = Array.from(processedFragment.childNodes);
//         const setTemplateHost = (element: HTMLElement) => {
//           (element as any).__swc_template_host = this;
//           Array.from(element.children).forEach((child: any) => {
//             if (child instanceof HTMLElement) {
//               setTemplateHost(child);
//             }
//           });
//         };
//         this._nodes.forEach((node: any) => {
//           if (node instanceof HTMLElement) {
//             setTemplateHost(node as HTMLElement);
//           }
//         });
//         const endpoint = this.ownerDocument?.createComment(`swc-choose endpoint id:${this.id}`) || document.createComment(`swc-choose endpoint id:${this.id}`);
//         processedFragment.appendChild(endpoint);
//         this._nodes.push(endpoint);
//         portal.insertBefore(processedFragment, this.nextSibling);
//       }
//     }
//
//     private cleanup() {
//       if (this.id) {
//         const portal = SwcUtils.getParentContainer(this);
//         if (portal) {
//           const endpointText = `swc-choose endpoint id:${this.id}`;
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
//   return w.customElements.whenDefined(tagName);
//
// }