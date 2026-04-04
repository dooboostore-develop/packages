import { changedAttributeHost } from '../decorators/changedAttributeHost';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils } from '@dooboostore/core';
import { SwcChooseInterface } from '../types';

class SwcChoose extends HTMLTemplateElement implements SwcChooseInterface {
  private _nodes: Node[] = [];
  private _value: any = null;
  private _previousTemplate: HTMLTemplateElement | null = null;

  get value(): any {
    return this._value;
  }
  set value(nv: any) {
    this._value = nv;
    this.render();
  }

  private _executeCloneCallback(attr: string, args: any) {
    const script = this.getAttribute(attr);
    if (!script) return;
    FunctionUtils.execute({ script, context: this, args });
  }

  @changedAttributeHost('value')
  refresh(valueAttr?: string | null) {
    valueAttr ??= this.getAttribute('value');
    if (valueAttr === null) {
      this.value = null;
      return;
    }

    // {{ }} 브레이스로 감싸진 값은 스크립트 실행
    if (valueAttr.startsWith('{{') && valueAttr.endsWith('}}')) {
      const script = valueAttr.slice(2, -2).trim();
      const win = this.ownerDocument?.defaultView || window;
      const helperAndHostSet = SwcUtils.getHelperAndHostSet(win, SwcUtils.findNearestSwcHost(this));
      // console.log('vvvvvvvvvvvvvvvvvv323', helperAndHostSet);
      const result = FunctionUtils.executeReturn({ script, context: this, args: helperAndHostSet });
      this.value = result;
      // console.log('----------vv', this.value);
    } else {
      // 일반 문자열 값
      this.value = valueAttr;
    }
  }

  private render() {
    // console.log('-------------', this.value);
    const win = this.ownerDocument?.defaultView || window;
    const helperSet = SwcUtils.getHelperAndHostSet(win, this);
    const templates = Array.from(this.content.querySelectorAll('template'));
    let selected: HTMLTemplateElement | null = null;

    for (const t of templates) {
      if (t.getAttribute('is') === 'swc-when') {
        let matches = false;
        const value = t.getAttribute('value') || '';

        // {{ }} 브레이스로 감싸진 값은 스크립트 실행
        if (value.startsWith('{{') && value.endsWith('}}')) {
          const script = value.slice(2, -2).trim();
          const result = FunctionUtils.executeReturn({
            script,
            context: t,
            args: { ...helperSet, $value: this._value }
          });
          // console.log('rrrrrrrrrrrrrr', result);
          matches = result === true;
        } else {
          // 일반 문자열 비교 (기존 방식)
          matches = String(value) === String(this._value);
        }

        if (matches) {
          selected = t;
          break;
        }
      }
    }

    const target = selected || (this.content.querySelector('template[is="swc-otherwise"]') as HTMLTemplateElement);

    // skip-if-same attribute가 있고 이전과 같은 template이면 렌더링 스킵
    // 최상위 skip-if-same 또는 각 when/otherwise의 skip-if-same 체크
    const targetHasSkipIfSame = target?.hasAttribute('skip-if-same');
    const shouldSkip = (this.hasAttribute('skip-if-same') || targetHasSkipIfSame) && this._previousTemplate === target;
    if (shouldSkip) {
      return;
    }

    this.cleanup();
    this._previousTemplate = target;

    if (target) {
      const clone = target.content.cloneNode(true) as DocumentFragment;
      this._nodes = Array.from(clone.childNodes);
      const elements = this._nodes.filter(n => n.nodeType === 1) as HTMLElement[];
      const groupArgs = { ...helperSet, $value: this._value, $nodes: this._nodes, $elements: elements, $firstElement: elements[0] };

      // 복제된 최상위 요소들은 SwcChoose의 직접 자식이 될 것이므로 __swc_host 설정 안 함
      this._nodes.forEach((n, nodeIdx) => {
        // if (n instanceof HTMLElement) (n as any).__swc_host = this;  // 제거: 부모 체인 유지
        this._executeCloneCallback('on-clone-node', { ...groupArgs, $node: n, $nodeIndex: nodeIdx, $isElement: n.nodeType === 1 });

        // Attribute {{ }} 치환 - HTML string 차원에서 동적 치환
        if (n instanceof HTMLElement) {
          Array.from(n.attributes).forEach(attr => {
            const value = attr.value || '';
            if (value.startsWith('{{') && value.endsWith('}}')) {
              const script = value.slice(2, -2).trim();
              const result = FunctionUtils.executeReturn({
                script,
                context: n,
                args: { ...groupArgs, $value: this._value }
              });
              n.setAttribute(attr.name, String(result));
            }
          });
        }
      });

      this._executeCloneCallback('on-clone-nodes', groupArgs);

      this.parentElement?.insertBefore(clone, this.nextSibling);
      // if (portal === this.parentElement) {
      //   portal.insertBefore(clone, this.nextSibling);
      // } else {
      //   portal.appendChild(clone);
      // }
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
