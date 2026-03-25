const Order = require('../models/Order')
const Product = require('../models/Product')

const COMMISSION_PCT = 0.08
const GST_PCT = 0.18

function calcDeliveryCharge(subtotal) {
    if (subtotal >= 999) return 0
    if (subtotal >= 500) return 49
    return 99
}

function getEffectivePrice(variant, qty, buyerType) {
    if (buyerType === 'wholesale') {
        if (qty >= 50) return variant.wholesalePrices?.high ?? variant.retailPrice
        if (qty >= 10) return variant.wholesalePrices?.mid ?? variant.retailPrice
    }
    return variant.retailPrice
}

// POST /api/v1/orders
exports.createOrder = async (req, res) => {
    try {
        console.log('--- RECV PAYLOAD:', JSON.stringify(req.body));
        const { items, shippingAddress, payment, donation = { enabled: false, amount: 0 } } = req.body

        // Validate items and calculate prices server-side
        let subtotal = 0
        const processedItems = []

        for (const item of items) {
            const product = await Product.findById(item.product)
            if (!product) return res.status(404).json({ success: false, message: `Product ${item.product} not found` })

            const variant = product.variants.find(v => v.sku === item.variant)
            if (!variant) return res.status(404).json({ success: false, message: `Variant ${item.variant} not found` })
            if (variant.stock < item.qty) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` })

            const unitPrice = getEffectivePrice(variant, item.qty, item.buyerType)
            subtotal += unitPrice * item.qty

            // Deduct stock
            variant.stock -= item.qty
            await product.save()

            processedItems.push({ product: product._id, variant: variant.sku, qty: item.qty, unitPrice, buyerType: item.buyerType || 'retail' })
        }

        const commission = subtotal * COMMISSION_PCT
        const deliveryCharge = calcDeliveryCharge(subtotal)
        const gst = (subtotal + commission + deliveryCharge) * GST_PCT
        const donationAmt = donation.enabled ? (donation.amount || 0) : 0
        const total = subtotal + commission + deliveryCharge + gst + donationAmt

        const buyerType = processedItems.some(i => i.buyerType === 'wholesale') ? 'wholesale' : 'retail'

        console.log('--- MAPPING PAYLOAD TO NEW FIELD: deliveryAddress');
        const order = new Order({
            user: req.user._id,
            buyerType,
            items: processedItems,
            deliveryAddress: shippingAddress, // Map incoming shippingAddress to deliveryAddress
            pricing: { subtotal, commission, deliveryCharge, gst, donation: donationAmt, total },
            payment: { method: payment.method, status: payment.method === 'cod' ? 'pending' : 'pending' },
        })

        await order.save()
        await order.populate('items.product', 'name images')

        res.status(201).json({ success: true, order })
    } catch (err) {
        console.error('--- ORDER CREATE ERROR:', err);
        res.status(500).json({ success: false, message: err.message, errors: err.errors })
    }
}

// GET /api/v1/orders (my orders)
exports.getMyOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query
        const filter = { user: req.user._id, ...(status && status !== 'all' && { status }) }
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .populate('items.product', 'name images')
        const total = await Order.countDocuments(filter)
        res.json({ success: true, orders, total })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// GET /api/v1/orders/:id
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('items.product')
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
        res.json({ success: true, order })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// PATCH /api/v1/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' })
        }

        // Restore stock
        for (const item of order.items) {
            await Product.findOneAndUpdate(
                { _id: item.product, 'variants.sku': item.variant },
                { $inc: { 'variants.$.stock': item.qty } }
            )
        }

        order.status = 'cancelled'
        order.cancelReason = req.body.reason || 'Customer requested'
        await order.save()

        res.json({ success: true, order })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// GET /api/v1/orders/all (admin)
exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query
        const filter = status && status !== 'all' ? { status } : {}
        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .populate('user', 'name email')
            .populate('items.product', 'name')
        const total = await Order.countDocuments(filter)
        res.json({ success: true, orders, total })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}
