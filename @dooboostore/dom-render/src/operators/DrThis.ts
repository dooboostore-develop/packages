import { OperatorExecuterAttrRequire } from './OperatorExecuterAttrRequire';
import { RawSet } from '../rawsets/RawSet';
import { ComponentSet } from '../components/ComponentSet';
import { ExecuteState } from './OperatorExecuter';
import { isOnDrThisUnBind } from '../lifecycle/dr-this/OnDrThisUnBind';
import { isOnDrThisBind } from '../lifecycle/dr-this/OnDrThisBind';
import { ObjectUtils } from '@dooboostore/core/object/ObjectUtils';
import { Render } from '../rawsets/Render';

export class DrThis extends OperatorExecuterAttrRequire<string> {
  async executeAttrRequire(attr: any): Promise<ExecuteState> {
    // const e = this.elementSource;
    // console.log('drThis!!!!!!!!!!!!!', this.elementSource.attrs.drDetectIfOption, this.elementSource.attrs.drIfOption);
    const optionIf = this.elementSource.attrs.drDetectIfOption ?? this.elementSource.attrs.drIfOption;
    const ok = ObjectUtils.Script.evaluate(`
                ${this.render.bindScript}
                try {
                  const ok  = ${this.elementSource.attrs.drThis};
                  const option = ${optionIf};
                  if (option!==null) {
                     return !!(ok && option); 
                  }
                  // console.log('vv', ${this.elementSource.attrs.drThis}, ${this.elementSource.attrs.drIfOption}, '${this.elementSource.attrs.drIfOption}');
                  return !!ok;
                } catch(e) {
                  return false;
                }
                `, Object.assign(this.source.obj,
      {
        __render: Object.freeze({
          drAttr: this.elementSource.attrs,
          drAttrsOriginName: RawSet.drAttrsOriginName,
          ...this.render
        } as Render)
      }
    ));
    // console.log('----zxvxcv-----!!!aa!', ok);
    // if (!ok) {
    //   this.elementSource.element.remove();
    //   return ExecuteState.STOP;
    // }

    // console.log('----zxvxcv-----!!!!', attr);
    if (attr && this.elementSource.attrs.drThis && ok) {
      let thisPath = this.elementSource.attrs.drThis;
      // let optionIf = this.elementSource.attrs.drIfOption;
      // console.log('drThis!!!!!!!!!!!!!, ', optionIf)
      if (attr instanceof ComponentSet) {
        // console.log('drThis!!!!!!!!!!->', attr)
        // if (this.rawSet.data) {
        //   const destroyOptions = this.elementSource.attrs.drDestroyOption?.split(',') ?? [];
        //   debugger;
        //   RawSet.destroy((this.rawSet.data as ComponentSet).obj, [], this.source.config, destroyOptions);
        // }
        if (attr.config?.beforeComponentSet?.obj !== attr.obj) {
          if (isOnDrThisUnBind(attr.config.beforeComponentSet?.obj)) {
            attr.config.beforeComponentSet?.obj?.onDrThisUnBind?.();
          }
        }
        // this.rawSet.dataSet ??= {};
        // this.rawSet.dataSet.data = attr;
        if (attr.config?.beforeComponentSet?.obj !== attr.obj) {
          if (isOnDrThisBind(attr.obj)) {
            attr.obj?.onDrThisBind?.();
          }
        }
        // 중요: componentSet 의 objPath를 보고 판단하는 중요한부분
        thisPath = `${this.elementSource.attrs.drThis}${attr.config.objPath ? ('.' + attr.config.objPath) : ''}`;
        // const zthisPath = `${this.elementSource.attrs.drThis}${attr.config.objPath ? ('?.' + attr.config.objPath) : ''}`;
        // console.log('thisPaththisPaththisPath',thisPath)
        this.setThisPath(thisPath);
        const componentBody = await RawSet.drThisCreate(this.rawSet, this.elementSource.element, thisPath, this.elementSource.attrs.drVarOption ?? '', this.elementSource.attrs.drStripOption, this.source.obj, this.source.config, attr);
        if (componentBody) {
          this.returnContainer.fag.append(componentBody)
          this.afterCallBack.onThisComponentSetCallBacks.push(attr);
        }

      } else {
        this.setThisPath(thisPath);
        const fragment = await RawSet.drThisCreate(this.rawSet, this.elementSource.element, this.elementSource.attrs.drThis, this.elementSource.attrs.drVarOption ?? '', this.elementSource.attrs.drStripOption, this.source.obj, this.source.config);
        if (fragment) {
          this.returnContainer.fag.append(fragment)
        }
      }


      // console.log('!!!!!!!!!zzz', Array.from(this.returnContainer.fag.childNodes), this.elementSource.element);
      const rr = RawSet.checkPointCreates(this.returnContainer.fag, this.source.obj, this.source.config)
      this.elementSource.element.parentNode?.replaceChild(this.returnContainer.fag, this.elementSource.element);
      this.returnContainer.raws.push(...rr);
    } else {
      this.elementSource.element.remove();
    }
    return ExecuteState.EXECUTE;
  }


  setThisPath(thisPath: string) {

    // if (this.rawSet.point.start instanceof HTMLMetaElement && this.rawSet.point.end instanceof HTMLMetaElement) {

    if (this.rawSet.point.start instanceof this.source.config.window.HTMLMetaElement && this.rawSet.point.end instanceof this.source.config.window.HTMLMetaElement) {
      this.rawSet.point.start.setAttribute('this-path', thisPath)
      this.rawSet.point.end.setAttribute('this-path', thisPath)
    }
  }
}
