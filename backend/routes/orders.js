const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/orderController')
const { auth, requireRole } = require('../middleware/auth')

router.post('/', auth, ctrl.createOrder)
router.get('/', auth, ctrl.getMyOrders)
router.get('/all', auth, requireRole('admin'), ctrl.getAllOrders)
router.get('/:id', auth, ctrl.getOrder)
router.patch('/:id/cancel', auth, ctrl.cancelOrder)

module.exports = router
