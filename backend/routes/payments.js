const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/paymentController')
const { auth } = require('../middleware/auth')

router.post('/initiate', auth, ctrl.initiatePayment)
router.post('/verify', auth, ctrl.verifyPayment)
router.post('/cod-confirm', auth, ctrl.codConfirm)

module.exports = router
