import { Request, Response } from 'express';
import { sql } from '../../../config/db.js';

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrPhone, password } = req.body;
    const users = await sql`
      SELECT * FROM users 
      WHERE email = ${emailOrPhone} OR phone = ${emailOrPhone}
      LIMIT 1
    `;

    if (users.length === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const user = users[0];

    // Basic plaintext password check (production should use bcrypt)
    if (password && user.password && user.password !== password) {
      res.status(401).json({ success: false, message: 'Invalid password' });
      return;
    }

    res.json({
      success: true,
      message: 'Authentication successful',
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const registerController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;
    const id = `usr_${Date.now()}`;
    const role = 'customer';
    const pass = password || 'customer123';

    await sql`
      INSERT INTO users (id, name, email, phone, role, password)
      VALUES (${id}, ${name}, ${email}, ${phone}, ${role}, ${pass})
    `;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id, name, email, phone, role, createdAt: new Date() },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getUsersController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await sql`SELECT * FROM users ORDER BY "createdAt" DESC`;
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCustomersController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await sql`
      SELECT * FROM users WHERE role = 'customer' OR role IS NULL ORDER BY "createdAt" DESC
    `;
    const orders = await sql`SELECT * FROM orders`;

    const enrichedCustomers = users.map((u: any) => {
      const userEmail = (u.email || '').toLowerCase();
      const userPhone = u.phone || '';

      const matchedOrders = orders.filter((o: any) => {
        const orderEmail = (o.email || '').toLowerCase();
        const orderPhone = o.phone || '';
        return (userEmail && orderEmail === userEmail) || (userPhone && orderPhone === userPhone);
      });

      const totalOrders = matchedOrders.length;
      const totalSpent = matchedOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0);
      const lastOrder = matchedOrders.sort((a: any, b: any) => new Date(b.createdAt || b.orderDate || 0).getTime() - new Date(a.createdAt || a.orderDate || 0).getTime())[0];

      return {
        ...u,
        totalOrders,
        totalSpent,
        lastOrderDate: lastOrder ? (lastOrder.orderDate || 'Recent') : 'No orders yet'
      };
    });

    res.json({ success: true, customers: enrichedCustomers });
  } catch (err) {
    console.error('Error fetching dynamic customers:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const otpLoginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, message: 'Phone number is required' });
      return;
    }

    let users = await sql`SELECT * FROM users WHERE phone = ${phone} LIMIT 1`;
    let user = users[0];

    if (!user) {
      const id = `c_${Date.now()}`;
      await sql`
        INSERT INTO users (id, name, email, phone, role)
        VALUES (${id}, '', '', ${phone}, 'customer')
      `;
      const newUsers = await sql`SELECT * FROM users WHERE id = ${id}`;
      user = newUsers[0];
    }

    res.json({
      success: true,
      message: 'OTP Login successful',
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, role, password } = req.body;
    const id = `usr_${Date.now()}`;
    const userRole = role || 'editor';
    const pass = password || 'teepresso123';

    await sql`
      INSERT INTO users (id, name, email, phone, role, password)
      VALUES (${id}, ${name}, ${email}, ${phone || null}, ${userRole}, ${pass})
    `;

    const users = await sql`SELECT * FROM users WHERE id = ${id}`;
    res.status(201).json({
      success: true,
      message: 'Staff user created successfully',
      user: users[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: (err as Error).message || 'Server error' });
  }
};

export const updateUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const existing = await sql`SELECT * FROM users WHERE id = ${id}`;
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (password) {
      await sql`
        UPDATE users 
        SET name = COALESCE(${name}, name), 
            email = COALESCE(${email}, email), 
            role = COALESCE(${role}, role),
            password = ${password}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE users 
        SET name = COALESCE(${name}, name), 
            email = COALESCE(${email}, email), 
            role = COALESCE(${role}, role)
        WHERE id = ${id}
      `;
    }

    const users = await sql`SELECT * FROM users WHERE id = ${id}`;
    res.json({
      success: true,
      message: 'User updated successfully',
      user: users[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await sql`DELETE FROM users WHERE id = ${id} RETURNING id`;
    
    if (result.length === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
