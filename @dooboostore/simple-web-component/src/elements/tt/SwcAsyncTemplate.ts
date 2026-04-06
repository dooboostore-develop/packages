// import { changedAttributeThis } from '../../decorators/changedAttributeThis';
// import { SwcUtils } from '../../utils/Utils';
// import { FunctionUtils, ActionExpression } from '@dooboostore/core';
// import { ConvertUtils } from '@dooboostore/core-web';
// import { attributeThis } from '../../decorators';
//
// export class SwcAsyncTemplate extends HTMLTemplateElement {
//   @attributeThis('value')
//   _value: any;
//   @attributeThis('replace-wrap-start')
//   _replaceWrapStart: string | null;
//   @attributeThis('replace-wrap-end')
//   _replaceWrapEnd: string | null;  resultValue?: any;
//
//   get value(): boolean {
//     return this._value;
//   }
//
//   set value(nv: any) {
//     this.executeAsync(nv);
//   }
//
//   private _nodes: Node[] = [];
//
//   @changedAttributeThis('value')
//   private setValue(valueAttr?: string | null) {
//     this.executeAsync(this._value);
//   }
//
//   // @changedAttributeThis('replace-wrap')
//   // private setReplaceWrap() {
//   //   this.executeAsync(this._value);
//   // }
//
//   private executeAsync(result: any = this._value) {
//     if (result === undefined || result === null) {
//       this.refresh('default');
//       return;
//     }
//
//     if (result instanceof Promise) {
//       this.refresh('loading');
//       result
//         .then(v => {
//           this.resultValue = v;
//           this.refresh('success');
//         })
//         .catch(e => {
//           console.error('[SWC-ASYNC] Promise rejected:', e);
//           this.resultValue = e;
//           this.refresh('error');
//         });
//     } else {
//       this.resultValue = result;
//       this.refresh('success');
//     }
//   }
//
//   private replaceExpressions(html: string, groupArgs: any, context: any, wrap: {start: string, end: string}): string {
//     let config: any = undefined;
//     if (wrap) {
//       config = {
//         expression: {
//           replace: { start: `${wrap.start}`, end: `${wrap.end}` },
//           callReturn: { start: `${wrap.start}=`, end: `${wrap.end}` },
//           call: { start: `${wrap.start}@`, end: `${wrap.end}` }
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
//   refresh(state: string = 'default') {
//     // console.log('rrrrrrrrrrrrrrrrr', state);
//     this.cleanup();
//     const portal = SwcUtils.getParentContainer(this);
//     if (!portal) return;
//
//     const win = this.ownerDocument?.defaultView || window;
//     const helperSet = SwcUtils.getHelperAndHostSet(win, this);
//
//     const t = this.content.querySelector(`template[is="swc-${state}"]`) as HTMLTemplateElement;
//     if (t) {
//       let htmlString = t.innerHTML;
//       const groupArgs = { ...helperSet, $value: this._value, $state: state, $templateHost: this };
//
//       htmlString = this.replaceExpressions(htmlString, groupArgs, this, {start:this._replaceWrapStart ?? '{#{', end: this._replaceWrapEnd ?? '}#}'});
//
//       const temp = this.ownerDocument?.createElement('template') || document.createElement('template');
//       temp.innerHTML = htmlString;
//       const content = temp.content;
//
//       this._nodes = Array.from(content.childNodes);
//       this._nodes.forEach((node: any) => {
//         if (node instanceof HTMLElement)  (node as any).__template_swc_host = this;
//       });
//
//       portal.insertBefore(content, this.nextSibling);
//     }
//   }
//
//   private cleanup() {
//     this._nodes.forEach(n => n.parentElement?.removeChild(n));
//     this._nodes = [];
//   }
//
//   disconnectedCallback() {
//     this.cleanup();
//   }
// }
