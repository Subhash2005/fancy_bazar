import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import './Auth.css'

export default function RegisterWholesale() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { loading } = useSelector(state => state.auth)

    // 'merchant' or 'trader'
    const initialType = searchParams.get('type') === 'trader' ? 'trader' : 'merchant'
    const [regType, setRegType] = useState(initialType)
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', businessName: '', gstNumber: '', businessType: '', businessAddress: '' })
    
    const set = (f) => e => setForm(prev => ({ ...prev, [f]: e.target.value }))

    async function handleSubmit(e) {
        e.preventDefault()
        if (!/^[A-Za-z0-9]{15}$/.test(form.gstNumber)) { toast.error('Please enter a valid 15-character GST number'); return }
        
        let userRole = 'merchant';
        if (regType === 'merchant') {
            userRole = 'merchant'; // Always merchant for buyers
        } else if (regType === 'trader') {
            if (form.businessType === 'market_owner') userRole = 'vendor';
            else if (form.businessType === 'low_level_trader') userRole = 'trader_low';
            else if (form.businessType === 'bulk_trader') userRole = 'trader_bulk';
            else userRole = 'vendor'; // fallback
        }

        const result = await dispatch(registerUser({ ...form, role: userRole }))
        if (result.meta.requestStatus === 'fulfilled') {
            toast.success(`${regType === 'merchant' ? 'Merchant' : 'Trader'} account created! 🏪 Welcome to FancyBazaar`)
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
                    <div className="buyer-toggle" style={{ margin: '0 auto 1.5rem', display: 'flex', width: 'fit-content' }}>
                        <button
                            type="button"
                            className={`buyer-toggle__btn${regType === 'merchant' ? ' active' : ''}`}
                            onClick={() => { setRegType('merchant'); setForm({ ...form, businessType: '' }) }}
                        >🛍️ Register as Merchant (Buyer)</button>
                        <button
                            type="button"
                            className={`buyer-toggle__btn${regType === 'trader' ? ' active' : ''}`}
                            onClick={() => { setRegType('trader'); setForm({ ...form, businessType: '' }) }}
                        >🏪 Register as Trader (Seller)</button>
                    </div>

                    <h1 className="auth-title">{regType === 'merchant' ? 'Merchant Account' : 'Trader Account'}</h1>
                    <p className="auth-subtitle">
                        {regType === 'merchant' 
                            ? 'Get bulk pricing and exclusive discounts. Requires minimum 5 quantity per item.' 
                            : 'Open your own shop, manage inventory, and sell your products to thousands of buyers.'}
                    </p>
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
                                {regType === 'merchant' ? (
                                    <>
                                        <option value="retail">Retail Shop</option>
                                        <option value="wholesale">Wholesale Shop</option>
                                        <option value="distributor">Distributor</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="market_owner">Market Owner</option>
                                        <option value="low_level_trader">Low Level Trader</option>
                                        <option value="bulk_trader">Bulk Trader</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="ws-baddr">Business Address *</label>
                            <input id="ws-baddr" className="form-input" value={form.businessAddress} onChange={set('businessAddress')} placeholder="City, State" required />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-accent btn-lg btn-full auth-submit" disabled={loading} id="wholesale-register-submit">
                        {loading ? 'Creating account…' : `Create ${regType === 'merchant' ? 'Merchant' : 'Trader'} Account 🏪`}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--clr-text-faint)', marginTop: 'var(--space-3)' }}>
                    Already have a business account? <Link to="/auth/login" className="auth-link">Sign In</Link>
                </p>
            </div>
        </div>
    )
}
