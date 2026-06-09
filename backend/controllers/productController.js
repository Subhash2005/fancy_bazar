const mongoose = require('mongoose')
const Product = require('../models/Product')
const Category = require('../models/Category')

const COMMISSION_PCT = 0.08
const GST_PCT = 0.18

// GET /api/v1/products
exports.getProducts = async (req, res) => {
    try {
        const {
            category, q, sort = 'newest', page = 1, limit = 12,
            minPrice, maxPrice, minRating, inStock, colors, isTrending, isFeatured
        } = req.query

        const filter = { isActive: true }

        // Category filter — support slug or id
        if (category && !['all', 'trending', 'new-arrivals', 'wholesale'].includes(category)) {
            const catQuery = mongoose.Types.ObjectId.isValid(category) 
                ? { $or: [{ slug: category }, { _id: category }] }
                : { slug: category };
            const cat = await Category.findOne(catQuery);
            if (cat) filter.category = cat._id;
        }

        // Special slug handling
        if (category === 'trending' || isTrending === 'true') filter.isTrending = true
        if (isFeatured === 'true') filter.isFeatured = true
        
        // Wholesale filter logic
        if (category === 'wholesale') {
            filter['variants.wholesalePrices.mid'] = { $exists: true, $gt: 0 }
        }

        // Search
        if (q) {
            const regex = new RegExp(q, 'i')
            filter.$or = [
                { name: regex },
                { description: regex },
                { tags: regex }
            ]
        }

        // Price range
        if (minPrice || maxPrice) {
            filter['variants.retailPrice'] = {}
            if (minPrice) filter['variants.retailPrice'].$gte = Number(minPrice)
            if (maxPrice) filter['variants.retailPrice'].$lte = Number(maxPrice)
        }

        // Rating
        if (minRating) filter['ratings.avg'] = { $gte: Number(minRating) }

        // In stock
        if (inStock === 'true') filter['variants.stock'] = { $gt: 0 }

        // Colors
        if (colors) filter['variants.color'] = { $in: colors.split(',') }

        // Sort
        let sortObj = { createdAt: -1 }
        if (sort === 'price_asc') sortObj = { 'variants.retailPrice': 1 }
        else if (sort === 'price_desc') sortObj = { 'variants.retailPrice': -1 }
        else if (sort === 'popularity') sortObj = { 'ratings.count': -1 }
        else if (sort === 'rating') sortObj = { 'ratings.avg': -1 }
        if (category === 'new-arrivals') sortObj = { createdAt: -1 }

        const skip = (Number(page) - 1) * Number(limit)
        
        let [products, total] = await Promise.all([
            Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit)).populate('category', 'name slug'),
            Product.countDocuments(filter),
        ])

        // If it's a global search (category 'all' or empty), optionally append vendor results
        if (q && (category === 'all' || !category)) {
            const Shop = require('../models/Shop')
            const regex = new RegExp(q, 'i')
            const shops = await Shop.find({ isActive: true })
            const vendorProducts = []
            
            for (const shop of shops) {
                const shopMatches = regex.test(shop.name) || regex.test(shop.businessName)
                const matches = (shop.products || []).filter(p => 
                    shopMatches || (p.name && (regex.test(p.name) || regex.test(p.category || '')))
                )
                for (const vp of matches) {
                    vendorProducts.push({
                        _id: vp._id,
                        name: vp.name,
                        brand: shop.name,
                        category: { name: vp.category || 'General', slug: 'shops' },
                        images: [{ url: vp.imageUrl || `https://picsum.photos/seed/${vp._id}/300/300` }],
                        variants: [{ retailPrice: vp.price, stock: vp.quantity, sku: `VP-${vp._id}` }],
                        ratings: { avg: shop.rating || 0, count: shop.reviews || 0 },
                        _vendorShopId: shop._id,
                        type: 'vendor'
                    })
                }
            }
            
            // Merge results (simple append, or keep it manageable)
            if (vendorProducts.length > 0) {
                products = [...products, ...vendorProducts]
                total += vendorProducts.length
            }
        }

        res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// GET /api/v1/products/search?q=&limit=6
exports.searchProducts = async (req, res) => {
    try {
        const { q, limit = 6 } = req.query
        if (!q || q.trim().length < 2) return res.json({ success: true, products: [] })

        const regex = new RegExp(q, 'i')
        const products = await Product.find(
            { 
                $or: [
                    { name: regex },
                    { description: regex },
                    { tags: regex }
                ],
                isActive: true 
            },
            { name: 1, images: 1, 'variants.retailPrice': 1, category: 1 }
        ).limit(Number(limit)).populate('category', 'name')

        res.json({ success: true, products })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// GET /api/v1/products/:idOrSlug
exports.getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        let product;
        
        // Try to find by ID if it's a valid ObjectId, otherwise find by Slug
        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findById(id).populate('category', 'name slug').populate('reviews.user', 'name');
        } else {
            product = await Product.findOne({ slug: id, isActive: true }).populate('category', 'name slug').populate('reviews.user', 'name');
        }

        if (!product || !product.isActive) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                const Shop = require('../models/Shop');
                const shop = await Shop.findOne({ "products._id": id });
                if (shop) {
                    const vp = shop.products.id(id);
                    if (vp) {
                        return res.json({
                            success: true,
                            product: {
                                _id: vp._id,
                                name: vp.name,
                                description: `Sold by ${shop.name} - ${shop.description || 'A local trader.'}`,
                                brand: shop.name,
                                category: { name: vp.category || 'General', slug: 'shops' },
                                images: [{ url: vp.imageUrl || `https://picsum.photos/seed/${vp._id}/800/800`, alt: vp.name }],
                                variants: [{
                                    sku: `VP-${vp._id}`,
                                    retailPrice: vp.price,
                                    originalPrice: vp.price,
                                    wholesalePrices: { low: vp.price, mid: vp.price * 0.95, high: vp.price * 0.9 },
                                    stock: vp.quantity,
                                    color: null,
                                    size: null
                                }],
                                ratings: { avg: shop.rating || 5.0, count: shop.reviews || 0 },
                                reviews: [],
                                deliveryDays: 3,
                                gstRate: 12,
                                hsn: '12345678',
                                _vendorShopId: shop._id,
                                type: 'vendor',
                                isActive: true
                            }
                        });
                    }
                }
            }
            return res.status(404).json({ success: false, message: 'Product not found' })
        }
        res.json({ success: true, product })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// POST /api/v1/products (admin)
exports.createProduct = async (req, res) => {
    try {
        // Auto-generate slug
        const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        const product = new Product({ ...req.body, slug })
        await product.save()
        res.status(201).json({ success: true, product })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// PUT /api/v1/products/:id (admin)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
        res.json({ success: true, product })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// DELETE /api/v1/products/:id (admin)
exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, { isActive: false })
        res.json({ success: true, message: 'Product deactivated' })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}
