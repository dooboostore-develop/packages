import { ComponentBase } from './ComponentBase';
import { ComponentSet } from '@dooboostore/simple-boot-front/component/ComponentSet';
import { RouterAction, RoutingDataSet } from '@dooboostore/simple-boot/route/RouterAction';
import { Intent } from '@dooboostore/simple-boot/intent/Intent';
import { RouterModule } from '@dooboostore/simple-boot/route/RouterModule';
import { RouterManager } from '@dooboostore/simple-boot/route/RouterManager';
import { isOnDrThisUnBind } from '@dooboostore/dom-render/lifecycle/dr-this/OnDrThisUnBind';

export abstract class ComponentRouterBase<T = any> extends ComponentBase<T> implements RouterAction{ // OnDrThisBind
  private _child? : ComponentSet;

  get child() {
    return this._child;
  }

  set child(child: any | ComponentSet) {
    // console.log('setChild!!', child, (this as any).name)
    this._child = child instanceof ComponentSet ? child : new ComponentSet(child);
  }

  onDrThisUnBind(): void {
    console.log('--ComponentRouterBase--onDrThisUnBind-')
    super.onDrThisUnBind();
    if (this.child && isOnDrThisUnBind(this.child?.obj)) {
      this.child.obj.onDrThisUnBind();
    }
    this.child = undefined;
  }


  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    this.onRouting(url);
    // console.log('%croute WorldRouterComponent canActivate->', 'color:yellow', url, data);
    // if (data) {
    //   if (data instanceof WorldComponent && url.routerModule.pathData?.['id']) {
    //     data.setWorldSeq(url.routerModule.pathData['id'])
    //   }
    // }
    // TODO: 왜이렇게 해야지 drThis 등 한번만 호출되는지 모르겠는데-_- 이런것들이 조금있는듯 task queue로 빠져야되나..
    // SSR처리할떄 안될것같은데...훔-_-;;  -> 체크해보니깐 또 잘되네-_-뽀록인가
    //   this.child = new ComponentSet(data);
    setTimeout(()=>{
      this.child = new ComponentSet(data);
    }, 0)
  }

  abstract onRouting(routingDataSet: RoutingDataSet):void;
}