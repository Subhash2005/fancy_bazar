import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import './Auth.css'

export default function RegisterWholesale() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading } = useSelector(state => state.auth)

    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', businessName: '', gstNumber: '', businessType: '', businessAddress: '' })
    const set = (f) => e => setForm(prev => ({ ...prev, [f]: e.target.value }))

    async function handleSubmit(e) {
        e.preventDefault()
        if (!/^[A-Za-z0-9]{15}$/.test(form.gstNumber)) { toast.error('Please enter a valid 15-character GST number'); return }
        const userRole = form.businessType === 'market_owner' ? 'vendor' : 'wholesale';
        const result = await dispatch(registerUser({ ...form, role: userRole }))
        if (result.meta.requestStatus === 'fulfilled') {
            toast.success('Merchant account created! 🏪 Welcome to FancyBazaar')
            navigate('/')
        } else {
            toast.error(result.payload || 'Registration failed. Please try again.')
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card auth-card--wide card">
                <div className="auth-logo">
                    <svg width="44" height="44" viewBox="0 0 64 64" aria-hidden="true">
                        <defs><linearGradient id="ws-lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient></defs>
                        <polygon points="32,2 58,16 58,48 32,62 6,48 6,16" fill="url(#ws-lg)" />
                        <text x="32" y="42" fontFamily="serif" fontSize="22" fontWeight="700" fill="white" textAnchor="middle">FB</text>
                    </svg>
                    <span className="auth-brand">FancyBazaar</span>
                </div>
                <div className="auth-wholesale-header">
                    <span className="badge badge-accent" style={{ fontSize: '0.85rem', padding: '4px 14px' }}>🏪 Merchant Registration</span>
                    <h1 className="auth-title">Merchant Account</h1>
                    <p className="auth-subtitle">Get bulk pricing or start selling as a vendor</p>
                </div>

                <div className="wholesale-perks">
                    <div className="wholesale-perk">🏪 Sell products as a Market Owner directly</div>
                    <div className="wholesale-perk">🔹 Buy at mid tier — 15% off (10-49 units)</div>
                    <div className="wholesale-perk">🔸 Buy at high tier — 30% off (50+ units)</div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form auth-form--wide" noValidate>
                    <div className="auth-form-section-label">Personal Details</div>
                    <div className="auth-form-2col">
                        <div className="form-group">
                            <label className="form-label" htmlFor="ws-name">Contact Name *</label>
                            <input id="ws-name" className="form-input" value={form.name} onChange={set('name')} placeholder="Your name" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="ws-phone">Mobile Number *</label>
                            <input id="ws-phone" type="tel" className="form-input" value={form.phone} onChange={set('phone')} placeholder="10-digit number" required pattern="[0-9]{10}" maxLength={10} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="ws-email">Email Address *</label>
                            <input id="ws-email" type="email" className="form-input" value={form.email} onChange={set('email')} placeholder="business@example.com" required autoComplete="email" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="ws-password">Password *</label>
                            <input id="ws-password" type="password" className="form-input" value={form.password} onChange={set('password')} placeholder="Minimum 8 characters" required minLength={8} autoComplete="new-password" />
                        </div>
                    </div>

                    <div className="auth-form-section-label">Business Details</div>
                    <div className="auth-form-2col">
                        <div className="form-group">
                            <label className="form-label" htmlFor="ws-bname">Business / Shop Name *</label>
                            <input id="ws-bname" className="form-input" value={form.businessName} onChange={set('businessName')} placeholder="Your business name" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="ws-gst">GST Number *</label>
                            <input id="ws-gst" className="form-input" value={form.gstNumber} onChange={set('gstNumber')} placeholder="15-digit GST number" required maxLength={15} style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px' }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="ws-btype">Business Type *</label>
                            <select id="ws-btype" className="form-input" value={form.businessType} onChange={set('businessType')} required>
                                <option value="">Select type</option>
                                <option value="retail_shop">Retail Shop</option>
                                <option value="wholesale_shop">Wholesale Shop</option>
                                <option value="distributor">Distributor</option>
                                <option value="market_owner">Market Owner (Sell Products)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="ws-baddr">Business Address *</label>
                            <input id="ws-baddr" className="form-input" value={form.businessAddress} onChange={set('businessAddress')} placeholder="City, State" required />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-accent btn-lg btn-full auth-submit" disabled={loading} id="wholesale-register-submit">
                        {loading ? 'Creating account…' : 'Create Merchant Account 🏪'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--clr-text-faint)', marginTop: 'var(--space-3)' }}>
                    Already have a merchant account? <Link to="/auth/login" className="auth-link">Sign In</Link>
                </p>
            </div>
        </div>
    )
}
