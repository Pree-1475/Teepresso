import { uploadBase64ToGCS } from '../../../config/storageService.js';
import { Request, Response } from 'express';
import { sql } from '../../../config/db.js';

export const getOrdersController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await sql`SELECT * FROM orders ORDER BY "createdAt" DESC`;
    res.json({ success: true, orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
};

export const createOfflineOrderController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, phone, orgName, productName, category, totalPieces, totalAmount, paymentStatus, items, notes } = req.body;

    const orderId = `TP-${new Date().getFullYear()}-OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    const deliveryStr = deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const id = `ord_${Date.now()}`;

    const newOrder = {
      id,
      orderId,
      customerName: customerName || 'Walk-in Customer',
      email: 'offline-customer@teepresso.com',
      phone: phone || '',
      orgName: orgName || 'Offline Customer Walkin',
      orgType: 'Offline',
      productName: productName || 'Custom Apparel',
      category: category || 'General',
      totalPieces: Number(totalPieces || 1),
      totalAmount: Number(totalAmount || 0),
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
      dispatchDetails: JSON.stringify({
        pieceCountVerified: false,
        qualityPassed: false,
        shippingLabelGenerated: false,
        invoiceGenerated: false,
        shippingPartner: '',
        trackingNumber: '',
      }),
      notes: notes || 'Offline Order',
      items: JSON.stringify(Array.isArray(items) ? items : [])
    };

    await sql`
      INSERT INTO orders (
        id, "orderId", "customerName", email, phone, "orgName", "orgType",
        "productName", category, "totalPieces", "totalAmount", "orderDate",
        "estimatedDelivery", "currentStage", "isUrgent", "paymentStatus",
        "paymentDetails", "mockupUrl", "mockupStatus", "softCopyUrl",
        "hasWatermark", "whatsappNotificationSent", "dispatchDetails", notes, items
      ) VALUES (
        ${newOrder.id}, ${newOrder.orderId}, ${newOrder.customerName}, ${newOrder.email}, ${newOrder.phone}, ${newOrder.orgName}, ${newOrder.orgType},
        ${newOrder.productName}, ${newOrder.category}, ${newOrder.totalPieces}, ${newOrder.totalAmount}, ${newOrder.orderDate},
        ${newOrder.estimatedDelivery}, ${newOrder.currentStage}, ${newOrder.isUrgent}, ${newOrder.paymentStatus},
        ${newOrder.paymentDetails}, ${newOrder.mockupUrl}, ${newOrder.mockupStatus}, ${newOrder.softCopyUrl},
        ${newOrder.hasWatermark}, ${newOrder.whatsappNotificationSent}, ${newOrder.dispatchDetails}::jsonb, ${newOrder.notes}, ${newOrder.items}::jsonb
      )
    `;

    res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (err) {
    console.error('Error creating offline order:', err);
    res.status(500).json({ success: false, message: (err as Error).message || 'Server error creating order' });
  }
};

export const collectQRPaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const orders = await sql`SELECT * FROM orders WHERE id = ${id}`;
    if (orders.length === 0) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const order = orders[0];
    const upiVpa = 'teepresso@upi';
    const payeeName = 'Teepresso Enterprise';
    const upiPayload = `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(payeeName)}&am=${order.totalAmount}&cu=INR&tn=Order_${order.orderId}`;
    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayload)}`;

    res.json({
      success: true,
      upiLink: upiPayload,
      qrUrl: qrImage,
      amount: order.totalAmount,
      orderId: order.orderId,
      vpa: upiVpa
    });
  } catch (err) {
    console.error('Error collecting QR payment:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const confirmOfflinePaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const paymentDetails = JSON.stringify({
      method: 'QR Code',
      transactionId: `TXN-UPI-${Math.floor(100000000 + Math.random() * 900000000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });

    await sql`
      UPDATE orders 
      SET "paymentStatus" = 'Paid', "paymentDetails" = ${paymentDetails}::jsonb
      WHERE id = ${id}
    `;

    const updated = await sql`SELECT * FROM orders WHERE id = ${id}`;
    res.json({ success: true, message: 'Payment confirmed via QR code successfully', order: updated[0] });
  } catch (err) {
    console.error('Error confirming payment:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateOrderStageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    await sql`
      UPDATE orders 
      SET "currentStage" = ${stage}
      WHERE id = ${id}
    `;

    const updated = await sql`SELECT * FROM orders WHERE id = ${id}`;
    res.json({ success: true, message: `Order stage updated to ${stage}`, order: updated[0] });
  } catch (err) {
    console.error('Error updating order stage:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateOrderMockupController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { mockupUrl, softCopyUrl, status, action, revisionNote } = req.body;

    let finalMockupUrl = mockupUrl;
    let finalSoftCopyUrl = softCopyUrl;

    if (mockupUrl && mockupUrl.startsWith('data:')) {
      try {
        finalMockupUrl = await uploadBase64ToGCS(mockupUrl, `mockups/order_${id}_${Date.now()}.png`);
      } catch (e) {
        console.error('Failed to upload mockup to GCS:', e);
      }
    }

    if (softCopyUrl && softCopyUrl.startsWith('data:')) {
      try {
        finalSoftCopyUrl = await uploadBase64ToGCS(softCopyUrl, `softcopies/order_${id}_${Date.now()}.png`);
      } catch (e) {
        console.error('Failed to upload soft copy to GCS:', e);
      }
    }

    if (finalMockupUrl) {
      await sql`UPDATE orders SET "mockupUrl" = ${finalMockupUrl} WHERE id = ${id}`;
    }
    if (finalSoftCopyUrl) {
      await sql`UPDATE orders SET "softCopyUrl" = ${finalSoftCopyUrl} WHERE id = ${id}`;
    }
    if (status) {
      await sql`UPDATE orders SET "mockupStatus" = ${status} WHERE id = ${id}`;
      if (status === 'Approved') {
        await sql`UPDATE orders SET "hasWatermark" = false, "currentStage" = 'Approved' WHERE id = ${id}`;
      } else if (status === 'Revision Requested') {
        await sql`UPDATE orders SET "currentStage" = 'Design in Progress' WHERE id = ${id}`;
      }
    }
    if (action === 'send_whatsapp') {
      await sql`UPDATE orders SET "whatsappNotificationSent" = true, "mockupStatus" = 'Customer Approval Pending' WHERE id = ${id}`;
    }

    const updated = await sql`SELECT * FROM orders WHERE id = ${id}`;
    res.json({
      success: true,
      message: action === 'send_whatsapp' ? 'Mockup sent via WhatsApp notification simulation' : 'Mockup updated successfully',
      order: updated[0]
    });
  } catch (err) {
    console.error('Error updating mockup:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateDispatchController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { pieceCountVerified, qualityPassed, shippingLabelGenerated, invoiceGenerated, shippingPartner, trackingNumber } = req.body;

    const orders = await sql`SELECT * FROM orders WHERE id = ${id}`;
    if (orders.length === 0) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const order = orders[0];
    const details = typeof order.dispatchDetails === 'string' ? JSON.parse(order.dispatchDetails) : (order.dispatchDetails || {});

    if (pieceCountVerified !== undefined) details.pieceCountVerified = pieceCountVerified;
    if (qualityPassed !== undefined) details.qualityPassed = qualityPassed;

    if (shippingLabelGenerated) {
      details.shippingLabelGenerated = true;
      details.shippingPartner = shippingPartner || 'Delhivery';
      details.trackingNumber = trackingNumber || `TRK-${Math.floor(1000000 + Math.random() * 9000000)}`;

      if (order.totalAmount > 50000 && !details.ewayBillNumber) {
        details.ewayBillNumber = `EWB-${new Date().getFullYear()}${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      }
    }

    if (invoiceGenerated) {
      details.invoiceGenerated = true;
    }

    await sql`
      UPDATE orders 
      SET "dispatchDetails" = ${JSON.stringify(details)}::jsonb
      WHERE id = ${id}
    `;

    const updated = await sql`SELECT * FROM orders WHERE id = ${id}`;
    res.json({
      success: true,
      message: 'Dispatch details updated successfully',
      order: updated[0]
    });
  } catch (err) {
    console.error('Error updating dispatch:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const trackOrderController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, emailOrPhone } = req.query;
    if (!orderId) {
      res.status(400).json({ success: false, message: 'Order ID is required' });
      return;
    }

    const orders = await sql`
      SELECT * FROM orders 
      WHERE "orderId" = ${String(orderId)} OR id = ${String(orderId)}
      LIMIT 1
    `;

    if (orders.length === 0) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({ success: true, order: orders[0] });
  } catch (err) {
    console.error('Error tracking order:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createOrderController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, email, phone, orgName, orgType, productName, category, totalPieces, totalAmount, items, notes } = req.body;
    const orderId = `TP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    const deliveryStr = deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const id = `ord_${Date.now()}`;

    const newOrder = {
      id,
      orderId,
      customerName: customerName || 'Online Customer',
      email: email || 'customer@teepresso.com',
      phone: phone || '',
      orgName: orgName || 'Individual / Society',
      orgType: orgType || 'Online Order',
      productName: productName || 'Custom Group Order',
      category: category || 'General',
      totalPieces: Number(totalPieces || 1),
      totalAmount: Number(totalAmount || 0),
      orderDate: dateStr,
      estimatedDelivery: deliveryStr,
      currentStage: 'Order Placed',
      isUrgent: false,
      paymentStatus: 'Pending',
      paymentDetails: null,
      mockupUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=250',
      mockupStatus: 'Pending Editing',
      softCopyUrl: null,
      hasWatermark: true,
      whatsappNotificationSent: false,
      dispatchDetails: JSON.stringify({
        pieceCountVerified: false,
        qualityPassed: false,
        shippingLabelGenerated: false,
        invoiceGenerated: false,
        shippingPartner: '',
        trackingNumber: '',
      }),
      notes: notes || 'Online Order',
      items: JSON.stringify(Array.isArray(items) ? items : [])
    };

    await sql`
      INSERT INTO orders (
        id, "orderId", "customerName", email, phone, "orgName", "orgType",
        "productName", category, "totalPieces", "totalAmount", "orderDate",
        "estimatedDelivery", "currentStage", "isUrgent", "paymentStatus",
        "paymentDetails", "mockupUrl", "mockupStatus", "softCopyUrl",
        "hasWatermark", "whatsappNotificationSent", "dispatchDetails", notes, items
      ) VALUES (
        ${newOrder.id}, ${newOrder.orderId}, ${newOrder.customerName}, ${newOrder.email}, ${newOrder.phone}, ${newOrder.orgName}, ${newOrder.orgType},
        ${newOrder.productName}, ${newOrder.category}, ${newOrder.totalPieces}, ${newOrder.totalAmount}, ${newOrder.orderDate},
        ${newOrder.estimatedDelivery}, ${newOrder.currentStage}, ${newOrder.isUrgent}, ${newOrder.paymentStatus},
        ${newOrder.paymentDetails}, ${newOrder.mockupUrl}, ${newOrder.mockupStatus}, ${newOrder.softCopyUrl},
        ${newOrder.hasWatermark}, ${newOrder.whatsappNotificationSent}, ${newOrder.dispatchDetails}::jsonb, ${newOrder.notes}, ${newOrder.items}::jsonb
      )
    `;

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateOrderFullController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { currentStage, paymentStatus, notes, customerName, email, phone, isUrgent } = req.body;

    const existing = await sql`SELECT * FROM orders WHERE id = ${id}`;
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    await sql`
      UPDATE orders
      SET "currentStage" = COALESCE(${currentStage}, "currentStage"),
          "paymentStatus" = COALESCE(${paymentStatus}, "paymentStatus"),
          notes = COALESCE(${notes}, notes),
          "customerName" = COALESCE(${customerName}, "customerName"),
          email = COALESCE(${email}, email),
          phone = COALESCE(${phone}, phone),
          "isUrgent" = COALESCE(${isUrgent}, "isUrgent")
      WHERE id = ${id}
    `;

    const updated = await sql`SELECT * FROM orders WHERE id = ${id}`;
    res.json({ success: true, message: 'Order updated successfully', order: updated[0] });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ success: false, message: 'Server error updating order' });
  }
};
