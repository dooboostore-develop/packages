import { elementDefine } from '../decorators/elementDefine';
import { SwcAppMixin } from './SwcAppMixin';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils } from '@dooboostore/core/function/FunctionUtils';
import { changedAttribute } from '../decorators/changedAttribute';

export const registerAllElements = (w: any) => {
  const {
    HTMLElement: _HTMLElement,
    HTMLTemplateElement: _HTMLTemplateElement,
    DocumentFragment: _DocumentFragment,
    Node: _Node,
    Element: _Element,
    HTMLAnchorElement: _HTMLAnchorElement,
    HTMLAreaElement: _HTMLAreaElement,
    HTMLAudioElement: _HTMLAudioElement,
    HTMLBaseElement: _HTMLBaseElement,
    HTMLButtonElement: _HTMLButtonElement,
    HTMLCanvasElement: _HTMLCanvasElement,
    HTMLDataElement: _HTMLDataElement,
    HTMLDataListElement: _HTMLDataListElement,
    HTMLDetailsElement: _HTMLDetailsElement,
    HTMLDialogElement: _HTMLDialogElement,
    HTMLDivElement: _HTMLDivElement,
    HTMLDListElement: _HTMLDListElement,
    HTMLEmbedElement: _HTMLEmbedElement,
    HTMLFieldSetElement: _HTMLFieldSetElement,
    HTMLFormElement: _HTMLFormElement,
    HTMLHRElement: _HTMLHRElement,
    HTMLIFrameElement: _HTMLIFrameElement,
    HTMLImageElement: _HTMLImageElement,
    HTMLInputElement: _HTMLInputElement,
    HTMLLabelElement: _HTMLLabelElement,
    HTMLLegendElement: _HTMLLegendElement,
    HTMLLIElement: _HTMLLIElement,
    HTMLLinkElement: _HTMLLinkElement,
    HTMLMapElement: _HTMLMapElement,
    HTMLMetaElement: _HTMLMetaElement,
    HTMLMeterElement: _HTMLMeterElement,
    HTMLModElement: _HTMLModElement,
    HTMLObjectElement: _HTMLObjectElement,
    HTMLOListElement: _HTMLOListElement,
    HTMLOptGroupElement: _HTMLOptGroupElement,
    HTMLOptionElement: _HTMLOptionElement,
    HTMLOutputElement: _HTMLOutputElement,
    HTMLParagraphElement: _HTMLParagraphElement,
    HTMLParamElement: _HTMLParamElement,
    HTMLPictureElement: _HTMLPictureElement,
    HTMLPreElement: _HTMLPreElement,
    HTMLProgressElement: _HTMLProgressElement,
    HTMLQuoteElement: _HTMLQuoteElement,
    HTMLScriptElement: _HTMLScriptElement,
    HTMLSelectElement: _HTMLSelectElement,
    HTMLSlotElement: _HTMLSlotElement,
    HTMLSourceElement: _HTMLSourceElement,
    HTMLSpanElement: _HTMLSpanElement,
    HTMLStyleElement: _HTMLStyleElement,
    HTMLTableElement: _HTMLTableElement,
    HTMLTableSectionElement: _HTMLTableSectionElement,
    HTMLTableCellElement: _HTMLTableCellElement,
    HTMLTextAreaElement: _HTMLTextAreaElement,
    HTMLTimeElement: _HTMLTimeElement,
    HTMLTitleElement: _HTMLTitleElement,
    HTMLTableRowElement: _HTMLTableRowElement,
    HTMLTrackElement: _HTMLTrackElement,
    HTMLUListElement: _HTMLUListElement,
    HTMLVideoElement: _HTMLVideoElement,
    HTMLHeadingElement: _HTMLHeadingElement,
    HTMLBodyElement: _HTMLBodyElement,
  } = w as any;

  const HTMLElement = _HTMLElement as typeof globalThis.HTMLElement;
  const HTMLTemplateElement = _HTMLTemplateElement as typeof globalThis.HTMLTemplateElement;
  const DocumentFragment = _DocumentFragment as typeof globalThis.DocumentFragment;
  const Node = _Node as typeof globalThis.Node;
  const Element = _Element as typeof globalThis.Element;
  const HTMLAnchorElement = _HTMLAnchorElement as typeof globalThis.HTMLAnchorElement;
  const HTMLAreaElement = _HTMLAreaElement as typeof globalThis.HTMLAreaElement;
  const HTMLAudioElement = _HTMLAudioElement as typeof globalThis.HTMLAudioElement;
  const HTMLBaseElement = _HTMLBaseElement as typeof globalThis.HTMLBaseElement;
  const HTMLButtonElement = _HTMLButtonElement as typeof globalThis.HTMLButtonElement;
  const HTMLCanvasElement = _HTMLCanvasElement as typeof globalThis.HTMLCanvasElement;
  const HTMLDataElement = _HTMLDataElement as typeof globalThis.HTMLDataElement;
  const HTMLDataListElement = _HTMLDataListElement as typeof globalThis.HTMLDataListElement;
  const HTMLDetailsElement = _HTMLDetailsElement as typeof globalThis.HTMLDetailsElement;
  const HTMLDialogElement = _HTMLDialogElement as typeof globalThis.HTMLDialogElement;
  const HTMLDivElement = _HTMLDivElement as typeof globalThis.HTMLDivElement;
  const HTMLDListElement = _HTMLDListElement as typeof globalThis.HTMLDListElement;
  const HTMLEmbedElement = _HTMLEmbedElement as typeof globalThis.HTMLEmbedElement;
  const HTMLFieldSetElement = _HTMLFieldSetElement as typeof globalThis.HTMLFieldSetElement;
  const HTMLFormElement = _HTMLFormElement as typeof globalThis.HTMLFormElement;
  const HTMLHRElement = _HTMLHRElement as typeof globalThis.HTMLHRElement;
  const HTMLIFrameElement = _HTMLIFrameElement as typeof globalThis.HTMLIFrameElement;
  const HTMLImageElement = _HTMLImageElement as typeof globalThis.HTMLImageElement;
  const HTMLInputElement = _HTMLInputElement as typeof globalThis.HTMLInputElement;
  const HTMLLabelElement = _HTMLLabelElement as typeof globalThis.HTMLLabelElement;
  const HTMLLegendElement = _HTMLLegendElement as typeof globalThis.HTMLLegendElement;
  const HTMLLIElement = _HTMLLIElement as typeof globalThis.HTMLLIElement;
  const HTMLLinkElement = _HTMLLinkElement as typeof globalThis.HTMLLinkElement;
  const HTMLMapElement = _HTMLMapElement as typeof globalThis.HTMLMapElement;
  const HTMLMetaElement = _HTMLMetaElement as typeof globalThis.HTMLMetaElement;
  const HTMLMeterElement = _HTMLMeterElement as typeof globalThis.HTMLMeterElement;
  const HTMLModElement = _HTMLModElement as typeof globalThis.HTMLModElement;
  const HTMLObjectElement = _HTMLObjectElement as typeof globalThis.HTMLObjectElement;
  const HTMLOListElement = _HTMLOListElement as typeof globalThis.HTMLOListElement;
  const HTMLOptGroupElement = _HTMLOptGroupElement as typeof globalThis.HTMLOptGroupElement;
  const HTMLOptionElement = _HTMLOptionElement as typeof globalThis.HTMLOptionElement;
  const HTMLOutputElement = _HTMLOutputElement as typeof globalThis.HTMLOutputElement;
  const HTMLParagraphElement = _HTMLParagraphElement as typeof globalThis.HTMLParagraphElement;
  const HTMLParamElement = _HTMLParamElement as typeof globalThis.HTMLParamElement;
  const HTMLPictureElement = _HTMLPictureElement as typeof globalThis.HTMLPictureElement;
  const HTMLPreElement = _HTMLPreElement as typeof globalThis.HTMLPreElement;
  const HTMLProgressElement = _HTMLProgressElement as typeof globalThis.HTMLProgressElement;
  const HTMLQuoteElement = _HTMLQuoteElement as typeof globalThis.HTMLQuoteElement;
  const HTMLScriptElement = _HTMLScriptElement as typeof globalThis.HTMLScriptElement;
  const HTMLSelectElement = _HTMLSelectElement as typeof globalThis.HTMLSelectElement;
  const HTMLSlotElement = _HTMLSlotElement as typeof globalThis.HTMLSlotElement;
  const HTMLSourceElement = _HTMLSourceElement as typeof globalThis.HTMLSourceElement;
  const HTMLSpanElement = _HTMLSpanElement as typeof globalThis.HTMLSpanElement;
  const HTMLStyleElement = _HTMLStyleElement as typeof globalThis.HTMLStyleElement;
  const HTMLTableElement = _HTMLTableElement as typeof globalThis.HTMLTableElement;
  const HTMLTableSectionElement = _HTMLTableSectionElement as typeof globalThis.HTMLTableSectionElement;
  const HTMLTableCellElement = _HTMLTableCellElement as typeof globalThis.HTMLTableCellElement;
  const HTMLTextAreaElement = _HTMLTextAreaElement as typeof globalThis.HTMLTextAreaElement;
  const HTMLTimeElement = _HTMLTimeElement as typeof globalThis.HTMLTimeElement;
  const HTMLTitleElement = _HTMLTitleElement as typeof globalThis.HTMLTitleElement;
  const HTMLTableRowElement = _HTMLTableRowElement as typeof globalThis.HTMLTableRowElement;
  const HTMLTrackElement = _HTMLTrackElement as typeof globalThis.HTMLTrackElement;
  const HTMLUListElement = _HTMLUListElement as typeof globalThis.HTMLUListElement;
  const HTMLVideoElement = _HTMLVideoElement as typeof globalThis.HTMLVideoElement;
  const HTMLHeadingElement = _HTMLHeadingElement as typeof globalThis.HTMLHeadingElement;
  const HTMLBodyElement = _HTMLBodyElement as typeof globalThis.HTMLBodyElement;


  // --- Sub Templates ---
  @elementDefine('swc-loading', { extends: 'template', window: w }) class SwcLoading extends HTMLTemplateElement {}
  @elementDefine('swc-error', { extends: 'template', window: w }) class SwcError extends HTMLTemplateElement {}
  @elementDefine('swc-success', { extends: 'template', window: w }) class SwcSuccess extends HTMLTemplateElement {}
  @elementDefine('swc-when', { extends: 'template', window: w }) class SwcWhen extends HTMLTemplateElement {}
  @elementDefine('swc-otherwise', { extends: 'template', window: w }) class SwcOtherwise extends HTMLTemplateElement {}
  @elementDefine('swc-default', { extends: 'template', window: w }) class SwcDefault extends HTMLTemplateElement {}

  // --- Core Elements ---
  @elementDefine('swc-app', { window: w })
  class SwcApp extends SwcAppMixin(HTMLElement) {}

    @elementDefine('swc-if', { extends: 'template', window: w })
  class SwcIf extends HTMLTemplateElement {
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

    @elementDefine('swc-loop', { extends: 'template', window: w })
  class SwcLoop extends HTMLTemplateElement {
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

    @elementDefine('swc-choose', { extends: 'template', window: w })
  class SwcChoose extends HTMLTemplateElement {
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

    @elementDefine('swc-async', { extends: 'template', window: w })
  class SwcAsync extends HTMLTemplateElement {
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

  @changedAttribute('on-get-value')
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

  // --- "is" Elements ---
  @elementDefine('swc-app-a', { extends: 'a', window: w })
  class SwcAppAnchor extends SwcAppMixin(HTMLAnchorElement) {}

  @elementDefine('swc-app-area', { extends: 'area', window: w })
  class SwcAppArea extends SwcAppMixin(HTMLAreaElement) {}

  @elementDefine('swc-app-audio', { extends: 'audio', window: w })
  class SwcAppAudio extends SwcAppMixin(HTMLAudioElement) {}

  @elementDefine('swc-app-base', { extends: 'base', window: w })
  class SwcAppBase extends SwcAppMixin(HTMLBaseElement) {}

  @elementDefine('swc-app-button', { extends: 'button', window: w })
  class SwcAppButton extends SwcAppMixin(HTMLButtonElement) {}

  @elementDefine('swc-app-canvas', { extends: 'canvas', window: w })
  class SwcAppCanvas extends SwcAppMixin(HTMLCanvasElement) {}

  @elementDefine('swc-app-data', { extends: 'data', window: w })
  class SwcAppData extends SwcAppMixin(HTMLDataElement) {}

  @elementDefine('swc-app-datalist', { extends: 'datalist', window: w })
  class SwcAppDataList extends SwcAppMixin(HTMLDataListElement) {}

  @elementDefine('swc-app-details', { extends: 'details', window: w })
  class SwcAppDetails extends SwcAppMixin(HTMLDetailsElement) {}

  @elementDefine('swc-app-dialog', { extends: 'dialog', window: w })
  class SwcAppDialog extends SwcAppMixin(HTMLDialogElement) {}

  @elementDefine('swc-app-div', { extends: 'div', window: w })
  class SwcAppDiv extends SwcAppMixin(HTMLDivElement) {}

  @elementDefine('swc-app-dl', { extends: 'dl', window: w })
  class SwcAppDList extends SwcAppMixin(HTMLDListElement) {}

  @elementDefine('swc-app-embed', { extends: 'embed', window: w })
  class SwcAppEmbed extends SwcAppMixin(HTMLEmbedElement) {}

  @elementDefine('swc-app-fieldset', { extends: 'fieldset', window: w })
  class SwcAppFieldSet extends SwcAppMixin(HTMLFieldSetElement) {}

  @elementDefine('swc-app-form', { extends: 'form', window: w })
  class SwcAppForm extends SwcAppMixin(HTMLFormElement) {}

  @elementDefine('swc-app-hr', { extends: 'hr', window: w })
  class SwcAppHR extends SwcAppMixin(HTMLHRElement) {}

  @elementDefine('swc-app-iframe', { extends: 'iframe', window: w })
  class SwcAppIFrame extends SwcAppMixin(HTMLIFrameElement) {}

  @elementDefine('swc-app-img', { extends: 'img', window: w })
  class SwcAppImage extends SwcAppMixin(HTMLImageElement) {}

  @elementDefine('swc-app-input', { extends: 'input', window: w })
  class SwcAppInput extends SwcAppMixin(HTMLInputElement) {}

  @elementDefine('swc-app-label', { extends: 'label', window: w })
  class SwcAppLabel extends SwcAppMixin(HTMLLabelElement) {}

  @elementDefine('swc-app-legend', { extends: 'legend', window: w })
  class SwcAppLegend extends SwcAppMixin(HTMLLegendElement) {}

  @elementDefine('swc-app-li', { extends: 'li', window: w })
  class SwcAppLI extends SwcAppMixin(HTMLLIElement) {}

  @elementDefine('swc-app-link', { extends: 'link', window: w })
  class SwcAppLink extends SwcAppMixin(HTMLLinkElement) {}

  @elementDefine('swc-app-map', { extends: 'map', window: w })
  class SwcAppMap extends SwcAppMixin(HTMLMapElement) {}

  @elementDefine('swc-app-meta', { extends: 'meta', window: w })
  class SwcAppMeta extends SwcAppMixin(HTMLMetaElement) {}

  @elementDefine('swc-app-meter', { extends: 'meter', window: w })
  class SwcAppMeter extends SwcAppMixin(HTMLMeterElement) {}

  @elementDefine('swc-app-del', { extends: 'del', window: w })
  class SwcAppMod extends SwcAppMixin(HTMLModElement) {}

  @elementDefine('swc-app-object', { extends: 'object', window: w })
  class SwcAppObject extends SwcAppMixin(HTMLObjectElement) {}

  @elementDefine('swc-app-ol', { extends: 'ol', window: w })
  class SwcAppOList extends SwcAppMixin(HTMLOListElement) {}

  @elementDefine('swc-app-optgroup', { extends: 'optgroup', window: w })
  class SwcAppOptGroup extends SwcAppMixin(HTMLOptGroupElement) {}

  @elementDefine('swc-app-option', { extends: 'option', window: w })
  class SwcAppOption extends SwcAppMixin(HTMLOptionElement) {}

  @elementDefine('swc-app-output', { extends: 'output', window: w })
  class SwcAppOutput extends SwcAppMixin(HTMLOutputElement) {}

  @elementDefine('swc-app-p', { extends: 'p', window: w })
  class SwcAppParagraph extends SwcAppMixin(HTMLParagraphElement) {}

  @elementDefine('swc-app-param', { extends: 'param', window: w })
  class SwcAppParam extends SwcAppMixin(HTMLParamElement) {}

  @elementDefine('swc-app-picture', { extends: 'picture', window: w })
  class SwcAppPicture extends SwcAppMixin(HTMLPictureElement) {}

  @elementDefine('swc-app-pre', { extends: 'pre', window: w })
  class SwcAppPre extends SwcAppMixin(HTMLPreElement) {}

  @elementDefine('swc-app-progress', { extends: 'progress', window: w })
  class SwcAppProgress extends SwcAppMixin(HTMLProgressElement) {}

  @elementDefine('swc-app-blockquote', { extends: 'blockquote', window: w })
  class SwcAppQuote extends SwcAppMixin(HTMLQuoteElement) {}

  @elementDefine('swc-app-script', { extends: 'script', window: w })
  class SwcAppScript extends SwcAppMixin(HTMLScriptElement) {}

  @elementDefine('swc-app-select', { extends: 'select', window: w })
  class SwcAppSelect extends SwcAppMixin(HTMLSelectElement) {}

  @elementDefine('swc-app-slot', { extends: 'slot', window: w })
  class SwcAppSlot extends SwcAppMixin(HTMLSlotElement) {}

  @elementDefine('swc-app-source', { extends: 'source', window: w })
  class SwcAppSource extends SwcAppMixin(HTMLSourceElement) {}

  @elementDefine('swc-app-span', { extends: 'span', window: w })
  class SwcAppSpan extends SwcAppMixin(HTMLSpanElement) {}

  @elementDefine('swc-app-style', { extends: 'style', window: w })
  class SwcAppStyle extends SwcAppMixin(HTMLStyleElement) {}

  @elementDefine('swc-app-table', { extends: 'table', window: w })
  class SwcAppTable extends SwcAppMixin(HTMLTableElement) {}

  @elementDefine('swc-app-tbody', { extends: 'tbody', window: w })
  class SwcAppTableSection extends SwcAppMixin(HTMLTableSectionElement) {}

  @elementDefine('swc-app-td', { extends: 'td', window: w })
  class SwcAppTableCell extends SwcAppMixin(HTMLTableCellElement) {}

  @elementDefine('swc-app-template', { extends: 'template', window: w })
  class SwcAppTemplate extends SwcAppMixin(HTMLTemplateElement) {}

  @elementDefine('swc-app-textarea', { extends: 'textarea', window: w })
  class SwcAppTextArea extends SwcAppMixin(HTMLTextAreaElement) {}

  @elementDefine('swc-app-time', { extends: 'time', window: w })
  class SwcAppTime extends SwcAppMixin(HTMLTimeElement) {}

  @elementDefine('swc-app-title', { extends: 'title', window: w })
  class SwcAppTitle extends SwcAppMixin(HTMLTitleElement) {}

  @elementDefine('swc-app-tr', { extends: 'tr', window: w })
  class SwcAppTableRow extends SwcAppMixin(HTMLTableRowElement) {}

  @elementDefine('swc-app-track', { extends: 'track', window: w })
  class SwcAppTrack extends SwcAppMixin(HTMLTrackElement) {}

  @elementDefine('swc-app-ul', { extends: 'ul', window: w })
  class SwcAppUList extends SwcAppMixin(HTMLUListElement) {}

  @elementDefine('swc-app-video', { extends: 'video', window: w })
  class SwcAppVideo extends SwcAppMixin(HTMLVideoElement) {}

  @elementDefine('swc-app-h1', { extends: 'h1', window: w })
  class SwcAppHeading extends SwcAppMixin(HTMLHeadingElement) {}

  @elementDefine('swc-app-body', { extends: 'body', window: w })
  class SwcAppBody extends SwcAppMixin(HTMLBodyElement) {}

};
