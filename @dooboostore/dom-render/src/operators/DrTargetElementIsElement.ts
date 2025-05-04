import { RawSet } from '../rawsets/RawSet';
import { CreatorMetaData } from '../rawsets/CreatorMetaData';
import { AfterCallBack, ElementSource, ExecuteState, OperatorExecuter, ReturnContainer, Source } from './OperatorExecuter';
import { Render } from '../rawsets/Render';
import { ScriptUtils } from '@dooboostore/core-web/script/ScriptUtils';

declare global {
  interface Window {
    HTMLMetaElement: typeof HTMLMetaElement;
  }
}

// 여기서 사용자가 등록한 TargetElement가 들어간다.
export class DrTargetElementIsElement extends OperatorExecuter<string | null> {
  constructor(rawSet: RawSet, render: Render, returnContainer: ReturnContainer, elementSource: ElementSource, source: Source, afterCallBack: AfterCallBack) {
    source.operatorAround = undefined;
    super(rawSet, render, returnContainer, elementSource, source, afterCallBack, false);
  }

  async execute(attr: string | null): Promise<ExecuteState> {
    if (!attr) {
      return ExecuteState.NO_EXECUTE;
    }
    const targetElement = this.source.config?.targetElements?.find(it => it.name.toLowerCase() === attr.toLowerCase());
    if (targetElement) {
      if (this.rawSet.point.start instanceof this.source.config.window.HTMLMetaElement && this.rawSet.point.end instanceof this.source.config.window.HTMLMetaElement) {
        this.rawSet.point.start.setAttribute('this-path', `this.__domrender_components.${this.rawSet.uuid}`)
        this.rawSet.point.end.setAttribute('this-path', `this.__domrender_components.${this.rawSet.uuid}`)
      }


      const documentFragment = await targetElement.callBack(this.elementSource.element, this.source.obj, this.rawSet, this.elementSource.attrs, this.source.config);
      if (documentFragment) {
        const detectAction = this.elementSource.element.getAttribute(RawSet.DR_DETECT_NAME);
        this.rawSet.dataSet.fragment = documentFragment;

        if (detectAction && this.rawSet.dataSet.render) {
          // TODO: 없어져야될듯?
          this.rawSet.detect = {
            action: () => {
              const script = `var $component = this.__render.component; var $element = this.__render.element; var $innerHTML = this.__render.innerHTML; var $attribute = this.__render.attribute;  ${detectAction} `;
              ScriptUtils.eval(script, Object.assign(this.source.obj, {
                __render: this.rawSet.dataSet.render
              }))
            }
          };
        }


        let targetFragment = documentFragment;
        if (targetElement.noStrip) {
          // documentFragment.firstElementChild.classList.add(`${this.rawSet.uuid}___DrTargetElement`)
          const fragment = this.source.config.window.document.createDocumentFragment()
          Array.from(documentFragment.firstElementChild?.childNodes || []).forEach(child => {
            // fragment.appendChild(child.cloneNode(true));
            fragment.appendChild(child);
          });
          // fragment.append(documentFragment.firstElementChild);
          targetFragment = fragment;
        }

        const rr = RawSet.checkPointCreates(targetFragment, this.source.obj, this.source.config)
        if (targetElement.noStrip) {
          Array.from(targetFragment.childNodes||[]).forEach(child => {
            documentFragment.firstElementChild.appendChild(child)
          })
        }
        this.elementSource.element.parentNode?.replaceChild(documentFragment, this.elementSource.element);
        this.returnContainer.raws.push(...rr);
        this.afterCallBack.onElementInitCallBacks.push({
          name: targetElement.name.toLowerCase(),
          obj: this.source.obj,
          targetElement,
          creatorMetaData: targetElement.__creatorMetaData as CreatorMetaData
        });
        // console.log('sssssssssssssss', this.source.obj);
        targetElement?.complete?.(this.elementSource.element, this.source.obj, this.rawSet);
      }
      return ExecuteState.EXECUTE;
    }
    return ExecuteState.NO_EXECUTE;
  }
}
