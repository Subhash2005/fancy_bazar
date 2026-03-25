const crypto = require('crypto')
const Order = require('../models/Order')

// POST /api/v1/payments/initiate — Create Razorpay order
exports.initiatePayment = async (req, res) => {
    try {
        const { orderId } = req.body
        const order = await Order.findOne({ _id: orderId, user: req.user._id })
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

        // Razorpay integration
        try {
            const Razorpay = require('razorpay')
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            })
            const rpOrder = await razorpay.orders.create({
                amount: Math.round(order.pricing.total * 100), // in paise
                currency: 'INR',
                receipt: order.orderNumber,
                notes: { orderId: order._id.toString(), userId: req.user._id.toString() },
            })

            order.payment.gatewayOrderId = rpOrder.id
            await order.save()

            res.json({
                success: true,
                razorpayOrderId: rpOrder.id,
                amount: rpOrder.amount,
                currency: rpOrder.currency,
                key: process.env.RAZORPAY_KEY_ID,
                orderDetails: { orderNumber: order.orderNumber, total: order.pricing.total },
            })
        } catch (rzpErr) {
            // Fallback for demo/dev mode without Razorpay credentials
            res.json({
                success: true,
                razorpayOrderId: `rp_demo_${Date.now()}`,
                amount: Math.round(order.pricing.total * 100),
                currency: 'INR',
                key: 'rzp_test_demo',
                demo: true,
            })
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// POST /api/v1/payments/verify — Verify Razorpay payment signature
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body

        // Skip verification in demo mode
        if (razorpayOrderId.startsWith('rp_demo_')) {
            const order = await Order.findByIdAndUpdate(orderId, {
                'payment.status': 'success',
                'payment.transactionId': `demo_${Date.now()}`,
                'payment.paidAt': new Date(),
                status: 'confirmed',
            }, { new: true })
            return res.json({ success: true, order })
        }

        // Verify HMAC signature
        const body = razorpayOrderId + '|' + razorpayPaymentId
        const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body).digest('hex')

        if (expectedSig !== razorpaySignature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' })
        }

        const order = await Order.findByIdAndUpdate(orderId, {
            'payment.status': 'success',
            'payment.transactionId': razorpayPaymentId,
            'payment.paidAt': new Date(),
            status: 'confirmed',
        }, { new: true })

        res.json({ success: true, order })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// POST /api/v1/payments/cod-confirm — Confirm COD order
exports.codConfirm = async (req, res) => {
    try {
        const { orderId } = req.body
        const order = await Order.findOneAndUpdate(
            { _id: orderId, user: req.user._id, 'payment.method': 'cod' },
            { status: 'confirmed' },
            { new: true }
        )
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
        res.json({ success: true, order })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}
