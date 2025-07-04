import { OperatorExecuterAttrRequire } from './OperatorExecuterAttrRequire';
import { RawSet } from '../rawsets/RawSet';
import { ComponentSet } from '../components/ComponentSet';
import { ExecuteState } from './OperatorExecuter';
import { isOnDrThisUnBind } from '../lifecycle/dr-this/OnDrThisUnBind';
import { isOnDrThisBind } from '../lifecycle/dr-this/OnDrThisBind';

export class DrThis extends OperatorExecuterAttrRequire<string> {
  async executeAttrRequire(attr: any): Promise<ExecuteState> {
    if (attr && this.elementSource.attrs.drThis) {
      let thisPath = this.elementSource.attrs.drThis;
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
        this.setThisPath(thisPath);
        const componentBody = await RawSet.drThisCreate(this.rawSet, this.elementSource.element, thisPath, this.elementSource.attrs.drVarOption ?? '', this.elementSource.attrs.drStripOption, this.source.obj, this.source.config, attr);
        this.returnContainer.fag.append(componentBody)
        this.afterCallBack.onThisComponentSetCallBacks.push(attr);

      } else {
        this.setThisPath(thisPath);
        this.returnContainer.fag.append(await RawSet.drThisCreate(this.rawSet, this.elementSource.element, this.elementSource.attrs.drThis, this.elementSource.attrs.drVarOption ?? '', this.elementSource.attrs.drStripOption, this.source.obj, this.source.config))
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

    if ( this.rawSet.point.start instanceof this.source.config.window.HTMLMetaElement && this.rawSet.point.end instanceof this.source.config.window.HTMLMetaElement) {
      this.rawSet.point.start.setAttribute('this-path', thisPath)
      this.rawSet.point.end.setAttribute('this-path', thisPath)
    }
  }
}
