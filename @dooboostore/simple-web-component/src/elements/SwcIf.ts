import { changedAttributeHost } from '../decorators/changedAttributeHost';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils } from '@dooboostore/core';

class SwcIf extends HTMLTemplateElement {
  private _value = false;
  private _nodes: Node[] = [];

  get value(): boolean {
    return this._value;
  }
  set value(nv: any) {
    this._value = Boolean(nv);
    this.render();
  }

  private _executeCloneCallback(attr: string, args: any) {
    const script = this.getAttribute(attr);
    if (!script) return;
    FunctionUtils.execute({ script, context: this, args });
  }

  @changedAttributeHost('value')
  private refreshValue(valueAttr?: string | null) {
    valueAttr ??= this.getAttribute('value');
    if (valueAttr === null) {
      this.value = false;
      return;
    }

    // {{ }} 브레이스로 감싸진 값은 스크립트 실행
    if (valueAttr.startsWith('{{') && valueAttr.endsWith('}}')) {
      const script = valueAttr.slice(2, -2).trim();
      const win = this.ownerDocument?.defaultView || window;
      const result = FunctionUtils.executeReturn({
        script,
        context: this,
        args: SwcUtils.getHelperAndHostSet(win, this)
      });
      this.value = result;
    } else {
      // 일반 문자열 값
      this.value = Boolean(valueAttr);
    }
  }

  private render() {
    this.cleanup();
    const portal = this.parentElement;
    if (!portal) return;

    const win = this.ownerDocument?.defaultView || window;
    const helperSet = SwcUtils.getHelperAndHostSet(win, this);

    let targetTpl: HTMLTemplateElement | null = null;
    if (this._value) {
      targetTpl = this;
    } else {
      targetTpl = this.content.querySelector('template[is="swc-default"]') as HTMLTemplateElement;
    }

    if (targetTpl) {
      const clone = targetTpl.content.cloneNode(true) as DocumentFragment;
      // If it's the host template, remove sub-templates from clone
      if (targetTpl === this) {
        clone.querySelectorAll('template[is^="swc-"]').forEach(t => t.remove());
      }

      this._nodes = Array.from(clone.childNodes);
      const elements = this._nodes.filter(n => n.nodeType === 1) as HTMLElement[];
      const groupArgs = { ...helperSet, $value: this._value, $nodes: this._nodes, $elements: elements, $firstElement: elements[0] };

      // 부모 체인을 정상적으로 유지하기 위해 __swc_host 할당 제거
      this._nodes.forEach((node, nodeIdx) => {
        // if (node instanceof HTMLElement) (node as any).__swc_host = this;  // 제거: 부모 체인 유지
        this._executeCloneCallback('on-clone-node', { ...groupArgs, $node: node, $nodeIndex: nodeIdx, $isElement: node.nodeType === 1 });

        // Attribute {{ }} 치환 - SwcChoose처럼 동적 치환
        if (node instanceof HTMLElement) {
          Array.from(node.attributes).forEach(attr => {
            const value = attr.value || '';
            if (value.startsWith('{{') && value.endsWith('}}')) {
              const script = value.slice(2, -2).trim();
              const result = FunctionUtils.executeReturn({
                script,
                context: node,
                args: { ...groupArgs, $value: this._value }
              });
              node.setAttribute(attr.name, String(result));
            }
          });
        }
      });

      this._executeCloneCallback('on-clone-nodes', groupArgs);

      portal.insertBefore(clone, this.nextSibling);
    }
  }

  private cleanup() {
    this._nodes.forEach(n => n.parentElement?.removeChild(n));
    this._nodes = [];
  }

  connectedCallback() {
    this.refreshValue();
  }
  disconnectedCallback() {
    this.cleanup();
  }
}
