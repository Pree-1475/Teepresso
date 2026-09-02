export type OrderStage = 
  | 'Order Placed'
  | 'Mockup Approved'
  | 'In Transit'
  | 'Delivered';

export const TRACKING_STAGES: OrderStage[] = [
  'Order Placed',
  'Mockup Approved',
  'In Transit',
  'Delivered',
];

export interface TrackedOrder {
  orderId: string;
  phone: string;
  customerName: string;
  productName: string;
  color: string;
  totalPieces: number;
  orderDate: string;
  estimatedDelivery: string;
  currentStage: OrderStage;
  isUrgent: boolean;
  watermarkedMockupUrl: string;
  whatsappLink: string;
  customerNote?: string;
  revisionRequested?: boolean;
  revisionComment?: string;
}

export const MOCK_ORDERS_DATABASE: TrackedOrder[] = [
  {
    orderId: 'TP-2026-8842',
    phone: '9876543210',
    customerName: 'Rahul Sharma',
    productName: 'Classic Round Neck T-Shirt',
    color: 'Warm Brown',
    totalPieces: 75,
    orderDate: 'Aug 06, 2026',
    estimatedDelivery: 'Aug 11, 2026',
    currentStage: 'Order Placed',
    isUrgent: false,
    watermarkedMockupUrl: '/images/products/tshirt.png',
    whatsappLink: 'https://wa.me/919876543210?text=Hi%20Teepresso%2C%20I%20am%20reviewing%20mockup%20for%20order%20TP-2026-8842',
  },
  {
    orderId: 'TP-2026-1049',
    phone: '9123456789',
    customerName: 'Priya Patel',
    productName: 'Custom Group Kurta',
    color: 'Cream Beige',
    totalPieces: 120,
    orderDate: 'Aug 07, 2026',
    estimatedDelivery: 'Aug 10, 2026',
    currentStage: 'In Transit',
    isUrgent: true,
    watermarkedMockupUrl: '/images/kurtas/hero.png',
    whatsappLink: 'https://wa.me/919123456789?text=Hi%20Teepresso%2C%20checking%20order%20TP-2026-1049',
  },
];
