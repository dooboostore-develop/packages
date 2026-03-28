import { elementDefine } from '../decorators/elementDefine';
import { changedAttribute } from '../decorators/changedAttribute';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils } from '@dooboostore/core/function/FunctionUtils';

@elementDefine({ name: 'swc-loop', extends: 'template' })
export class SwcLoop extends HTMLTemplateElement {
  private _value: any[] = [];
  private _nodes: (Node[] | null)[] = [];
  private _defaultNodes: Node[] = [];

  get value(): any[] {
    return this._value;
  }

  set value(nv: any[]) {
    this._value = Array.isArray(nv) ? [...nv] : [];
    this.render();
  }

  getNodes(index: number): Node[] | null {
    return this._nodes[index] || null;
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
      console.error('[SwcLoop] Portal target error:', e);
    }
    return null;
  }

  append(...items: any[]) {
    if (!items.length || !this.parentElement) return;
    if (this._defaultNodes.length > 0) this._cleanupDefault();

    const fragment = document.createDocumentFragment();
    const startIndex = this._value.length;

    items.forEach((item, i) => {
      const index = startIndex + i;
      const nodes = this._createItemNodes(item, index);
      if (nodes) {
        this._nodes.push(nodes);
        nodes.forEach(n => fragment.appendChild(n));
        this._value.push(item);
      } else {
        this._nodes.push(null);
        this._value.push(null);
      }
    });

    const target = this._getTarget();
    if (target) {
      target.appendChild(fragment);
    } else {
      const lastValidIdx = this._nodes.length - items.length - 1;
      let refNode: Node = this;
      for (let i = lastValidIdx; i >= 0; i--) {
        const group = this._nodes[i];
        if (group && group.length > 0) {
          refNode = group[group.length - 1];
          break;
        }
      }
      this.parentElement.insertBefore(fragment, refNode.nextSibling);
    }
  }

  remove(index?: number) {
    const targetIdx = index !== undefined ? index : this._nodes.length - 1;
    if (targetIdx < 0 || targetIdx >= this._nodes.length) return;

    const nodes = this._nodes[targetIdx];
    if (nodes) {
      nodes.forEach(n => {
        if (n.parentElement) n.parentElement.removeChild(n);
      });
      this._nodes[targetIdx] = null;
      this._value[targetIdx] = null;
    }

    const activeRows = this._value.filter(v => v !== null);
    if (activeRows.length === 0) {
      this.render();
    }
  }

  private _createItemNodes(item: any, index: number): Node[] {
    const clone = this.content.cloneNode(true) as DocumentFragment;
    Array.from(clone.querySelectorAll('template[is="swc-default"]')).forEach(t => t.remove());

    const nodes = Array.from(clone.childNodes);
    const elements = nodes.filter(n => n.nodeType === 1) as HTMLElement[];

    const groupCtx = {
      $index: index,
      $item: item,
      $nodes: nodes,
      $elements: elements,
      $firstNode: nodes[0],
      $lastNode: nodes[nodes.length - 1],
      $firstElement: elements[0],
      $lastElement: elements[elements.length - 1],
      $isFirst: index === 0,
      $isLast: index === this._value.length - 1,
      $isEven: index % 2 === 0,
      $isOdd: index % 2 !== 0,
      $count: this._value.length
    };

    this._executeCallback('on-clone-nodes', groupCtx);
    nodes.forEach((node, nodeIndex) => {
      if (node instanceof HTMLElement) (node as any).__swc_host = this;
      this._executeCallback('on-clone-node', { ...groupCtx, $node: node, $nodeIndex: nodeIndex, $isElement: node.nodeType === 1 });
    });

    return nodes;
  }

  private _executeCallback(attrName: string, extraArgs: Record<string, any>) {
    const script = this.getAttribute(attrName);
    if (!script) return;
    const helperHostSet = SwcUtils.getHelperAndHostSet(window, this);
    try {
      FunctionUtils.execute({ script, context: this, args: { ...helperHostSet, ...extraArgs } });
    } catch (e) {
      console.error(`[SwcLoop] Error in ${attrName}:`, e);
    }
  }

  @changedAttribute('on-get-value')
  private refreshValue(newValue?: string | null) {
    const script = newValue !== undefined ? newValue : this.getAttribute('on-get-value');
    if (!script) {
      this.value = [];
      return;
    }
    const helperHostSet = SwcUtils.getHelperAndHostSet(window, this);
    try {
      const res = FunctionUtils.executeReturn({ script, context: this, args: helperHostSet });
      if (Array.isArray(res)) {
        this.value = res;
      }
    } catch (e) {
      console.error('[SwcLoop] Failed to get value from on-get-value script:', e);
      this.value = [];
    }
  }

  render() {
    this._cleanup();
    if (!this.parentElement) return;

    const activeRows = this._value.filter(v => v !== null);
    const target = this._getTarget();

    if (activeRows.length === 0) {
      const t = this.content.querySelector('template[is="swc-default"]') as HTMLTemplateElement;
      if (t) {
        const clone = t.content.cloneNode(true) as DocumentFragment;
        this._defaultNodes = Array.from(clone.childNodes);
        this._defaultNodes.forEach(n => {
          if (n instanceof HTMLElement) (n as any).__swc_host = this;
        });
        if (target) target.appendChild(clone);
        else this.parentElement.insertBefore(clone, this.nextSibling);
      }
      return;
    }

    const fragment = document.createDocumentFragment();
    this._value.forEach((item, index) => {
      if (item === null) {
        this._nodes.push(null);
        return;
      }
      const nodes = this._createItemNodes(item, index);
      this._nodes.push(nodes);
      nodes.forEach(n => fragment.appendChild(n));
    });

    if (target) target.appendChild(fragment);
    else this.parentElement.insertBefore(fragment, this.nextSibling);
  }

  private _cleanup() {
    this._nodes.forEach(group => {
      if (group) group.forEach(node => node.parentElement?.removeChild(node));
    });
    this._nodes = [];
    this._cleanupDefault();
  }

  private _cleanupDefault() {
    this._defaultNodes.forEach(n => n.parentElement?.removeChild(n));
    this._defaultNodes = [];
  }

  connectedCallback() {
    this.refreshValue();
  }
  disconnectedCallback() {
    this._cleanup();
  }
}
