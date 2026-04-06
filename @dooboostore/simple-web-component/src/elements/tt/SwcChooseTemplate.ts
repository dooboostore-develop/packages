// import {changedAttributeThis} from '../../decorators/changedAttributeThis';
// import {SwcUtils} from '../../utils/Utils';
// import {FunctionUtils, ActionExpression} from '@dooboostore/core';
// import {ConvertUtils} from '@dooboostore/core-web';
// import {SwcChooseInterface} from '../../types';
// import {attributeThis, getAttributeValue, getElementConfig} from '../../decorators';
//
// export class SwcChooseTemplate extends HTMLTemplateElement implements SwcChooseInterface {
//   _value: any;
//
//   @attributeThis('replace-wrap-start')
//   _replaceWrapStart: string | null;
//   @attributeThis('replace-wrap-end')
//   _replaceWrapEnd: string | null;
//
//   private _nodes: Node[] = [];
//   private _previousTemplate: HTMLTemplateElement | null = null;
//
//   get value(): any {
//     return this._value;
//   }
//
//   set value(nv: any) {
//     this._value = nv;
//     this.refresh(this._value);
//   }
//
//   constructor() {
//     super();
//     // console.log('swc chooooooooooooooooooooooooose constructor called!');
//     // console.log('swc cccccccss', this.getAttribute('value'));
//   }
//
//   static get observedAttributes() {
//     return ['value'];
//   }
//
//   attributeChangedCallback(na, o, n) {
//     // console.log('-----------------choooooooose attr origin', na, o, n);
//   }
//
//   connectedCallback() {
//     // console.log('------choooooooose connectedCallback called!------');
//     if (!this.id) {
//       throw new Error('[SWC] SwcChoose must have an "id" attribute for reliable cleanup.');
//     }
//     if (this.hasAttribute('value')) {
//       this.refresh();
//     }
//   }
//
//   @changedAttributeThis('value')
//   private setValue(value: any, o: string, n: string) {
//     if (!this.id) return;
//     // console.log('chooooooose value', value)
//     this._value = value;
//     this.refresh(this._value);
//   }
//
//   // @changedAttributeThis('replace-wrap')
//   // private setReplaceWrap(replaceWrapAttr?: string | null) {
//   //   this.refresh();
//   // }
//
//   private replaceExpressions(html: string, groupArgs: any, context: any, wrap: { start: string, end: string }): string {
//     let config: any = undefined;
//     if (wrap) {
//       config = {
//         expression: {
//           replace: {start: `${wrap.start}`, end: `${wrap.end}`},
//           callReturn: {start: `${wrap.start}=`, end: `${wrap.end}`},
//           call: {start: `${wrap.start}@`, end: `${wrap.end}`}
//         }
//       };
//     }
//     const ae = new ActionExpression(html, config);
//     const win = this.ownerDocument?.defaultView || window;
//
//     // @ts-ignore
//     for (const expr of ae.getExpressions('replace')) {
//       try {
//         const value = FunctionUtils.executeReturn({
//           script: ConvertUtils.decodeHtmlEntity(expr.script, win.document),
//           context,
//           args: groupArgs
//         });
//         ae.replace(expr, String(value));
//       } catch (e) {
//         console.error(`[SWC] Failed to execute ${expr.original}:`, e);
//       }
//     }
//     return ae.getUnprocessedTemplate();
//   }
//
//   refresh(value?: any) {
//     if (!this.id) return;
//     value = value ?? getAttributeValue(this, 'value') ?? this._value;
//     // console.log('[DEBUG] SwcChoose.refresh called, value:', value);
//     const portal = SwcUtils.getParentContainer(this);
//     if (!portal) {
//       // console.log('[DEBUG] SwcChoose portal is null!');
//       return;
//     }
//
//     const win = (getElementConfig(this).window ?? this.ownerDocument?.defaultView) || window;
//     const helperSet = SwcUtils.getHelperAndHostSet(win, this);
//     const groupArgs = {...helperSet, $value: value, $templateHost: this};
//
//     const templates = Array.from(this.content.querySelectorAll('template'));
//     let selected: HTMLTemplateElement | null = null;
//
//     for (const t of templates) {
//       if (t.getAttribute('is') === 'swc-when') {
//         const attrVal = t.getAttribute('test') || '';
//         let matches = false;
//
//
//         const result = FunctionUtils.executeReturn({
//           script: attrVal,
//           context: t,
//           args: groupArgs
//         });
//         matches = !!result;
//         // Use ActionExpression to parse and extract script from value attribute
//         // const ae = new ActionExpression(attrVal);
//         // const expr = ae.getFirstExpression('replace');
//
//         // if (expr) {
//         //   const decodedScript = ConvertUtils.decodeHtmlEntity(expr.script, win.document);
//         //   const result = FunctionUtils.executeReturn({
//         //     script: decodedScript,
//         //     context: t,
//         //     args: groupArgs
//         //   });
//         //   matches = !!result;
//         // } else {
//         //   matches = String(attrVal) === String(value);
//         // }
//
//         if (matches) {
//           selected = t;
//           break;
//         }
//       }
//     }
//
//     const target = selected || (this.content.querySelector('template[is="swc-otherwise"]') as HTMLTemplateElement);
//
//     const skipValue = target?.getAttribute?.('skip-if-same');
//     const skipValue2 = this._previousTemplate?.getAttribute?.('skip-if-same');
//     const hasSkipIfSame = target?.hasAttribute?.('skip-if-same');
//     const isSame = this._previousTemplate === target;
//     // console.log('---rrrr---', this._previousTemplate, target, hasSkipIfSame, isSame, skipValue, skipValue2);
//     if (hasSkipIfSame && isSame) {
//       return;
//     }
//
//     this.cleanup();
//     this._previousTemplate = target;
//
//     if (target) {
//       let htmlString = target.innerHTML;
//       htmlString = this.replaceExpressions(htmlString, groupArgs, this, {start: this._replaceWrapStart ?? '{#{', end: this._replaceWrapEnd ?? '}#}'});
//
//       const result = this.ownerDocument?.createElement('template') || document.createElement('template');
//       result.innerHTML = htmlString;
//       const processedFragment = result.content;
//
//       // console.log('[DEBUG] SwcChoose processedFragment children:', processedFragment._childNodesInternal?.length);
//       this._nodes = Array.from(processedFragment.childNodes);
//
//       const setTemplateHost = (element: HTMLElement) => {
//         (element as any).__swc_template_host = this;
//         Array.from(element.children).forEach((child: any) => {
//           if (child instanceof HTMLElement) {
//             setTemplateHost(child);
//           }
//         });
//       };
//
//       this._nodes.forEach((node: any) => {
//         if (node instanceof HTMLElement) {
//           setTemplateHost(node as HTMLElement);
//         }
//       });
//
//       // console.log(`[DEBUG] SwcChoose before insertBefore, portal: ${portal?.tagName}, isConnected: ${(portal as any)?.isConnected}`);
//
//       // Add endpoint comment node
//       const endpoint = this.ownerDocument?.createComment(`swc-choose endpoint id:${this.id}`) || document.createComment(`swc-choose endpoint id:${this.id}`);
//       processedFragment.appendChild(endpoint);
//       this._nodes.push(endpoint);
//
//       portal.insertBefore(processedFragment, this.nextSibling);
//       // console.log('[DEBUG] SwcChoose after insertBefore');
//     }
//   }
//
//   private cleanup() {
//     if (this.id) {
//       const portal = SwcUtils.getParentContainer(this);
//       if (portal) {
//         const endpointText = `swc-choose endpoint id:${this.id}`;
//         let current = this.nextSibling;
//         const toRemove: Node[] = [];
//
//         while (current) {
//           toRemove.push(current);
//           if (current.nodeType === 8 && (current as Comment).data === endpointText) {
//             // Found the endpoint!
//             toRemove.forEach(n => {
//               const realNode = (n as any).__upgraded_instance || n;
//               if (realNode.parentElement) {
//                 realNode.parentElement.removeChild(realNode);
//               }
//             });
//             break;
//           }
//           current = current.nextSibling;
//         }
//       }
//     }
//     this._nodes = [];
//   }
//
//   disconnectedCallback() {
//     this.cleanup();
//   }
// }
