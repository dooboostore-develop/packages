import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnDestroyRenderParams } from '../../lifecycle/OnDestroyRender';


export namespace Timer {
  export const selector = 'dr-timer';
  export type Attribute = {
    timeSecond?: string;
  }

  // class RadioBase extends ComponentBase<Attribute> {
  //   public hidden = true;
  //
  // }

  // @Component({
  //   template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
  //   styles: '',
  //   selector: `${selector}.Checked`
  // })
  // export class RadioChecked extends RadioBase {
  //   public name = 'Checked';
  //
  //   constructor() {
  //     super({ onlyParentType: Radio });
  //   }
  // }
  //
  // @Component({
  //   template: '<div dr-if="!@this@.hidden" dr-strip="true">#innerHTML#</div>',
  //   styles: '',
  //   selector: `${selector}.UnChecked`
  // })
  // export class UnChecked extends RadioBase {
  //   public name = 'unChecked';
  //
  //   constructor() {
  //     super({ onlyParentType: Radio });
  //   }
  // }

  // @Component({
  //   template: '#innerHTML#',
  //   selector: `${selector}`,
  //   noStrip: true
  // })
  export class Timer extends ComponentBase<Attribute> {
    private interval?: any;
    private timeSecond?: number;


    onInitRender(param: any, rawSet: RawSet) {
      super.onInitRender(param, rawSet);
      console.log('---2', this.getElement()?.isConnected)
      // const element = this.getElement();
      // if(element){
      //   (element as any).component = this;
      // }
    }

    isRunning() {
      return this.timeSecond !== undefined;
    }

    start() {
      const timeSecond = this.getAttribute('timeSecond');
      if (timeSecond) {
        this.timeSecond = parseInt(timeSecond);
        this.interval = setInterval(() => {
          // console.log('--------->',this.timeSecond)
          if (this.timeSecond) {
            this.timeSecond--;
          } else {
            clearInterval(this.interval);
            this.timeSecond = undefined;
            this.interval = undefined;
          }
        }, 1000)
      }
    }


    stop() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = undefined;
        this.timeSecond = undefined;
      }
    }

    onChangeAttrRender(name: string, val: any, other: OtherData) {
      super.onChangeAttrRender(name, val, other);
      console.log('-----', name, val, this.getElement())
    }

    onDestroyRender(data: OnDestroyRenderParams) {
      super.onDestroyRender(data);
      if (this.interval){
        clearInterval(this.interval);
      }
    }
  }
}


export default {
  choose: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Timer.selector}`,
      template: '#innerHTML#',
      objFactory: (e,o,r2, counstructorParam) => {
        return DomRender.run({rootObject: new Timer.Timer(...counstructorParam), config: config});
      }
    })
  },
}