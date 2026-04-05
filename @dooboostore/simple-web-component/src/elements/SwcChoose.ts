import { changedAttributeHost } from '../decorators/changedAttributeHost';
import { SwcUtils } from '../utils/Utils';
import { FunctionUtils, ActionExpression } from '@dooboostore/core';
import { ConvertUtils } from '@dooboostore/core-web';
import { SwcChooseInterface } from '../types';
import { attributeHost } from '../decorators';

class SwcChoose extends HTMLTemplateElement implements SwcChooseInterface {
  @attributeHost('value')
  _value: any;

  @attributeHost('replace-wrap')
  _replaceWrap: string | null;

  private _nodes: Node[] = [];
  private _previousTemplate: HTMLTemplateElement | null = null;

  get value(): any {
    return this._value;
  }

  set value(nv: any) {
    this.refresh(nv);
  }

  @changedAttributeHost('value')
  private setValue() {
    this.refresh();
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

  refresh(value = this._value) {
    const portal = this.parentElement;
    if (!portal) return;

    const win = this.ownerDocument?.defaultView || window;
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
