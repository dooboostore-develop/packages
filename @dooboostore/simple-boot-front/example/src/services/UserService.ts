import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

@Sim
export class UserService {
  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', age: 28 },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', age: 32 },
    { id: 3, name: 'Bob Wilson', email: 'bob.wilson@example.com', age: 45 },
    { id: 4, name: 'Alice Brown', email: 'alice.brown@example.com', age: 29 }
  ];

  constructor() {
    console.log('👤 UserService created');
  }

  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  addUser(user: User): void {
    this.users.push(user);
    console.log(`✅ User added: ${user.name}`);
  }
}
