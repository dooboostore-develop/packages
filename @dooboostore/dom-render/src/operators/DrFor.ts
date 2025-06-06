import { OperatorExecuterAttrRequire} from './OperatorExecuterAttrRequire';
import {ScriptUtils} from '@dooboostore/core-web/script/ScriptUtils';
import {RawSet} from '../rawsets/RawSet';
import {Render} from '../rawsets/Render';
import {AfterCallBack, ElementSource, ExecuteState, ReturnContainer, Source} from './OperatorExecuter';

export class DrFor extends OperatorExecuterAttrRequire<string> {
    constructor(rawSet: RawSet, render: Render, returnContainer: ReturnContainer, elementSource: ElementSource, source: Source, afterCallBack: AfterCallBack) {
        source.operatorAround = undefined;
        super(rawSet, render, returnContainer, elementSource, source, afterCallBack, false);
    }

    async executeAttrRequire(attr: string): Promise<ExecuteState> {
        const itRandom = RawSet.drItOtherEncoding(this.elementSource.element);
        const vars = RawSet.drVarEncoding(this.elementSource.element, this.elementSource.attrs.drVarOption ?? '');
        const newTemp = this.source.config.window.document.createElement('temp');
        // console.log('-----asdad',attr , this.elementSource.attrs.drItOption);
        ScriptUtils.eval(`
                    ${this.render.bindScript}
                    ${this.elementSource.attrs.drBeforeOption ?? ''}
                    for(${attr}) {
                        const n = this.__render.element.cloneNode(true);
                        var destIt = ${this.elementSource.attrs.drItOption};
                        if (destIt !== undefined) {
                            n.getAttributeNames().forEach(it => n.setAttribute(it, n.getAttribute(it).replace(/\\#it\\#/g, destIt).replace(/\\#nearForIt\\#/g, destIt).replace(/\\#nearForIndex\\#/g, destIt))) 
                            n.innerHTML = n.innerHTML.replace(/\\#it\\#/g, destIt).replace(/\\#index\\#/g, destIt);
                        }
                        if (this.__render.drStripOption === 'true') {
                            Array.from(n.childNodes).forEach(it => this.__render.fag.append(it));
                        } else {
                            this.__render.fag.append(n);
                        }
                    }
                    ${this.elementSource.attrs.drAfterOption ?? ''}
                    `, Object.assign(this.source.obj, {
            __render: Object.freeze({
                fag: newTemp,
                drStripOption: this.elementSource.attrs.drStripOption,
                ...this.render
            })
        }));
        RawSet.drVarDecoding(newTemp, vars);
        RawSet.drItOtherDecoding(newTemp, itRandom);
        const tempalte = this.source.config.window.document.createElement('template');
        tempalte.innerHTML = newTemp.innerHTML;
        this.returnContainer.fag.append(tempalte.content)
        const rr = RawSet.checkPointCreates(this.returnContainer.fag, this.source.obj, this.source.config)
        this.elementSource.element.parentNode?.replaceChild(this.returnContainer.fag, this.elementSource.element);
        this.returnContainer.raws.push(...rr)
        return ExecuteState.EXECUTE;
    }
}
