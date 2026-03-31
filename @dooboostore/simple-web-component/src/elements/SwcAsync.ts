import { changedAttributeHost } from '../decorators/changedAttributeHost';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils } from '@dooboostore/core';

export class SwcAsync extends HTMLTemplateElement {
  private _nodes: Node[] = [];
  private _value: any = null;

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

  @changedAttributeHost('on-get-value')
  private refresh() {
    const script = this.getAttribute('on-get-value');
    if (!script) return;
    const win = this.ownerDocument?.defaultView || window;
    const result = FunctionUtils.executeReturn({ script, context: this, args: SwcUtils.getHelperAndHostSet(win, this) });

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
    const portal = this._resolvePortal();
    if (!portal) return;

    const win = this.ownerDocument?.defaultView || window;
    const helperSet = SwcUtils.getHelperAndHostSet(win, this);

    const t = this.content.querySelector(`template[is="swc-${state}"]`) as HTMLTemplateElement;
    if (t) {
      const clone = t.content.cloneNode(true) as DocumentFragment;
      this._nodes = Array.from(clone.childNodes);
      const elements = this._nodes.filter(n => n.nodeType === 1) as HTMLElement[];
      const groupArgs = { ...helperSet, $value: this._value, $nodes: this._nodes, $elements: elements, $firstElement: elements[0], $state: state };

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
