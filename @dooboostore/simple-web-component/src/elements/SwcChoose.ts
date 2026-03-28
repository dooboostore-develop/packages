import { elementDefine } from '../decorators/elementDefine';
import { changedAttribute } from '../decorators/changedAttribute';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils } from '@dooboostore/core/function/FunctionUtils';
import { SwcWhen, SwcOtherwise } from './SwcSubTemplates';

@elementDefine({ name: 'swc-choose', extends: 'template' })
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

  private _executeCallback(attrName: string, extraArgs: Record<string, any>) {
    const script = this.getAttribute(attrName);
    if (!script) return;
    const helperHostSet = SwcUtils.getHelperAndHostSet(window, this);
    try {
      FunctionUtils.execute({ script, context: this, args: { ...helperHostSet, ...extraArgs } });
    } catch (e) {
      console.error(`[SwcChoose] Error in ${attrName}:`, e);
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
      console.error('[SwcChoose] Error in on-get-value:', e);
    }
  }

  private render() {
    this.cleanup();
    if (!this.parentElement) return;

    const templates = Array.from(this.content.querySelectorAll('template'));
    let selected: HTMLTemplateElement | null = null;
    let otherwise: HTMLTemplateElement | null = null;
    let defaultTmp: HTMLTemplateElement | null = null;

    for (const t of templates) {
      const is = t.getAttribute('is');
      if (is === 'swc-when') {
        const whenVal = t.getAttribute('value');
        if (String(whenVal) === String(this._value)) {
          selected = t;
          break;
        }
      } else if (is === 'swc-otherwise') {
        otherwise = t;
      } else if (is === 'swc-default') {
        defaultTmp = t;
      }
    }

    const targetTemplate = (this._value == null ? defaultTmp : selected) || otherwise || defaultTmp;
    if (targetTemplate) {
      const clone = targetTemplate.content.cloneNode(true) as DocumentFragment;
      const nodes = Array.from(clone.childNodes);
      const elements = nodes.filter(n => n.nodeType === 1) as HTMLElement[];

      const ctx = {
        $value: this._value,
        $nodes: nodes,
        $elements: elements,
        $firstNode: nodes[0],
        $lastNode: nodes[nodes.length - 1],
        $firstElement: elements[0],
        $lastElement: elements[elements.length - 1]
      };

      // Execution Callbacks
      this._executeCallback('on-clone-nodes', ctx);
      nodes.forEach((node, nodeIndex) => {
        if (node instanceof HTMLElement) {
          (node as any).__swc_host = this;
        }
        this._executeCallback('on-clone-node', {
          ...ctx,
          $node: node,
          $nodeIndex: nodeIndex,
          $isElement: node.nodeType === 1
        });
      });

      this._nodes = nodes;
      this.parentElement.insertBefore(clone, this.nextSibling);
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
