import {
  ComponentBase as DomRenderComponentBase,
  ComponentBaseConfig
} from '@dooboostore/dom-render';
import { RouterAction } from '@dooboostore/simple-boot';
import type { RoutingDataSet } from '@dooboostore/simple-boot';
export abstract class ComponentBase<T = any, C extends ComponentBaseConfig = ComponentBaseConfig> extends DomRenderComponentBase implements RouterAction.OnRouting{
  async onRouting(r: RoutingDataSet): Promise<void> {
  }
}