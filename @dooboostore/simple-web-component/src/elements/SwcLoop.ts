import { changedAttributeHost } from '../decorators/changedAttributeHost';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils, ActionExpression } from '@dooboostore/core';
import { ConvertUtils } from '@dooboostore/core-web';
import { attributeHost } from '../decorators';

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
