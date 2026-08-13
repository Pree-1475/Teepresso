export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'manager' | 'editing_team' | 'admin';
  createdAt: Date;
}

export const usersDatabase: User[] = [
  {
    id: 'usr_1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '9876543210',
    role: 'customer',
    createdAt: new Date(),
  },
];
