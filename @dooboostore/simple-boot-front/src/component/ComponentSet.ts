import { ComponentSet as DomRenderComponentSet} from '@dooboostore/dom-render/components/ComponentSet';
import { getComponent } from '../decorators/Component';
export class ComponentSet<T = any> extends DomRenderComponentSet<T> {
 constructor(data: any) {
   const component = getComponent(data);
   if (component) {
     const styles = component?.styles ?? [];
     const template = component?.template ?? '';
     super(data, {template, styles});
   } else {
     super(data, {});
   }
 }
}

// export const createComponentSet = (data: any) => {
//   const component = getComponent(data);
//      if (component) {
//      const styles = component?.styles ?? [];
//      const template = component?.template ?? '';
//      return new ComponentSet(data, template, styles, {objPath: null});
//    } else {
//        return new ComponentSet(data);
//    }
// }