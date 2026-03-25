const express = require('express')
const router = express.Router()
const { auth, requireRole } = require('../middleware/auth')
const User = require('../models/User')
const Order = require('../models/Order')
const Product = require('../models/Product')

router.use(auth, requireRole('admin'))

// GET /api/v1/admin/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const [users, orders, products, revenue] = await Promise.all([
            User.countDocuments(),
            Order.countDocuments(),
            Product.countDocuments({ isActive: true }),
            Order.aggregate([
                { $match: { 'payment.status': 'success' } },
                { $group: { _id: null, total: { $sum: '$pricing.total' } } },
            ]),
        ])
        res.json({
            success: true,
            stats: {
                users,
                orders,
                products,
                revenue: revenue[0]?.total || 0,
            },
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// GET /api/v1/admin/users
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, role } = req.query
        const filter = role ? { role } : {}
        const users = await User.find(filter).select('-passwordHash -otp -resetPasswordToken').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit))
        const total = await User.countDocuments(filter)
        res.json({ success: true, users, total })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

module.exports = router
