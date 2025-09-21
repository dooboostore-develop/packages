import {
  ComponentBase as DomRenderComponentBase,
  ComponentBaseConfig
} from '@dooboostore/dom-render/components/ComponentBase';
import { RouterAction } from '@dooboostore/simple-boot/route/RouterAction';
export abstract class ComponentBase<T = any, C extends ComponentBaseConfig = ComponentBaseConfig> extends DomRenderComponentBase implements RouterAction.OnRouting{
  async onRouting(r: RouterAction.RoutingDataSet): Promise<void> {
  }
}