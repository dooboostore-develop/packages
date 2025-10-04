import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import { UserService } from '../../services/UserService';
import template from './user.route.component.html';
import style from './user.route.component.css';
import { ComponentBase } from '@dooboostore/simple-boot-front/component/ComponentBase';
import { RawSet } from '@dooboostore/dom-render/rawsets/RawSet';

@Sim({
  using: [UserService]
})
@Component({
  template,
  styles: [style]
})
export class UserRouteComponent extends ComponentBase{
  constructor(private userService: UserService) {
    super();
    console.log('👥 User page created with UserService');
  }

  async onInitRender(param: any, rawSet: RawSet) {
   await super.onInitRender(param,rawSet);
    console.log('👥 User onInitRender', param);
    console.log('👥 UserService test:', this.userService.getUsers());
  }
}
