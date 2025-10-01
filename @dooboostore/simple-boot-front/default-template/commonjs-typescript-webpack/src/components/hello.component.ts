import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentBase } from '@dooboostore/simple-boot-front/component/ComponentBase';
import template from './hello.component.html';
import style from './hello.component.css';

@Component({
  selector: 'hello-component',
  template,
  styles: [style]
})
export class HelloComponent extends ComponentBase {
  message = 'Hello from Component!';
  
  constructor() {
    super();
  }

  changeMessage() {
    this.message = 'Message changed! ✨';
  }
}
