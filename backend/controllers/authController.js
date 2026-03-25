const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const User = require('../models/User')
const crypto = require('crypto')

const generateTokens = (userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' })
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' })
    return { token, refreshToken }
}

// POST /api/v1/auth/register
exports.register = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() })

    const { name, email, phone, password, role } = req.body
    try {
        const existing = await User.findOne({ email })
        if (existing) return res.status(409).json({ success: false, message: 'Email already registered' })

        const user = new User({ name, email, phone, passwordHash: password, role: role === 'wholesale' ? 'retail' : (role || 'retail') })
        await user.save()

        const { token } = generateTokens(user._id)
        res.status(201).json({ success: true, token, user: user.toSafeObject() })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// POST /api/v1/auth/register-wholesale
exports.registerWholesale = async (req, res) => {
    const { name, email, phone, password, businessName, gstNumber, businessType, businessAddress, role } = req.body
    try {
        if (!gstNumber || !/^[A-Z0-9]{15}$/.test(gstNumber.toUpperCase())) {
            return res.status(422).json({ success: false, message: 'Invalid GST number (must be 15 alphanumeric chars)' })
        }
        const existing = await User.findOne({ email })
        if (existing) return res.status(409).json({ success: false, message: 'Email already registered' })

        const userRole = role === 'vendor' ? 'vendor' : 'wholesale'
        const user = new User({
            name, email, phone, passwordHash: password, role: userRole,
            gstNumber: gstNumber.toUpperCase(), businessName, businessType, businessAddress,
        })
        await user.save()

        const { token } = generateTokens(user._id)
        res.status(201).json({ success: true, token, user: user.toSafeObject() })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// POST /api/v1/auth/login
exports.login = async (req, res) => {
    const { email, phone, password, otp } = req.body
    try {
        const query = email ? { email } : { phone }
        const user = await User.findOne(query)
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' })

        if (otp) {
            // OTP login
            if (!user.otp || user.otpExpiry < Date.now() || user.otp !== otp) {
                return res.status(401).json({ success: false, message: 'Invalid or expired OTP' })
            }
            user.otp = undefined
            user.otpExpiry = undefined
        } else {
            // Password login
            const match = await user.comparePassword(password)
            if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }

        user.lastLogin = new Date()
        await user.save()
        const { token, refreshToken } = generateTokens(user._id)
        user.refreshToken = refreshToken
        await user.save()

        res.json({ success: true, token, refreshToken, user: user.toSafeObject() })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// POST /api/v1/auth/otp/send
exports.sendOtp = async (req, res) => {
    const { phone } = req.body
    try {
        const user = await User.findOne({ phone })
        if (!user) return res.status(404).json({ success: false, message: 'Phone number not registered' })

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        user.otp = otp
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 min
        await user.save()

        // TODO: integrate SMS gateway (Twilio / MSG91)
        console.log(`[OTP] Sending ${otp} to +91${phone}`)
        res.json({ success: true, message: 'OTP sent successfully' })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email })
        // Always respond OK for security (prevent email enumeration)
        if (user) {
            const token = crypto.randomBytes(32).toString('hex')
            user.resetPasswordToken = token
            user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
            await user.save()
            // TODO: send email
            console.log(`[Reset] Token for ${email}: ${token}`)
        }
        res.json({ success: true, message: 'If registered, a reset link will be emailed' })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// POST /api/v1/auth/reset-password
exports.resetPassword = async (req, res) => {
    const { token, password } = req.body
    try {
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpiry: { $gt: Date.now() } })
        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' })

        user.passwordHash = password // will be hashed by pre-save hook
        user.resetPasswordToken = undefined
        user.resetPasswordExpiry = undefined
        await user.save()

        res.json({ success: true, message: 'Password reset successful. Please log in.' })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// GET /api/v1/auth/me
exports.getMe = async (req, res) => {
    res.json({ success: true, user: req.user.toSafeObject() })
}

// PUT /api/v1/auth/me
exports.updateMe = async (req, res) => {
    const { name, phone, addresses } = req.body
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { name, phone, ...(addresses && { addresses }) } },
            { new: true, runValidators: true }
        )
        res.json({ success: true, user: user.toSafeObject() })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}
