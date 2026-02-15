import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

@Sim({symbol: Symbol.for('UserService')})
export class UserService {
  private users: User[] = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      createdAt: new Date('2024-01-01')
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@example.com',
      createdAt: new Date('2024-01-15')
    },
    {
      id: 3,
      name: 'Carol Williams',
      email: 'carol@example.com',
      createdAt: new Date('2024-02-01')
    }
  ];

  private nextId = 4;

  constructor() {
    console.log('👤 UserService initialized with', this.users.length, 'users');
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  createUser(userData: Partial<User>): User {
    const newUser: User = {
      id: this.nextId++,
      name: userData.name || 'Unknown',
      email: userData.email || '',
      createdAt: new Date()
    };

    this.users.push(newUser);
    console.log('✅ User created:', newUser);
    
    return newUser;
  }

  updateUser(id: number, userData: Partial<User>): User | null {
    const index = this.users.findIndex(user => user.id === id);
    
    if (index === -1) {
      return null;
    }

    this.users[index] = {
      ...this.users[index],
      ...userData,
      id: this.users[index].id,
      createdAt: this.users[index].createdAt
    };

    console.log('📝 User updated:', this.users[index]);
    return this.users[index];
  }

  deleteUser(id: number): boolean {
    const index = this.users.findIndex(user => user.id === id);
    
    if (index === -1) {
      return false;
    }

    this.users.splice(index, 1);
    console.log('🗑️  User deleted with id:', id);
    return true;
  }

  say() {
    return 'zzzzzzzzzz'
  }
}
