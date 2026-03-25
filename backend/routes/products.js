const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/productController')
const { auth, requireRole, optionalAuth } = require('../middleware/auth')

router.get('/search', ctrl.searchProducts)
router.get('/', optionalAuth, ctrl.getProducts)
router.get('/:id', ctrl.getProduct)
router.post('/', auth, requireRole('admin'), ctrl.createProduct)
router.put('/:id', auth, requireRole('admin'), ctrl.updateProduct)
router.delete('/:id', auth, requireRole('admin'), ctrl.deleteProduct)

module.exports = router
