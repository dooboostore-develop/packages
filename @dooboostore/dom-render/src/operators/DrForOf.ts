import { OperatorExecuterAttrRequire } from './OperatorExecuterAttrRequire';
import { ScriptUtils } from '@dooboostore/core-web/script/ScriptUtils';
import { RawSet } from '../rawsets/RawSet';
import { Render } from '../rawsets/Render';
import { AfterCallBack, ElementSource, ExecuteState, ReturnContainer, Source } from './OperatorExecuter';

export class DrForOf extends OperatorExecuterAttrRequire<string> {
  constructor(rawSet: RawSet, render: Render, returnContainer: ReturnContainer, elementSource: ElementSource, source: Source, afterCallBack: AfterCallBack) {
    source.operatorAround = undefined;
    super(rawSet, render, returnContainer, elementSource, source, afterCallBack, false);
  }

  async executeAttrRequire(attr: string): Promise<ExecuteState> {
    // console.log('타지도않냐?')
    const itRandom = RawSet.drItOtherEncoding(this.elementSource.element, 'DrForOf');
    const vars = RawSet.drVarEncoding(this.elementSource.element, this.elementSource.attrs.drVarOption ?? '');
    const newTemp = this.source.config.window.document.createElement('temp');
    // console.log('---------!!', this.elementSource.attrs)
    ScriptUtils.eval(`
                    ${this.render.bindScript}
                    ${this.elementSource.attrs.drBeforeOption ?? ''}
                    var i = 0; 
                    const forOf = ${attr};
                    const forOfStr = \`${attr}\`.trim();
                    // console.log('forOf---',forOf);
                    if (forOf) {
                        for(const it of forOf) {
                            var destIt = it;
                            if (/\\[(.*,?)\\],/g.test(forOfStr)) {
                                if (typeof it === 'string') {
                                    destIt = it;
                                } else {
                                    destIt = forOfStr.substring(1, forOfStr.length-1).split(',')[i];
                                }
                            } else if (forOf.isRange) {
                                    destIt = it;
                            } else {
                                destIt = forOfStr + '[' + i +']'
                            }
                            const n = this.__render.element.cloneNode(true);
                            // console.log('zzzzzzzzzzz', n);
                            Object.entries(this.__render.drAttr).filter(([k,v]) => k !== 'drForOf' && k !== 'drNextOption' && v).forEach(([k, v]) => n.setAttribute(this.__render.drAttrsOriginName[k], v));
                            // console.log('---------'+destIt,n, Array.from(n.getAttributeNames()).map(it=>({name:it,attr: n.getAttribute(it)})));
                            // console.log('---------',n.attributes);
                            n.getAttributeNames().forEach(it => n.setAttribute(it, n.getAttribute(it).replace(/\\#it\\#/g, destIt).replace(/\\#nearForOfIt\\#/g, destIt).replace(/\\#it\\#/g, destIt).replace(/\\#nearForOfIndex\\#/g, i)))
                            n.innerHTML = n.innerHTML.replace(/\\#it\\#/g, destIt).replace(/\\#index\\#/g, i);
                            const drOptionThis = n.getAttribute('${RawSet.DR_THIS_OPTIONNAME}');
                            if (drOptionThis) {
                             n.setAttribute('${RawSet.DR_THIS_NAME}', drOptionThis)
                            }
                            if (this.__render.drStripOption === 'true') {
                                Array.from(n.childNodes).forEach(it => this.__render.fag.append(it));
                            } else {
                                this.__render.fag.append(n);
                            }
                            i++;
                        }
                        
                        if('${this.elementSource.attrs.drNextOption}' !== 'null') {
                            const n = this.__render.element.cloneNode(true);
                            Object.entries(this.__render.drAttr).filter(([k,v]) => k !== 'drForOf' && k !== 'drNextOption' && v).forEach(([k, v]) => n.setAttribute(this.__render.drAttrsOriginName[k], v));
                            const [name, idx] = '${this.elementSource.attrs.drNextOption}'.split(',');
                            n.setAttribute('${RawSet.DR_FOR_OF_NAME}', name + '[' + idx + ']');
                            n.setAttribute('${RawSet.DR_NEXT_OPTIONNAME}', name + ',' +  (Number(idx) + 1));
                            this.__render.fag.append(n);
                        }
                    }
                    ${this.elementSource.attrs.drAfterOption ?? ''}
                    `, Object.assign(this.source.obj, {
      __render: Object.freeze({
        drStripOption: this.elementSource.attrs.drStripOption,
        drAttr: this.elementSource.attrs,
        drAttrsOriginName: RawSet.drAttrsOriginName,
        fag: newTemp,
        ...this.render
        // eslint-disable-next-line no-use-before-define
      } as Render)
    }));
    RawSet.drVarDecoding(newTemp, vars);
    RawSet.drItOtherDecoding(newTemp, itRandom);
    const tempalte = this.source.config.window.document.createElement('template');
    tempalte.innerHTML = newTemp.innerHTML;
    this.returnContainer.fag.append(tempalte.content)
    const rr = RawSet.checkPointCreates(this.returnContainer.fag, this.source.obj, this.source.config);
    this.elementSource.element.parentNode?.replaceChild(this.returnContainer.fag, this.elementSource.element);
    // const rrr = rr.flatMap(it => it.render(obj, config));// .flat();
    this.returnContainer.raws.push(...rr)
    return ExecuteState.EXECUTE;
  }
}
