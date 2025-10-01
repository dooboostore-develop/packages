import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Sim({})
export class UserService {
  private users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' }
  ];

  async getUsers(): Promise<User[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.users);
      }, 500);
    });
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async addUser(user: User): Promise<void> {
    this.users.push(user);
  }
}
