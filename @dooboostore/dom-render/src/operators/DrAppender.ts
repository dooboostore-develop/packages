import { OperatorExecuterAttrRequire } from './OperatorExecuterAttrRequire';
import { RawSet } from '../rawsets/RawSet';
import { Render } from '../rawsets/Render';
import { AfterCallBack, ElementSource, ExecuteState, ReturnContainer, Source } from './OperatorExecuter';
import { ObjectUtils } from '@dooboostore/core/object/ObjectUtils';

export class DrAppender extends OperatorExecuterAttrRequire<string> {
  constructor(rawSet: RawSet, render: Render, returnContainer: ReturnContainer, elementSource: ElementSource, source: Source, afterCallBack: AfterCallBack) {
    source.operatorAround = undefined;
    super(rawSet, render, returnContainer, elementSource, source, afterCallBack, false);
  }

  async executeAttrRequire(attr: string): Promise<ExecuteState> {
    const itRandom = RawSet.drItOtherEncoding(this.elementSource.element, 'DrAppender');
    const vars = RawSet.drVarEncoding(this.elementSource.element, this.elementSource.attrs.drVarOption ?? '');
    const newTemp = this.source.config.window.document.createElement('temp');

    const variableName = this.elementSource.attrs.drVariableNameOption;
    const itemVariableName = this.elementSource.attrs.drItemVariableNameOption;
    const itemIndexVariableName = this.elementSource.attrs.drItemIndexVariableNameOption;
    const itemOffsetIndexVariableName = this.elementSource.attrs.drItemOffsetIndexVariableNameOption;

    const hasVariableName = !!variableName;
    const hasItemVariableName = !!itemVariableName;
    const hasItemIndexVariableName = !!itemIndexVariableName;
    const hasItemOffsetIndexVariableName = !!itemOffsetIndexVariableName;

    const indexOffsetOption = this.elementSource.attrs.drItemIndexOffsetOption;
    const hasIndexOffsetOption = !!indexOffsetOption;

    ObjectUtils.Script.evaluate(
      `
                    try{
                    ${this.render.bindScript}
                    ${this.elementSource.attrs.drBeforeOption ?? ''}
                        const offset = ${hasIndexOffsetOption ? Number(indexOffsetOption) : 0};
                        const data = ${ObjectUtils.Path.toOptionalChainPath(attr)};
                        const attrStr = \`${attr}\`.trim();
                        const isChunkPath = /\\[\\d+\\]$/.test(attrStr);
                        
                        if (data !== undefined && data !== null) {
                            // SSR 호환성을 위해 Array.from 사용
                            const items = isChunkPath ? (Array.isArray(data) ? data : [data]) : (typeof data.getAll === 'function' ? data.getAll().slice(offset) : Array.from(data).slice(offset));
                            var i = -1;
                            
                            for(const it of items) {
                                i++;
                                const userIdx = i + offset;
                                
                                // 아이템 접근 경로 생성
                                let destItStr = attrStr + '[' + (isChunkPath ? i : userIdx) + ']';
                                if (!isChunkPath && typeof data.getAll === 'function') {
                                   destItStr = '(' + attrStr + '.getAll()[' + userIdx + '])';
                                } else {
                                   destItStr = '(' + destItStr + ')';
                                }
                                
                                const n = this.__render.element.cloneNode(true);
                                // 옵션 복원 및 정제
                                Object.entries(this.__render.drAttr).filter(([k,v]) => k !== 'drAppender' && k !== 'drNextOption' && v).forEach(([k, v]) => n.setAttribute(this.__render.drAttrsOriginName[k], v));
                                
                                // 정교한 치환 로직 (속성)
                                n.getAttributeNames().forEach(itName => {
                                    let attrVal = n.getAttribute(itName);
                                    attrVal = attrVal.replace(/\\#it\\#/g, destItStr)
                                                     .replace(/\\#nearForOfIt\\#/g, destItStr)
                                                     .replace(/\\#index\\#/g, String(i))
                                                     .replace(/\\#offsetIndex\\#/g, String(userIdx))
                                                     .replace(/\\#nearForOfIndex\\#/g, String(i));
                                    
                                    if (${hasVariableName} && '${variableName}') attrVal = attrVal.replaceAll('#${variableName}#', attrStr);
                                    if (${hasItemVariableName} && '${itemVariableName}') attrVal = attrVal.replaceAll('#${itemVariableName}#', destItStr);
                                    if (${hasItemIndexVariableName} && '${itemIndexVariableName}') attrVal = attrVal.replaceAll('#${itemIndexVariableName}#', String(i));
                                    if (${hasItemOffsetIndexVariableName} && '${itemOffsetIndexVariableName}') attrVal = attrVal.replaceAll('#${itemOffsetIndexVariableName}#', String(userIdx));
                                    n.setAttribute(itName, attrVal);
                                });

                                // 정교한 치환 로직 (InnerHTML)
                                n.innerHTML = n.innerHTML.replace(/\\#it\\#/g, destItStr)
                                                         .replace(/\\#index\\#/g, String(i))
                                                         .replace(/\\#offsetIndex\\#/g, String(userIdx));
                                                         
                                if (${hasVariableName} && '${variableName}') n.innerHTML = n.innerHTML.replaceAll('#${variableName}#', attrStr);
                                if (${hasItemVariableName} && '${itemVariableName}') n.innerHTML = n.innerHTML.replaceAll('#${itemVariableName}#', destItStr);
                                if (${hasItemIndexVariableName} && '${itemIndexVariableName}') n.innerHTML = n.innerHTML.replaceAll('#${itemIndexVariableName}#', String(i));
                                if (${hasItemOffsetIndexVariableName} && '${itemOffsetIndexVariableName}') n.innerHTML = n.innerHTML.replaceAll('#${itemOffsetIndexVariableName}#', String(userIdx));
                       
                                if (this.__render.drStripOption === 'true') {
                                    Array.from(n.childNodes).forEach(it => this.__render.fag.append(it));
                                } else {
                                    this.__render.fag.append(n);
                                }
                            }
                            
                            // 다음 세대 센티넬 생성 (정석 체이닝)
                            const nextN = this.__render.element.cloneNode(true);
                            Object.entries(this.__render.drAttr).filter(([k,v]) => v).forEach(([k, v]) => nextN.setAttribute(this.__render.drAttrsOriginName[k], v));
                            
                            const basePath = attrStr.replace(/\\[\\d+\\]$/, '');
                            const appenderObj = ${ObjectUtils.Path.toOptionalChainPath(attr.replace(/\\[\\d+\\]$/, ''))};
                            const nextChunkIdx = isChunkPath ? Number(attrStr.match(/\\[(\\d+)\\]$/)[1]) + 1 : (appenderObj?.length ?? 0);
                            
                            nextN.setAttribute('${RawSet.DR_APPENDER_NAME}', basePath + '[' + nextChunkIdx + ']');
                            nextN.setAttribute('${RawSet.DR_ITEM_INDEX_OFFSET_OPTIONNAME}', (offset + items.length));
                            this.__render.fag.append(nextN);
                        }
                    ${this.elementSource.attrs.drAfterOption ?? ''}
                    }catch(e){console.error('DrAppender Error:', e);}
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
