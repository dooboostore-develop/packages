import { changedAttribute } from '../decorators/changedAttribute';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils } from '@dooboostore/core/function/FunctionUtils';

export class SwcIf extends HTMLTemplateElement {
  private _value = false;
  private _nodes: Node[] = [];

  get value(): boolean {
    return this._value;
  }
  set value(nv: any) {
    this._value = Boolean(nv);
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
  private refreshValue() {
    const script = this.getAttribute('on-get-value');
    if (!script) {
      this.value = false;
      return;
    }
    const win = this.ownerDocument?.defaultView || window;
    const res = FunctionUtils.executeReturn({
      script,
      context: this,
      args: SwcUtils.getHelperAndHostSet(win, this)
    });

    if (res instanceof Promise) {
      res.then(v => (this.value = v)).catch(() => (this.value = false));
    } else {
      this.value = res;
    }
  }

  private render() {
    this.cleanup();
    const portal = this._resolvePortal();
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

      this._nodes.forEach((node, nodeIdx) => {
        if (node instanceof HTMLElement) (node as any).__swc_host = this;
        this._executeCloneCallback('on-clone-node', { ...groupArgs, $node: node, $nodeIndex: nodeIdx, $isElement: node.nodeType === 1 });
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
    this.refreshValue();
  }
  disconnectedCallback() {
    this.cleanup();
  }
}
