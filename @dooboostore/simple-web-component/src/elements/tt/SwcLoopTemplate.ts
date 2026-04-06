// import { changedAttributeThis } from '../../decorators/changedAttributeThis';
// import { SwcUtils } from '../../utils/Utils';
// import { FunctionUtils, ActionExpression } from '@dooboostore/core';
// import { ConvertUtils } from '@dooboostore/core-web';
// import { attributeThis, getAttributeValue } from '../../decorators';
//
// export class SwcLoopTemplate extends HTMLTemplateElement {
//   _value: any[] = [];
//
//   @attributeThis('replace-wrap-start')
//   _replaceWrapStart: string | null;
//   @attributeThis('replace-wrap-end')
//   _replaceWrapEnd: string | null;
//
//   private _nodeGroups: Node[][] = [];
//
//   get value(): any[] {
//     return this._value;
//   }
//
//   set value(nv: any[]) {
//     this._value = nv;
//     this.refresh(nv);
//   }
//
//   getValue(index: number) {
//     return this._value?.[index];
//   }
//
//   constructor() {
//     super();
//     // console.log('swc SwcLoop constructor called!');
//     // console.log('swc SwcLoop', this.getAttribute('value'));
//   }
//
//   connectedCallback() {
//     if (!this.id) {
//       throw new Error('[SWC] SwcLoop must have an "id" attribute for reliable cleanup.');
//     }
//     if (this.hasAttribute('value')) {
//       this.refresh();
//     }
//   }
//
//   @changedAttributeThis('value')
//   private setValue(value: any, o: string, n: string) {
//     if (!this.id) return;
//     this._value = value;
//     this.refresh(this._value);
//   }
//
//   // @changedAttributeThis('replace-wrap')
//   // private setReplaceWrap(replaceWrapAttr?: string | null) {
//   //   this.refresh();
//   // }
//
//   private replaceExpressions(html: string, groupArgs: any, context: any, wrap: {start: string, end: string}): string {
//     let config: any = undefined;
//     config = {
//       expression: {
//         replace: { start: `${wrap.start}`, end: `${wrap.end}` },
//         callReturn: { start: `${wrap.start}=`, end: `${wrap.end}` },
//         call: { start: `${wrap.start}@`, end: `${wrap.end}` }
//       }
//     };
//     const ae = new ActionExpression(html, config);
//     const win = this.ownerDocument?.defaultView || window;
//
//     // @ts-ignore
//     const expressions = ae.getExpressions('replace');
//     for (const expr of expressions) {
//       const script = ConvertUtils.decodeHtmlEntity(expr.script, win.document);
//       try {
//         const value = FunctionUtils.executeReturn({
//           script: script,
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
//   private createFragmentAndNodes(items: any[], helperSet: any, startIndex: number = 0): { fragment: DocumentFragment; newNodesGroup: Node[][] } {
//     const win = this.ownerDocument?.defaultView || window;
//     const fragment = win.document.createDocumentFragment();
//     const newNodesGroup: Node[][] = [];
//
//     items.forEach((item, i) => {
//       const index = startIndex + i;
//       let htmlString = this.innerHTML;
//       const groupArgs = { ...helperSet, $item: item, $index: index, $value: this._value };
//
//       htmlString = this.replaceExpressions(htmlString, groupArgs, this, {start:this._replaceWrapStart ?? '{#{', end: this._replaceWrapEnd ?? '}#}'});
//
//       const temp = this.ownerDocument?.createElement('template') || document.createElement('template');
//       temp.innerHTML = htmlString;
//
//       const content = temp.content;
//       const nodes = Array.from(content.childNodes);
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
//       nodes.forEach((node: any) => {
//         if (node instanceof HTMLElement) {
//           setTemplateHost(node as HTMLElement);
//         }
//       });
//       newNodesGroup.push(nodes);
//       fragment.appendChild(content);
//     });
//
//     return { fragment, newNodesGroup };
//   }
//
//   appendItem(...items: any[]) {
//     if (!items || items.length <= 0) return;
//     const portal = SwcUtils.getParentContainer(this);
//     if (!portal) return;
//
//     const win = this.ownerDocument?.defaultView || window;
//     const helperSet = SwcUtils.getHelperAndHostSet(win, this);
//
//     const startIndex = this._value ? this._value.length : 0;
//
//     // 내부 상태(value) 업데이트 (기존 배열에 새 아이템 추가)
//     if (this._value !== items) {
//       this._value = [...(this._value || []), ...items];
//     }
//
//     const { fragment, newNodesGroup } = this.createFragmentAndNodes(items, helperSet, startIndex);
//     this._nodeGroups.push(...newNodesGroup);
//
//     // console.log('뭐야 씨발');
//     // append 위치 계산: 기존에 그려진 마지막 노드 뒤에 삽입, 없으면 템플릿 바로 뒤에 삽입
//     let insertReference: Node | null = this.nextSibling;
//     if (this._nodeGroups.length > items.length) {
//       const lastExistingGroup = this._nodeGroups[this._nodeGroups.length - items.length - 1];
//       if (lastExistingGroup && lastExistingGroup.length > 0) {
//         const lastNode = lastExistingGroup[lastExistingGroup.length - 1];
//         insertReference = lastNode.nextSibling;
//       }
//     }
//
//     // SSR endpoint handling: if we append, we should find the old endpoint and remove it or insert before it.
//     // However, it's safer to just cleanup and redraw for now, OR find the endpoint.
//     // For appendItem, we find the endpoint comment and insert before it.
//     const endpointText = `swc-loop endpoint id:${this.id}`;
//     let current = this.nextSibling;
//     let endpointNode: Node | null = null;
//     while (current) {
//       if (current.nodeType === 8 && (current as Comment).data === endpointText) {
//         endpointNode = current;
//         break;
//       }
//       current = current.nextSibling;
//     }
//
//     portal.insertBefore(fragment, endpointNode || this.nextSibling);
//   }
//
//   async prependItem(...items: any[]) {
//     if (!items || items.length <= 0) return;
//     const portal = SwcUtils.getParentContainer(this);
//     if (!portal) return;
//
//     const win = this.ownerDocument?.defaultView || window;
//     const helperSet = SwcUtils.getHelperAndHostSet(win, this);
//
//     // 내부 상태(value) 업데이트 (기존 배열의 앞쪽에 새 아이템 추가)
//     if (this._value !== items) {
//       this._value = [...items, ...(this._value || [])];
//     }
//
//     const { fragment, newNodesGroup } = this.createFragmentAndNodes(items, helperSet, 0);
//
//     // 기존의 nodeGroups 배열 맨 앞에 새로운 그룹들을 추가
//     this._nodeGroups = [...newNodesGroup, ...this._nodeGroups];
//
//     // prepend 위치: 이 템플릿(SwcLoop) 노드의 바로 다음 위치 (가장 위)
//     portal.insertBefore(fragment, this.nextSibling);
//   }
//
//   refresh(value?: any) {
//     if (!this.id) return;
//     // 1. 그릴 대상 확정
//     const targetValue = value !== undefined ? value : (getAttributeValue(this, 'value') ?? this._value ?? []);
//
//     // 2. 화면 정리
//     this.cleanup();
//
//     // 3. 상태 완전 교체 (이어붙이지 않음!)
//     this._value = targetValue;
//
//     if (!this._value || this._value.length <= 0) return;
//
//     // 4. 화면 다시 그리기 (appendItem을 쓰지 않고 바로 그리기)
//     const win = this.ownerDocument?.defaultView || window;
//     const helperSet = SwcUtils.getHelperAndHostSet(win, this);
//     helperSet.$templateHost = this;
//     const { fragment, newNodesGroup } = this.createFragmentAndNodes(this._value, helperSet, 0);
//
//     this._nodeGroups = newNodesGroup;
//     const portal = SwcUtils.getParentContainer(this);
//     if (portal) {
//       // Add endpoint comment node
//       const endpointText = `swc-loop endpoint id:${this.id}`;
//       const endpoint = this.ownerDocument?.createComment(endpointText) || document.createComment(endpointText);
//       fragment.appendChild(endpoint);
//
//       portal.insertBefore(fragment, this.nextSibling);
//     }
//   }
//
//   private cleanup() {
//     if (this.id) {
//       const portal = SwcUtils.getParentContainer(this);
//       if (portal) {
//         const endpointText = `swc-loop endpoint id:${this.id}`;
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
//     this._nodeGroups = [];
//   }
//
//   disconnectedCallback() {
//     this.cleanup();
//   }
// }
