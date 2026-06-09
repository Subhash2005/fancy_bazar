import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import './Footer.css'

const LINKS = {
    Shop: [
        { label: 'Writing Instruments', to: '/categories/writing-instruments' },
        { label: 'Paper Products', to: '/categories/paper-products' },
        { label: 'Office Supplies', to: '/categories/office-supplies' },
        { label: 'Art & Craft', to: '/categories/art-craft' },
        { label: 'Wholesale', to: '/categories/wholesale' },
        { label: 'New Arrivals', to: '/categories/new-arrivals' },
        { label: 'Trending', to: '/categories/trending' },
    ],
    Account: [
        { label: 'My Orders', to: '/orders' },
        { label: 'My Profile', to: '/profile' },
        { label: 'Wishlist', to: '/wishlist' },
        { label: 'Sign In', to: '/auth/login' },
        { label: 'Register', to: '/auth/register' },
        { label: 'Wholesale Sign Up', to: '/auth/register-wholesale' },
    ],
    Support: [
        { label: 'Help Center', to: '/help' },
        { label: 'Shipping Policy', to: '/shipping' },
        { label: 'Return & Refund', to: '/returns' },
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms of Service', to: '/terms' },
        { label: 'Contact Us', to: '/contact' },
    ],
}

const PAYMENTS = ['UPI', 'Visa', 'Mastercard', 'Wallet', 'COD']

export default function Footer() {
    const { user } = useSelector(state => state.auth)
    const isTrader = user && ['vendor', 'trader_low', 'trader_bulk'].includes(user.role)

    return (
        <footer className="footer" role="contentinfo">
            <div className={`footer__top container ${isTrader ? 'footer__top--trader' : ''}`}>
                {/* Brand */}
                <div className="footer__brand">
                    <Link to="/" className="footer__logo" aria-label="FancyBazaar">
                        <svg width="36" height="36" viewBox="0 0 64 64" aria-hidden="true">
                            <defs>
                                <linearGradient id="footer-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#7C3AED" />
                                    <stop offset="100%" stopColor="#F59E0B" />
                                </linearGradient>
                            </defs>
                            <polygon points="32,2 58,16 58,48 32,62 6,48 6,16" fill="url(#footer-logo-grad)" />
                            <text x="32" y="42" fontFamily="serif" fontSize="24" fontWeight="700" fill="white" textAnchor="middle">FB</text>
                        </svg>
                        <span className="footer__brand-name">FancyBazaar</span>
                    </Link>
                    <p className="footer__tagline">
                        {isTrader ? 'Empowering Your Business.' : 'Every Fancy Thing. Delivered.'}
                    </p>
                    <p className="footer__desc">
                        {isTrader 
                            ? "India's premium marketplace for traders. Manage your shop, analyze the market, and grow your business."
                            : "India's premium online marketplace for fancy accessories, jewellery, bags, and more — catering to both retail shoppers and wholesale businesses."}
                    </p>
                    <div className="footer__socials" aria-label="Social media links">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label="Instagram">
                            <FiInstagram size={18} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label="Twitter">
                            <FiTwitter size={18} />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label="Facebook">
                            <FiFacebook size={18} />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label="YouTube">
                            <FiYoutube size={18} />
                        </a>
                    </div>
                </div>

                {/* Links */}
                {Object.entries(LINKS).map(([section, links]) => {
                    if (isTrader && (section === 'Shop' || section === 'Account')) return null;
                    return (
                        <div key={section} className="footer__col">
                            <h3 className="footer__col-title">{section}</h3>
                            <ul className="footer__col-links">
                                {links.map(link => (
                                    <li key={link.to}>
                                        <Link to={link.to} className="footer__link">{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}

                {/* Contact */}
                <div className="footer__col">
                    <h3 className="footer__col-title">Contact</h3>
                    <ul className="footer__contact-list">
                        <li>
                            <FiMail size={14} aria-hidden="true" />
                            <a href="mailto:subhash1422005s@gmail.com" className="footer__link">subhash1422005s@gmail.com</a>
                        </li>
                        <li>
                            <FiPhone size={14} aria-hidden="true" />
                            <a href="tel:+917695903778" className="footer__link">+91 7695903778</a>
                        </li>
                        <li>
                            <FiMapPin size={14} aria-hidden="true" />
                            <span className="footer__link-text">Vyasarpadi, Chennai</span>
                        </li>
                    </ul>
                    {!isTrader && (
                        <div className="footer__newsletter">
                            <p className="footer__newsletter-label">Get exclusive deals</p>
                            <form className="footer__newsletter-form" onSubmit={e => { e.preventDefault(); alert('Subscribed!') }}>
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="form-input footer__newsletter-input"
                                    aria-label="Email for newsletter"
                                    required
                                />
                                <button type="submit" className="btn btn-primary btn-sm">Subscribe</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="footer__bottom">
                <div className="footer__bottom-inner container">
                    <p className="footer__copy">
                        © {new Date().getFullYear()} FancyBazaar. All rights reserved.
                    </p>
                    <div className="footer__payments" aria-label="Accepted payment methods">
                        {PAYMENTS.map(p => (
                            <span key={p} className="footer__payment-tag">{p}</span>
                        ))}
                    </div>
                    <div className="footer__badges">
                        <span className="footer__badge">🔒 SSL Secured</span>
                        <span className="footer__badge">🛡️ GST Compliant</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
