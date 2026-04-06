// import {SwcUtils} from '../../utils/Utils';
// import {ActionExpression, FunctionUtils} from '@dooboostore/core';
// import {ConvertUtils} from '@dooboostore/core-web';
// import {elementDefine, getAttributeValue} from '../../decorators';
//
// export default async (w: Window) => {
//   const tagName = 'swc-loop';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//
//   @elementDefine(tagName, { window: w })
//   class SwcLoop extends w.HTMLElement {
//
//     private _value: any[] = [];
//     private _replaceWrapStart: string | null = null;
//     private _replaceWrapEnd: string | null = null;
//     private _nodeGroups: Node[][] = [];
//     private innerHTMLUserData: string;
//
//     static get observedAttributes() {
//       return ['value', 'replace-wrap-start', 'replace-wrap-end'];
//     }
//
//     get value(): any[] {
//       return this._value;
//     }
//
//     set value(nv: any[]) {
//       this._value = nv;
//       this.refresh(nv);
//     }
//
//     getValue(index: number) {
//       return this._value?.[index];
//     }
//
//     connectedCallback() {
//       this.style.display = 'none';
//       this.innerHTMLUserData = this.innerHTML;
//       console.log('iiiiiiiiiiii', this.innerHTMLUserData, this.innerHTML,)
//       // this.innerHTML='';
//       if (!this.id) {
//         throw new Error('[SWC] SwcLoop must have an "id" attribute for reliable cleanup.');
//       }
//       if (this.hasAttribute('value')) {
//         this.refresh();
//       }
//     }
//
//     attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
//       switch (name) {
//         case 'value':
//           this._value = newValue ? JSON.parse(newValue) : [];
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
//       config = {
//         expression: {
//           replace: {start: `${wrap.start}`, end: `${wrap.end}`},
//           callReturn: {start: `${wrap.start}=`, end: `${wrap.end}`},
//           call: {start: `${wrap.start}@`, end: `${wrap.end}`}
//         }
//       };
//       const ae = new ActionExpression(html, config);
//       const win = this.ownerDocument?.defaultView || window;
//       const expressions = ae.getExpressions('replace');
//       for (const expr of expressions) {
//         const script = ConvertUtils.decodeHtmlEntity(expr.script, win.document);
//         try {
//           const value = FunctionUtils.executeReturn({
//             script: script,
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
//     private createFragmentAndNodes(items: any[], helperSet: any, startIndex: number = 0): { fragment: DocumentFragment; newNodesGroup: Node[][] } {
//       const win = this.ownerDocument?.defaultView || window;
//       const fragment = win.document.createDocumentFragment();
//       const newNodesGroup: Node[][] = [];
//       items.forEach((item, i) => {
//         const index = startIndex + i;
//         let htmlString = this.innerHTMLUserData;
//         const groupArgs = {...helperSet, $item: item, $index: index, $value: this._value};
//         htmlString = this.replaceExpressions(htmlString, groupArgs, this, {start: this._replaceWrapStart ?? '{#{', end: this._replaceWrapEnd ?? '}#}'});
//         const temp = this.ownerDocument?.createElement('template') || document.createElement('template');
//         temp.innerHTML = htmlString;
//         const content = temp.content;
//         const nodes = Array.from(content.childNodes);
//         const setTemplateHost = (element: HTMLElement) => {
//           (element as any).__swc_template_host = this;
//           Array.from(element.children).forEach((child: any) => {
//             if (child instanceof HTMLElement) {
//               setTemplateHost(child);
//             }
//           });
//         };
//         nodes.forEach((node: any) => {
//           if (node instanceof HTMLElement) {
//             setTemplateHost(node as HTMLElement);
//           }
//         });
//         newNodesGroup.push(nodes);
//         fragment.appendChild(content);
//       });
//       return {fragment, newNodesGroup};
//     }
//
//     appendItem(...items: any[]) {
//       if (!items || items.length <= 0) return;
//       const portal = SwcUtils.getParentContainer(this);
//       if (!portal) return;
//       const win = this.ownerDocument?.defaultView || window;
//       const helperSet = SwcUtils.getHelperAndHostSet(win, this);
//       const startIndex = this._value ? this._value.length : 0;
//       if (this._value !== items) {
//         this._value = [...(this._value || []), ...items];
//       }
//       const {fragment, newNodesGroup} = this.createFragmentAndNodes(items, helperSet, startIndex);
//       this._nodeGroups.push(...newNodesGroup);
//       let insertReference: Node | null = this.nextSibling;
//       if (this._nodeGroups.length > items.length) {
//         const lastExistingGroup = this._nodeGroups[this._nodeGroups.length - items.length - 1];
//         if (lastExistingGroup && lastExistingGroup.length > 0) {
//           const lastNode = lastExistingGroup[lastExistingGroup.length - 1];
//           insertReference = lastNode.nextSibling;
//         }
//       }
//       const endpointText = `swc-loop endpoint id:${this.id}`;
//       let current = this.nextSibling;
//       let endpointNode: Node | null = null;
//       while (current) {
//         if (current.nodeType === 8 && (current as Comment).data === endpointText) {
//           endpointNode = current;
//           break;
//         }
//         current = current.nextSibling;
//       }
//       portal.insertBefore(fragment, endpointNode || this.nextSibling);
//     }
//
//     async prependItem(...items: any[]) {
//       if (!items || items.length <= 0) return;
//       const portal = SwcUtils.getParentContainer(this);
//       if (!portal) return;
//       const win = this.ownerDocument?.defaultView || window;
//       const helperSet = SwcUtils.getHelperAndHostSet(win, this);
//       if (this._value !== items) {
//         this._value = [...items, ...(this._value || [])];
//       }
//       const {fragment, newNodesGroup} = this.createFragmentAndNodes(items, helperSet, 0);
//       this._nodeGroups = [...newNodesGroup, ...this._nodeGroups];
//       portal.insertBefore(fragment, this.nextSibling);
//     }
//
//     refresh(value?: any) {
//       if (!this.id) return;
//       const targetValue = value !== undefined ? value : (getAttributeValue(this, 'value') ?? this._value ?? []);
//       this.cleanup();
//       this._value = targetValue;
//       if (!this._value || this._value.length <= 0) return;
//       const win = this.ownerDocument?.defaultView || window;
//       const helperSet = SwcUtils.getHelperAndHostSet(win, this);
//       const groupArgs = {...helperSet, $value: value, $templateHost: this};
//       const {fragment, newNodesGroup} = this.createFragmentAndNodes(this._value, groupArgs, 0);
//       this._nodeGroups = newNodesGroup;
//       const portal = SwcUtils.getParentContainer(this);
//       if (portal) {
//         const endpointText = `swc-loop endpoint id:${this.id}`;
//         const endpoint = this.ownerDocument?.createComment(endpointText) || document.createComment(endpointText);
//         fragment.appendChild(endpoint);
//         portal.insertBefore(fragment, this.nextSibling);
//       }
//     }
//
//     private cleanup() {
//       if (this.id) {
//         const portal = SwcUtils.getParentContainer(this);
//         if (portal) {
//           const endpointText = `swc-loop endpoint id:${this.id}`;
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
//       this._nodeGroups = [];
//     }
//
//     disconnectedCallback() {
//       this.cleanup();
//     }
//   }
//   return w.customElements.whenDefined(tagName);
// }