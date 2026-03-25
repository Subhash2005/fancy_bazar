const express = require('express')
const { body } = require('express-validator')
const router = express.Router()
const ctrl = require('../controllers/authController')
const { auth } = require('../middleware/auth')

const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
]

router.post('/register', registerValidation, ctrl.register)
router.post('/register-wholesale', ctrl.registerWholesale)
router.post('/login', ctrl.login)
router.post('/otp/send', ctrl.sendOtp)
router.post('/forgot-password', ctrl.forgotPassword)
router.post('/reset-password', ctrl.resetPassword)
router.get('/me', auth, ctrl.getMe)
router.put('/me', auth, ctrl.updateMe)

module.exports = router
