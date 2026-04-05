import { changedAttributeHost } from '../decorators/changedAttributeHost';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils, ActionExpression } from '@dooboostore/core';
import { ConvertUtils } from '@dooboostore/core-web';
import { attributeHost } from '../decorators';

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
