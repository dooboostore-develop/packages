import { ComponentRouterBase } from './component/ComponentRouterBase';
import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import * as url from 'node:url';
import { getDomRenderOriginObject } from '@dooboostore/dom-render/DomRenderProxy';
import { RoutingDataSet } from '@dooboostore/simple-boot/route/RouterAction';

// export const DomRenderRootDefaultTemplate = '${@this@.name}$ <button dr-event-click="$router.go(\'/\')">aa</button><button dr-event-click="console.log(@this@.name); @this@.name = 22">aa</button>  ${@this@.rootRouter}$<dr-this value="${@this@.rootRouter}$"></dr-this>'
// export const DomRenderRootDefaultTemplate = '<dr-this value="${@this@.child}$"></dr-this>'
export const DomRenderRootDefaultTemplate = '<dr-this value="${@this@.child}$"></dr-this>'
// @Router({
//   path: ''
// })
export class DomRenderRootObject extends ComponentRouterBase {
  name?: string;
  // rootRouter?: any;

  constructor() {
    super({sameRouteNoApply: true});
  }

}