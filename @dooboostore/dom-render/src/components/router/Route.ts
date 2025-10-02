import { attribute, ComponentBase } from '../ComponentBase';
import { DomRender } from '../../DomRender';
import { OnInitRender } from '../../lifecycle/OnInitRender';
import { RawSet } from '../../rawsets/RawSet';
import type { DomRenderConfig } from '../../configs/DomRenderConfig';
import { DomRenderNoProxy } from '../../decorators/DomRenderNoProxy';
import { OnDestroyRenderParams } from '../../lifecycle/OnDestroyRender';
import { Subscription } from '@dooboostore/core/message/Subscription';

export namespace Route {
  export const selector = 'dr-route';
  export type Attribute<D> = {
    value?: null | string;
  };

  abstract class CheckerBase<D> extends ComponentBase<Attribute<D>> implements OnInitRender {
    protected sw: boolean = false;
    @attribute({ name: 'value' })
    value?: string;
    @DomRenderNoProxy
    private inputDomRenderConfig?: DomRenderConfig;
    private routerSubscription?: Subscription;

    constructor(domRenderConfig?: DomRenderConfig) {
      super();
      this.inputDomRenderConfig = domRenderConfig;
    }

    async onInitRender(param: any, rawSet: RawSet) {
      await super.onInitRender(param, rawSet);
      this.routerSubscription = this.inputDomRenderConfig?.router?.observable.subscribe(it => {
        if (this.value && this.inputDomRenderConfig) {
          this.sw = this.check(this.inputDomRenderConfig);
        } else {
          this.sw = false;
        }
      });
    }

    onDrThisBind() {
      super.onDrThisBind();
    }

    onDrThisUnBind() {
      super.onDrThisUnBind();
    }

    onDestroyRender(data?: OnDestroyRenderParams) {
      super.onDestroyRender(data);
      this.routerSubscription?.unsubscribe();
    }

    abstract check(config?: DomRenderConfig): boolean;
  }

  export class Match<D> extends CheckerBase<D> {
    check(config?: DomRenderConfig): boolean {
      return !!config?.router?.test(this.value);
    }
  }

  export class Regexp<D> extends CheckerBase<D> {
    check(config?: DomRenderConfig): boolean {
      return !!config?.router?.testRegexp(this.value);
    }
  }
}

export default {
  match: (config?: DomRenderConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Route.selector}-match`,
      template: '<div dr-if="@this@.sw" dr-option-strip="true">#innerHTML#</div>',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({ rootObject: new Route.Match(config), config: config });
      }
    });
  },
  regexp: (config?: DomRenderConfig) => {
    return RawSet.createComponentTargetElement({
      name: `${Route.selector}-regexp`,
      template: '<div dr-if="@this@.sw" dr-option-strip="true">#innerHTML#</div>',
      objFactory: (e, o, r2, counstructorParam) => {
        return DomRender.run({ rootObject: new Route.Regexp(config), config: config });
      }
    });
  }
};
