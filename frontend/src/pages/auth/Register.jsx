import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi'
import { registerUser } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import './Auth.css'

export default function Register() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading } = useSelector(state => state.auth)

    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
    const [showPwd, setShowPwd] = useState(false)

    function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

    async function handleSubmit(e) {
        e.preventDefault()
        if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
        if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
        const result = await dispatch(registerUser({ ...form, role: 'retail' }))
        if (result.meta.requestStatus === 'fulfilled') {
            toast.success('Account created! Welcome to FancyBazaar 🎉')
            navigate('/')
        } else {
            toast.error(result.payload || 'Registration failed')
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card card">
                <div className="auth-logo">
                    <svg width="44" height="44" viewBox="0 0 64 64" aria-hidden="true">
                        <defs><linearGradient id="reg-lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient></defs>
                        <polygon points="32,2 58,16 58,48 32,62 6,48 6,16" fill="url(#reg-lg)" />
                        <text x="32" y="42" fontFamily="serif" fontSize="22" fontWeight="700" fill="white" textAnchor="middle">FB</text>
                    </svg>
                    <span className="auth-brand">FancyBazaar</span>
                </div>
                <h1 className="auth-title">Create Customer Account</h1>
                <p className="auth-subtitle">Join thousands of happy shoppers</p>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-name">Full Name</label>
                        <div className="input-icon-wrap"><FiUser className="input-icon" aria-hidden /><input id="reg-name" className="form-input input-with-icon" value={form.name} onChange={set('name')} placeholder="Your full name" required autoComplete="name" /></div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-email">Email Address</label>
                        <div className="input-icon-wrap"><FiMail className="input-icon" aria-hidden /><input id="reg-email" type="email" className="form-input input-with-icon" value={form.email} onChange={set('email')} placeholder="you@example.com" required autoComplete="email" /></div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-phone">Phone Number</label>
                        <div className="input-icon-wrap"><FiPhone className="input-icon" aria-hidden /><input id="reg-phone" type="tel" className="form-input input-with-icon" value={form.phone} onChange={set('phone')} placeholder="10-digit mobile" maxLength={10} /></div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-password">Password</label>
                        <div className="input-icon-wrap">
                            <FiLock className="input-icon" aria-hidden />
                            <input id="reg-password" type={showPwd ? 'text' : 'password'} className="form-input input-with-icon input-with-icon-right" value={form.password} onChange={set('password')} placeholder="Minimum 8 characters" required minLength={8} autoComplete="new-password" />
                            <button type="button" className="input-icon-right" onClick={() => setShowPwd(!showPwd)} aria-label={showPwd ? 'Hide' : 'Show'} aria-pressed={showPwd}>{showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}</button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                        <div className="input-icon-wrap"><FiLock className="input-icon" aria-hidden /><input id="reg-confirm" type="password" className="form-input input-with-icon" value={form.confirm} onChange={set('confirm')} placeholder="Re-enter password" required autoComplete="new-password" /></div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg btn-full auth-submit" disabled={loading} id="register-submit-btn">
                        {loading ? 'Creating account…' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-divider"><span>Already have an account?</span></div>
                <Link to="/auth/login" className="btn btn-secondary btn-full">Sign In</Link>
                <p className="auth-wholesale-cta">
                    Are you a business? <Link to="/auth/register-wholesale" className="auth-link">Create Merchant Account 🏪</Link>
                </p>
            </div>
        </div>
    )
}
