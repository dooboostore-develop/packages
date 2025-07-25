import { ComponentBase } from '../ComponentBase';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import styles from './skeleton.css'

export namespace Skeleton {
  export const selector = 'System:Skeleton';
  export type Attribute = {
    color?: string,
    animated?: boolean; // default: true
    class?: string;
    // 애니메이션 종류 (예: 'pulse', 'wave')
    animationType?: 'pulse' | 'wave'; // default: 'wave'
    padding?: string;
    margin?: string;
    width?: string;
    height?: string;
    radius?: string
    // class?: string;
  }


  @Component({
    template: '<div class="skeleton" dr-class="{[@this@.getAttribute(\'class\')]:@this@.getAttribute(\'class\'), wave: @this@.getAttribute(\'animationType\') === \'wave\', pulse: @this@.getAttribute(\'animationType\') === \'pulse\' || !@this@.getAttribute(\'animationType\')}" dr-style="{width:@this@.getAttribute(\'width\'), height:@this@.getAttribute(\'height\'), borderRadius: @this@.getAttribute(\'radius\')}">&nbsp;</div>',
    styles: styles,
    selector: `${selector}`
  })
  export class Skeleton extends ComponentBase<Attribute> {

  }


}