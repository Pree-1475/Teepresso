import { Request, Response } from 'express';
import { inventoryDatabase, InventoryItem, InventoryTransaction } from '../models/inventoryModel.js';
import { saveDb } from '../../../config/jsonDb.js';

export const getInventoryController = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    inventory: inventoryDatabase,
  });
};

export const updateStockController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { type, size, quantity, notes, handler } = req.body;

  const item = inventoryDatabase.find(i => i.id === id);
  if (!item) {
    res.status(404).json({ success: false, message: 'Inventory item not found' });
    return;
  }

  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) {
    res.status(400).json({ success: false, message: 'Invalid quantity' });
    return;
  }

  // Update sizesStock
  const currentSizes = item.sizesStock as any;
  if (!(size in currentSizes)) {
    res.status(400).json({ success: false, message: `Invalid size: ${size}` });
    return;
  }

  if (type === 'OUT' && currentSizes[size] < qty) {
    res.status(400).json({
      success: false,
      message: `Insufficient stock for size ${size}. Available: ${currentSizes[size]}, Requested: ${qty}`
    });
    return;
  }

  if (type === 'IN') {
    currentSizes[size] += qty;
    item.totalStock += qty;
  } else if (type === 'OUT') {
    currentSizes[size] -= qty;
    item.totalStock -= qty;
  }

  // Add transaction
  const newTx: InventoryTransaction = {
    type,
    quantity: qty,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    notes: notes || `${type === 'IN' ? 'Stocked in' : 'Stocked out'} size ${size}`,
    handler: handler || 'Manager',
  };

  item.transactions.unshift(newTx);
  saveDb();

  res.json({
    success: true,
    message: `Stock updated successfully: size ${size} ${type === 'IN' ? 'increased' : 'decreased'} by ${qty}`,
    item,
  });
};

