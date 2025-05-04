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
    template: '<div class="skeleton" dr-class="{[@this@.attribute.class]:@this@.attribute.class, wave: @this@.attribute.animationType === \'wave\', pulse: @this@.attribute.animationType === \'pulse\' || !@this@.attribute.animationType}" dr-style="{width:@this@.attribute.width, height:@this@.attribute.height, borderRadius: @this@.attribute.radius}">&nbsp;</div>',
    styles: styles,
    selector: `${selector}`
  })
  export class Skeleton extends ComponentBase<Attribute> {

  }


}