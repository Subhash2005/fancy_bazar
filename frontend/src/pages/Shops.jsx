import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMapPin, FiPhone, FiClock, FiSearch, FiArrowRight, FiStar } from 'react-icons/fi'
import api from '../services/api'
import './Shops.css'

const SHOPS = [
    {
        id: 'apsara-stationery',
        name: 'Apsara Stationery Mart',
        tagline: 'Pencils, Pens & More Since 1985',
        address: '12, MG Road, Connaught Place, New Delhi – 110001',
        phone: '+91 98100 12345',
        hours: 'Mon–Sat: 9:00 AM – 8:00 PM',
        rating: 4.8,
        reviews: 312,
        image: '/images/shop_apsara.png',
        badge: '⭐ Top Rated',
        badgeColor: '#F59E0B',
        category: 'Writing Instruments',
        itemCount: 85,
        items: ['Ball Pen Blue (Pack of 10)', 'Fountain Pen with Ink Cartridges', 'Mechanical Pencil (0.5mm, Pack of 3)', 'Ultrasmooth HB Pencils (Pack of 12)', 'Highlighter Pens (6 Colors)', 'Eraser (White Vinyl, Pack of 5)', 'Yellow Highlighter Marker (Pack of 2)', 'Ink Pen Refills (Blue, Pack of 20)', 'Marker Pens Permanent (12 Colors)'],
    },
    {
        id: 'classmate-paper-house',
        name: 'Classmate Paper House',
        tagline: 'All Paper Needs Under One Roof',
        address: '34, Brigade Road, Bengaluru – 560025',
        phone: '+91 80 2345 6789',
        hours: 'Mon–Sun: 8:30 AM – 9:00 PM',
        rating: 4.6,
        reviews: 198,
        image: '/images/shop_classmate.png',
        badge: '🔥 Popular',
        badgeColor: '#EF4444',
        category: 'Paper Products',
        itemCount: 60,
        items: ['A4 Paper Ream (500 Sheets)', 'Notebook A5 Spiral (200 Pages)', 'Index Cards (100 Pack, Ruled)', 'Kraft Paper Roll (3 meters)', 'Xtra Wide Sticky Notes (5x5 inch, 4 Pads)'],
    },
    {
        id: 'camlin-art-studio',
        name: 'Camlin Art & Craft Studio',
        tagline: 'Colors That Bring Ideas to Life',
        address: '8, Linking Road, Bandra West, Mumbai – 400050',
        phone: '+91 22 2640 7890',
        hours: 'Tue–Sun: 10:00 AM – 7:30 PM',
        rating: 4.9,
        reviews: 445,
        image: '/images/shop_camlin.png',
        badge: '🎨 Best Art',
        badgeColor: '#8B5CF6',
        category: 'Art & Craft',
        itemCount: 110,
        items: ['Oil Pastels (25 Colors)', 'Watercolor Paint Set (24 Colors)', 'Drawing Compass Set', 'Kraft Paper Roll (3 meters)'],
    },
    {
        id: 'solo-office-supplies',
        name: 'Solo Office Supplies Co.',
        tagline: 'Everything for Your Desk & Beyond',
        address: '21, Anna Salai, Teynampet, Chennai – 600018',
        phone: '+91 44 4321 9876',
        hours: 'Mon–Sat: 9:00 AM – 7:00 PM',
        rating: 4.5,
        reviews: 167,
        image: '/images/shop_solo.png',
        badge: '🏢 Office Pick',
        badgeColor: '#0EA5E9',
        category: 'Office Supplies',
        itemCount: 140,
        items: ['Correction Pen (White-out)', 'Glue Stick (Pack of 6)', 'Jumbo Binder Clips (Pack of 12)', 'Quick-Dry Ink Stamp Pad (Blue)', 'Ruler (30cm Transparent, Pack of 3)', 'Scissors (Stainless Steel, 8 inch)', 'Tape Dispenser with Refill Roll', 'Velcro Cable Ties (Pack of 20)', 'Paper Clips (Silver, Box of 100)', 'Stapler with 1000 Staples', 'Hair Clips Assorted (Pack of 20)'],
    },
    {
        id: 'fancybazaar-stationery',
        name: 'FancyBazaar Stationery Hub',
        tagline: 'Your One-Stop Stationery Destination',
        address: '5, Park Street, Kolkata – 700016',
        phone: '+91 33 2229 0011',
        hours: 'Mon–Sun: 10:00 AM – 9:00 PM',
        rating: 4.7,
        reviews: 523,
        image: '/images/shop_fancybazaar.png',
        badge: '🏆 Best Value',
        badgeColor: '#10B981',
        category: 'All Categories',
        itemCount: 200,
        items: ['A4 Paper Ream (500 Sheets)', 'Ball Pen Blue (Pack of 10)', 'Notebook A5 Spiral (200 Pages)', 'Highlighter Pens (6 Colors)', 'Watercolor Paint Set (24 Colors)', 'Stapler with 1000 Staples', 'Scissors (Stainless Steel, 8 inch)', 'Oil Pastels (25 Colors)', 'Xtra Wide Sticky Notes (5x5 inch, 4 Pads)', 'Paper Clips (Silver, Box of 100)', 'Mechanical Pencil (0.5mm, Pack of 3)', 'Eraser (White Vinyl, Pack of 5)'],
    },
    {
        id: 'kores-filing-center',
        name: 'Kores Filing & Storage Center',
        tagline: 'Organize Your Space, Organize Your Life',
        address: '67, FC Road, Shivaji Nagar, Pune – 411004',
        phone: '+91 20 2567 3344',
        hours: 'Mon–Fri: 9:30 AM – 6:30 PM',
        rating: 4.4,
        reviews: 89,
        image: '/images/shop_kores.png',
        badge: '📁 Filing Expert',
        badgeColor: '#F59E0B',
        category: 'Filing & Storage',
        itemCount: 55,
        items: ['Letter File Folder (A4, Pack of 5)', 'Zip-Lock Storage Bags (A4 Size, Pack of 50)', 'Jumbo Binder Clips (Pack of 12)', 'Paper Clips (Silver, Box of 100)'],
    },
]

export default function Shops() {
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState('All')
    const [vendorShops, setVendorShops] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        api.get('/shops')
            .then(res => {
                // Normalize vendor shops to match SHOPS shape
                const normalized = (res.data.shops || []).map(s => ({
                    id: s._id,
                    name: s.name,
                    tagline: s.description || 'Merchant Shop on FancyBazaar',
                    address: s.location || 'Location not set',
                    phone: s.phone || 'Not provided',
                    hours: 'Open Daily',
                    rating: s.rating || 4.5,
                    reviews: s.reviews || 0,
                    image: s.image || `https://picsum.photos/seed/${s._id}/400/250`,
                    badge: '🏪 Vendor Shop',
                    badgeColor: '#7C3AED',
                    category: s.category || 'General',
                    itemCount: (s.products || []).length,
                    items: [],
                    isVendor: true,
                }))
                setVendorShops(normalized)
            })
            .catch(() => {})
    }, [])

    const allShops = [...SHOPS, ...vendorShops]
    const filters = ['All', 'Writing Instruments', 'Paper Products', 'Art & Craft', 'Office Supplies', 'Filing & Storage', 'General']

    const filtered = allShops.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.address.toLowerCase().includes(search.toLowerCase()) ||
            s.category.toLowerCase().includes(search.toLowerCase())
        const matchFilter = activeFilter === 'All' || s.category === activeFilter || s.category === 'All Categories'
        return matchSearch && matchFilter
    })

    return (
        <div className="shops-page">
            {/* ── Hero ── */}
            <section className="shops-hero">
                <div className="shops-hero__bg" />
                <div className="container shops-hero__content">
                    <span className="shops-hero__eyebrow">📍 Near You</span>
                    <h1 className="shops-hero__title">Browse <span className="gradient-text">Stationery Shops</span></h1>
                    <p className="shops-hero__sub">Click any shop to explore their full catalogue and buy directly</p>
                    <div className="shops-search">
                        <FiSearch className="shops-search__icon" />
                        <input
                            id="shop-search"
                            className="shops-search__input"
                            type="text"
                            placeholder="Search by shop name, city or category…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* ── Filters ── */}
            <div className="shops-filters container">
                {filters.map(f => (
                    <button
                        key={f}
                        className={`shops-filter-btn${activeFilter === f ? ' active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* ── Shop Grid ── */}
            <div className="container shops-grid">
                {filtered.length === 0 ? (
                    <div className="shops-empty">
                        <span>🔍</span>
                        <p>No shops found for "<strong>{search}</strong>"</p>
                    </div>
                ) : (
                    filtered.map(shop => (
                        <article
                            key={shop.id}
                            className="shop-card"
                            onClick={() => navigate(`/shops/${shop.id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && navigate(`/shops/${shop.id}`)}
                            aria-label={`Open ${shop.name}`}
                        >
                            {/* Image */}
                            <div className="shop-card__img-wrap">
                                <img
                                    src={shop.image}
                                    alt={shop.name}
                                    className="shop-card__img"
                                    loading="lazy"
                                />
                                <span className="shop-card__badge" style={{ background: shop.badgeColor }}>
                                    {shop.badge}
                                </span>
                                <div className="shop-card__overlay" />
                            </div>

                            {/* Body */}
                            <div className="shop-card__body">
                                <h2 className="shop-card__name">{shop.name}</h2>
                                <p className="shop-card__tagline">{shop.tagline}</p>

                                <div className="shop-card__meta">
                                    <span className="shop-card__rating">
                                        <FiStar fill="#F59E0B" color="#F59E0B" size={14} />
                                        {shop.rating} <span className="shop-card__reviews">({shop.reviews})</span>
                                    </span>
                                    <span className="shop-card__items">{shop.itemCount}+ items</span>
                                </div>

                                <div className="shop-card__info">
                                    <span className="shop-card__info-row">
                                        <FiMapPin size={13} /> {shop.address}
                                    </span>
                                    <span className="shop-card__info-row">
                                        <FiPhone size={13} /> {shop.phone}
                                    </span>
                                    <span className="shop-card__info-row">
                                        <FiClock size={13} /> {shop.hours}
                                    </span>
                                </div>

                                <button className="shop-card__cta">
                                    View Shop <FiArrowRight size={15} />
                                </button>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    )
}
