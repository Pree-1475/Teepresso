import { Request, Response } from 'express';
import { ordersDatabase, Order } from '../models/orderModel.js';
import { productsDatabase, Product } from '../../products/models/productModel.js';
import { usersDatabase } from '../../auth/models/userModel.js';
import { settingsDatabase } from '../../settings/models/settingsModel.js';
import { saveDb } from '../../../config/jsonDb.js';

// Get all orders (with optional role-based filtering or customer phone filtering)
export const getOrdersController = (req: Request, res: Response): void => {
  const { role, phone } = req.query;

  if (phone) {
    const customerOrders = ordersDatabase.filter(o => o.phone === String(phone));
    res.json({ success: true, orders: customerOrders });
    return;
  }

  if (role === 'manager') {
    // Limited operational access: only quantity, order details, points/status. No customer PII!
    const filteredOrders = ordersDatabase.map(order => ({
      id: order.id,
      orderId: order.orderId,
      orgName: order.orgName,
      productName: order.productName,
      category: order.category,
      totalPieces: order.totalPieces,
      currentStage: order.currentStage,
      isUrgent: order.isUrgent,
      paymentStatus: order.paymentStatus,
      estimatedDelivery: order.estimatedDelivery,
      orderDate: order.orderDate
    }));
    res.json({ success: true, orders: filteredOrders });
    return;
  }

  // Admin/Editor/Dispatch get full details (or appropriate details)
  res.json({ success: true, orders: ordersDatabase });
};

// Track a single order by ID (and optionally Phone for authorization)
export const trackOrderController = (req: Request, res: Response): void => {
  const { orderId, phone } = req.query;

  const match = ordersDatabase.find(
    o => o.orderId.toLowerCase() === String(orderId || '').toLowerCase() &&
         (!phone || o.phone === String(phone || ''))
  );

  if (!match) {
    res.status(404).json({
      success: false,
      message: 'Order not found',
    });
    return;
  }

  res.json({
    success: true,
    order: match,
  });
};

// Create customer order (from frontend client-app)
export const createOrderController = (req: Request, res: Response): void => {
  const { customerName, phone, email, orgName, orgType, productName, category, totalPieces, totalAmount, isUrgent, mockupUrl, notes } = req.body;

  const orderId = `TP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + (isUrgent ? 3 : 5));
  const deliveryStr = deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    orderId,
    customerName,
    email: email || `${customerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
    phone,
    orgName: orgName || 'Personal Order',
    orgType: orgType || 'Colony/Community',
    productName,
    category,
    totalPieces: Number(totalPieces),
    totalAmount: Number(totalAmount),
    orderDate: dateStr,
    estimatedDelivery: deliveryStr,
    currentStage: 'Order Placed',
    isUrgent: !!isUrgent,
    paymentStatus: 'Paid', // assume storefront payment is completed
    paymentDetails: {
      method: 'UPI',
      transactionId: `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      date: dateStr,
    },
    mockupUrl: mockupUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=250',
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
    notes: notes || '',
  };

  ordersDatabase.push(newOrder);

  // Sync / Upsert Customer Profile in usersDatabase
  if (phone) {
    const existingUser = usersDatabase.find(u => u.phone === phone || (email && u.email === email));
    if (existingUser) {
      if (customerName) existingUser.name = customerName;
      if (email) existingUser.email = email;
      if (orgName) existingUser.orgName = orgName;
      if (orgType) existingUser.orgType = orgType;
      existingUser.totalOrders = (existingUser.totalOrders || 0) + 1;
      existingUser.totalSpent = (existingUser.totalSpent || 0) + Number(totalAmount || 0);
      existingUser.lastOrderDate = dateStr;
    } else {
      const newUser = {
        id: `c_${Date.now()}`,
        name: customerName || '',
        email: email || '',
        phone: phone || '',
        orgName: orgName || '',
        orgType: orgType || 'Corporate',
        totalOrders: 1,
        totalSpent: Number(totalAmount || 0),
        lastOrderDate: dateStr,
        role: 'customer' as const,
        createdAt: new Date()
      };
      usersDatabase.push(newUser);
    }
  }

  saveDb();
  res.status(201).json({
    success: true,
    order: newOrder,
  });
};

// Helper to decrement product inventory stock on paid orders
const decrementProductStock = (items: any[]) => {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    if (!item.productId) continue;
    const prod = productsDatabase.find(p => p.id === item.productId);
    if (prod) {
      const qty = Number(item.qty || 1);
      if (prod.stock !== undefined && prod.stock !== null) {
        prod.stock = Math.max(0, prod.stock - qty);
      }
      if (prod.sizesStock && typeof prod.sizesStock === 'object') {
        const key3 = `${item.color}_${item.pattern}_${item.size}`;
        const key2 = `${item.color}_${item.size}`;
        if (prod.sizesStock[key3] !== undefined) {
          prod.sizesStock[key3] = Math.max(0, Number(prod.sizesStock[key3]) - qty);
        } else if (prod.sizesStock[key2] !== undefined) {
          prod.sizesStock[key2] = Math.max(0, Number(prod.sizesStock[key2]) - qty);
        } else if (item.size && prod.sizesStock[item.size] !== undefined) {
          prod.sizesStock[item.size] = Math.max(0, Number(prod.sizesStock[item.size]) - qty);
        }
      }
    }
  }
};

// Create offline customer order (Manager Panel feature)
export const createOfflineOrderController = (req: Request, res: Response): void => {
  const { customerName, phone, orgName, productName, category, totalPieces, totalAmount, paymentStatus, items, notes } = req.body;

  const orderId = `TP-${new Date().getFullYear()}-OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const deliveryStr = deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    orderId,
    customerName,
    email: 'offline-customer@teepresso.com',
    phone,
    orgName: orgName || 'Offline Customer Walkin',
    orgType: 'Offline',
    productName,
    category,
    totalPieces: Number(totalPieces),
    totalAmount: Number(totalAmount),
    orderDate: dateStr,
    estimatedDelivery: deliveryStr,
    currentStage: 'Order Placed',
    isUrgent: false,
    paymentStatus: paymentStatus || 'Pending',
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
    notes: notes || 'Offline Order',
    items: Array.isArray(items) ? items : []
  };

  ordersDatabase.push(newOrder);
  decrementProductStock(newOrder.items || []);
  saveDb();
  res.status(201).json({
    success: true,
    order: newOrder,
  });
};

// Generate QR payment collection link/code (Manager Panel)
export const collectQRPaymentController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const order = ordersDatabase.find(o => o.id === id);

  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  // Fetch dynamic merchant UPI settings
  const upiSetting = settingsDatabase.find(s => s.key === 'upiVpa');
  const upiVpa = upiSetting ? upiSetting.value : 'teepresso@upi';
  const payeeSetting = settingsDatabase.find(s => s.key === 'payeeName');
  const payeeName = payeeSetting ? payeeSetting.value : 'Teepresso Enterprise';

  // Generate real UPI QR Code payload
  const upiPayload = `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(payeeName)}&am=${order.totalAmount}&cu=INR&tn=Order_${order.orderId}`;
  
  // Return functional QR data URI
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayload)}`;

  res.json({
    success: true,
    upiLink: upiPayload,
    qrUrl: qrImage,
    amount: order.totalAmount,
    orderId: order.orderId,
    vpa: upiVpa
  });
};

// Confirm payment for offline QR order
export const confirmOfflinePaymentController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const order = ordersDatabase.find(o => o.id === id);

  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  order.paymentStatus = 'Paid';
  order.paymentDetails = {
    method: 'QR Code',
    transactionId: `TXN-UPI-${Math.floor(100000000 + Math.random() * 900000000)}`,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };

  saveDb();
  res.json({
    success: true,
    message: 'Payment confirmed via QR code successfully',
    order
  });
};

// Update order stage (Admin / Dispatcher / Manager)
export const updateOrderStageController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { stage } = req.body;

  const order = ordersDatabase.find(o => o.id === id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  order.currentStage = stage;
  saveDb();
  res.json({ success: true, message: `Order stage updated to ${stage}`, order });
};

// Mockup Upload & Updates (Editing / Mockup Panel)
export const updateOrderMockupController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { mockupUrl, softCopyUrl, status, action, revisionNote } = req.body;

  const order = ordersDatabase.find(o => o.id === id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  if (mockupUrl) order.mockupUrl = mockupUrl;
  if (softCopyUrl) order.softCopyUrl = softCopyUrl;
  if (status) {
    order.mockupStatus = status;
    if (status === 'Approved') {
      order.hasWatermark = false; // Turn off watermark when approved
      order.currentStage = 'Approved'; // Update order stage
    } else if (status === 'Revision Requested') {
      order.currentStage = 'Design in Progress';
      if (revisionNote) {
        order.revisionNote = revisionNote;
      }
    }
  }

  if (action === 'send_whatsapp') {
    order.whatsappNotificationSent = true;
    order.mockupStatus = 'Customer Approval Pending';
  }

  saveDb();
  res.json({
    success: true,
    message: action === 'send_whatsapp' ? 'Mockup sent via WhatsApp notification simulation' : 'Mockup updated successfully',
    order
  });
};

// Dispatch & shipping validation and label generation (Dispatch & Shipping Panel)
export const updateDispatchController = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { pieceCountVerified, qualityPassed, shippingLabelGenerated, invoiceGenerated, shippingPartner, trackingNumber } = req.body;

  const order = ordersDatabase.find(o => o.id === id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  if (pieceCountVerified !== undefined) order.dispatchDetails.pieceCountVerified = pieceCountVerified;
  if (qualityPassed !== undefined) order.dispatchDetails.qualityPassed = qualityPassed;
  
  if (shippingLabelGenerated) {
    order.dispatchDetails.shippingLabelGenerated = true;
    order.dispatchDetails.shippingPartner = shippingPartner || 'Delhivery';
    order.dispatchDetails.trackingNumber = trackingNumber || `TRK-${Math.floor(1000000 + Math.random() * 9000000)}`;
    
    // Additional Rule: If order value exceeds ₹50,000, E-Way Bill should be automatically generated!
    if (order.totalAmount > 50000 && !order.dispatchDetails.ewayBillNumber) {
      order.dispatchDetails.ewayBillNumber = `EWB-${new Date().getFullYear()}${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    }
  }

  if (invoiceGenerated) {
    order.dispatchDetails.invoiceGenerated = true;
  }

  saveDb();
  res.json({
    success: true,
    message: 'Dispatch details updated successfully',
    order
  });
};
