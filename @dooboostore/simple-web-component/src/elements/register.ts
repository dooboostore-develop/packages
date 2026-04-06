import { getElementConfig, elementDefine, attributeHost, changedAttributeHost, getAttributeValue } from '../decorators';
import { SwcAppMixin } from './SwcAppMixin';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils,ActionExpression } from '@dooboostore/core';
import { ConvertUtils } from '@dooboostore/core-web';

type Constructor<T> = new (...args: any[]) => T;

export const registerAllElements = (w: any): Record<string, Constructor<HTMLElement>> => {
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
  @attributeHost('value')
  _value: any;

  @attributeHost('replace-wrap')
  _replaceWrap: string | null;

  private _nodes: Node[] = [];

  get value(): boolean {
    return this._value;
  }

  set value(nv: any) {
    // this._value = nv;
    this.refresh(nv);
  }

  private replaceExpressions(html: string, groupArgs: any, context: any, wrap?: string | null): string {
    const config = wrap ? { wrapExpression: wrap } : undefined;
    const ae = new ActionExpression(html, config);
    const filterOptions = wrap ? { type: 'replace' as const, wrap } : 'replace';
    const win = this.ownerDocument?.defaultView || window;
    
    // @ts-ignore
    for (const expr of ae.getExpressions(filterOptions)) {
      try {
        const value = FunctionUtils.executeReturn({
          script: ConvertUtils.decodeHtmlEntity(expr.script, win.document),
          context,
          args: groupArgs
        });
        ae.replace(expr, String(value));
      } catch (e) {
        console.error(`[SWC] Failed to execute ${expr.original}:`, e);
      }
    }
    return ae.getUnprocessedTemplate();
  }

  @changedAttributeHost('value')
  private setValue(valueAttr?: string | null) {
    this.refresh();
  }

  @changedAttributeHost('replace-wrap')
  private setReplaceWrap(replaceWrapAttr?: string | null) {
    this.refresh();
  }

  refresh(value = this._value) {
    this.cleanup();
    const portal = this.parentElement;
    if (!portal || !value) return;

    const win = this.ownerDocument?.defaultView || window;
    const helperSet = SwcUtils.getHelperAndHostSet(win, this);

    let htmlString = this.innerHTML;
    const groupArgs = { ...helperSet, $value: value };

    htmlString = this.replaceExpressions(htmlString, groupArgs, this, this._replaceWrap);

    const result = this.ownerDocument?.createElement('template') || document.createElement('template');
    result.innerHTML = htmlString;
    const processedFragment = result.content;

    this._nodes = Array.from(processedFragment.childNodes);
    portal.insertBefore(processedFragment, this.nextSibling);
  }

  private cleanup() {
    this._nodes.forEach(n => n.parentElement?.removeChild(n));
    this._nodes = [];
  }

  disconnectedCallback() {
    this.cleanup();
  }
  }

    @elementDefine('swc-loop', { extends: 'template', window: w })
  class SwcLoop extends HTMLTemplateElement {
  @attributeHost('value')
  _value: any[];

  @attributeHost('replace-wrap')
  _replaceWrap: string | null;

  private _nodeGroups: Node[][] = [];

  get value(): any[] {
    return this._value;
  }
  set value(nv: any[]) {
    // this._value = Array.isArray(nv) ? [...nv] : [];
    this.refresh(nv);
  }

  @changedAttributeHost('value')
  private setValue() {
    this.refresh();
  }

  @changedAttributeHost('replace-wrap')
  private setReplaceWrap() {
    this.refresh();
  }

  private replaceExpressions(html: string, groupArgs: any, context: any, wrap?: string | null): string {
    const config = wrap ? { wrapExpression: wrap } : undefined;
    const ae = new ActionExpression(html, config);
    const filterOptions = wrap ? { type: 'replace' as const, wrap } : 'replace';
    const win = this.ownerDocument?.defaultView || window;

    // @ts-ignore
    for (const expr of ae.getExpressions(filterOptions)) {
      try {
        const value = FunctionUtils.executeReturn({
          script: ConvertUtils.decodeHtmlEntity(expr.script, win.document),
          context,
          args: groupArgs
        });
        ae.replace(expr, String(value));
      } catch (e) {
        console.error(`[SWC] Failed to execute ${expr.original}:`, e);
      }
    }
    return ae.getUnprocessedTemplate();
  }

  refresh(value = this._value) {
    this.cleanup();
    if (value?.length<=0) return;
    const portal = this.parentElement;
    if (!portal) return;

    const win = this.ownerDocument?.defaultView || window;
    const helperSet = SwcUtils.getHelperAndHostSet(win, this);
    const fragment = win.document.createDocumentFragment();

    value.forEach((item, index) => {
      let htmlString = this.innerHTML;
      const groupArgs = { ...helperSet, $item: item, $index: index, $value: this._value };

      htmlString = this.replaceExpressions(htmlString, groupArgs, this, this._replaceWrap);

      const temp = this.ownerDocument?.createElement('template') || document.createElement('template');
      temp.innerHTML = htmlString;

      const content = temp.content;
      const nodes = Array.from(content.childNodes);
      this._nodeGroups.push(nodes);
      fragment.appendChild(content);
    });

    portal.insertBefore(fragment, this.nextSibling);
  }

  private cleanup() {
    this._nodeGroups.forEach(nodes => nodes.forEach(n => n.parentElement?.removeChild(n)));
    this._nodeGroups = [];
  }

  disconnectedCallback() {
    this.cleanup();
  }
  }

    @elementDefine('swc-choose', { extends: 'template', window: w })
  class SwcChoose extends HTMLTemplateElement {
  // @attributeHost('value')
  // fetchValue: any;

  _value: any;

  @attributeHost('replace-wrap')
  _replaceWrap: string | null;

  private _nodes: Node[] = [];
  private _previousTemplate: HTMLTemplateElement | null = null;

  get value(): any {
    return this._value;
  }

  set value(nv: any) {
    this._value = nv;
    this.refresh(this._value);
  }

  constructor() {
    super();
    console.log('swc chooooooooooooooooooooooooose constructor called!');
  }

  attributeChangedCallback(na,o,n){
    console.log('-----------------choooooooose attr origin', na,o,n);
  }

  @changedAttributeHost('value')
  private setValue(value: any, o: string, n: string) {
    console.log('-----------------choooooooose attr setValue', value, o, n);
    this._value = value;
    this.refresh(this._value);
  }

  @changedAttributeHost('replace-wrap')
  private setReplaceWrap(replaceWrapAttr?: string | null) {
    this.refresh();
  }

  private replaceExpressions(html: string, groupArgs: any, context: any, wrap?: string | null): string {
    const config = wrap ? { wrapExpression: wrap } : undefined;
    const ae = new ActionExpression(html, config);
    const filterOptions = wrap ? { type: 'replace' as const, wrap } : 'replace';
    const win = this.ownerDocument?.defaultView || window;

    // @ts-ignore
    for (const expr of ae.getExpressions(filterOptions)) {
      try {
        const value = FunctionUtils.executeReturn({
          script: ConvertUtils.decodeHtmlEntity(expr.script, win.document),
          context,
          args: groupArgs
        });
        ae.replace(expr, String(value));
      } catch (e) {
        console.error(`[SWC] Failed to execute ${expr.original}:`, e);
      }
    }
    return ae.getUnprocessedTemplate();
  }

  refresh(value?: any) {
    value = getAttributeValue(this,'value') ?? this._value;
    console.log('chooooooooo refresh->', value);
    const portal = this.parentElement;
    if (!portal) return;

    const win = (getElementConfig(this).window ?? this.ownerDocument?.defaultView) || window;
    const helperSet = SwcUtils.getHelperAndHostSet(win, this);
    const groupArgs = { ...helperSet, $value: value };

    const templates = Array.from(this.content.querySelectorAll('template'));
    let selected: HTMLTemplateElement | null = null;

    for (const t of templates) {
      if (t.getAttribute('is') === 'swc-when') {
        const attrVal = t.getAttribute('value') || '';
        let matches = false;

        // Use ActionExpression to parse and extract script from value attribute
        const ae = new ActionExpression(attrVal);
        const expr = ae.getFirstExpression('replace');

        if (expr) {
          const decodedScript = ConvertUtils.decodeHtmlEntity(expr.script, win.document);
          const result = FunctionUtils.executeReturn({
            script: decodedScript,
            context: t,
            args: groupArgs
          });
          matches = !!result;
        } else {
          matches = String(attrVal) === String(value);
        }

        if (matches) {
          selected = t;
          break;
        }
      }
    }

    const target = selected || (this.content.querySelector('template[is="swc-otherwise"]') as HTMLTemplateElement);

    const skipValue = target?.getAttribute?.('skip-if-same');
    const skipValue2 = this._previousTemplate?.getAttribute?.('skip-if-same');
    const hasSkipIfSame = target?.hasAttribute?.('skip-if-same');
    const isSame = this._previousTemplate === target;
    // console.log('---rrrr---', this._previousTemplate, target, hasSkipIfSame, isSame, skipValue, skipValue2);
    if (hasSkipIfSame && isSame) {
      return;
    }

    this.cleanup();
    this._previousTemplate = target;

    if (target) {
      let htmlString = target.innerHTML;
      htmlString = this.replaceExpressions(htmlString, groupArgs, this, this._replaceWrap);

      const result = this.ownerDocument?.createElement('template') || document.createElement('template');
      result.innerHTML = htmlString;
      const processedFragment = result.content;

      this._nodes = Array.from(processedFragment.childNodes);
      portal.insertBefore(processedFragment, this.nextSibling);
    }
  }

  private cleanup() {
    this._nodes.forEach(n => n.parentElement?.removeChild(n));
    this._nodes = [];
  }

  disconnectedCallback() {
    this.cleanup();
  }
  }

    @elementDefine('swc-async', { extends: 'template', window: w })
  class SwcAsync extends HTMLTemplateElement {
  @attributeHost('value')
  _value: any;

  @attributeHost('replace-wrap')
  _replaceWrap: string | null;

  resultValue?: any;

  get value(): boolean {
    return this._value;
  }

  set value(nv: any) {
    this.executeAsync(nv);
  }

  private _nodes: Node[] = [];

  @changedAttributeHost('value')
  private setValue(valueAttr?: string | null) {
    this.executeAsync(this._value);
  }

  @changedAttributeHost('replace-wrap')
  private setReplaceWrap() {
    this.executeAsync(this._value);
  }

  private executeAsync(result: any = this._value) {
    if (result === undefined || result === null) {
      this.refresh('default');
      return;
    }

    if (result instanceof Promise) {
      this.refresh('loading');
      result
        .then(v => {
          this.resultValue = v;
          this.refresh('success');
        })
        .catch(e => {
          console.error('[SWC-ASYNC] Promise rejected:', e);
          this.resultValue = e;
          this.refresh('error');
        });
    } else {
      this.resultValue = result;
      this.refresh('success');
    }
  }

  private replaceExpressions(html: string, groupArgs: any, context: any, wrap?: string | null): string {
    const config = wrap ? { wrapExpression: wrap } : undefined;
    const ae = new ActionExpression(html, config);
    const filterOptions = wrap ? { type: 'replace' as const, wrap } : 'replace';
    const win = this.ownerDocument?.defaultView || window;

    // @ts-ignore
    for (const expr of ae.getExpressions(filterOptions)) {
      try {
        const value = FunctionUtils.executeReturn({
          script: ConvertUtils.decodeHtmlEntity(expr.script, win.document),
          context,
          args: groupArgs
        });
        ae.replace(expr, String(value));
      } catch (e) {
        console.error(`[SWC] Failed to execute ${expr.original}:`, e);
      }
    }
    return ae.getUnprocessedTemplate();
  }

  refresh(state: string = 'default') {
    console.log('rrrrrrrrrrrrrrrrr', state);
    this.cleanup();
    const portal = this.parentElement;
    if (!portal) return;

    const win = this.ownerDocument?.defaultView || window;
    const helperSet = SwcUtils.getHelperAndHostSet(win, this);

    const t = this.content.querySelector(`template[is="swc-${state}"]`) as HTMLTemplateElement;
    if (t) {
      let htmlString = t.innerHTML;
      const groupArgs = { ...helperSet, $value: this._value, $state: state };

      htmlString = this.replaceExpressions(htmlString, groupArgs, this, this._replaceWrap);

      const temp = this.ownerDocument?.createElement('template') || document.createElement('template');
      temp.innerHTML = htmlString;
      const content = temp.content;

      this._nodes = Array.from(content.childNodes);
      portal.insertBefore(content, this.nextSibling);
    }
  }

  private cleanup() {
    this._nodes.forEach(n => n.parentElement?.removeChild(n));
    this._nodes = [];
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


  return {
    // Sub Templates
    SwcLoading,
    SwcError,
    SwcSuccess,
    SwcWhen,
    SwcOtherwise,
    SwcDefault,
    // Core Elements
    SwcApp,
    SwcIf,
    SwcLoop,
    SwcChoose,
    SwcAsync,
    // App Elements
    SwcAppAnchor,
    SwcAppArea,
    SwcAppAudio,
    SwcAppBase,
    SwcAppButton,
    SwcAppCanvas,
    SwcAppData,
    SwcAppDataList,
    SwcAppDetails,
    SwcAppDialog,
    SwcAppDiv,
    SwcAppDList,
    SwcAppEmbed,
    SwcAppFieldSet,
    SwcAppForm,
    SwcAppHR,
    SwcAppIFrame,
    SwcAppImage,
    SwcAppInput,
    SwcAppLabel,
    SwcAppLegend,
    SwcAppLI,
    SwcAppLink,
    SwcAppMap,
    SwcAppMeta,
    SwcAppMeter,
    SwcAppMod,
    SwcAppObject,
    SwcAppOList,
    SwcAppOptGroup,
    SwcAppOption,
    SwcAppOutput,
    SwcAppParagraph,
    SwcAppParam,
    SwcAppPicture,
    SwcAppPre,
    SwcAppProgress,
    SwcAppQuote,
    SwcAppScript,
    SwcAppSelect,
    SwcAppSlot,
    SwcAppSource,
    SwcAppSpan,
    SwcAppStyle,
    SwcAppTable,
    SwcAppTableSection,
    SwcAppTableCell,
    SwcAppTemplate,
    SwcAppTextArea,
    SwcAppTime,
    SwcAppTitle,
    SwcAppTableRow,
    SwcAppTrack,
    SwcAppUList,
    SwcAppVideo,
    SwcAppHeading,
    SwcAppBody,
  };
};
