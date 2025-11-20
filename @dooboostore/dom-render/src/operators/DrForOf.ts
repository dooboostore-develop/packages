import { OperatorExecuterAttrRequire } from './OperatorExecuterAttrRequire';
import { ScriptUtils } from '@dooboostore/core-web/script/ScriptUtils';
import { RawSet } from '../rawsets/RawSet';
import { Render } from '../rawsets/Render';
import { AfterCallBack, ElementSource, ExecuteState, ReturnContainer, Source } from './OperatorExecuter';
import { ObjectUtils } from '@dooboostore/core/object/ObjectUtils';

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

    const variableName = this.elementSource.element.getAttribute(RawSet.DR_VARIABLE_NAME_OPTIONNAME);
    const itemVariableName = this.elementSource.element.getAttribute(RawSet.DR_ITEM_VARIABLE_NAME_OPTIONNAME);
    // const drAttrOption = this.elementSource.element.getAttribute(RawSet.DR_ATTR_OPTIONNAME);
    const itemIndexVariableName = this.elementSource.element.getAttribute(RawSet.DR_ITEM_INDEX_VARIABLE_NAME_OPTIONNAME);
    const hasVariableName = this.elementSource.element.hasAttribute(RawSet.DR_VARIABLE_NAME_OPTIONNAME);
    const hasItemVariableName = this.elementSource.element.hasAttribute(RawSet.DR_ITEM_VARIABLE_NAME_OPTIONNAME);
    const hasItemIndexVariableName = this.elementSource.element.hasAttribute(RawSet.DR_ITEM_INDEX_VARIABLE_NAME_OPTIONNAME);
    // console.log('----!', this.elementSource.attrs)
    // ScriptUtils.evalReturn()
    const t0 = performance.now();
    ObjectUtils.Script.evaluate(`
                    ${this.render.bindScript}
                    ${this.elementSource.attrs.drBeforeOption ?? ''}
                    var i = -1; 
                    const forOf = ${ObjectUtils.Path.toOptionalChainPath(attr)};
                    const forOfStr = \`${attr}\`.trim();
                    // console.log('forOf---',forOf);
                    // debugger;
                    if (forOf) {
                        for(const it of forOf) {
                            i++;
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
                            Object.entries(this.__render.drAttr).filter(([k,v]) => k !== 'drForOf' && k !== 'drNextOption' && v).forEach(([k, v]) => n.setAttribute(this.__render.drAttrsOriginName[k], v));
                            n.getAttributeNames().forEach(it => n.setAttribute(it, n.getAttribute(it).replace(/\\#it\\#/g, destIt).replace(/\\#nearForOfIt\\#/g, destIt).replace(/\\#it\\#/g, destIt).replace(/\\#nearForOfIndex\\#/g, i)))
                            if (${hasVariableName} && '${variableName}') {
                              n.getAttributeNames().forEach(it => n.setAttribute(it, n.getAttribute(it).replaceAll('#${variableName}#', forOfStr)));
                            }
                            if (${hasItemVariableName} && '${itemVariableName}') {
                              n.getAttributeNames().forEach(it => n.setAttribute(it, n.getAttribute(it).replaceAll('#${itemVariableName}#', destIt)));
                            }
                            if (${hasItemIndexVariableName} && '${itemIndexVariableName}') {
                              n.getAttributeNames().forEach(it => n.setAttribute(it, n.getAttribute(it).replaceAll('#${itemIndexVariableName}#', i)));
                            }
                            
                            const hasDrOptionAttr = n.hasAttribute('${RawSet.DR_ATTR_OPTIONNAME}');
                            if (hasDrOptionAttr) {
                              const drOptionAttr = n.getAttribute('${RawSet.DR_ATTR_OPTIONNAME}');
                              const drOptionAttrResult = $scriptUtils.evaluateReturn(drOptionAttr, this);
                              Array.from(Object.entries(drOptionAttrResult??{})).forEach(([k,v])=>{
                                if (v === null) {
                                  n.removeAttribute(k);
                                } else {
                                  n.setAttribute(k,v);
                                }
                              })
                            
                            }
                            const hasDrOptionIf = n.hasAttribute('${RawSet.DR_IF_OPTIONNAME}');
                            if (hasDrOptionIf) {
                              const drOptionIf = n.getAttribute('${RawSet.DR_IF_OPTIONNAME}');
                              const e = $scriptUtils.evaluateReturn(drOptionIf, this);
                              if(!e) {
                                continue;
                              }
                            
                            }
                            
                            const drOptionAttr = n.getAttribute('${RawSet.DR_DETECT_ATTR_OPTIONNAME}');
                            if (drOptionAttr) {
                              const drOptionAttrResult = $scriptUtils.evaluateReturn(drOptionAttr, this);
                              Array.from(Object.entries(drOptionAttrResult??{})).forEach(([k,v])=>{
                                if (v === null) {
                                  n.removeAttribute(k);
                                } else {
                                  n.setAttribute(k,v);
                                }
                              })
                            }
                            
                            const drOptionFilter = n.getAttribute('${RawSet.DR_DETECT_FILTER_OPTIONNAME}');
                            if (drOptionFilter) {
                              const drOptionFilterResult = $scriptUtils.evaluateReturn(drOptionFilter, this);
                              // console.log('---drforof----', drOptionFilter, drOptionFilterResult)
                              if (!drOptionFilterResult) {
                                continue;
                              }
                            }

                            n.innerHTML = n.innerHTML.replace(/\\#it\\#/g, destIt).replace(/\\#index\\#/g, i);
                            if (${hasVariableName} && '${variableName}') {
                              n.innerHTML = n.innerHTML.replaceAll('#${variableName}#', forOfStr);
                            }
                            if (${hasItemVariableName} && '${itemVariableName}') {
                              n.innerHTML = n.innerHTML.replaceAll('#${itemVariableName}#', destIt);
                            }
                            if (${hasItemIndexVariableName} && '${itemIndexVariableName}') {
                              n.innerHTML = n.innerHTML.replaceAll('#${itemIndexVariableName}#', i);
                            }
                   
                            if (this.__render.drStripOption === 'true') {
                                Array.from(n.childNodes).forEach(it => this.__render.fag.append(it));
                            } else {
                                this.__render.fag.append(n);
                            }
                           
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
    // console.log(`drForOf 호출에 걸린 시간은 ${performance.now() - t0} 밀리초.`);
    return ExecuteState.EXECUTE;
  }
}
