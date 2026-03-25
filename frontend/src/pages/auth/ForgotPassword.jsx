import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import './Auth.css'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            await api.post('/auth/forgot-password', { email })
            setSent(true)
        } catch {
            toast.success('If this email is registered, you\'ll receive a reset link.')
            setSent(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card card">
                <div className="auth-logo">
                    <svg width="44" height="44" viewBox="0 0 64 64" aria-hidden="true">
                        <defs><linearGradient id="fp-lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient></defs>
                        <polygon points="32,2 58,16 58,48 32,62 6,48 6,16" fill="url(#fp-lg)" />
                        <text x="32" y="42" fontFamily="serif" fontSize="22" fontWeight="700" fill="white" textAnchor="middle">FB</text>
                    </svg>
                    <span className="auth-brand">FancyBazaar</span>
                </div>
                {sent ? (
                    <div className="auth-success">
                        <div style={{ fontSize: '3rem' }}>📧</div>
                        <h1 className="auth-title">Check your email</h1>
                        <p className="auth-subtitle">We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.</p>
                        <Link to="/auth/login" className="btn btn-primary btn-lg btn-full" style={{ marginTop: 16 }}>Back to Sign In</Link>
                    </div>
                ) : (
                    <>
                        <h1 className="auth-title">Forgot Password</h1>
                        <p className="auth-subtitle">Enter your email to receive a reset link</p>
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label" htmlFor="fp-email">Email Address</label>
                                <input id="fp-email" type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" autoFocus />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} id="forgot-submit-btn">
                                {loading ? 'Sending…' : 'Send Reset Link'}
                            </button>
                        </form>
                        <Link to="/auth/login" className="auth-back-link">← Back to Sign In</Link>
                    </>
                )}
            </div>
        </div>
    )
}
