const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant: String, // SKU
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    buyerType: { type: String, enum: ['retail', 'wholesale'], default: 'retail' },
}, { _id: false })

const addressSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    type: { type: String, default: 'home' },
}, { _id: false })

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyerType: { type: String, enum: ['retail', 'wholesale'], default: 'retail' },
    items: [orderItemSchema],
    deliveryAddress: { type: addressSchema, required: true },
    pricing: {
        subtotal: { type: Number, required: true },
        commission: Number,
        deliveryCharge: Number,
        gst: Number,
        donation: { type: Number, default: 0 },
        total: { type: Number, required: true },
    },
    payment: {
        method: { type: String, enum: ['upi', 'card', 'wallet', 'cod'] },
        status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
        transactionId: String,
        paidAt: Date,
    },
    delivery: {
        status: { type: String, default: 'Pending' },
        trackingId: String,
        estimatedDate: Date,
        driverName: String,
        driverPhone: String,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending',
    },
    cancelReason: String,
    returnReason: String,
}, { timestamps: true })

// Auto-generate order number
orderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments()
        this.orderNumber = `FB${new Date().getFullYear()}${String(count + 1).padStart(6, '0')}`
    }
})

module.exports = mongoose.model('Order', orderSchema)
