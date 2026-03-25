const express = require('express')
const router = express.Router()
const Category = require('../models/Category')
const { auth, requireRole } = require('../middleware/auth')

router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 })
        res.json({ success: true, categories })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

router.post('/', auth, requireRole('admin'), async (req, res) => {
    try {
        const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const category = new Category({ ...req.body, slug })
        await category.save()
        res.status(201).json({ success: true, category })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

module.exports = router
