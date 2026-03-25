import './LoadingScreen.css'

export default function LoadingScreen() {
    return (
        <div className="loading-screen" role="status" aria-label="Loading page">
            <div className="loading-gem">
                <svg width="60" height="60" viewBox="0 0 64 64" aria-hidden="true">
                    <defs>
                        <linearGradient id="ls-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#7C3AED" />
                            <stop offset="100%" stopColor="#F59E0B" />
                        </linearGradient>
                    </defs>
                    <polygon points="32,2 58,16 58,48 32,62 6,48 6,16" fill="url(#ls-grad)" />
                    <text x="32" y="42" fontFamily="serif" fontSize="24" fontWeight="700" fill="white" textAnchor="middle">FB</text>
                </svg>
            </div>
            <p className="loading-text">Loading FancyBazaar…</p>
            <div className="loading-bar">
                <div className="loading-bar-fill" />
            </div>
        </div>
    )
}
