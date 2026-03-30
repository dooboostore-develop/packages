import { OperatorExecuterAttrRequire } from './OperatorExecuterAttrRequire';
import { RawSet } from '../rawsets/RawSet';
import { Render } from '../rawsets/Render';
import { AfterCallBack, ElementSource, ExecuteState, ReturnContainer, Source } from './OperatorExecuter';
import { ObjectUtils } from '@dooboostore/core';

export class DrForOf extends OperatorExecuterAttrRequire<string> {
  constructor(rawSet: RawSet, render: Render, returnContainer: ReturnContainer, elementSource: ElementSource, source: Source, afterCallBack: AfterCallBack) {
    source.operatorAround = undefined;
    super(rawSet, render, returnContainer, elementSource, source, afterCallBack, false);
  }

  async executeAttrRequire(attr: string): Promise<ExecuteState> {
    const itRandom = RawSet.drItOtherEncoding(this.elementSource.element, 'DrForOf');
    const vars = RawSet.drVarEncoding(this.elementSource.element, this.elementSource.attrs.drVarOption ?? '');
    const newTemp = this.source.config.window.document.createElement('temp');

    const variableName = this.elementSource.attrs.drVariableNameOption;
    const itemVariableName = this.elementSource.attrs.drItemVariableNameOption || RawSet.DR_ITEM_VARIABLE_NAME_OPTIONNAME_DEFAULT;
    const itemIndexVariableName = this.elementSource.attrs.drItemIndexVariableNameOption || RawSet.DR_ITEM_INDEX_VARIABLE_NAME_OPTIONNAME_DEFAULT;

    const hasVariableName = !!variableName;
    const hasItemVariableName = !!itemVariableName;
    const hasItemIndexVariableName = !!itemIndexVariableName;

    ObjectUtils.Script.evaluate(
      `
                    try {
                    ${this.render.bindScript}
                    ${this.elementSource.attrs.drBeforeOption ?? ''}
                        var i = -1;
                        const forOf = ${ObjectUtils.Path.toOptionalChainPath(attr)};
                        const forOfStr = '('+\`${attr}\`.trim() + ')';
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
                                destIt = '(' + destIt + ')';
                                
                                const n = this.__render.element.cloneNode(true);
                                // dr-for-of 및 관련 옵션 제거 후 나머지 속성 유지
                                Object.entries(this.__render.drAttr).filter(([k,v]) => k !== 'drForOf' && k !== 'drNextOption' && v).forEach(([k, v]) => n.setAttribute(this.__render.drAttrsOriginName[k], v));
                                
                                // 정교한 치환 함수 (Regex 기반으로 호환성 확보)
                                const replaceAllVars = (text) => {
                                    if (!text) return text;
                                    let result = text.replace(/\\#it\\#/g, destIt)
                                                     .replace(/\\#nearForOfIt\\#/g, destIt)
                                                     .replace(/\\#index\\#/g, String(i))
                                                     .replace(/\\#nearForOfIndex\\#/g, String(i));
                                    
                                    if (${hasVariableName} && '${variableName}') result = result.replace(new RegExp('#${variableName}#', 'g'), forOfStr);
                                    if (${hasItemVariableName} && '${itemVariableName}') result = result.replace(new RegExp('#${itemVariableName}#', 'g'), destIt);
                                    if (${hasItemIndexVariableName} && '${itemIndexVariableName}') result = result.replace(new RegExp('#${itemIndexVariableName}#', 'g'), String(i));
                                    return result;
                                };

                                // 속성 치환
                                n.getAttributeNames().forEach(itName => {
                                    n.setAttribute(itName, replaceAllVars(n.getAttribute(itName)));
                                });

                                const hasDrOptionAttr = n.hasAttribute('${RawSet.DR_ATTR_OPTIONNAME}');
                                if (hasDrOptionAttr) {
                                  const drOptionAttr = n.getAttribute('${RawSet.DR_ATTR_OPTIONNAME}');
                                  const drOptionAttrResult = $scriptUtils.evaluateReturn(drOptionAttr, this);
                                  Array.from(Object.entries(drOptionAttrResult??{})).forEach(([k,v])=>{
                                    if (v === null) n.removeAttribute(k); else n.setAttribute(k,v);
                                  });
                                }
                                
                                const hasDrOptionIf = n.hasAttribute('${RawSet.DR_IF_OPTIONNAME}');
                                if (hasDrOptionIf) {
                                  const drOptionIf = n.getAttribute('${RawSet.DR_IF_OPTIONNAME}');
                                  if(!$scriptUtils.evaluateReturn(drOptionIf, this)) continue;
                                }
                                
                                const drOptionAttrDetect = n.getAttribute('${RawSet.DR_DETECT_ATTR_OPTIONNAME}');
                                if (drOptionAttrDetect) {
                                  const drOptionAttrResult = $scriptUtils.evaluateReturn(drOptionAttrDetect, this);
                                  Array.from(Object.entries(drOptionAttrResult??{})).forEach(([k,v])=>{
                                    if (v === null) n.removeAttribute(k); else n.setAttribute(k,v);
                                  });
                                }
                                
                                const drOptionFilter = n.getAttribute('${RawSet.DR_DETECT_FILTER_OPTIONNAME}');
                                if (drOptionFilter) {
                                  if (!$scriptUtils.evaluateReturn(drOptionFilter, this)) continue;
                                }
     
                                // InnerHTML 치환
                                n.innerHTML = replaceAllVars(n.innerHTML);
                       
                                if (this.__render.drStripOption === 'true') {
                                    Array.from(n.childNodes).forEach(it => this.__render.fag.append(it));
                                } else {
                                    this.__render.fag.append(n);
                                }
                            }
                        }
                    ${this.elementSource.attrs.drAfterOption ?? ''}
                    } catch(e) { console.error('DrForOf Error:', e); }
                    `,
      Object.assign(this.source.obj, {
        __render: Object.freeze({
          drStripOption: this.elementSource.attrs.drStripOption,
          drAttr: this.elementSource.attrs,
          drAttrsOriginName: RawSet.drAttrsOriginName,
          fag: newTemp,
          ...this.render
        } as Render)
      })
    );
    RawSet.drVarDecoding(newTemp, vars);
    RawSet.drItOtherDecoding(newTemp, itRandom);
    const template = this.source.config.window.document.createElement('template');
    template.innerHTML = newTemp.innerHTML;
    this.returnContainer.fag.append(template.content);
    const rr = RawSet.checkPointCreates(this.returnContainer.fag, this.source.obj, this.source.config);
    this.elementSource.element.parentNode?.replaceChild(this.returnContainer.fag, this.elementSource.element);
    this.returnContainer.raws.push(...rr);
    return ExecuteState.EXECUTE;
  }
}
