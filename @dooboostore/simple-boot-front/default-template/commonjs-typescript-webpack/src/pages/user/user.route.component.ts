import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '@dooboostore/simple-boot-front/component/ComponentBase';
import template from './user.route.component.html';
import style from './user.route.component.css';
import { formatDate } from '../../utils/dateUtils';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';

@Sim
@Component({
  template,
  styles: [style]
})
export class UserRouteComponent extends ComponentBase {
  userName = 'John Doe';
  userEmail = 'john@example.com';
  joinDate = new Date();
  
  constructor() {
    super();
  }

  get formattedDate() {
    return formatDate(this.joinDate);
  }

  updateProfile() {
    alert('Profile updated!');
  }
}
