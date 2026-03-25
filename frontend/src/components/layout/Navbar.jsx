import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX,
    FiChevronDown, FiPackage, FiLogOut, FiSettings, FiGrid
} from 'react-icons/fi'
import { logout } from '../../store/slices/authSlice'
import { selectCartCount } from '../../store/slices/cartSlice'
import { debounce } from '../../utils/pricing'
import api from '../../services/api'
import './Navbar.css'

const CATEGORIES = [
    { label: 'Hair Accessories', slug: 'hair-accessories', icon: '💇' },
    { label: 'Jewellery', slug: 'jewellery', icon: '💍' },
    { label: 'Bags & Purses', slug: 'bags-purses', icon: '👜' },
    { label: 'Watches', slug: 'watches', icon: '⌚' },
    { label: 'Scarves & Stoles', slug: 'scarves-stoles', icon: '🧣' },
    { label: 'Sunglasses', slug: 'sunglasses', icon: '🕶️' },
    { label: 'Keychains', slug: 'keychains', icon: '🔑' },
    { label: 'Gift Sets', slug: 'gift-sets', icon: '🎁' },
]

export default function Navbar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useSelector(state => state.auth)
    const cartCount = useSelector(selectCartCount)
    const wishlistCount = useSelector(state => state.wishlist.items.length)

    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [catMenuOpen, setCatMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    const searchRef = useRef(null)
    const userMenuRef = useRef(null)

    // Scroll detection for sticky shadow
    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handler, { passive: true })
        return () => window.removeEventListener('scroll', handler)
    }, [])

    // Close dropdowns on route change
    useEffect(() => {
        setMobileOpen(false)
        setUserMenuOpen(false)
        setCatMenuOpen(false)
    }, [location])

    // Debounced search — queries both regular products AND vendor shop products
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchSuggestions = useCallback(
        debounce(async (q) => {
            if (!q.trim() || q.length < 2) { setSuggestions([]); return }
            try {
                const [prodRes, shopRes] = await Promise.allSettled([
                    api.get(`/products/search?q=${encodeURIComponent(q)}&limit=5`),
                    api.get(`/shops/search?q=${encodeURIComponent(q)}`),
                ])
                const products = prodRes.status === 'fulfilled' ? (prodRes.value.data.products || []) : []
                const vendorItems = shopRes.status === 'fulfilled' ? (shopRes.value.data.results || []) : []

                // Normalize vendor items to same shape as products for the dropdown
                const normalizedVendor = vendorItems.map(v => ({
                    _id: v._id,
                    name: v.name,
                    variants: [{ retailPrice: v.price }],
                    images: [{ url: v.imageUrl }],
                    _vendorShopId: v.shopId,   // custom flag
                    _shopName: v.shopName,
                    type: 'vendor',
                }))

                setSuggestions([...products, ...normalizedVendor].slice(0, 8))
            } catch { setSuggestions([]) }
        }, 300),
        []
    )

    useEffect(() => { fetchSuggestions(searchQuery) }, [searchQuery, fetchSuggestions])

    // Click outside to close user menu
    useEffect(() => {
        function handler(e) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/categories/all?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchOpen(false)
            setSuggestions([])
            setSearchQuery('')
        }
    }

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
    }

    return (
        <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} role="banner">
            <div className="navbar__inner container">

                {/* Logo */}
                <Link to="/" className="navbar__logo" aria-label="FancyBazaar Home">
                    <svg width="32" height="32" viewBox="0 0 64 64" aria-hidden="true">
                        <defs>
                            <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7C3AED" />
                                <stop offset="100%" stopColor="#F59E0B" />
                            </linearGradient>
                        </defs>
                        <polygon points="32,2 58,16 58,48 32,62 6,48 6,16" fill="url(#logo-grad)" />
                        <text x="32" y="42" fontFamily="serif" fontSize="24" fontWeight="700" fill="white" textAnchor="middle">FB</text>
                    </svg>
                    <span className="navbar__brand">
                        Fancy<span className="navbar__brand-accent">Bazaar</span>
                    </span>
                </Link>

                {/* Categories dropdown — desktop */}
                <nav className="navbar__nav hidden-mobile" aria-label="Main navigation">
                    <div className="navbar__cat-toggle" onMouseEnter={() => setCatMenuOpen(true)} onMouseLeave={() => setCatMenuOpen(false)}>
                        <button className="navbar__nav-btn" aria-expanded={catMenuOpen} aria-haspopup="true">
                            <FiGrid size={16} /> Categories <FiChevronDown size={14} />
                        </button>
                        {catMenuOpen && (
                            <div className="navbar__cat-dropdown" role="menu" aria-label="Product categories">
                                <div className="navbar__cat-dropdown-inner">
                                    {CATEGORIES.map(cat => (
                                        <Link key={cat.slug} to={`/categories/${cat.slug}`} className="navbar__cat-item" role="menuitem">
                                            <span aria-hidden="true">{cat.icon}</span> {cat.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Search bar — desktop */}
                <form className="navbar__search hidden-mobile" onSubmit={handleSearch} role="search">
                    <FiSearch className="navbar__search-icon" aria-hidden="true" />
                    <input
                        ref={searchRef}
                        type="search"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search fancy items..."
                        className="navbar__search-input"
                        aria-label="Search products"
                        autoComplete="off"
                    />
                    {suggestions.length > 0 && (
                        <div className="navbar__suggestions" role="listbox" aria-label="Search suggestions">
                            {suggestions.map(p => (
                                <button
                                    key={p._id}
                                    type="button"
                                    className="navbar__suggestion-item"
                                    role="option"
                                    onClick={() => {
                                        if (p.type === 'vendor') {
                                            // Vendor shop item → go to the shop page
                                            navigate(`/shops/${p._vendorShopId}`)
                                        } else {
                                            navigate(`/product/${p._id}`)
                                        }
                                        setSearchQuery('')
                                        setSuggestions([])
                                    }}
                                >
                                    <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt="" className="navbar__suggestion-img" />
                                    <span style={{ flex: 1, textAlign: 'left' }}>
                                        {p.name}
                                        {p.type === 'vendor' && (
                                            <small style={{ display: 'block', color: '#7C3AED', fontSize: '0.72rem' }}>
                                                🏪 {p._shopName}
                                            </small>
                                        )}
                                    </span>
                                    <span className="navbar__suggestion-price">₹{p.variants?.[0]?.retailPrice}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </form>

                {/* Right icons */}
                <div className="navbar__actions">
                    {/* Mobile search toggle */}
                    <button
                        className="navbar__icon-btn show-mobile"
                        onClick={() => setSearchOpen(!searchOpen)}
                        aria-label="Toggle search"
                    >
                        {searchOpen ? <FiX size={20} /> : <FiSearch size={20} />}
                    </button>

                    {/* Wishlist */}
                    <Link to="/wishlist" className="navbar__icon-btn" aria-label={`Wishlist (${wishlistCount} items)`}>
                        <FiHeart size={20} />
                        {wishlistCount > 0 && <span className="navbar__badge" aria-hidden="true">{wishlistCount}</span>}
                    </Link>

                    {/* Cart */}
                    <Link to="/cart" className="navbar__icon-btn" aria-label={`Shopping cart (${cartCount} items)`}>
                        <FiShoppingCart size={20} />
                        {cartCount > 0 && <span className="navbar__badge navbar__badge--accent" aria-hidden="true">{cartCount}</span>}
                    </Link>

                    {/* User menu */}
                    {user ? (
                        <div className="navbar__user-menu" ref={userMenuRef}>
                            <button
                                className="navbar__user-btn"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                aria-expanded={userMenuOpen}
                                aria-haspopup="true"
                                aria-label="User menu"
                            >
                                <div className="navbar__avatar" aria-hidden="true">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="navbar__user-name hidden-mobile">{user.name?.split(' ')[0]}</span>
                                <FiChevronDown size={14} className="hidden-mobile" />
                            </button>
                            {userMenuOpen && (
                                <div className="navbar__user-dropdown" role="menu">
                                    <div className="navbar__user-info">
                                        <strong>{user.name}</strong>
                                        <span>{user.role === 'wholesale' ? '🏭 Wholesale' : user.role === 'vendor' ? '🏪 Merchant' : '🛍️ Retail'}</span>
                                    </div>
                                    <div className="navbar__divider" />
                                    <Link to="/profile" className="navbar__user-item" role="menuitem"><FiUser size={14} /> My Profile</Link>
                                    <Link to="/orders" className="navbar__user-item" role="menuitem"><FiPackage size={14} /> My Orders</Link>
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className="navbar__user-item" role="menuitem"><FiSettings size={14} /> Admin Panel</Link>
                                    )}
                                    {user.role === 'vendor' && (
                                        <Link to="/vendor" className="navbar__user-item" role="menuitem"><FiSettings size={14} /> Vendor Dashboard</Link>
                                    )}
                                    <div className="navbar__divider" />
                                    <button className="navbar__user-item navbar__user-logout" onClick={handleLogout} role="menuitem">
                                        <FiLogOut size={14} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/auth/login" className="btn btn-primary btn-sm" id="nav-login-btn">
                            <FiUser size={15} /> Sign In
                        </Link>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        className="navbar__icon-btn show-mobile"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>
                </div>
            </div>

            {/* Secondary strip — Trending | New Arrivals | Wholesale */}
            <div className="navbar__secondary hidden-mobile" aria-label="Quick links">
                <Link to="/categories/trending" className="navbar__sec-link navbar__sec-link--hot" id="nav-trending-link">
                    🔥 Trending
                </Link>
                <span className="navbar__sec-divider" aria-hidden="true" />
                <Link to="/categories/new-arrivals" className="navbar__sec-link navbar__sec-link--new" id="nav-new-arrivals-link">
                    ✨ New Arrivals
                </Link>
                <span className="navbar__sec-divider" aria-hidden="true" />
                <Link to="/categories/wholesale" className="navbar__sec-link navbar__sec-link--wholesale" id="nav-wholesale-link">
                    🏭 Wholesale
                </Link>
                <span className="navbar__sec-divider" aria-hidden="true" />
                <Link to="/shops" className="navbar__sec-link" id="nav-shops-link" style={{ color: '#10B981' }}>
                    🏪 Shops
                </Link>
            </div>

            {/* Mobile search bar */}
            {searchOpen && (
                <div className="navbar__mobile-search show-mobile animate-fade-in">
                    <form onSubmit={handleSearch} role="search" className="navbar__mobile-search-form">
                        <input
                            autoFocus
                            type="search"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search fancy items..."
                            className="navbar__search-input"
                            aria-label="Search products"
                        />
                        <button type="submit" className="btn btn-primary btn-sm">Go</button>
                    </form>
                    {suggestions.length > 0 && (
                        <div className="navbar__suggestions navbar__suggestions--mobile">
                            {suggestions.map(p => (
                                <button key={p._id} type="button" className="navbar__suggestion-item"
                                    onClick={() => { navigate(`/product/${p._id}`); setSearchOpen(false); setSuggestions([]); setSearchQuery('') }}>
                                    <span>{p.name}</span>
                                    <span className="navbar__suggestion-price">₹{p.variants?.[0]?.retailPrice}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Mobile menu */}
            {mobileOpen && (
                <nav className="navbar__mobile-menu show-mobile animate-fade-in" aria-label="Mobile navigation">
                    <div className="navbar__mobile-cats">
                        <p className="navbar__mobile-section-label">Categories</p>
                        {CATEGORIES.map(cat => (
                            <Link key={cat.slug} to={`/categories/${cat.slug}`} className="navbar__mobile-cat-item">
                                {cat.icon} {cat.label}
                            </Link>
                        ))}
                    </div>
                    <div className="navbar__divider" />
                    <Link to="/categories/trending" className="navbar__mobile-cat-item">🔥 Trending</Link>
                    <Link to="/categories/new-arrivals" className="navbar__mobile-cat-item">✨ New Arrivals</Link>
                    <Link to="/categories/wholesale" className="navbar__mobile-cat-item">🏭 Wholesale</Link>
                    <Link to="/shops" className="navbar__mobile-cat-item" style={{ color: '#10B981', fontWeight: 600 }}>🏪 Shops</Link>
                </nav>
            )}
        </header>
    )
}
