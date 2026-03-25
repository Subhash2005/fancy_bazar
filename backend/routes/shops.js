const express = require('express')
const router = express.Router()
const Shop = require('../models/Shop')
const jwt = require('jsonwebtoken')

// ─── Auth middleware ───────────────────────────────────────────────────────
function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' })
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch {
        res.status(401).json({ success: false, message: 'Invalid token' })
    }
}

// ─── IMPORTANT: Specific named routes MUST come before /:id wildcard ──────

// GET /api/v1/shops — list all active shops (public)
router.get('/', async (req, res) => {
    try {
        const shops = await Shop.find({ isActive: true })
            .select('-products')
            .populate('owner', 'name businessName')
            .sort({ createdAt: -1 })
        res.json({ success: true, shops })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// GET /api/v1/shops/search?q=... — search products across all vendor shops (public)
router.get('/search', async (req, res) => {
    try {
        const q = (req.query.q || '').trim()
        if (!q || q.length < 1) return res.json({ success: true, results: [] })

        const regex = new RegExp(q, 'i')
        // Fetch ALL active shops (let JS filter products for reliability)
        const shops = await Shop.find({ isActive: true })
        const results = []

        for (const shop of shops) {
            if (!shop.products || shop.products.length === 0) continue
            const matchingProducts = shop.products.filter(p =>
                p.name && (regex.test(p.name) || regex.test(p.category || ''))
            )
            for (const p of matchingProducts) {
                // If image is a blob:// URL (temporary), generate a stable fallback
                let imageUrl = p.imageUrl || ''
                if (!imageUrl || imageUrl.startsWith('blob:')) {
                    imageUrl = `https://picsum.photos/seed/${p._id}/80/80`
                }
                results.push({
                    _id: p._id,
                    name: p.name,
                    price: p.price,
                    imageUrl,
                    shopId: shop._id,
                    shopName: shop.name,
                    category: p.category,
                    type: 'vendor_product',
                })
            }
        }

        res.json({ success: true, results: results.slice(0, 10) })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// GET /api/v1/shops/my/shop — vendor gets their own shop (MUST be before /:id)
router.get('/my/shop', auth, async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.user.id })
        res.json({ success: true, shop: shop || null })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// GET /api/v1/shops/:id — single shop with products (public) — WILDCARD LAST
router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id).populate('owner', 'name')
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' })
        res.json({ success: true, shop })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// POST /api/v1/shops — create or update vendor's shop profile
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, image, location, phone, category } = req.body
        if (!name) return res.status(422).json({ success: false, message: 'Shop name is required' })

        let shop = await Shop.findOne({ owner: req.user.id })
        if (shop) {
            Object.assign(shop, { name, description, image, location, phone, category })
            await shop.save()
        } else {
            shop = await Shop.create({ owner: req.user.id, name, description, image, location, phone, category })
        }
        res.status(201).json({ success: true, shop })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// POST /api/v1/shops/products — add product to vendor's shop
router.post('/products', auth, async (req, res) => {
    try {
        const { name, imageUrl, price, quantity, category } = req.body
        if (!name || !price || quantity == null) {
            return res.status(422).json({ success: false, message: 'name, price and quantity are required' })
        }
        let shop = await Shop.findOne({ owner: req.user.id })
        if (!shop) return res.status(404).json({ success: false, message: 'Create your shop profile first' })

        // Replace blob:// URLs with persistent fallback before saving
        let safeImageUrl = imageUrl || ''
        if (safeImageUrl.startsWith('blob:')) {
            safeImageUrl = `https://picsum.photos/seed/${encodeURIComponent(name)}/400/400`
        }

        shop.products.push({ name, imageUrl: safeImageUrl, price, quantity, category })
        await shop.save()
        res.status(201).json({ success: true, product: shop.products[shop.products.length - 1] })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// DELETE /api/v1/shops/products/:productId — remove a product
router.delete('/products/:productId', auth, async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.user.id })
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' })
        shop.products = shop.products.filter(p => p._id.toString() !== req.params.productId)
        await shop.save()
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

module.exports = router
