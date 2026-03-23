import fs from 'fs';
import path from 'path';

const elements = [
  ['HTMLAnchorElement', 'a'],
  ['HTMLAreaElement', 'area'],
  ['HTMLAudioElement', 'audio'],
  ['HTMLBaseElement', 'base'],
  ['HTMLButtonElement', 'button'],
  ['HTMLCanvasElement', 'canvas'],
  ['HTMLDataElement', 'data'],
  ['HTMLDataListElement', 'datalist'],
  ['HTMLDetailsElement', 'details'],
  ['HTMLDialogElement', 'dialog'],
  ['HTMLDivElement', 'div'],
  ['HTMLDListElement', 'dl'],
  ['HTMLEmbedElement', 'embed'],
  ['HTMLFieldSetElement', 'fieldset'],
  ['HTMLFormElement', 'form'],
  ['HTMLHRElement', 'hr'],
  ['HTMLIFrameElement', 'iframe'],
  ['HTMLImageElement', 'img'],
  ['HTMLInputElement', 'input'],
  ['HTMLLabelElement', 'label'],
  ['HTMLLegendElement', 'legend'],
  ['HTMLLIElement', 'li'],
  ['HTMLLinkElement', 'link'],
  ['HTMLMapElement', 'map'],
  ['HTMLMetaElement', 'meta'],
  ['HTMLMeterElement', 'meter'],
  ['HTMLModElement', 'del'],
  ['HTMLObjectElement', 'object'],
  ['HTMLOListElement', 'ol'],
  ['HTMLOptGroupElement', 'optgroup'],
  ['HTMLOptionElement', 'option'],
  ['HTMLOutputElement', 'output'],
  ['HTMLParagraphElement', 'p'],
  ['HTMLParamElement', 'param'],
  ['HTMLPictureElement', 'picture'],
  ['HTMLPreElement', 'pre'],
  ['HTMLProgressElement', 'progress'],
  ['HTMLQuoteElement', 'blockquote'],
  ['HTMLScriptElement', 'script'],
  ['HTMLSelectElement', 'select'],
  ['HTMLSlotElement', 'slot'],
  ['HTMLSourceElement', 'source'],
  ['HTMLSpanElement', 'span'],
  ['HTMLStyleElement', 'style'],
  ['HTMLTableElement', 'table'],
  ['HTMLTableSectionElement', 'tbody'],
  ['HTMLTableCellElement', 'td'],
  ['HTMLTemplateElement', 'template'],
  ['HTMLTextAreaElement', 'textarea'],
  ['HTMLTimeElement', 'time'],
  ['HTMLTitleElement', 'title'],
  ['HTMLTableRowElement', 'tr'],
  ['HTMLTrackElement', 'track'],
  ['HTMLUListElement', 'ul'],
  ['HTMLVideoElement', 'video'],
  ['HTMLHeadingElement', 'h1']
];

const targetDir = './src/is';
if (fs.existsSync(targetDir)) {
  fs.readdirSync(targetDir).forEach(file => fs.unlinkSync(path.join(targetDir, file)));
} else {
  fs.mkdirSync(targetDir, { recursive: true });
}

elements.forEach(([className, tagName]) => {
  let shortName = className.replace('HTML', '').replace('Element', '');
  if (shortName === 'UList') shortName = 'Ul';
  if (shortName === 'OList') shortName = 'Ol';
  if (shortName === 'DList') shortName = 'Dl';
  if (shortName === 'LI') shortName = 'Li';
  if (shortName === 'HR') shortName = 'Hr';

  const baseClassName = 'Swc' + className + 'Base';
  const forOfClassName = 'SwcForOf' + shortName;
  const ifClassName = 'SwcIf' + shortName;
  const objectClassName = 'SwcObject' + shortName;
  const chooseClassName = 'SwcChoose' + shortName;
  const whenClassName = 'SwcWhen' + shortName;
  const otherClassName = 'SwcOther' + shortName;

  const genFile = (name, content) => fs.writeFileSync(path.join(targetDir, name + '.ts'), content);

  // 1. Base Class
  genFile(
    baseClassName,
    "import { SwcUtils } from '../utils/Utils';\n\n" +
      'export abstract class ' +
      baseClassName +
      ' extends ' +
      className +
      ' {\n' +
      '  protected _masterTplNodes: Node[] = [];\n' +
      "  protected _asKey: string = 'value';\n" +
      "  protected _asIndexKey: string = 'index';\n\n" +
      '  constructor() {\n' +
      '    super();\n' +
      '  }\n\n' +
      '  protected initCore() {\n' +
      "    this._asKey = this.getAttribute('as') || 'value';\n" +
      "    this._asIndexKey = this.getAttribute('as-index') || 'index';\n" +
      '    if (this._masterTplNodes.length > 0) return;\n' +
      "    const tplSlot = this.shadowRoot?.getElementById('tpl-slot') as HTMLSlotElement;\n" +
      '    if (tplSlot) {\n' +
      '      this._masterTplNodes = tplSlot.assignedNodes().map(n => n.cloneNode(true));\n' +
      '    } else if (this.childNodes.length > 0) {\n' +
      '      this._masterTplNodes = Array.from(this.childNodes).map(n => n.cloneNode(true));\n' +
      '    }\n' +
      '  }\n\n' +
      '  protected applyData(node: Node, data: any, index?: number) {\n' +
      '    SwcUtils.applyData(node, data, {\n' +
      '      asKey: this._asKey,\n' +
      '      asIndexKey: this._asIndexKey,\n' +
      '      index\n' +
      '    });\n' +
      '  }\n\n' +
      '  protected createReactiveProxy(target: any, onChange: () => void, onIndexChange?: (index: number, val: any) => void) {\n' +
      '    return SwcUtils.createReactiveProxy(target, onChange, onIndexChange);\n' +
      '  }\n' +
      '}\n'
  );

  // 2. ForOf
  genFile(
    forOfClassName,
    "import { elementDefine, innerHtml } from '../index';\n" +
      'import { ' +
      baseClassName +
      " } from './" +
      baseClassName +
      "';\n\n" +
      "@elementDefine({ name: 'swc-for-of-" +
      tagName +
      "', extends: '" +
      tagName +
      "' })\n" +
      'export class ' +
      forOfClassName +
      ' extends ' +
      baseClassName +
      ' {\n' +
      '  private _swcValue: any[] = [];\n' +
      '  private _rowNodes: Node[][] = [];\n\n' +
      '  constructor() {\n' +
      '    super();\n' +
      '  }\n\n' +
      '  set swcValue(val: any[]) {\n' +
      '    if (!Array.isArray(val)) val = [];\n' +
      '    this._swcValue = this.createReactiveProxy(\n' +
      '      val,\n' +
      '      () => this.renderAll(),\n' +
      '      (idx, v) => this.updateSingleRow(idx, v)\n' +
      '    );\n' +
      '    if (this._masterTplNodes.length === 0) this.initCore();\n' +
      '    this.renderAll();\n' +
      '  }\n\n' +
      '  get swcValue(): any[] {\n' +
      '    return this._swcValue;\n' +
      '  }\n\n' +
      '  @innerHtml\n' +
      '  renderTemplate() {\n' +
      '    return `<slot id="tpl-slot" style="display:none;"></slot>`;\n' +
      '  }\n\n' +
      '  connectedCallback() {\n' +
      '    this.initCore();\n' +
      '    if (this._masterTplNodes.length > 0) {\n' +
      "      this.innerHTML = '';\n" +
      '      this.renderAll();\n' +
      '    }\n' +
      '  }\n\n' +
      '  public updateSingleRow(index: number, newValue: any) {\n' +
      '    const nodes = this._rowNodes[index];\n' +
      '    if (nodes && nodes.length > 0) {\n' +
      '      nodes.forEach(node => this.applyData(node, newValue, index));\n' +
      '    } else {\n' +
      '      this.renderRow(newValue, index);\n' +
      '    }\n' +
      '  }\n\n' +
      '  private renderRow(item: any, index: number) {\n' +
      '    if (this._masterTplNodes.length === 0) return;\n' +
      '    const currentNodes = [];\n' +
      '    this._masterTplNodes.forEach(tplNode => {\n' +
      '      const clone = tplNode.cloneNode(true);\n' +
      '      this.appendChild(clone);\n' +
      '      this.applyData(clone, item, index);\n' +
      '      currentNodes.push(clone);\n' +
      '    });\n' +
      '    this._rowNodes[index] = currentNodes;\n' +
      '  }\n\n' +
      '  private renderAll() {\n' +
      "    this.innerHTML = '';\n" +
      '    this._rowNodes = [];\n' +
      '    this._swcValue.forEach((item, index) => this.renderRow(item, index));\n' +
      '  }\n' +
      '}\n'
  );

  // 3. If
  genFile(
    ifClassName,
    "import { elementDefine, innerHtml } from '../index';\n" +
      'import { ' +
      baseClassName +
      " } from './" +
      baseClassName +
      "';\n\n" +
      "@elementDefine({ name: 'swc-if-" +
      tagName +
      "', extends: '" +
      tagName +
      "' })\n" +
      'export class ' +
      ifClassName +
      ' extends ' +
      baseClassName +
      ' {\n' +
      '  private _swcValue: any = false;\n\n' +
      '  constructor() {\n' +
      '    super();\n' +
      '  }\n\n' +
      '  set swcValue(val: any) {\n' +
      '    this._swcValue = val;\n' +
      '    if (this._masterTplNodes.length === 0) this.initCore();\n' +
      '    this.render();\n' +
      '  }\n\n' +
      '  get swcValue(): any {\n' +
      '    return this._swcValue;\n' +
      '  }\n\n' +
      '  @innerHtml\n' +
      '  renderTemplate() {\n' +
      '    return `<slot id="tpl-slot" style="display:none;"></slot>`;\n' +
      '  }\n\n' +
      '  connectedCallback() {\n' +
      '    this.initCore();\n' +
      '    if (this._masterTplNodes.length > 0) {\n' +
      "      this.innerHTML = '';\n" +
      '      this.render();\n' +
      '    }\n' +
      '  }\n\n' +
      '  private render() {\n' +
      "    const attrValue = this.getAttribute('swc-value') || this.getAttribute('value');\n" +
      "    if (attrValue !== null && attrValue.includes('{{')) return;\n\n" +
      '    let displayValue = attrValue !== null ? attrValue : this._swcValue;\n' +
      '    let isTruthy = !!displayValue;\n' +
      "    if (typeof displayValue === 'string') {\n" +
      "      if (displayValue === 'false' || displayValue === '0' || displayValue === '') isTruthy = false;\n" +
      '      else {\n' +
      '        try {\n' +
      "          isTruthy = !!new Function('return ' + displayValue)();\n" +
      '        } catch (e) {\n' +
      '          isTruthy = true;\n' +
      '        }\n' +
      '      }\n' +
      '    }\n\n' +
      "    this.innerHTML = '';\n" +
      '    if (isTruthy && this._masterTplNodes.length > 0) {\n' +
      '      this._masterTplNodes.forEach(tplNode => {\n' +
      '        const clone = tplNode.cloneNode(true) as HTMLElement;\n' +
      '        this.appendChild(clone);\n' +
      "        if (clone.style) clone.style.display = 'contents';\n" +
      '        this.applyData(clone, this._swcValue);\n' +
      '      });\n' +
      '    }\n' +
      '  }\n' +
      '}\n'
  );

  // 4. Object
  genFile(
    objectClassName,
    "import { elementDefine, innerHtml } from '../index';\n" +
      'import { ' +
      baseClassName +
      " } from './" +
      baseClassName +
      "';\n\n" +
      "@elementDefine({ name: 'swc-object-" +
      tagName +
      "', extends: '" +
      tagName +
      "' })\n" +
      'export class ' +
      objectClassName +
      ' extends ' +
      baseClassName +
      ' {\n' +
      '  private _swcValue: any = {};\n' +
      '  private _renderedNodes: Node[] = [];\n\n' +
      '  constructor() {\n' +
      '    super();\n' +
      '  }\n\n' +
      '  set swcValue(val: any) {\n' +
      "    if (typeof val !== 'object' || val === null) val = {};\n" +
      '    this._swcValue = this.createReactiveProxy(val, () => this.updateUI());\n' +
      '    if (this._masterTplNodes.length === 0) this.initCore();\n' +
      '    this.render();\n' +
      '  }\n\n' +
      '  get swcValue(): any {\n' +
      '    return this._swcValue;\n' +
      '  }\n\n' +
      '  @innerHtml\n' +
      '  renderTemplate() {\n' +
      '    return `<slot id="tpl-slot" style="display:none;"></slot>`;\n' +
      '  }\n\n' +
      '  connectedCallback() {\n' +
      '    this.initCore();\n' +
      '    if (this._masterTplNodes.length > 0) {\n' +
      "      this.innerHTML = '';\n" +
      '      this.render();\n' +
      '    }\n' +
      '  }\n\n' +
      '  private updateUI() {\n' +
      '    this._renderedNodes.forEach(node => {\n' +
      '      this.applyData(node, this._swcValue);\n' +
      '    });\n' +
      '  }\n\n' +
      '  private render() {\n' +
      "    this.innerHTML = '';\n" +
      '    this._renderedNodes = [];\n' +
      '    if (this._masterTplNodes.length === 0) return;\n\n' +
      '    this._masterTplNodes.forEach(tplNode => {\n' +
      '      const clone = tplNode.cloneNode(true) as HTMLElement;\n' +
      '      this.appendChild(clone);\n' +
      "      if (clone.style) clone.style.display = 'contents';\n" +
      '      this._renderedNodes.push(clone);\n' +
      '      this.applyData(clone, this._swcValue);\n' +
      '    });\n' +
      '  }\n' +
      '}\n'
  );

  // 5. Choose
  genFile(
    chooseClassName,
    "import { elementDefine } from '../index';\n" +
      'import { ' +
      baseClassName +
      " } from './" +
      baseClassName +
      "';\n\n" +
      'interface Branch {\n' +
      '  tpl: HTMLElement;\n' +
      '  test: string | null;\n' +
      '}\n\n' +
      "@elementDefine({ name: 'swc-choose-" +
      tagName +
      "', extends: '" +
      tagName +
      "' })\n" +
      'export class ' +
      chooseClassName +
      ' extends ' +
      baseClassName +
      ' {\n' +
      '  private _observer: MutationObserver | null = null;\n' +
      '  private _swcValue: any = undefined;\n' +
      '  private _branches: Branch[] = [];\n' +
      '  private _otherBranch: Branch | null = null;\n' +
      '  private _isInitialized = false;\n\n' +
      '  set swcValue(val: any) { this._swcValue = val; this.evaluate(); }\n' +
      '  get swcValue() { return this._swcValue; }\n\n' +
      '  connectedCallback() {\n' +
      "    this.style.display = 'contents';\n" +
      '    this._initBranches();\n' +
      '    this._observer = new MutationObserver(() => this.evaluate());\n' +
      '    this._observer.observe(this, { attributes: true });\n' +
      '    this.evaluate();\n' +
      '  }\n\n' +
      '  private _initBranches() {\n' +
      '    if (this._isInitialized) return;\n' +
      '    const children = Array.from(this.children);\n' +
      '    children.forEach(c => {\n' +
      "      const isWhen = c.localName === 'swc-when' || c.getAttribute('is')?.startsWith('swc-when-');\n" +
      "      const isOther = c.localName === 'swc-other' || c.getAttribute('is')?.startsWith('swc-other-');\n" +
      '      const branch: Branch = {\n' +
      '        tpl: c.cloneNode(true) as HTMLElement,\n' +
      "        test: c.getAttribute('test')\n" +
      '      };\n' +
      '      if (isWhen) this._branches.push(branch);\n' +
      '      else if (isOther) this._otherBranch = branch;\n' +
      '    });\n' +
      "    this.innerHTML = '';\n" +
      '    this._isInitialized = true;\n' +
      '  }\n\n' +
      '  disconnectedCallback() { this._observer?.disconnect(); }\n\n' +
      '  private evaluate() {\n' +
      '    if (!this._isInitialized) return;\n' +
      '    let matched = false;\n' +
      "    const chooseValue = this.getAttribute('swc-value') ?? this.getAttribute('value') ?? this._swcValue;\n" +
      "    this.innerHTML = '';\n\n" +
      '    for (const branch of this._branches) {\n' +
      '      if (matched) break;\n' +
      '      const testAttr = branch.test;\n' +
      "      if (testAttr === null || testAttr.includes('{{')) continue;\n" +
      '      let isMet = false;\n' +
      '      if (chooseValue !== undefined && chooseValue !== null) { isMet = String(chooseValue) === String(testAttr); }\n' +
      "      else { try { if (testAttr === 'true') isMet = true; else if (testAttr === 'false') isMet = false; else isMet = !!new Function('return ' + testAttr)(); } catch (e) { isMet = false; } }\n\n" +
      '      if (isMet) {\n' +
      '        this._renderBranch(branch);\n' +
      '        matched = true;\n' +
      '      }\n' +
      '    }\n\n' +
      '    if (!matched && this._otherBranch) { this._renderBranch(this._otherBranch); }\n' +
      '  }\n\n' +
      '  private _renderBranch(branch: Branch) {\n' +
      '    const clone = branch.tpl.cloneNode(true) as HTMLElement;\n' +
      "    clone.style.display = 'contents';\n" +
      '    this.appendChild(clone);\n' +
      '    this.applyData(clone, this._swcValue);\n' +
      '  }\n' +
      '}\n'
  );

  genFile(whenClassName, "import { elementDefine, innerHtml } from '../index';\n" + 'import { ' + baseClassName + " } from './" + baseClassName + "';\n\n" + "@elementDefine({ name: 'swc-when-" + tagName + "', extends: '" + tagName + "' })\n" + 'export class ' + whenClassName + ' extends ' + baseClassName + ' {\n' + '  connectedCallback() {\n' + "    if (this.style.display !== 'contents') {\n" + "       this.style.display = 'none';\n" + '    }\n' + '  }\n' + '}\n');

  genFile(otherClassName, "import { elementDefine, innerHtml } from '../index';\n" + 'import { ' + baseClassName + " } from './" + baseClassName + "';\n\n" + "@elementDefine({ name: 'swc-other-" + tagName + "', extends: '" + tagName + "' })\n" + 'export class ' + otherClassName + ' extends ' + baseClassName + ' {\n' + '  connectedCallback() {\n' + "    if (this.style.display !== 'contents') {\n" + "       this.style.display = 'none';\n" + '    }\n' + '  }\n' + '}\n');
});

const indexFile = './src/index.ts';
const baseExports = ["export * from './decorators/elementDefine';", "export * from './decorators/innerHtml';", "export * from './decorators/attribute';", "export * from './decorators/state';", "export * from './decorators/emitCustomEvent';", "export * from './decorators/lifecycles';", "export * from './decorators/query';", "export * from './decorators/queryAll';", "export * from './decorators/addEventListener';", "export * from './elements/SwcHTMLElementBase';", "export * from './utils/Utils';"];

let indexContent = "import 'reflect-metadata';\n" + baseExports.join('\n') + '\n';

elements.forEach(([className, tagName]) => {
  let shortName = className.replace('HTML', '').replace('Element', '');
  if (shortName === 'UList') shortName = 'Ul';
  if (shortName === 'OList') shortName = 'Ol';
  if (shortName === 'DList') shortName = 'Dl';
  if (shortName === 'LI') shortName = 'Li';
  if (shortName === 'HR') shortName = 'Hr';

  const classes = ['Swc' + className + 'Base', 'SwcForOf' + shortName, 'SwcIf' + shortName, 'SwcObject' + shortName, 'SwcChoose' + shortName, 'SwcWhen' + shortName, 'SwcOther' + shortName];
  classes.forEach(cls => {
    indexContent += "export * from './is/" + cls + "';\n";
  });
});

fs.writeFileSync(indexFile, indexContent);
console.log('Successfully re-generated all is components with prefix swc-!');
