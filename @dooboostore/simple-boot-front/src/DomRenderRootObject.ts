import { ComponentRouterBase } from './component/ComponentRouterBase';
// export const DomRenderRootDefaultTemplate = '${@this@.name}$ <button dr-event-click="$router.go(\'/\')">aa</button><button dr-event-click="console.log(@this@.name); @this@.name = 22">aa</button>  ${@this@.rootRouter}$<dr-this value="${@this@.rootRouter}$"></dr-this>'
export const DomRenderRootDefaultTemplate = '<dr-this value="${@this@.child}$"></dr-this>'
// export const DomRenderRootDefaultTemplate = '<dr-this value="222 ${@this@.child}$"></dr-this>'
// export const DomRenderRootDefaultTemplate = '<dr-router-outlet></dr-router-outlet>'
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