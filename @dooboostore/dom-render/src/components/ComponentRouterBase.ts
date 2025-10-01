import { ChildrenSet, ComponentBase, ComponentBaseConfig } from './ComponentBase';
import { ComponentSet } from './ComponentSet';
import { isOnDrThisUnBind } from '../lifecycle/dr-this/OnDrThisUnBind';
import {RouterOutlet} from '../components/router/RouterOutlet';

export interface OnCreatedOutlet {
  onCreatedOutlet(child: any): void;
}
export const isOnCreatedOutlet = (obj: any): obj is OnCreatedOutlet =>
  typeof obj?.onCreatedOutlet === 'function';

export interface OnCreatedOutletDebounce {
  onCreatedOutletDebounce(child: any): void;
}
export const isOnCreatedOutletDebounce = (obj: any): obj is OnCreatedOutletDebounce =>
  typeof obj?.onCreatedOutletDebounce === 'function';
export type ComponentRouterBaseConfig = ComponentBaseConfig & { sameRouteNoApply?: boolean };

export abstract class ComponentRouterBase<T = any>
  extends ComponentBase<T, ComponentRouterBaseConfig>
{
  // OnDrThisBind
  public child?: ComponentSet;

  constructor(_config?: ComponentRouterBaseConfig) {
    super(_config);
  }

  // get child() {
  //   return this._child;
  // }


  setChild(child: ComponentSet) {
    console.log('setChild!!', child, (this as any).name)
    if (child) {
      this.child = child;
    } else {
      this.child = undefined;
    }
    const routerOutletChildren = this.getChildren(RouterOutlet.RouterOutlet);
    routerOutletChildren.forEach(it => {
      it.setValue(this.child)
    })
  }

  onDrThisUnBind(): void {
    super.onDrThisUnBind();
    if (this.child && isOnDrThisUnBind(this.child?.obj)) {
      this.child.obj.onDrThisUnBind();
    }
  }

  onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {
    super.onCreatedThisChildDebounce(childrenSet);
  }


}
