const Order = require('../models/Order')
const Product = require('../models/Product')
const mongoose = require('mongoose')

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
        const { items, deliveryAddress, payment, donation = { enabled: false, amount: 0 } } = req.body

        // Validate items and calculate prices server-side
        let subtotal = 0
        const processedItems = []

        for (const item of items) {
            if (!mongoose.Types.ObjectId.isValid(item.product)) {
                return res.status(400).json({ success: false, message: `Invalid product ID format for item: ${item.product}` })
            }
            
            let product, variant, unitPrice;
            
            if (item.isVendorProduct) {
                const Shop = require('../models/Shop');
                const shop = await Shop.findById(item.shopId);
                if (!shop) return res.status(404).json({ success: false, message: `Shop ${item.shopId} not found` });
                
                product = shop.products.id(item.product);
                if (!product) return res.status(404).json({ success: false, message: `Vendor Product ${item.product} not found` });
                
                variant = { sku: `VP-${product._id}`, stock: product.quantity, retailPrice: product.price };
                unitPrice = product.price;
            } else {
                product = await Product.findById(item.product)
                if (!product) return res.status(404).json({ success: false, message: `Product ${item.product} not found` })

                variant = product.variants.find(v => v.sku === item.variant)
                if (!variant) return res.status(404).json({ success: false, message: `Variant ${item.variant} not found` })
                unitPrice = getEffectivePrice(variant, item.qty, item.buyerType)
            }

            if (variant.stock < item.qty) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` })

            // Enforce merchant minimum quantity
            if (req.user.role === 'merchant' && item.qty < 5) {
                return res.status(400).json({ success: false, message: `Merchant accounts must buy a minimum of 5 quantities for each item (${product.name})` })
            }

            subtotal += unitPrice * item.qty

            // Deduct stock
            if (item.isVendorProduct) {
                const Shop = require('../models/Shop');
                await Shop.updateOne({ 'products._id': product._id }, { $inc: { 'products.$.quantity': -item.qty } });
            } else {
                variant.stock -= item.qty
                await product.save()
            }

            processedItems.push({ 
                product: product._id, 
                isVendorProduct: item.isVendorProduct,
                shopId: item.shopId,
                variant: item.isVendorProduct ? variant.sku : variant.sku, 
                qty: item.qty, 
                unitPrice, 
                buyerType: item.buyerType || 'retail' 
            })
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
            deliveryAddress: deliveryAddress,
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
            .lean()
            
        const Shop = require('../models/Shop');
        for (const order of orders) {
            for (const item of order.items) {
                if (item.isVendorProduct) {
                    const shop = await Shop.findById(item.shopId);
                    const vp = shop ? shop.products.id(item.product) : null;
                    if (vp) {
                        item.product = { _id: vp._id, name: vp.name, images: [{url: vp.imageUrl}] };
                    }
                }
            }
        }
        
        const total = await Order.countDocuments(filter)
        res.json({ success: true, orders, total })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// GET /api/v1/orders/:id
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('items.product').lean()
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
        
        const Shop = require('../models/Shop');
        for (const item of order.items) {
            if (item.isVendorProduct) {
                const shop = await Shop.findById(item.shopId);
                const vp = shop ? shop.products.id(item.product) : null;
                if (vp) {
                    item.product = { _id: vp._id, name: vp.name, images: [{url: vp.imageUrl}] };
                }
            }
        }
        
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
            if (item.isVendorProduct) {
                const Shop = require('../models/Shop');
                await Shop.updateOne(
                    { 'products._id': item.product },
                    { $inc: { 'products.$.quantity': item.qty } }
                );
            } else {
                await Product.findOneAndUpdate(
                    { _id: item.product, 'variants.sku': item.variant },
                    { $inc: { 'variants.$.stock': item.qty } }
                )
            }
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
