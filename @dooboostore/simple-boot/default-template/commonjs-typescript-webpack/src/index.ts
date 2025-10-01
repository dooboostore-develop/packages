import 'reflect-metadata'
import { SimpleApplication } from '@dooboostore/simple-boot/SimpleApplication';
import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';


@Sim
class Office {
  constructor() {
    console.log('Office constructor');
  }

  say() {
    console.log('Office say');
  }
}

@Sim({ scheme: 'User' })
class User {
  constructor(private office: Office) {
    console.log('User constructor');
  }

  say() {
    console.log('User say');
    this.office.say();
  }
}

new SimpleApplication().run().sim(User)?.say();