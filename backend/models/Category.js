const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    image: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    commissionPct: { type: Number, default: 8 },
}, { timestamps: true })

module.exports = mongoose.model('Category', categorySchema)
