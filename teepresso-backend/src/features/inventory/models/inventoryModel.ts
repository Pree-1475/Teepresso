import { registerDatabase } from '../../../config/jsonDb.js';

export interface InventoryTransaction {
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  notes: string;
  handler: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Fabric' | 'T-Shirt Blank' | 'Kurta Blank' | 'Polo Blank' | 'Hoodie Blank';
  gsm: number;
  color: string;
  sizesStock: {
    S: number;
    M: number;
    L: number;
    XL: number;
    XXL: number;
  };
  totalStock: number;
  reorderPoint: number;
  unit: string;
  transactions: InventoryTransaction[];
}

export const inventoryDatabase: InventoryItem[] = [
  {
    id: 'inv_1',
    name: 'Teepresso Oversized Heavy Cotton Blank',
    category: 'T-Shirt Blank',
    gsm: 240,
    color: 'Matte Black',
    sizesStock: { S: 150, M: 280, L: 450, XL: 310, XXL: 90 },
    totalStock: 1280,
    reorderPoint: 300,
    unit: 'Pcs',
    transactions: [
      { type: 'IN', quantity: 500, date: 'Aug 05, 2026', notes: 'Factory batch delivery', handler: 'Manager' },
      { type: 'OUT', quantity: 120, date: 'Aug 11, 2026', notes: 'Allocated to Order #TP-2026-9011', handler: 'Manager' }
    ]
  },
  {
    id: 'inv_2',
    name: 'Teepresso Oversized Heavy Cotton Blank',
    category: 'T-Shirt Blank',
    gsm: 240,
    color: 'Off-White',
    sizesStock: { S: 80, M: 120, L: 140, XL: 95, XXL: 40 },
    totalStock: 475,
    reorderPoint: 200,
    unit: 'Pcs',
    transactions: [
      { type: 'IN', quantity: 200, date: 'Aug 01, 2026', notes: 'Restocked by procurement', handler: 'Manager' }
    ]
  },
  {
    id: 'inv_3',
    name: 'Teepresso Corporate Pique Blank',
    category: 'Polo Blank',
    gsm: 220,
    color: 'Navy Blue',
    sizesStock: { S: 200, M: 300, L: 250, XL: 180, XXL: 70 },
    totalStock: 1000,
    reorderPoint: 250,
    unit: 'Pcs',
    transactions: [
      { type: 'OUT', quantity: 200, date: 'Aug 07, 2026', notes: 'Allocated to Order #TP-2026-8720', handler: 'Manager' }
    ]
  },
  {
    id: 'inv_4',
    name: 'Festive Cotton Kurta Blend Blank',
    category: 'Kurta Blank',
    gsm: 180,
    color: 'Maroon Gold Accent',
    sizesStock: { S: 45, M: 50, L: 20, XL: 15, XXL: 5 },
    totalStock: 135, // Low stock! Less than reorder point (150)
    reorderPoint: 150,
    unit: 'Pcs',
    transactions: [
      { type: 'OUT', quantity: 50, date: 'Aug 10, 2026', notes: 'Allocated to Order #TP-2026-8842', handler: 'Manager' }
    ]
  },
  {
    id: 'inv_5',
    name: 'Premium Heavyweight Fleece Blank',
    category: 'Hoodie Blank',
    gsm: 350,
    color: 'Melange Grey',
    sizesStock: { S: 90, M: 140, L: 160, XL: 120, XXL: 50 },
    totalStock: 560,
    reorderPoint: 150,
    unit: 'Pcs',
    transactions: [
      { type: 'IN', quantity: 300, date: 'Jul 28, 2026', notes: 'Winter stock pre-order arrival', handler: 'Manager' }
    ]
  }
];

registerDatabase('inventory', inventoryDatabase);

