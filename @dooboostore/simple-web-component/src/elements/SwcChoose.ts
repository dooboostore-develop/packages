import { changedAttribute } from '../decorators/changedAttribute';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils } from '@dooboostore/core/function/FunctionUtils';

export class SwcChoose extends HTMLTemplateElement {
  private _nodes: Node[] = [];
  private _value: any = null;

  get value(): any {
    return this._value;
  }
  set value(nv: any) {
    this._value = nv;
    this.render();
  }

  private _resolvePortal(): Element | null {
    const portalScript = this.getAttribute('on-get-portal');
    if (!portalScript) return this.parentElement;

    const win = this.ownerDocument?.defaultView || window;
    const res = FunctionUtils.executeReturn({
      script: portalScript,
      context: this,
      args: SwcUtils.getHelperAndHostSet(win, this)
    });

    if (res instanceof HTMLElement) return res;
    if (typeof res === 'string') return win.document.querySelector(res);
    return this.parentElement;
  }

  private _executeCloneCallback(attr: string, args: any) {
    const script = this.getAttribute(attr);
    if (!script) return;
    FunctionUtils.execute({ script, context: this, args });
  }

  @changedAttribute('on-get-value')
  private refresh() {
    const script = this.getAttribute('on-get-value');
    if (!script) {
      this.value = null;
      return;
    }
    const win = this.ownerDocument?.defaultView || window;
    const result = FunctionUtils.executeReturn({ script, context: this, args: SwcUtils.getHelperAndHostSet(win, this) });
    this.value = result;
  }

  private render() {
    this.cleanup();
    const portal = this._resolvePortal();
    if (!portal) return;

    const win = this.ownerDocument?.defaultView || window;
    const helperSet = SwcUtils.getHelperAndHostSet(win, this);

    const templates = Array.from(this.content.querySelectorAll('template'));
    let selected: HTMLTemplateElement | null = null;
    for (const t of templates) {
      if (t.getAttribute('is') === 'swc-when' && String(t.getAttribute('value')) === String(this._value)) {
        selected = t;
        break;
      }
    }
    const target = selected || (this.content.querySelector('template[is="swc-otherwise"]') as HTMLTemplateElement);

    if (target) {
      const clone = target.content.cloneNode(true) as DocumentFragment;
      this._nodes = Array.from(clone.childNodes);
      const elements = this._nodes.filter(n => n.nodeType === 1) as HTMLElement[];
      const groupArgs = { ...helperSet, $value: this._value, $nodes: this._nodes, $elements: elements, $firstElement: elements[0] };

      this._nodes.forEach((n, nodeIdx) => {
        if (n instanceof HTMLElement) (n as any).__swc_host = this;
        this._executeCloneCallback('on-clone-node', { ...groupArgs, $node: n, $nodeIndex: nodeIdx, $isElement: n.nodeType === 1 });
      });

      this._executeCloneCallback('on-clone-nodes', groupArgs);

      if (portal === this.parentElement) {
        portal.insertBefore(clone, this.nextSibling);
      } else {
        portal.appendChild(clone);
      }
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
