import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
    return (
        <div className="notfound-page">
            <div className="notfound-content">
                <div className="notfound-gem" aria-hidden="true">
                    <svg width="120" height="120" viewBox="0 0 64 64">
                        <defs>
                            <linearGradient id="nf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7C3AED" />
                                <stop offset="100%" stopColor="#F59E0B" />
                            </linearGradient>
                        </defs>
                        <polygon points="32,2 58,16 58,48 32,62 6,48 6,16" fill="url(#nf-grad)" opacity="0.3" />
                        <polygon points="32,8 54,19 54,45 32,56 10,45 10,19" fill="url(#nf-grad)" opacity="0.5" />
                    </svg>
                </div>
                <h1 className="notfound-code gradient-text">404</h1>
                <h2 className="notfound-title">Page Not Found</h2>
                <p className="notfound-desc">The fancy item you're looking for doesn't exist. Let's get you back to shopping!</p>
                <div className="notfound-actions">
                    <Link to="/" className="btn btn-primary btn-lg" id="go-home-btn">🏠 Go Home</Link>
                    <Link to="/categories/all" className="btn btn-ghost btn-lg">Browse All Items</Link>
                </div>
            </div>
        </div>
    )
}
