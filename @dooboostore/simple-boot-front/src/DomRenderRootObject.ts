import {ComponentRouterBase} from './component/ComponentRouterBase';
import {OnRawSetRenderedOtherData} from "@dooboostore/dom-render/lifecycle/OnRawSetRendered";
import {ChildrenSet} from "@dooboostore/dom-render/components/ComponentBase";
import {RawSet} from "@dooboostore/dom-render/rawsets/RawSet";
import {OnChildRawSetRendered} from "@dooboostore/dom-render/lifecycle/OnChildRawSetRendered";
// export const DomRenderRootDefaultTemplate = '${@this@.name}$ <button dr-event-click="$router.go(\'/\')">aa</button><button dr-event-click="console.log(@this@.name); @this@.name = 22">aa</button>  ${@this@.rootRouter}$<dr-this value="${@this@.rootRouter}$"></dr-this>'
export const DomRenderRootDefaultTemplate = '<dr-this value="${@this@.child}$"></dr-this>'
// export const DomRenderRootDefaultTemplate = '<div>zz${@this@.name}$z</div>'
// export const DomRenderRootDefaultTemplate = '[${@this@.name}$]'
export const DomRenderRootDefaultStyle = ''
// export const DomRenderRootDefaultTemplate = '<dr-this value="222 ${@this@.child}$"></dr-this>'
// export const DomRenderRootDefaultTemplate = '<dr-router-outlet></dr-router-outlet>'
// @Router({
//   path: ''
// })
export class DomRenderRootObject extends ComponentRouterBase  {
  name?: string = 'domRenderRootObject' + new Date().toISOString();
  // rootRouter?: any;
  first = true;
  onInitCallbacks: Array<() => Promise<void>> = [];
  onChildRawSetRenderedDebounceCallbacks: Array<() => Promise<void>> = [];

  constructor() {
    super({sameRouteNoApply: true});
  }

  addOnInitCallback(cb: (() => Promise<void>) | (() => void)): void {
    this.onInitCallbacks.push(async () => {
      await cb();
    });
  }

  addOnChildRawSetRenderedDebounceCallback(cb: (() => Promise<void>) | (() => void)): void {
    this.onChildRawSetRenderedDebounceCallbacks.push(async () => {
      await cb();
    });
  }

  async onInitRender(param: any, rawSet: RawSet): Promise<void> {
    // console.log('1onInitRender DomRenderRootObject', this.name);
    if (this.first) {
      await super.onInitRender(param, rawSet);
      for (const callback of this.onInitCallbacks) {
        await callback();
      }
      this.first = false;
    }
    // console.log('2onInitRender DomRenderRootObject', this.name);

  }


  async onChildRawSetRenderedDebounce(): Promise<void> {
    for (let onChildRawSetRenderedDebounceCallback of this.onChildRawSetRenderedDebounceCallbacks) {
      await onChildRawSetRenderedDebounceCallback();
    }
    // console.log('-------bbbbbbbbbbbcccccb')

  }


}