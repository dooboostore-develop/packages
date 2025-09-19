import { ChildrenSet, ComponentBase, ComponentBaseConfig } from './ComponentBase';
import { ComponentSet } from './ComponentSet';
import { isOnDrThisUnBind } from '../lifecycle/dr-this/OnDrThisUnBind';


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
    // console.log('setChild!!', child, (this as any).name)
    if (child) {
      this.child = child;
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
  }

  onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {
    super.onCreatedThisChildDebounce(childrenSet);
  }


}
