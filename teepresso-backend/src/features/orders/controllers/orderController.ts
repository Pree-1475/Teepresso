import { Request, Response } from 'express';
import { ordersDatabase, Order } from '../models/orderModel.js';

// Get all orders (with optional role-based filtering)
export const getOrdersController = (req: Request, res: Response): void => {
  const { role } = req.query;

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
  res.status(201).json({
    success: true,
    order: newOrder,
  });
};

// Create offline customer order (Manager Panel feature)
export const createOfflineOrderController = (req: Request, res: Response): void => {
  const { customerName, phone, orgName, productName, category, totalPieces, totalAmount, notes } = req.body;

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
    paymentStatus: 'Pending', // Offline orders default to pending until QR payment collected
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
  };

  ordersDatabase.push(newOrder);
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

  // Generate simulated UPI QR Code payload
  const upiPayload = `upi://pay?pa=pay@teepresso&pn=Teepresso&am=${order.totalAmount}&cu=INR&tn=Order_${order.orderId}`;
  
  // Return simulated QR data URI (a placeholder QR image using chart API)
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayload)}`;

  res.json({
    success: true,
    upiLink: upiPayload,
    qrUrl: qrImage,
    amount: order.totalAmount,
    orderId: order.orderId
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

  res.json({
    success: true,
    message: 'Dispatch details updated successfully',
    order
  });
};
