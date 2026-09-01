import { registerDatabase } from '../../../config/jsonDb.js';

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  orgName: string;
  orgType: 'University' | 'Corporate' | 'Startup' | 'Colony/Community' | 'Event Organizers' | 'Offline';
  productName: string;
  category: string;
  totalPieces: number;
  totalAmount: number;
  orderDate: string;
  estimatedDelivery: string;
  currentStage: 'Order Placed' | 'Waiting for Approval' | 'Approved' | 'Design in Progress' | 'Printing' | 'Quality Check' | 'Packed' | 'In Transit' | 'Delivered';
  isUrgent: boolean;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  paymentDetails: {
    method: 'UPI' | 'Card' | 'NetBanking' | 'QR Code' | 'Cash';
    transactionId: string;
    date: string;
  } | null;
  mockupUrl: string;
  mockupStatus: 'Pending Editing' | 'Customer Approval Pending' | 'Approved' | 'Revision Requested';
  revisionNote?: string;
  softCopyUrl: string | null; // Only visible to editors
  hasWatermark: boolean; // Watermark on until approved
  whatsappNotificationSent: boolean;
  dispatchDetails: {
    pieceCountVerified: boolean;
    qualityPassed: boolean;
    shippingLabelGenerated: boolean;
    invoiceGenerated: boolean;
    shippingPartner: string;
    trackingNumber: string;
    ewayBillNumber?: string; // Auto-generated if value > 50,000
  };
  notes: string;
  items?: any[];
}

export const ordersDatabase: Order[] = [
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
    paymentStatus: 'Paid',
    paymentDetails: {
      method: 'UPI',
      transactionId: 'TXN-982348911',
      date: 'Aug 10, 2026',
    },
    mockupUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=250',
    mockupStatus: 'Customer Approval Pending',
    softCopyUrl: 'https://designs.teepresso.com/iitb_techfest_final.ai',
    hasWatermark: true,
    whatsappNotificationSent: true,
    dispatchDetails: {
      pieceCountVerified: false,
      qualityPassed: false,
      shippingLabelGenerated: false,
      invoiceGenerated: false,
      shippingPartner: '',
      trackingNumber: '',
    },
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
    totalPieces: 320, // > 300: triggers manual follow-up notification!
    totalAmount: 112000, // > 50,000: triggers E-Way Bill!
    orderDate: 'Aug 11, 2026',
    estimatedDelivery: 'Aug 21, 2026',
    currentStage: 'Printing',
    isUrgent: false,
    paymentStatus: 'Paid',
    paymentDetails: {
      method: 'Card',
      transactionId: 'TXN-882194012',
      date: 'Aug 11, 2026',
    },
    mockupUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=250',
    mockupStatus: 'Approved',
    softCopyUrl: 'https://designs.teepresso.com/zettascale_streetwear.ai',
    hasWatermark: false,
    whatsappNotificationSent: true,
    dispatchDetails: {
      pieceCountVerified: true,
      qualityPassed: false,
      shippingLabelGenerated: false,
      invoiceGenerated: false,
      shippingPartner: '',
      trackingNumber: '',
    },
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
    paymentStatus: 'Paid',
    paymentDetails: {
      method: 'UPI',
      transactionId: 'TXN-773821094',
      date: 'Aug 09, 2026',
    },
    mockupUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=250',
    mockupStatus: 'Approved',
    softCopyUrl: 'https://designs.teepresso.com/greenwood_festive.pdf',
    hasWatermark: false,
    whatsappNotificationSent: true,
    dispatchDetails: {
      pieceCountVerified: true,
      qualityPassed: true,
      shippingLabelGenerated: true,
      invoiceGenerated: true,
      shippingPartner: 'Delhivery',
      trackingNumber: 'DEL-9923891',
    },
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
    totalAmount: 85800, // > 50,000: triggers E-Way Bill!
    orderDate: 'Aug 07, 2026',
    estimatedDelivery: 'Aug 17, 2026',
    currentStage: 'In Transit',
    isUrgent: false,
    paymentStatus: 'Paid',
    paymentDetails: {
      method: 'NetBanking',
      transactionId: 'TXN-129481023',
      date: 'Aug 07, 2026',
    },
    mockupUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=250',
    mockupStatus: 'Approved',
    softCopyUrl: 'https://designs.teepresso.com/gcg_polo_corporate.eps',
    hasWatermark: false,
    whatsappNotificationSent: true,
    dispatchDetails: {
      pieceCountVerified: true,
      qualityPassed: true,
      shippingLabelGenerated: true,
      invoiceGenerated: true,
      shippingPartner: 'BlueDart',
      trackingNumber: 'BD-8823481',
      ewayBillNumber: 'EWB-202688472910',
    },
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
    paymentStatus: 'Paid',
    paymentDetails: {
      method: 'UPI',
      transactionId: 'TXN-662381290',
      date: 'Aug 05, 2026',
    },
    mockupUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=250',
    mockupStatus: 'Approved',
    softCopyUrl: 'https://designs.teepresso.com/stxaviers_hoodie.ai',
    hasWatermark: false,
    whatsappNotificationSent: true,
    dispatchDetails: {
      pieceCountVerified: true,
      qualityPassed: true,
      shippingLabelGenerated: true,
      invoiceGenerated: true,
      shippingPartner: 'Delhivery',
      trackingNumber: 'DEL-4412984',
    },
    notes: 'Fleece lined 350 GSM hoodies with individual student names.',
  },
  {
    id: 'ord_6',
    orderId: 'TP-2026-OFFLINE-9812',
    customerName: 'Ritesh Deshmukh (Offline)',
    email: 'ritesh@gmail.com',
    phone: '9822334455',
    orgName: 'Local Gym Crew',
    orgType: 'Offline',
    productName: 'Heavyweight Oversized Streetwear Tee',
    category: 'T-Shirts',
    totalPieces: 45,
    totalAmount: 15705,
    orderDate: 'Aug 12, 2026',
    estimatedDelivery: 'Aug 17, 2026',
    currentStage: 'Order Placed',
    isUrgent: false,
    paymentStatus: 'Pending',
    paymentDetails: null,
    mockupUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=250',
    mockupStatus: 'Pending Editing',
    softCopyUrl: null,
    hasWatermark: true,
    whatsappNotificationSent: false,
    dispatchDetails: {
      pieceCountVerified: false,
      qualityPassed: false,
      shippingLabelGenerated: false,
      invoiceGenerated: false,
      shippingPartner: '',
      trackingNumber: '',
    },
    notes: 'Offline order created by Manager. Requires QR payment collection.',
  }
];

registerDatabase('orders', ordersDatabase);

