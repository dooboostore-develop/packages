import { elementDefine } from '../index';
import { SwcHTMLHeadingElementBase } from './SwcHTMLHeadingElementBase';

interface Branch {
  tpl: HTMLElement;
  test: string | null;
}

@elementDefine({ name: 'swc-choose-h1', extends: 'h1' })
export class SwcChooseHeading extends SwcHTMLHeadingElementBase {
  private _observer: MutationObserver | null = null;
  private _swcValue: any = undefined;
  private _branches: Branch[] = [];
  private _otherBranch: Branch | null = null;
  private _isInitialized = false;

  set swcValue(val: any) { this._swcValue = val; this.evaluate(); }
  get swcValue() { return this._swcValue; }

  connectedCallback() {
    this.style.display = 'contents';
    this._initBranches();
    this._observer = new MutationObserver(() => this.evaluate());
    this._observer.observe(this, { attributes: true });
    this.evaluate();
  }

  private _initBranches() {
    if (this._isInitialized) return;
    const children = Array.from(this.children);
    children.forEach(c => {
      const isWhen = c.localName === 'swc-when' || c.getAttribute('is')?.startsWith('swc-when-');
      const isOther = c.localName === 'swc-other' || c.getAttribute('is')?.startsWith('swc-other-');
      const branch: Branch = {
        tpl: c.cloneNode(true) as HTMLElement,
        test: c.getAttribute('test')
      };
      if (isWhen) this._branches.push(branch);
      else if (isOther) this._otherBranch = branch;
    });
    this.innerHTML = '';
    this._isInitialized = true;
  }

  disconnectedCallback() { this._observer?.disconnect(); }

  private evaluate() {
    if (!this._isInitialized) return;
    let matched = false;
    const chooseValue = this.getAttribute('swc-value') ?? this.getAttribute('value') ?? this._swcValue;
    this.innerHTML = '';

    for (const branch of this._branches) {
      if (matched) break;
      const testAttr = branch.test;
      if (testAttr === null || testAttr.includes('{{')) continue;
      let isMet = false;
      if (chooseValue !== undefined && chooseValue !== null) { isMet = String(chooseValue) === String(testAttr); }
      else { try { if (testAttr === 'true') isMet = true; else if (testAttr === 'false') isMet = false; else isMet = !!new Function('return ' + testAttr)(); } catch (e) { isMet = false; } }

      if (isMet) {
        this._renderBranch(branch);
        matched = true;
      }
    }

    if (!matched && this._otherBranch) { this._renderBranch(this._otherBranch); }
  }

  private _renderBranch(branch: Branch) {
    const clone = branch.tpl.cloneNode(true) as HTMLElement;
    clone.style.display = 'contents';
    this.appendChild(clone);
    this.applyData(clone, this._swcValue);
  }
}
