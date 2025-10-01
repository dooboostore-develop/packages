import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { OnInitRender } from '@dooboostore/dom-render/lifecycle/OnInitRender';
import { UserService } from '../../services/UserService';
import template from './user.html';
import style from './user.css';

@Sim({
  using: [UserService]
})
@Component({
  template,
  styles: [style]
})
export class User implements OnInitRender {
  constructor(private userService: UserService) {
    console.log('👥 User page created with UserService');
  }

  onInitRender(...param: any[]): void {
    console.log('👥 User onInitRender', param);
    console.log('👥 UserService test:', this.userService.getUsers());
  }
}
