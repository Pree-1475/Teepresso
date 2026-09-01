import { registerDatabase } from '../../../config/jsonDb.js';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'editor' | 'customer';
  password?: string;
  orgName?: string;
  orgType?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  createdAt: Date;
}

export const usersDatabase: User[] = [
  {
    id: 'c_1',
    name: 'Rahul Sharma',
    email: 'rahul.s@iitb.ac.in',
    phone: '98765 43210',
    role: 'customer',
    orgName: 'IIT Bombay TechFest',
    orgType: 'University',
    totalOrders: 4,
    totalSpent: 84500,
    lastOrderDate: 'Aug 10, 2026',
    createdAt: new Date(),
  },
  {
    id: 'c_2',
    name: 'Ananya Verma',
    email: 'ananya@techcorp.io',
    phone: '98112 23344',
    role: 'customer',
    orgName: 'ZettaScale Tech Inc.',
    orgType: 'Startup',
    totalOrders: 2,
    totalSpent: 76000,
    lastOrderDate: 'Aug 11, 2026',
    createdAt: new Date(),
  },
  {
    id: 'c_3',
    name: 'Priya Nair',
    email: 'pnair@globalconsulting.com',
    phone: '97445 56677',
    role: 'customer',
    orgName: 'Global Consulting Group',
    orgType: 'Corporate',
    totalOrders: 6,
    totalSpent: 245000,
    lastOrderDate: 'Aug 07, 2026',
    createdAt: new Date(),
  },
  {
    id: 'c_4',
    name: 'Vikramaditya Roy',
    email: 'roy@suburbansociety.org',
    phone: '99001 12233',
    role: 'customer',
    orgName: 'Greenwood Heights RWA',
    orgType: 'Community',
    totalOrders: 3,
    totalSpent: 92400,
    lastOrderDate: 'Aug 09, 2026',
    createdAt: new Date(),
  },
  {
    id: 'usr_2',
    name: 'Production Director',
    email: 'admin@teepresso.com',
    phone: '9999911111',
    role: 'admin',
    password: 'admin123',
    createdAt: new Date(),
  },
  {
    id: 'usr_3',
    name: 'Operations Manager',
    email: 'manager@teepresso.com',
    phone: '9999922222',
    role: 'manager',
    password: 'manager123',
    createdAt: new Date(),
  },
  {
    id: 'usr_4',
    name: 'Lead Designer',
    email: 'editor@teepresso.com',
    phone: '9999933333',
    role: 'editor',
    password: 'editor123',
    createdAt: new Date(),
  }
];

registerDatabase('users', usersDatabase);


