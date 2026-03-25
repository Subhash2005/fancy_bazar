const mongoose = require('mongoose')

const shopProductSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'General' },
}, { timestamps: true })

const shopSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, maxlength: 1000, default: '' },
    image: { type: String, default: '' },
    location: { type: String, default: '' },
    phone: { type: String, default: '' },
    category: { type: String, default: 'General' },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    products: [shopProductSchema],
}, { timestamps: true })

module.exports = mongoose.model('Shop', shopSchema)
