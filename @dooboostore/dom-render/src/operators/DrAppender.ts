import {OperatorExecuterAttrRequire} from './OperatorExecuterAttrRequire';
import {ScriptUtils} from '@dooboostore/core-web/script/ScriptUtils';
import {RawSet} from '../rawsets/RawSet';
import {Render} from '../rawsets/Render';
import {AfterCallBack, ElementSource, ExecuteState, ReturnContainer, Source} from './OperatorExecuter';

export class DrAppender extends OperatorExecuterAttrRequire<string> {
    constructor(rawSet: RawSet, render: Render, returnContainer: ReturnContainer, elementSource: ElementSource, source: Source, afterCallBack: AfterCallBack) {
        source.operatorAround = undefined;
        super(rawSet, render, returnContainer, elementSource, source, afterCallBack, false);
    }

    async executeAttrRequire(attr: string): Promise<ExecuteState> {
        const itRandom = RawSet.drItOtherEncoding(this.elementSource.element);
        const vars = RawSet.drVarEncoding(this.elementSource.element, this.elementSource.attrs.drVarOption ?? '');
        const newTemp = this.source.config.window.document.createElement('temp');
        ScriptUtils.eval(`
                    try{
                    ${this.render.bindScript}
                    ${this.elementSource.attrs.drBeforeOption ?? ''}
                        const ifWrap = document.createElement('div');
                        // ifWrap.setAttribute('${RawSet.DR_STRIP_OPTIONNAME}', 'true');
                        // ifWrap.setAttribute('${RawSet.DR_IF_NAME}', '${this.elementSource.attrs.drAppender} && ${this.elementSource.attrs.drAppender}.length > 0');
                        const n = this.__render.element.cloneNode(true);
                        Object.entries(this.__render.drAttr).filter(([k,v]) => k !== 'drAppender' && v).forEach(([k, v]) => n.setAttribute(this.__render.drAttrsOriginName[k], v));
                        const length = ${this.elementSource.attrs.drAppender}.length;
                        if (length > 0) {
                            n.setAttribute('${RawSet.DR_FOR_OF_NAME}', '${this.elementSource.attrs.drAppender}[' + (length-1) + ']');
                            n.setAttribute('${RawSet.DR_NEXT_OPTIONNAME}', '${this.elementSource.attrs.drAppender},' + length);
                        } else {
                            n.setAttribute('${RawSet.DR_FOR_OF_NAME}', '${this.elementSource.attrs.drAppender}[0]');
                            n.setAttribute('${RawSet.DR_NEXT_OPTIONNAME}', '${this.elementSource.attrs.drAppender},' + 1);
                        }
                        // console.log('appender--->', Array.from(n.getAttributeNames()).map(it=>({name:it,attr: n.getAttribute(it)})));
                        // const drOptionThis = n.getAttribute('${RawSet.DR_THIS_OPTIONNAME}');
                        // if (drOptionThis) {
                        // }
                        // ifWrap.append(n);
                        // this.__render.fag.append(ifWrap);
                        this.__render.fag.append(n);
                    ${this.elementSource.attrs.drAfterOption ?? ''}
                    }catch(e){}
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
