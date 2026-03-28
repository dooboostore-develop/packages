import { elementDefine } from '../decorators/elementDefine';
import { changedAttribute } from '../decorators/changedAttribute';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils } from '@dooboostore/core/function/FunctionUtils';
import { SwcLoading, SwcError, SwcSuccess, SwcDefault } from './SwcSubTemplates';

@elementDefine({ name: 'swc-async', extends: 'template' })
export class SwcAsync extends HTMLTemplateElement {
  private _nodes: Node[] = [];
  private _currentPromise: Promise<any> | null = null;
  private _value: any = null;

  get value(): any {
    return this._value;
  }

  set value(nv: any) {
    if (nv instanceof Promise) {
      this.handlePromise(nv);
    } else {
      this._value = nv;
      this.render(nv === null ? 'default' : 'success', nv);
    }
  }

  @changedAttribute('on-get-value')
  private refresh(newValue?: string | null) {
    const script = newValue !== undefined ? newValue : this.getAttribute('on-get-value');
    if (!script) {
      this.value = null; // Triggers default render
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

      if (result instanceof Promise) {
        this.handlePromise(result);
      } else {
        this.value = result;
      }
    } catch (e) {
      this.render('error', e);
    }
  }

  private async handlePromise(promise: Promise<any>) {
    this._currentPromise = promise;
    this.render('loading');

    try {
      const result = await promise;
      if (this._currentPromise !== promise) return;
      this._value = result;
      this.render('success', result);
    } catch (e) {
      if (this._currentPromise !== promise) return;
      this.render('error', e);
    }
  }

  private render(state: 'loading' | 'error' | 'success' | 'default', data?: any) {
    this.cleanup();
    if (!this.parentElement) return;

    let fragment: DocumentFragment;
    const ctx: any = {
      $nodes: [],
      $elements: [],
      $state: state,
      $value: null,
      $error: null
    };

    if (state === 'default') {
      const t = this.content.querySelector('template[is="swc-default"]') as HTMLTemplateElement;
      fragment = t ? (t.content.cloneNode(true) as DocumentFragment) : document.createDocumentFragment();
    } else if (state === 'loading') {
      const t = this.content.querySelector('template[is="swc-loading"]') as HTMLTemplateElement;
      fragment = t ? (t.content.cloneNode(true) as DocumentFragment) : document.createDocumentFragment();
    } else if (state === 'error') {
      const t = this.content.querySelector('template[is="swc-error"]') as HTMLTemplateElement;
      ctx.$error = data;
      fragment = t ? (t.content.cloneNode(true) as DocumentFragment) : document.createDocumentFragment();
    } else {
      // Success
      const t = this.content.querySelector('template[is="swc-success"]') as HTMLTemplateElement;
      ctx.$value = data;
      if (t) {
        fragment = t.content.cloneNode(true) as DocumentFragment;
      } else {
        const clone = this.content.cloneNode(true) as DocumentFragment;
        Array.from(clone.querySelectorAll('template[is="swc-loading"], template[is="swc-error"], template[is="swc-success"], template[is="swc-default"]')).forEach(tmp => tmp.remove());
        fragment = clone;
      }
    }

    this.mount(fragment, ctx);
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
    this.parentElement?.insertBefore(fragment, this.nextSibling);
  }

  private _executeCallback(attrName: string, extraArgs: Record<string, any>) {
    const script = this.getAttribute(attrName);
    if (!script) return;
    const helperHostSet = SwcUtils.getHelperAndHostSet(window, this);
    try {
      FunctionUtils.execute({ script, context: this, args: { ...helperHostSet, ...extraArgs } });
    } catch (e) {
      console.error(`[SwcAsync] Error in ${attrName}:`, e);
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
