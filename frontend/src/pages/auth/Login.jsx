import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiEye, FiEyeOff, FiMail, FiLock, FiPhone } from 'react-icons/fi'
import { loginUser } from '../../store/slices/authSlice'
import api from '../../services/api'
import toast from 'react-hot-toast'
import './Auth.css'

export default function Login() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading, error } = useSelector(state => state.auth)

    const [mode, setMode] = useState('email') // 'email' | 'phone'
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [showPwd, setShowPwd] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [otp, setOtp] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        if (mode === 'phone' && !otpSent) {
            try {
                await api.post('/auth/otp/send', { phone })
                toast.success(`OTP sent! Please check your backend terminal for the code.`)
                setOtpSent(true)
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to send OTP')
            }
            return
        }
        const credentials = mode === 'email'
            ? { email, password }
            : { phone, otp }
        const result = await dispatch(loginUser(credentials))
        if (result.meta.requestStatus === 'fulfilled') {
            toast.success('Welcome back!')
            navigate('/')
        } else {
            toast.error(result.payload || 'Login failed')
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card card">
                {/* Logo */}
                <div className="auth-logo">
                    <svg width="44" height="44" viewBox="0 0 64 64" aria-hidden="true">
                        <defs>
                            <linearGradient id="auth-lg" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7C3AED" />
                                <stop offset="100%" stopColor="#F59E0B" />
                            </linearGradient>
                        </defs>
                        <polygon points="32,2 58,16 58,48 32,62 6,48 6,16" fill="url(#auth-lg)" />
                        <text x="32" y="42" fontFamily="serif" fontSize="22" fontWeight="700" fill="white" textAnchor="middle">FB</text>
                    </svg>
                    <span className="auth-brand">FancyBazaar</span>
                </div>

                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to continue shopping</p>

                {/* Mode toggle */}
                <div className="auth-mode-toggle" role="tablist">
                    <button
                        role="tab"
                        className={`auth-mode-btn${mode === 'email' ? ' active' : ''}`}
                        onClick={() => { setMode('email'); setOtpSent(false) }}
                        aria-selected={mode === 'email'}
                    ><FiMail size={14} /> Email</button>
                    <button
                        role="tab"
                        className={`auth-mode-btn${mode === 'phone' ? ' active' : ''}`}
                        onClick={() => { setMode('phone'); setOtpSent(false) }}
                        aria-selected={mode === 'phone'}
                    ><FiPhone size={14} /> Phone OTP</button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {mode === 'email' ? (
                        <>
                            <div className="form-group">
                                <label className="form-label" htmlFor="login-email">Email Address</label>
                                <div className="input-icon-wrap">
                                    <FiMail className="input-icon" aria-hidden="true" />
                                    <input id="login-email" type="email" className="form-input input-with-icon" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="flex-between">
                                    <label className="form-label" htmlFor="login-password">Password</label>
                                    <Link to="/auth/forgot-password" className="auth-forgot" tabIndex={0}>Forgot password?</Link>
                                </div>
                                <div className="input-icon-wrap">
                                    <FiLock className="input-icon" aria-hidden="true" />
                                    <input
                                        id="login-password"
                                        type={showPwd ? 'text' : 'password'}
                                        className="form-input input-with-icon input-with-icon-right"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Your password"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="input-icon-right"
                                        onClick={() => setShowPwd(!showPwd)}
                                        aria-label={showPwd ? 'Hide password' : 'Show password'}
                                        aria-pressed={showPwd}
                                    >
                                        {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label className="form-label" htmlFor="login-phone">Mobile Number</label>
                                <div className="input-icon-wrap">
                                    <span className="input-phone-prefix">+91</span>
                                    <input id="login-phone" type="tel" className="form-input input-with-phone-prefix" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit number" maxLength={10} required pattern="[0-9]{10}" />
                                </div>
                            </div>
                            {otpSent && (
                                <div className="form-group animate-fade-in">
                                    <label className="form-label" htmlFor="login-otp">OTP sent to +91 {phone}</label>
                                    <input id="login-otp" type="text" className="form-input otp-input" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" maxLength={6} inputMode="numeric" aria-label="One-time password" />
                                    <button type="button" className="auth-resend" onClick={() => toast.success('OTP resent!')}>Resend OTP</button>
                                </div>
                            )}
                        </>
                    )}

                    {error && <p className="auth-error" role="alert">{error}</p>}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg btn-full auth-submit"
                        disabled={loading}
                        id="login-submit-btn"
                    >
                        {loading ? 'Signing in…' : mode === 'phone' && !otpSent ? 'Send OTP' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-divider"><span>Don't have an account?</span></div>
                <div className="auth-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link to="/auth/register" className="btn btn-secondary btn-full">Create Customer Account</Link>
                    <Link to="/auth/register-wholesale?type=merchant" className="btn btn-ghost btn-full">Create Merchant Account 🛍️</Link>
                    <Link to="/auth/register-wholesale?type=trader" className="btn btn-ghost btn-full">Create Trader Account 🏪</Link>
                </div>
            </div>
        </div>
    )
}
