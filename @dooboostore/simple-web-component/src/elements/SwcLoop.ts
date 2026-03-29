import { changedAttribute } from '../decorators/changedAttribute';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils } from '@dooboostore/core/function/FunctionUtils';

export class SwcLoop extends HTMLTemplateElement {
  private _value: any[] = [];
  private _nodeGroups: Node[][] = [];

  get value(): any[] {
    return this._value;
  }
  set value(nv: any[]) {
    this._value = Array.isArray(nv) ? [...nv] : [];
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

  private _cleanup() {
    this._nodeGroups.forEach(nodes => nodes.forEach(n => n.parentElement?.removeChild(n)));
    this._nodeGroups = [];
  }

  @changedAttribute('on-get-value')
  private refreshValue() {
    const script = this.getAttribute('on-get-value');
    if (!script) {
      this.value = [];
      return;
    }
    const win = this.ownerDocument?.defaultView || window;
    const res = FunctionUtils.executeReturn({
      script,
      context: this,
      args: SwcUtils.getHelperAndHostSet(win, this)
    });

    if (res instanceof Promise) {
      res.then(v => (this.value = v)).catch(() => (this.value = []));
    } else {
      this.value = res;
    }
  }

  render() {
    this._cleanup();
    const portal = this._resolvePortal();
    if (!portal) return;

    const win = this.ownerDocument?.defaultView || window;
    const helperSet = SwcUtils.getHelperAndHostSet(win, this);
    const fragment = win.document.createDocumentFragment();

    if (this._value.length === 0) {
      const defaultTpl = this.content.querySelector('template[is="swc-default"]') as HTMLTemplateElement;
      if (defaultTpl) {
        const clone = defaultTpl.content.cloneNode(true);
        const nodes = Array.from(clone.childNodes);
        this._nodeGroups.push(nodes);
        fragment.appendChild(clone);
      }
    } else {
      this._value.forEach((item, index) => {
        const clone = this.content.cloneNode(true) as DocumentFragment;
        // Filter out sub-templates
        const subTemplates = clone.querySelectorAll('template[is^="swc-"]');
        subTemplates.forEach(t => t.remove());

        const nodes = Array.from(clone.childNodes);
        const elements = nodes.filter(n => n.nodeType === 1) as HTMLElement[];

        const groupArgs = { ...helperSet, $item: item, $index: index, $value: this._value, $nodes: nodes, $elements: elements, $firstElement: elements[0] };

        nodes.forEach((node, nodeIdx) => {
          if (node instanceof HTMLElement) (node as any).__swc_host = this;
          this._executeCloneCallback('on-clone-node', { ...groupArgs, $node: node, $nodeIndex: nodeIdx, $isElement: node.nodeType === 1 });
        });

        this._executeCloneCallback('on-clone-nodes', groupArgs);
        this._nodeGroups.push(nodes);
        fragment.appendChild(clone);
      });
    }

    if (portal === this.parentElement) {
      portal.insertBefore(fragment, this.nextSibling);
    } else {
      portal.appendChild(fragment);
    }
  }

  connectedCallback() {
    this.refreshValue();
  }
  disconnectedCallback() {
    this._cleanup();
  }
}
