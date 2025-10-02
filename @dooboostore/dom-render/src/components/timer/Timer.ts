import { ComponentBase } from '../ComponentBase';
import { DomRender, DomRenderRunConfig } from '../../DomRender';
import { RawSet } from '../../rawsets/RawSet';
import { OtherData } from '../../lifecycle/OnChangeAttrRender';
import { OnDestroyRenderParams } from '../../lifecycle/OnDestroyRender';

export namespace Timer {
  export const selector = 'dr-timer';
  export type Attribute = {
    value?: string;
    interval?: number;
    onCreated?: (timer: Timer) => void;
  };
  export class Timer extends ComponentBase<Attribute> {
    private interval?: any;
    private value?: number;

    async onInitRender(param: any, rawSet: RawSet) {
      await super.onInitRender(param, rawSet);
      this.getAttribute('onCreated')?.(this);
      // console.log('---2', this.getElement()?.isConnected)
      // const element = this.getElement();
      // if(element){
      //   (element as any).component = this;
      // }
    }

    isRunning() {
      return this.value !== undefined;
    }

    start() {
      const timems = this.getAttribute('value');
      if (timems) {
        this.value = parseInt(timems);
        const intervalValue = this.getAttribute('interval') ?? 1000;
        console.log('int', this.value, intervalValue);
        this.interval = setInterval(() => {
          console.log('--------->', this.value);
          if (this.value) {
            this.value--;
          } else {
            clearInterval(this.interval);
            this.value = undefined;
            this.interval = undefined;
          }
        }, intervalValue);
      }
    }

    stop() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = undefined;
        this.value = undefined;
      }
    }

    onChangeAttrRender(name: string, val: any, other: OtherData) {
      super.onChangeAttrRender(name, val, other);
      console.log('-----', name, val, this.getElement());
    }

    onDestroyRender(data: OnDestroyRenderParams) {
      super.onDestroyRender(data);
      if (this.interval) {
        clearInterval(this.interval);
      }
    }
  }
}

export default {
  timer: (config?: DomRenderRunConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Timer.selector}`,
      template: '#innerHTML#',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({ rootObject: new Timer.Timer(...counstructorParam), config: config });
      }
    });
  }
};