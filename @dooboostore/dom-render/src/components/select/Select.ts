import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { ComponentSet } from '../../components/ComponentSet';
import { OnCreateRenderDataParams } from '../../lifecycle/OnCreateRenderData';
import { OnCreateRender } from '../../lifecycle/OnCreateRender';



export namespace Select {
  export const selector = 'dr-select';

  export type Attribute = {
    class?: string;
  }


  // @Component({
  //   template: '<option class="${`${@this@.getAttribute(\'class\')} select-option-container`}$">#innerHTML#</option>',
  //   styles: '',
  //   selector: `${selector}.Option`
  // })
  export class Option extends ComponentBase<Attribute> {
    constructor() {
      super({onlyParentType: [Select]});
    }
  }

  // @Component({
  //   template: '',
  //   styles: '',
  //   selector: `${selector}`
  // })
  export class Select extends ComponentBase<Attribute> implements OnCreateRender{
    private element?: HTMLSelectElement;
    onCreateRender(...param: any[]): void {
    }
    onDestroyRender(...metaData: any[]): void {
    }
  }
}


// 아직 사용한적없으니 사용할때 만드세유~
export default {
  selectOption: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Select.selector}-option`,
      template: '<option class="${`${@this@.getAttribute(\'class\')} select-option-container`}$">#innerHTML#</option>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new Select.Option(), config: config});
      }
    })
  },
  select: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Select.selector}`,
      template: '<select class="${@this@.getAttribute(\'class\')}$">#innerHTML#</select>',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new Select.Select(...counstructorParam), config: config});
      }
    })
  },
}