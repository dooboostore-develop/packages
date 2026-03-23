import { elementDefine, innerHtml } from '../index';

@elementDefine({ name: 'swc-choose' })
export class SwcChoose extends HTMLElement {
  private _observer: MutationObserver | null = null;
  private _swcValue: any = undefined;

  set swcValue(val: any) {
    this._swcValue = val;
    this.evaluate();
  }

  get swcValue() {
    return this._swcValue;
  }

  @innerHtml({ useShadow: true })
  render() {
    return `
      <style>:host { display: contents; }</style>
      <slot id="choose-slot"></slot>
    `;
  }

  connectedCallback() {
    this._observer = new MutationObserver(() => this.evaluate());
    this._observer.observe(this, { attributes: true, subtree: true, childList: true });
    this.evaluate();
  }

  disconnectedCallback() {
    this._observer?.disconnect();
  }

  private evaluate() {
    const whens = Array.from(this.querySelectorAll('swc-when'));
    const other = this.querySelector('swc-other');
    let matched = false;

    const chooseValue = this.getAttribute('swc-value') ?? this.getAttribute('value') ?? this._swcValue;

    whens.forEach(when => {
      if (matched) {
        (when as HTMLElement).style.display = 'none';
        return;
      }

      const testAttr = when.getAttribute('test');
      if (testAttr === null) return;
      if (testAttr.includes('{{')) return;

      let isConditionMet = false;
      if (chooseValue !== undefined && chooseValue !== null) {
        isConditionMet = String(chooseValue) === String(testAttr);
      } else {
        try {
          if (testAttr === 'true') isConditionMet = true;
          else if (testAttr === 'false') isConditionMet = false;
          else isConditionMet = !!new Function(`return ${testAttr}`)();
        } catch (e) {
          isConditionMet = false;
        }
      }

      if (isConditionMet) {
        (when as HTMLElement).style.display = '';
        matched = true;
      } else {
        (when as HTMLElement).style.display = 'none';
      }
    });

    if (other) {
      (other as HTMLElement).style.display = matched ? 'none' : '';
    }
  }
}
