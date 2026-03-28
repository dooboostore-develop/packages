import { elementDefine } from '../decorators/elementDefine';
import { changedAttribute } from '../decorators/changedAttribute';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils } from '@dooboostore/core/function/FunctionUtils';

@elementDefine({ name: 'swc-if', extends: 'template' })
export class SwcIf extends HTMLTemplateElement {
  private _nodes: Node[] = [];
  private _value: any = null;

  get value(): any {
    return this._value;
  }

  set value(nv: any) {
    this._value = nv;
    this.render();
  }

  private _getTarget(): Element | DocumentFragment | null {
    const script = this.getAttribute('on-get-portal');
    if (!script) return null;
    try {
      const res = FunctionUtils.executeReturn({
        script,
        context: this,
        args: SwcUtils.getHelperAndHostSet(window, this)
      });
      if (typeof res === 'string') return document.querySelector(res);
      if (res instanceof Node) return res as any;
    } catch (e) {
      console.error('[SwcIf] Portal target error:', e);
    }
    return null;
  }

  private _executeCallback(attrName: string, extraArgs: Record<string, any>) {
    const script = this.getAttribute(attrName);
    if (!script) return;
    const helperHostSet = SwcUtils.getHelperAndHostSet(window, this);
    try {
      FunctionUtils.execute({ script, context: this, args: { ...helperHostSet, ...extraArgs } });
    } catch (e) {
      console.error(`[SwcIf] Error in ${attrName}:`, e);
    }
  }

  @changedAttribute('on-get-value')
  private refresh(newValue?: string | null) {
    const script = newValue !== undefined ? newValue : this.getAttribute('on-get-value');
    if (!script) {
      this.value = null;
      return;
    }
    if (!this.parentElement) return;

    const helperHostSet = SwcUtils.getHelperAndHostSet(window, this);
    try {
      const result = FunctionUtils.executeReturn({
        script,
        context: this,
        args: helperHostSet
      });
      this.value = result;
    } catch (e) {
      console.error('[SwcIf] Error in on-get-value:', e);
      this.value = null;
    }
  }

  private render() {
    this.cleanup();
    if (!this.parentElement) return;

    let fragment: DocumentFragment | null = null;
    const ctx: any = { $value: this._value, $nodes: [], $elements: [] };

    if (this._value) {
      const clone = this.content.cloneNode(true) as DocumentFragment;
      Array.from(clone.querySelectorAll('template[is="swc-default"]')).forEach(t => t.remove());
      fragment = clone;
    } else {
      const t = this.content.querySelector('template[is="swc-default"]') as HTMLTemplateElement;
      if (t) fragment = t.content.cloneNode(true) as DocumentFragment;
    }

    if (fragment) {
      this.mount(fragment, ctx);
    }
  }

  private mount(fragment: DocumentFragment, ctx: any) {
    const nodes = Array.from(fragment.childNodes);
    const elements = nodes.filter(n => n.nodeType === 1) as HTMLElement[];

    Object.assign(ctx, {
      $nodes: nodes,
      $elements: elements,
      $firstNode: nodes[0],
      $lastNode: nodes[nodes.length - 1],
      $firstElement: elements[0],
      $lastElement: elements[elements.length - 1]
    });

    this._executeCallback('on-clone-nodes', ctx);
    nodes.forEach((node, nodeIndex) => {
      if (node instanceof HTMLElement) (node as any).__swc_host = this;
      this._executeCallback('on-clone-node', { ...ctx, $node: node, $nodeIndex: nodeIndex, $isElement: node.nodeType === 1 });
    });

    this._nodes = nodes;
    const target = this._getTarget();
    if (target) {
      target.appendChild(fragment);
    } else {
      this.parentElement?.insertBefore(fragment, this.nextSibling);
    }
  }

  private cleanup() {
    this._nodes.forEach(n => {
      if (n.parentElement) n.parentElement.removeChild(n);
    });
    this._nodes = [];
  }

  connectedCallback() {
    this.refresh();
  }

  disconnectedCallback() {
    this.cleanup();
  }
}
