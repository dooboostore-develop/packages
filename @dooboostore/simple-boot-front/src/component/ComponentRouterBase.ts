import { ComponentSet } from './ComponentSet';
import { RouterAction, RoutingDataSet } from '@dooboostore/simple-boot/route/RouterAction';
import { Intent } from '@dooboostore/simple-boot/intent/Intent';
import { RouterModule } from '@dooboostore/simple-boot/route/RouterModule';
import { RouterManager } from '@dooboostore/simple-boot/route/RouterManager';
import { isOnDrThisUnBind } from '@dooboostore/dom-render/lifecycle/dr-this/OnDrThisUnBind';
import { ComponentBase, ComponentBaseConfig } from '@dooboostore/dom-render/components/ComponentBase';
import { getDomRenderOriginObject } from '@dooboostore/dom-render/DomRenderProxy';

export type ComponentRouterBaseConfig = ComponentBaseConfig & { sameRouteNoApply?: boolean }

export abstract class ComponentRouterBase<T = any> extends ComponentBase<T, ComponentRouterBaseConfig> implements RouterAction { // OnDrThisBind
  public child?: ComponentSet;


  constructor(_config?: ComponentRouterBaseConfig) {
    super(_config);
  }

  // get child() {
  //   return this._child;
  // }

  setChild(child: any | ComponentSet) {
    // console.log('setChild!!', child, (this as any).name)
    if (child) {
      this.child = child instanceof ComponentSet ? child : new ComponentSet(child);
    } else {
      this.child = undefined;
    }
  }

  onDrThisUnBind(): void {
    // console.log('--ComponentRouterBase--onDrThisUnBind-')
    super.onDrThisUnBind();
    if (this.child && isOnDrThisUnBind(this.child?.obj)) {
      this.child.obj.onDrThisUnBind();
    }
    // 똑같이 자기자신이 dr-this에 들어간다면 canActivate에 우선 셋팅이되고 난뒤 unbind 일어나서 다시 bind될때에는 child 값이 없어지는...그런 라이프사이클 순서? 있어서 child지우지않는다
    // console.log('un!!!?', this.child);
    // this.child = undefined;
  }


  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    // console.log('cccccccccccc')
    if (!(this.componentConfig?.sameRouteNoApply && getDomRenderOriginObject(this.child?.obj) === getDomRenderOriginObject(data))) {
      this.child = new ComponentSet(data);
    }
  }

  // abstract onRouting(routingDataSet: RoutingDataSet):void;
}