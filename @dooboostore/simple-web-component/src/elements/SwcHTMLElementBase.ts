import { SwcUtils } from '../utils/Utils';

export abstract class SwcHTMLElementBase extends HTMLElement {
  protected _masterTplNodes: Node[] = [];
  protected _asKey: string = 'value';
  protected _asIndexKey: string = 'index';

  constructor() {
    super();
  }

  protected initCore() {
    this._asKey = this.getAttribute('as') || 'value';
    this._asIndexKey = this.getAttribute('as-index') || 'index';

    if (this._masterTplNodes.length > 0) return; // 이미 초기화됨

    const tplSlot = this.shadowRoot?.getElementById('tpl-slot') as HTMLSlotElement;
    if (tplSlot) {
      this._masterTplNodes = tplSlot.assignedNodes().map(n => n.cloneNode(true));
    } else if (this.childNodes.length > 0) {
      // Light DOM에서 템플릿 추출
      this._masterTplNodes = Array.from(this.childNodes).map(n => n.cloneNode(true));
    }
  }

  protected applyData(node: Node, data: any, index?: number) {
    SwcUtils.applyData(node, data, {
      asKey: this._asKey,
      asIndexKey: this._asIndexKey,
      index
    });
  }

  protected createReactiveProxy(target: any, onChange: () => void, onIndexChange?: (index: number, val: any) => void) {
    return SwcUtils.createReactiveProxy(target, onChange, onIndexChange);
  }
}
