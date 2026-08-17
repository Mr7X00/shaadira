import express from 'express';
import { connectDb } from './db.js';

const router = express.Router();

// Middleware to authenticate
const authenticate = (req: any, res: any, next: any) => {
    // Simplified for now - assume user info in headers or session
    if (!req.headers.authorization) return res.status(401).json({ error: 'Unauthorized' });
    next();
};

router.use(authenticate);

// Profile
router.get('/profile', async (req, res) => {
    const db = await connectDb();
    if (!db) return res.status(500).json({ error: 'DB error' });
    const user = await db.collection('users').findOne({ email: req.headers.email });
    res.json(user);
});

router.put('/profile', async (req, res) => {
    const db = await connectDb();
    if (!db) return res.status(500).json({ error: 'DB error' });
    await db.collection('users').updateOne({ email: req.headers.email }, { $set: req.body });
    res.json({ success: true });
});

// Orders
router.get('/orders', async (req, res) => {
    const db = await connectDb();
    if (!db) return res.status(500).json({ error: 'DB error' });
    const orders = await db.collection('orders').find({ email: req.headers.email }).toArray();
    res.json(orders);
});

// Payments
router.get('/payments', async (req, res) => {
    const db = await connectDb();
    if (!db) return res.status(500).json({ error: 'DB error' });
    const payments = await db.collection('payments').find({ email: req.headers.email }).toArray();
    res.json(payments);
});

export default router;
