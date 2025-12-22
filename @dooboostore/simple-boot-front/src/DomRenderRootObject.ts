import {ComponentRouterBase} from './component/ComponentRouterBase';
import {OnRawSetRenderedOtherData} from "@dooboostore/dom-render/lifecycle/OnRawSetRendered";
import {ChildrenSet} from "@dooboostore/dom-render/components/ComponentBase";
import {RawSet} from "@dooboostore/dom-render/rawsets/RawSet";
import {OnChildRawSetRendered} from "@dooboostore/dom-render/lifecycle/OnChildRawSetRendered";
import {Subject} from "@dooboostore/core/message/Subject";
import {RoutingDataSet} from "@dooboostore/simple-boot/route/RouterManager";
import * as url from "node:url";
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

  private  lifeCycleSubject= new Subject<{type: 'end'}>();
  constructor() {
    super({sameRouteNoApply: true, onChildRawSetRenderedOtherDataDebounce: 5});
  }

  lifecycleObservable() {
    return this.lifeCycleSubject.asObservable();
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

  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    await super.canActivate(url, data);
    // console.log('canActivate DomRenderRootObject', );
  }

  async onRouting(r: RoutingDataSet): Promise<void> {
    await super.onRouting(r);
    // console.log('onRouting DomRenderRootObject', );
  }

  onCreatedThisChildDebounce(childrenSet: ChildrenSet[]): void {
    super.onCreatedThisChildDebounce(childrenSet);
    // console.log('dddddddddddddddddo');
  }

  async onChildRawSetRenderedDebounce(): Promise<void> {
    for (let onChildRawSetRenderedDebounceCallback of this.onChildRawSetRenderedDebounceCallbacks) {
      await onChildRawSetRenderedDebounceCallback();
    }
    this.lifeCycleSubject.next({type: 'end'});
    // console.log('-------bbbbbbbbbbbcccccb')

  }

  onDestroy() {
    super.onDestroy();
    // console.log('DomRenderRootObject onDestroy');
    this.child = undefined;
    const componentObjet = this[RawSet.DOMRENDER_COMPONENTS_KEY];
    if (componentObjet) {
      for (const key of Object.keys(componentObjet)) {
        const comp = componentObjet[key];
        if (comp && typeof comp.onDestroy === 'function') {
          try {
            // console.log('Calling onDestroy for component:', key);
            comp.onDestroy();
          } catch (e) {
            // console.error('Error during component onDestroy:', e);
          }
        }
      }
    }
  }

}