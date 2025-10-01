import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '@dooboostore/simple-boot-front/component/ComponentBase';
import template from './home.route.component.html';
import style from './home.route.component.css';
import { UserService } from '../../services/UserService';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';

@Sim
@Component({
  template,
  styles: [style]
})
export class HomeRouteComponent extends ComponentBase {
  title = 'Welcome to Simple Boot Front!';
  count = 0;
  
  constructor(private userService: UserService) {
    super();
  }

  increment() {
    this.count++;
    console.log('Count:', this.count);
  }

  async loadUsers() {
    const users = await this.userService.getUsers();
    alert(`Loaded ${users.length} users!`);
  }
}
