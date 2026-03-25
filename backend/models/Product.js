const mongoose = require('mongoose')

const variantSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true },
    color: String,
    size: String,
    design: String,
    stock: { type: Number, default: 0, min: 0 },
    retailPrice: { type: Number, required: true, min: 0 },
    originalPrice: Number,
    wholesalePrices: {
        low: Number,   // 1-9 units (same as retail)
        mid: Number,   // 10-49 units
        high: Number,  // 50+ units
    },
}, { _id: false })

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    images: [{ url: String, alt: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
}, { timestamps: true })

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, maxlength: 5000 },
    brand: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ url: String, alt: String }],
    video: String,
    variants: [variantSchema],
    tags: [String],
    ratings: {
        avg: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
    },
    reviews: [reviewSchema],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    deliveryDays: { type: Number, default: 3 },
    hsn: String,
    gstRate: { type: Number, default: 12 },
}, { timestamps: true })

productSchema.index({ name: 'text', tags: 'text', description: 'text' })
productSchema.index({ category: 1, isActive: 1 })
productSchema.index({ 'variants.retailPrice': 1 })

// Update rating avg on review add
productSchema.methods.updateRating = function () {
    const reviews = this.reviews
    if (reviews.length === 0) { this.ratings = { avg: 0, count: 0 }; return }
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    this.ratings = { avg: Math.round(avg * 10) / 10, count: reviews.length }
}

module.exports = mongoose.model('Product', productSchema)
