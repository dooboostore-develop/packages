// import { getElementConfig, elementDefine, attributeThis, changedAttributeThis, getAttributeValue } from '../../decorators';
// import { SwcAppMixin } from './SwcAppMixin';
// import { SwcUtils } from '../../utils/Utils';
// import { FunctionUtils,ActionExpression } from '@dooboostore/core';
// import { ConvertUtils } from '@dooboostore/core-web';
//
// type Constructor<T> = new (...args: any[]) => T;
//
// const getBaseClass = (w: Window, name: string) => {
//   const _cls = (w as any)[name];
//   return _cls as typeof globalThis[keyof typeof globalThis];
// }
//
// const extractBaseClasses = (w: Window) => {
//   return {
//     HTMLElement: getBaseClass(w, 'HTMLElement') as typeof globalThis.HTMLElement,
//     HTMLTemplateElement: getBaseClass(w, 'HTMLTemplateElement') as typeof globalThis.HTMLTemplateElement,
//     Node: getBaseClass(w, 'Node') as typeof globalThis.Node,
//     Element: getBaseClass(w, 'Element') as typeof globalThis.Element,
//     DocumentFragment: getBaseClass(w, 'DocumentFragment') as typeof globalThis.DocumentFragment,
//   };
// }
//
//
//
// // --- "is" Elements ---
// export const registerSwcAppAnchor = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-a';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLAnchorElement = getBaseClass(w, 'HTMLAnchorElement') as typeof globalThis.HTMLAnchorElement;
//   @elementDefine(tagName, { extends: 'a', window: w })
//   class SwcAppAnchor extends SwcAppMixin(HTMLAnchorElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppArea = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-area';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLAreaElement = getBaseClass(w, 'HTMLAreaElement') as typeof globalThis.HTMLAreaElement;
//   @elementDefine(tagName, { extends: 'area', window: w })
//   class SwcAppArea extends SwcAppMixin(HTMLAreaElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppAudio = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-audio';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLAudioElement = getBaseClass(w, 'HTMLAudioElement') as typeof globalThis.HTMLAudioElement;
//   @elementDefine(tagName, { extends: 'audio', window: w })
//   class SwcAppAudio extends SwcAppMixin(HTMLAudioElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppBase = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-base';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLBaseElement = getBaseClass(w, 'HTMLBaseElement') as typeof globalThis.HTMLBaseElement;
//   @elementDefine(tagName, { extends: 'base', window: w })
//   class SwcAppBase extends SwcAppMixin(HTMLBaseElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppButton = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-button';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLButtonElement = getBaseClass(w, 'HTMLButtonElement') as typeof globalThis.HTMLButtonElement;
//   @elementDefine(tagName, { extends: 'button', window: w })
//   class SwcAppButton extends SwcAppMixin(HTMLButtonElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppCanvas = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-canvas';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLCanvasElement = getBaseClass(w, 'HTMLCanvasElement') as typeof globalThis.HTMLCanvasElement;
//   @elementDefine(tagName, { extends: 'canvas', window: w })
//   class SwcAppCanvas extends SwcAppMixin(HTMLCanvasElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppData = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-data';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLDataElement = getBaseClass(w, 'HTMLDataElement') as typeof globalThis.HTMLDataElement;
//   @elementDefine(tagName, { extends: 'data', window: w })
//   class SwcAppData extends SwcAppMixin(HTMLDataElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppDataList = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-datalist';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLDataListElement = getBaseClass(w, 'HTMLDataListElement') as typeof globalThis.HTMLDataListElement;
//   @elementDefine(tagName, { extends: 'datalist', window: w })
//   class SwcAppDataList extends SwcAppMixin(HTMLDataListElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppDetails = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-details';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLDetailsElement = getBaseClass(w, 'HTMLDetailsElement') as typeof globalThis.HTMLDetailsElement;
//   @elementDefine(tagName, { extends: 'details', window: w })
//   class SwcAppDetails extends SwcAppMixin(HTMLDetailsElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppDialog = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-dialog';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLDialogElement = getBaseClass(w, 'HTMLDialogElement') as typeof globalThis.HTMLDialogElement;
//   @elementDefine(tagName, { extends: 'dialog', window: w })
//   class SwcAppDialog extends SwcAppMixin(HTMLDialogElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppDiv = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-div';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLDivElement = getBaseClass(w, 'HTMLDivElement') as typeof globalThis.HTMLDivElement;
//   @elementDefine(tagName, { extends: 'div', window: w })
//   class SwcAppDiv extends SwcAppMixin(HTMLDivElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppDList = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-dl';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLDListElement = getBaseClass(w, 'HTMLDListElement') as typeof globalThis.HTMLDListElement;
//   @elementDefine(tagName, { extends: 'dl', window: w })
//   class SwcAppDList extends SwcAppMixin(HTMLDListElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppEmbed = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-embed';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLEmbedElement = getBaseClass(w, 'HTMLEmbedElement') as typeof globalThis.HTMLEmbedElement;
//   @elementDefine(tagName, { extends: 'embed', window: w })
//   class SwcAppEmbed extends SwcAppMixin(HTMLEmbedElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppFieldSet = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-fieldset';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLFieldSetElement = getBaseClass(w, 'HTMLFieldSetElement') as typeof globalThis.HTMLFieldSetElement;
//   @elementDefine(tagName, { extends: 'fieldset', window: w })
//   class SwcAppFieldSet extends SwcAppMixin(HTMLFieldSetElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppForm = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-form';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLFormElement = getBaseClass(w, 'HTMLFormElement') as typeof globalThis.HTMLFormElement;
//   @elementDefine(tagName, { extends: 'form', window: w })
//   class SwcAppForm extends SwcAppMixin(HTMLFormElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppHR = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-hr';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLHRElement = getBaseClass(w, 'HTMLHRElement') as typeof globalThis.HTMLHRElement;
//   @elementDefine(tagName, { extends: 'hr', window: w })
//   class SwcAppHR extends SwcAppMixin(HTMLHRElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppIFrame = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-iframe';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLIFrameElement = getBaseClass(w, 'HTMLIFrameElement') as typeof globalThis.HTMLIFrameElement;
//   @elementDefine(tagName, { extends: 'iframe', window: w })
//   class SwcAppIFrame extends SwcAppMixin(HTMLIFrameElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppImage = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-img';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLImageElement = getBaseClass(w, 'HTMLImageElement') as typeof globalThis.HTMLImageElement;
//   @elementDefine(tagName, { extends: 'img', window: w })
//   class SwcAppImage extends SwcAppMixin(HTMLImageElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppInput = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-input';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLInputElement = getBaseClass(w, 'HTMLInputElement') as typeof globalThis.HTMLInputElement;
//   @elementDefine(tagName, { extends: 'input', window: w })
//   class SwcAppInput extends SwcAppMixin(HTMLInputElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppLabel = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-label';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLLabelElement = getBaseClass(w, 'HTMLLabelElement') as typeof globalThis.HTMLLabelElement;
//   @elementDefine(tagName, { extends: 'label', window: w })
//   class SwcAppLabel extends SwcAppMixin(HTMLLabelElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppLegend = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-legend';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLLegendElement = getBaseClass(w, 'HTMLLegendElement') as typeof globalThis.HTMLLegendElement;
//   @elementDefine(tagName, { extends: 'legend', window: w })
//   class SwcAppLegend extends SwcAppMixin(HTMLLegendElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppLI = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-li';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLLIElement = getBaseClass(w, 'HTMLLIElement') as typeof globalThis.HTMLLIElement;
//   @elementDefine(tagName, { extends: 'li', window: w })
//   class SwcAppLI extends SwcAppMixin(HTMLLIElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppLink = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-link';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLLinkElement = getBaseClass(w, 'HTMLLinkElement') as typeof globalThis.HTMLLinkElement;
//   @elementDefine(tagName, { extends: 'link', window: w })
//   class SwcAppLink extends SwcAppMixin(HTMLLinkElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppMap = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-map';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLMapElement = getBaseClass(w, 'HTMLMapElement') as typeof globalThis.HTMLMapElement;
//   @elementDefine(tagName, { extends: 'map', window: w })
//   class SwcAppMap extends SwcAppMixin(HTMLMapElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppMeta = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-meta';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLMetaElement = getBaseClass(w, 'HTMLMetaElement') as typeof globalThis.HTMLMetaElement;
//   @elementDefine(tagName, { extends: 'meta', window: w })
//   class SwcAppMeta extends SwcAppMixin(HTMLMetaElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppMeter = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-meter';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLMeterElement = getBaseClass(w, 'HTMLMeterElement') as typeof globalThis.HTMLMeterElement;
//   @elementDefine(tagName, { extends: 'meter', window: w })
//   class SwcAppMeter extends SwcAppMixin(HTMLMeterElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppMod = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-del';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLModElement = getBaseClass(w, 'HTMLModElement') as typeof globalThis.HTMLModElement;
//   @elementDefine(tagName, { extends: 'del', window: w })
//   class SwcAppMod extends SwcAppMixin(HTMLModElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppObject = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-object';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLObjectElement = getBaseClass(w, 'HTMLObjectElement') as typeof globalThis.HTMLObjectElement;
//   @elementDefine(tagName, { extends: 'object', window: w })
//   class SwcAppObject extends SwcAppMixin(HTMLObjectElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppOList = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-ol';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLOListElement = getBaseClass(w, 'HTMLOListElement') as typeof globalThis.HTMLOListElement;
//   @elementDefine(tagName, { extends: 'ol', window: w })
//   class SwcAppOList extends SwcAppMixin(HTMLOListElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppOptGroup = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-optgroup';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLOptGroupElement = getBaseClass(w, 'HTMLOptGroupElement') as typeof globalThis.HTMLOptGroupElement;
//   @elementDefine(tagName, { extends: 'optgroup', window: w })
//   class SwcAppOptGroup extends SwcAppMixin(HTMLOptGroupElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppOption = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-option';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLOptionElement = getBaseClass(w, 'HTMLOptionElement') as typeof globalThis.HTMLOptionElement;
//   @elementDefine(tagName, { extends: 'option', window: w })
//   class SwcAppOption extends SwcAppMixin(HTMLOptionElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppOutput = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-output';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLOutputElement = getBaseClass(w, 'HTMLOutputElement') as typeof globalThis.HTMLOutputElement;
//   @elementDefine(tagName, { extends: 'output', window: w })
//   class SwcAppOutput extends SwcAppMixin(HTMLOutputElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppParagraph = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-p';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLParagraphElement = getBaseClass(w, 'HTMLParagraphElement') as typeof globalThis.HTMLParagraphElement;
//   @elementDefine(tagName, { extends: 'p', window: w })
//   class SwcAppParagraph extends SwcAppMixin(HTMLParagraphElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppParam = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-param';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLParamElement = getBaseClass(w, 'HTMLParamElement') as typeof globalThis.HTMLParamElement;
//   @elementDefine(tagName, { extends: 'param', window: w })
//   class SwcAppParam extends SwcAppMixin(HTMLParamElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppPicture = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-picture';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLPictureElement = getBaseClass(w, 'HTMLPictureElement') as typeof globalThis.HTMLPictureElement;
//   @elementDefine(tagName, { extends: 'picture', window: w })
//   class SwcAppPicture extends SwcAppMixin(HTMLPictureElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppPre = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-pre';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLPreElement = getBaseClass(w, 'HTMLPreElement') as typeof globalThis.HTMLPreElement;
//   @elementDefine(tagName, { extends: 'pre', window: w })
//   class SwcAppPre extends SwcAppMixin(HTMLPreElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppProgress = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-progress';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLProgressElement = getBaseClass(w, 'HTMLProgressElement') as typeof globalThis.HTMLProgressElement;
//   @elementDefine(tagName, { extends: 'progress', window: w })
//   class SwcAppProgress extends SwcAppMixin(HTMLProgressElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppQuote = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-blockquote';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLQuoteElement = getBaseClass(w, 'HTMLQuoteElement') as typeof globalThis.HTMLQuoteElement;
//   @elementDefine(tagName, { extends: 'blockquote', window: w })
//   class SwcAppQuote extends SwcAppMixin(HTMLQuoteElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppScript = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-script';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLScriptElement = getBaseClass(w, 'HTMLScriptElement') as typeof globalThis.HTMLScriptElement;
//   @elementDefine(tagName, { extends: 'script', window: w })
//   class SwcAppScript extends SwcAppMixin(HTMLScriptElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppSelect = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-select';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLSelectElement = getBaseClass(w, 'HTMLSelectElement') as typeof globalThis.HTMLSelectElement;
//   @elementDefine(tagName, { extends: 'select', window: w })
//   class SwcAppSelect extends SwcAppMixin(HTMLSelectElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppSlot = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-slot';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLSlotElement = getBaseClass(w, 'HTMLSlotElement') as typeof globalThis.HTMLSlotElement;
//   @elementDefine(tagName, { extends: 'slot', window: w })
//   class SwcAppSlot extends SwcAppMixin(HTMLSlotElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppSource = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-source';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLSourceElement = getBaseClass(w, 'HTMLSourceElement') as typeof globalThis.HTMLSourceElement;
//   @elementDefine(tagName, { extends: 'source', window: w })
//   class SwcAppSource extends SwcAppMixin(HTMLSourceElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppSpan = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-span';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLSpanElement = getBaseClass(w, 'HTMLSpanElement') as typeof globalThis.HTMLSpanElement;
//   @elementDefine(tagName, { extends: 'span', window: w })
//   class SwcAppSpan extends SwcAppMixin(HTMLSpanElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppStyle = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-style';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLStyleElement = getBaseClass(w, 'HTMLStyleElement') as typeof globalThis.HTMLStyleElement;
//   @elementDefine(tagName, { extends: 'style', window: w })
//   class SwcAppStyle extends SwcAppMixin(HTMLStyleElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppTable = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-table';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLTableElement = getBaseClass(w, 'HTMLTableElement') as typeof globalThis.HTMLTableElement;
//   @elementDefine(tagName, { extends: 'table', window: w })
//   class SwcAppTable extends SwcAppMixin(HTMLTableElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppTableSection = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-tbody';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLTableSectionElement = getBaseClass(w, 'HTMLTableSectionElement') as typeof globalThis.HTMLTableSectionElement;
//   @elementDefine(tagName, { extends: 'tbody', window: w })
//   class SwcAppTableSection extends SwcAppMixin(HTMLTableSectionElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppTableCell = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-td';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLTableCellElement = getBaseClass(w, 'HTMLTableCellElement') as typeof globalThis.HTMLTableCellElement;
//   @elementDefine(tagName, { extends: 'td', window: w })
//   class SwcAppTableCell extends SwcAppMixin(HTMLTableCellElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppTemplate = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-template';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLTemplateElement = getBaseClass(w, 'HTMLTemplateElement') as typeof globalThis.HTMLTemplateElement;
//   @elementDefine(tagName, { extends: 'template', window: w })
//   class SwcAppTemplate extends SwcAppMixin(HTMLTemplateElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppTextArea = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-textarea';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLTextAreaElement = getBaseClass(w, 'HTMLTextAreaElement') as typeof globalThis.HTMLTextAreaElement;
//   @elementDefine(tagName, { extends: 'textarea', window: w })
//   class SwcAppTextArea extends SwcAppMixin(HTMLTextAreaElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppTime = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-time';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLTimeElement = getBaseClass(w, 'HTMLTimeElement') as typeof globalThis.HTMLTimeElement;
//   @elementDefine(tagName, { extends: 'time', window: w })
//   class SwcAppTime extends SwcAppMixin(HTMLTimeElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppTitle = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-title';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLTitleElement = getBaseClass(w, 'HTMLTitleElement') as typeof globalThis.HTMLTitleElement;
//   @elementDefine(tagName, { extends: 'title', window: w })
//   class SwcAppTitle extends SwcAppMixin(HTMLTitleElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppTableRow = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-tr';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLTableRowElement = getBaseClass(w, 'HTMLTableRowElement') as typeof globalThis.HTMLTableRowElement;
//   @elementDefine(tagName, { extends: 'tr', window: w })
//   class SwcAppTableRow extends SwcAppMixin(HTMLTableRowElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppTrack = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-track';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLTrackElement = getBaseClass(w, 'HTMLTrackElement') as typeof globalThis.HTMLTrackElement;
//   @elementDefine(tagName, { extends: 'track', window: w })
//   class SwcAppTrack extends SwcAppMixin(HTMLTrackElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppUList = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-ul';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLUListElement = getBaseClass(w, 'HTMLUListElement') as typeof globalThis.HTMLUListElement;
//   @elementDefine(tagName, { extends: 'ul', window: w })
//   class SwcAppUList extends SwcAppMixin(HTMLUListElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppVideo = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-video';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLVideoElement = getBaseClass(w, 'HTMLVideoElement') as typeof globalThis.HTMLVideoElement;
//   @elementDefine(tagName, { extends: 'video', window: w })
//   class SwcAppVideo extends SwcAppMixin(HTMLVideoElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppHeading = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-h1';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLHeadingElement = getBaseClass(w, 'HTMLHeadingElement') as typeof globalThis.HTMLHeadingElement;
//   @elementDefine(tagName, { extends: 'h1', window: w })
//   class SwcAppHeading extends SwcAppMixin(HTMLHeadingElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
// export const registerSwcAppBody = async (w: Window): Promise<CustomElementConstructor> => {
//   const tagName = 'swc-app-body';
//   const existing = w.customElements.get(tagName);
//   if (existing) return existing;
//   const { SwcAppMixin: _SwcAppMixin } = { SwcAppMixin };
//   const HTMLBodyElement = getBaseClass(w, 'HTMLBodyElement') as typeof globalThis.HTMLBodyElement;
//   @elementDefine(tagName, { extends: 'body', window: w })
//   class SwcAppBody extends SwcAppMixin(HTMLBodyElement) {}
//   return await w.customElements.whenDefined(tagName);
// };
//
//
// export const registerAllElements = async (w: Window): Promise<Record<string, CustomElementConstructor>> => {
//   return {
//     SwcApp: await registerSwcApp(w),
//     SwcIf: await registerSwcIf(w),
//     SwcLoop: await registerSwcLoop(w),
//     SwcChoose: await registerSwcChoose(w),
//     SwcAsync: await registerSwcAsync(w),
//     SwcAppAnchor: await registerSwcAppAnchor(w),
//     SwcAppArea: await registerSwcAppArea(w),
//     SwcAppAudio: await registerSwcAppAudio(w),
//     SwcAppBase: await registerSwcAppBase(w),
//     SwcAppButton: await registerSwcAppButton(w),
//     SwcAppCanvas: await registerSwcAppCanvas(w),
//     SwcAppData: await registerSwcAppData(w),
//     SwcAppDataList: await registerSwcAppDataList(w),
//     SwcAppDetails: await registerSwcAppDetails(w),
//     SwcAppDialog: await registerSwcAppDialog(w),
//     SwcAppDiv: await registerSwcAppDiv(w),
//     SwcAppDList: await registerSwcAppDList(w),
//     SwcAppEmbed: await registerSwcAppEmbed(w),
//     SwcAppFieldSet: await registerSwcAppFieldSet(w),
//     SwcAppForm: await registerSwcAppForm(w),
//     SwcAppHR: await registerSwcAppHR(w),
//     SwcAppIFrame: await registerSwcAppIFrame(w),
//     SwcAppImage: await registerSwcAppImage(w),
//     SwcAppInput: await registerSwcAppInput(w),
//     SwcAppLabel: await registerSwcAppLabel(w),
//     SwcAppLegend: await registerSwcAppLegend(w),
//     SwcAppLI: await registerSwcAppLI(w),
//     SwcAppLink: await registerSwcAppLink(w),
//     SwcAppMap: await registerSwcAppMap(w),
//     SwcAppMeta: await registerSwcAppMeta(w),
//     SwcAppMeter: await registerSwcAppMeter(w),
//     SwcAppMod: await registerSwcAppMod(w),
//     SwcAppObject: await registerSwcAppObject(w),
//     SwcAppOList: await registerSwcAppOList(w),
//     SwcAppOptGroup: await registerSwcAppOptGroup(w),
//     SwcAppOption: await registerSwcAppOption(w),
//     SwcAppOutput: await registerSwcAppOutput(w),
//     SwcAppParagraph: await registerSwcAppParagraph(w),
//     SwcAppParam: await registerSwcAppParam(w),
//     SwcAppPicture: await registerSwcAppPicture(w),
//     SwcAppPre: await registerSwcAppPre(w),
//     SwcAppProgress: await registerSwcAppProgress(w),
//     SwcAppQuote: await registerSwcAppQuote(w),
//     SwcAppScript: await registerSwcAppScript(w),
//     SwcAppSelect: await registerSwcAppSelect(w),
//     SwcAppSlot: await registerSwcAppSlot(w),
//     SwcAppSource: await registerSwcAppSource(w),
//     SwcAppSpan: await registerSwcAppSpan(w),
//     SwcAppStyle: await registerSwcAppStyle(w),
//     SwcAppTable: await registerSwcAppTable(w),
//     SwcAppTableSection: await registerSwcAppTableSection(w),
//     SwcAppTableCell: await registerSwcAppTableCell(w),
//     SwcAppTemplate: await registerSwcAppTemplate(w),
//     SwcAppTextArea: await registerSwcAppTextArea(w),
//     SwcAppTime: await registerSwcAppTime(w),
//     SwcAppTitle: await registerSwcAppTitle(w),
//     SwcAppTableRow: await registerSwcAppTableRow(w),
//     SwcAppTrack: await registerSwcAppTrack(w),
//     SwcAppUList: await registerSwcAppUList(w),
//     SwcAppVideo: await registerSwcAppVideo(w),
//     SwcAppHeading: await registerSwcAppHeading(w),
//     SwcAppBody: await registerSwcAppBody(w),
//   };
// };
