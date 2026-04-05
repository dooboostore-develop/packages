import { changedAttributeHost } from '../decorators/changedAttributeHost';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils, ActionExpression } from '@dooboostore/core';
import { ConvertUtils } from '@dooboostore/core-web';
import { SwcIfInterface } from '../types';
import { attributeHost } from '../decorators';

class SwcIf extends HTMLTemplateElement implements SwcIfInterface {
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
