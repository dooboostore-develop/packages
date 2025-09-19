import {ComponentRouterBase as DomRenderComponentRouterBase} from '@dooboostore/dom-render/components/ComponentRouterBase'
import { ComponentSet } from './ComponentSet';
import { RouterAction } from '@dooboostore/simple-boot/route/RouterAction';
import { Intent } from '@dooboostore/simple-boot/intent/Intent';
import { RouterModule } from '@dooboostore/simple-boot/route/RouterModule';
import { RouterManager } from '@dooboostore/simple-boot/route/RouterManager';
import { isOnDrThisUnBind } from '@dooboostore/dom-render/lifecycle/dr-this/OnDrThisUnBind';
import { ChildrenSet, ComponentBase, ComponentBaseConfig } from '@dooboostore/dom-render/components/ComponentBase';
import { getDomRenderOriginObject } from '@dooboostore/dom-render/DomRenderProxy';
import { RouterOutlet } from '@dooboostore/dom-render/components/router/RouterOutlet';

export type ComponentRouterBaseConfig = ComponentBaseConfig & { sameRouteNoApply?: boolean };

export abstract class ComponentRouterBase<T = any>
  extends DomRenderComponentRouterBase<T >
  implements RouterAction.CanActivate, RouterAction.OnRouting
{

  constructor(_config?: ComponentRouterBaseConfig) {
    super(_config);
  }

  // get child() {
  //   return this._child;
  // }

  setChild(child: any | ComponentSet) {
    // console.log('setChild!!', child, (this as any).name)
    if (child) {
      child = child instanceof ComponentSet ? child : new ComponentSet(child);
    } else {
      child = undefined;
    }

    super.setChild(child);
  }

  onDrThisUnBind(): void {
    super.onDrThisUnBind();
  }

  onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {
    super.onCreatedThisChildDebounce(childrenSet);
    // const routerOutlet = this.getChildren(RouterOutlet.RouterOutlet);
    // if (routerOutlet) {
    //   routerOutlet.forEach(it => it.setValue(this.child));
    // }
  }
  async canActivate(url: RouterAction.RoutingDataSet, data?: any): Promise<void> {
    // console.log('cccccccccccc')
    if (
      !(
        this.componentConfig?.sameRouteNoApply &&
        getDomRenderOriginObject(this.child?.obj) === getDomRenderOriginObject(data)
      )
    ) {
      this.child = new ComponentSet(data);
      const routerOutlet = this.getChildren(RouterOutlet.RouterOutlet);
      if (routerOutlet) {
        routerOutlet.forEach(it => it.setValue(this.child));
      }
    }
  }

  async onRouting(r: RouterAction.RoutingDataSet): Promise<void> {
    // if (RouterAction.isOnRouting(this.child?.obj)){
    //   await this.child.obj.onRouting(r);
    // }
  }

  // abstract onRouting(routingDataSet: RoutingDataSet):void;
}
