import { changedAttributeHost } from '../decorators/changedAttributeHost';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils } from '@dooboostore/core';

class SwcAsync extends HTMLTemplateElement {
  private _nodes: Node[] = [];
  private _value: any = null;

  private _executeCloneCallback(attr: string, args: any) {
    const script = this.getAttribute(attr);
    if (!script) return;
    FunctionUtils.execute({ script, context: this, args });
  }

  @changedAttributeHost('value')
  private refresh(valueAttr?: string | null) {
    valueAttr ??= this.getAttribute('value');
    if (!valueAttr) {
      this.render('default');
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

      this.executeAsync(result);
    } else {
      // 일반 문자열 값 또는 직접 Promise 속성
      this.executeAsync(valueAttr);
    }
  }

  private executeAsync(result: any) {
    if (result instanceof Promise) {
      this.render('loading');
      result
        .then(v => {
          this._value = v;
          this.render('success');
        })
        .catch(e => this.render('error'));
    } else {
      this._value = result;
      this.render('success');
    }
  }

  private render(state: string) {
    this.cleanup();
    const portal = this.parentElement;
    if (!portal) return;

    const win = this.ownerDocument?.defaultView || window;
    const helperSet = SwcUtils.getHelperAndHostSet(win, this);

    const t = this.content.querySelector(`template[is="swc-${state}"]`) as HTMLTemplateElement;
    if (t) {
      const clone = t.content.cloneNode(true) as DocumentFragment;
      this._nodes = Array.from(clone.childNodes);
      const elements = this._nodes.filter(n => n.nodeType === 1) as HTMLElement[];
      const groupArgs = { ...helperSet, $value: this._value, $nodes: this._nodes, $elements: elements, $firstElement: elements[0], $state: state };

      // 부모 체인을 정상적으로 유지하기 위해 __swc_host 할당 제거
      this._nodes.forEach((n, nodeIdx) => {
        // if (n instanceof HTMLElement) (n as any).__swc_host = this;  // 제거: 부모 체인 유지
        this._executeCloneCallback('on-clone-node', { ...groupArgs, $node: n, $nodeIndex: nodeIdx, $isElement: n.nodeType === 1 });

        // Attribute {{ }} 치환 - SwcChoose처럼 동적 치환
        if (n instanceof HTMLElement) {
          Array.from(n.attributes).forEach(attr => {
            const value = attr.value || '';
            if (value.startsWith('{{') && value.endsWith('}}')) {
              const script = value.slice(2, -2).trim();
              const result = FunctionUtils.executeReturn({
                script,
                context: n,
                args: groupArgs
              });
              n.setAttribute(attr.name, String(result));
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
    this.refresh();
  }
  disconnectedCallback() {
    this.cleanup();
  }
}
