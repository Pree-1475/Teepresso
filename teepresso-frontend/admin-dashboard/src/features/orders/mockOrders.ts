export interface AdminOrder {
  id: string;
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  orgName: string;
  orgType: 'University' | 'Corporate' | 'Startup' | 'Colony/Community' | 'Event Organizers';
  productName: string;
  category: string;
  totalPieces: number;
  totalAmount: number;
  orderDate: string;
  estimatedDelivery: string;
  currentStage: 'Order Placed' | 'Waiting for Approval' | 'Approved' | 'Design in Progress' | 'Printing' | 'Quality Check' | 'Packed' | 'In Transit' | 'Delivered';
  isUrgent: boolean;
  mockupUrl: string;
  notes: string;
}

export const INITIAL_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: 'ord_1',
    orderId: 'TP-2026-8842',
    customerName: 'Rahul Sharma',
    email: 'rahul.s@iitb.ac.in',
    phone: '9876543210',
    orgName: 'IIT Bombay TechFest Committee',
    orgType: 'University',
    productName: 'Custom Kurta Seasonal Batch',
    category: 'Kurtas',
    totalPieces: 50,
    totalAmount: 19950,
    orderDate: 'Aug 10, 2026',
    estimatedDelivery: 'Aug 18, 2026',
    currentStage: 'Waiting for Approval',
    isUrgent: true,
    mockupUrl: '/images/kurtas/hero.png',
    notes: 'Requires gold foil emblem on left chest. Festival date is Aug 20.',
  },
  {
    id: 'ord_2',
    orderId: 'TP-2026-9011',
    customerName: 'Ananya Verma',
    email: 'ananya@techcorp.io',
    phone: '9811223344',
    orgName: 'ZettaScale Tech Inc.',
    orgType: 'Startup',
    productName: 'Heavyweight Oversized Streetwear Tee',
    category: 'T-Shirts',
    totalPieces: 120,
    totalAmount: 41880,
    orderDate: 'Aug 11, 2026',
    estimatedDelivery: 'Aug 21, 2026',
    currentStage: 'Printing',
    isUrgent: false,
    mockupUrl: '/images/products/oversized.png',
    notes: 'Boxy fit 240 GSM cotton. Back 3D puff print in Teal.',
  },
  {
    id: 'ord_3',
    orderId: 'TP-2026-9104',
    customerName: 'Vikramaditya Roy',
    email: 'roy@suburbansociety.org',
    phone: '9900112233',
    orgName: 'Greenwood Heights RWA Committee',
    orgType: 'Colony/Community',
    productName: 'Festive Printed Kurta Short Cut',
    category: 'Kurtas',
    totalPieces: 85,
    totalAmount: 38165,
    orderDate: 'Aug 09, 2026',
    estimatedDelivery: 'Aug 16, 2026',
    currentStage: 'Approved',
    isUrgent: true,
    mockupUrl: '/images/kurtas/hero.png',
    notes: 'Colony Ganesh Utsav core team. Sorted size bundles (M/L/XL).',
  },
  {
    id: 'ord_4',
    orderId: 'TP-2026-8720',
    customerName: 'Priya Nair',
    email: 'pnair@globalconsulting.com',
    phone: '9744556677',
    orgName: 'Global Consulting Group India',
    orgType: 'Corporate',
    productName: 'Classic Pique Corporate Polo Shirt',
    category: 'Polos',
    totalPieces: 200,
    totalAmount: 85800,
    orderDate: 'Aug 07, 2026',
    estimatedDelivery: 'Aug 17, 2026',
    currentStage: 'In Transit',
    isUrgent: false,
    mockupUrl: '/images/products/polo.png',
    notes: 'Navy Blue polos with high density left-chest embroidery.',
  },
  {
    id: 'ord_5',
    orderId: 'TP-2026-8519',
    customerName: 'Amitabh Sen',
    email: 'asen@stxaviers.edu',
    phone: '9833445566',
    orgName: 'St. Xavier\'s Cultural Club',
    orgType: 'University',
    productName: 'Premium Heavyweight Pullover Hoodie',
    category: 'Hoodies',
    totalPieces: 60,
    totalAmount: 47940,
    orderDate: 'Aug 05, 2026',
    estimatedDelivery: 'Aug 14, 2026',
    currentStage: 'Delivered',
    isUrgent: false,
    mockupUrl: '/images/products/hoodie.png',
    notes: 'Fleece lined 350 GSM hoodies with individual student names embroidered on sleeve.',
  },
];
