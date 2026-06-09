const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const addressSchema = new mongoose.Schema({
    label: { type: String, default: 'home' },
    street: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: { type: Boolean, default: false },
}, { _id: false })

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, maxlength: 10 },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['retail', 'wholesale', 'admin', 'vendor', 'merchant', 'trader_low', 'trader_bulk'], default: 'retail' },
    // Wholesale fields
    gstNumber: { type: String, uppercase: true },
    businessName: String,
    businessType: String,
    businessAddress: String,
    // User data
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    walletBalance: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },
    // Auth
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    refreshToken: String,
    lastLogin: Date,
}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return
    this.passwordHash = await bcrypt.hash(this.passwordHash, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12)
})

userSchema.methods.comparePassword = async function (raw) {
    return bcrypt.compare(raw, this.passwordHash)
}

userSchema.methods.toSafeObject = function () {
    const obj = this.toObject()
    delete obj.passwordHash
    delete obj.otp
    delete obj.otpExpiry
    delete obj.resetPasswordToken
    delete obj.refreshToken
    return obj
}

module.exports = mongoose.model('User', userSchema)
