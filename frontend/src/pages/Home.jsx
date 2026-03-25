import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiShoppingBag, FiTruck, FiShield, FiRefreshCw, FiMapPin, FiStar } from 'react-icons/fi'
import ProductCard from '../components/products/ProductCard'
import SEO from '../components/layout/SEO'
import api from '../services/api'
import './Home.css'

// Real stationery products with accurate names & images
const SAMPLE_PRODUCTS = [
    { _id: 'luxury-rose-gold-watch', name: 'Luxury Rose Gold Watch', category: { name: 'Watches' }, images: [{ url: '/images/prod_highlighter6.png', alt: 'Watch' }], variants: [{ sku: 'WATCH-GOLD', retailPrice: 1599, originalPrice: 1999, stock: 15, wholesalePrices: { low: 1599, mid: 1350, high: 1100 } }], ratings: { avg: 4.8, count: 124 }, isTrending: true },
    { _id: 'designer-sunglasses-v2', name: 'Designer Sunglasses', category: { name: 'Sunglasses' }, images: [{ url: '/images/prod_hair_clips.jpg', alt: 'Sunglasses' }], variants: [{ sku: 'SUN-DG-01', retailPrice: 1899, originalPrice: 2499, stock: 45, wholesalePrices: { low: 1899, mid: 1615, high: 1330 } }], ratings: { avg: 4.9, count: 112 }, isTrending: true },
    { _id: 'scented-candle-set-premium', name: 'Scented Candle Set', category: { name: 'Gift Sets' }, images: [{ url: '/images/prod_glue_stick.jpg', alt: 'Candle Set' }], variants: [{ sku: 'CNDL-SET', retailPrice: 799, originalPrice: 999, stock: 60, wholesalePrices: { low: 799, mid: 680, high: 560 } }], ratings: { avg: 4.7, count: 128 }, isTrending: true },
    { _id: 'silk-scarf-blue', name: 'Silk Scarf Blue', category: { name: 'Scarves' }, images: [{ url: '/images/prod_velcro_ties.jpg', alt: 'Scarf' }], variants: [{ sku: 'SCARF-BLU', retailPrice: 499, originalPrice: 699, stock: 25, wholesalePrices: { low: 499, mid: 420, high: 350 } }], ratings: { avg: 4.6, count: 42 }, isTrending: true },
    { _id: 'embroidered-tote-bag-floral', name: 'Embroidered Tote Bag', category: { name: 'Bags' }, images: [{ url: '/images/prod_velcro_ties.jpg', alt: 'Tote Bag' }], variants: [{ sku: 'TOTE-EMB', retailPrice: 1299, originalPrice: 1599, stock: 85, wholesalePrices: { low: 1299, mid: 1105, high: 910 } }], ratings: { avg: 4.7, count: 167 }, isTrending: true },
]

const PREVIEW_SHOPS = [
    {
        id: 'apsara-stationery',
        name: 'Apsara Stationery Mart',
        tagline: 'Pencils, Pens & More Since 1985',
        address: 'MG Road, New Delhi',
        rating: 4.8, reviews: 312, items: 85,
        badge: '⭐ Top Rated',
        badgeColor: '#F59E0B',
        image: '/images/shop_apsara.png',
    },
    {
        id: 'classmate-paper-house',
        name: 'Classmate Paper House',
        tagline: 'All Paper Needs Under One Roof',
        address: 'Brigade Road, Bengaluru',
        rating: 4.6, reviews: 198, items: 60,
        badge: '🔥 Popular',
        badgeColor: '#EF4444',
        image: '/images/shop_classmate.png',
    },
    {
        id: 'camlin-art-studio',
        name: 'Camlin Art & Craft Studio',
        tagline: 'Colors That Bring Ideas to Life',
        address: 'Linking Road, Mumbai',
        rating: 4.9, reviews: 445, items: 110,
        badge: '🎨 Best Art',
        badgeColor: '#8B5CF6',
        image: '/images/shop_camlin.png',
    },
    {
        id: 'solo-office-supplies',
        name: 'Solo Office Supplies Co.',
        tagline: 'Everything for Your Desk & Beyond',
        address: 'Anna Salai, Chennai',
        rating: 4.5, reviews: 167, items: 140,
        badge: '🏢 Office Pick',
        badgeColor: '#0EA5E9',
        image: '/images/shop_solo.png',
    },
    {
        id: 'fancybazaar-stationery',
        name: 'FancyBazaar Stationery Hub',
        tagline: 'Your One-Stop Stationery Destination',
        address: 'Park Street, Kolkata',
        rating: 4.7, reviews: 523, items: 200,
        badge: '🏆 Best Value',
        badgeColor: '#10B981',
        image: '/images/shop_fancybazaar.png',
    },
]

const BANNERS = [
    { id: 1, title: 'Premium Writing Instruments', subtitle: 'Pens, pencils & markers for every need', cta: 'Shop Now', slug: 'writing-instruments', gradient: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' },
    { id: 2, title: 'Wholesale Stationery Deals', subtitle: 'Up to 30% off on bulk orders of 50+ items', cta: 'Buy Wholesale', slug: 'wholesale', gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)' },
    { id: 3, title: 'Art & Craft Supplies', subtitle: 'Watercolors, oil pastels & more for every artist', cta: 'Explore', slug: 'art-craft', gradient: 'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)' },
]

const PERKS = [
    { icon: <FiTruck size={24} />, title: 'Free Delivery', desc: 'On orders above ₹999', color: 'var(--clr-primary)' },
    { icon: <FiRefreshCw size={24} />, title: 'Easy Returns', desc: '7-day hassle-free returns', color: 'var(--clr-secondary)' },
    { icon: <FiShield size={24} />, title: 'Secure Payments', desc: 'UPI, Card, COD & more', color: 'var(--clr-success)' },
    { icon: <FiShoppingBag size={24} />, title: 'Wholesale Available', desc: 'Tiered pricing for businesses', color: 'var(--clr-info)' },
]

export default function Home() {
    const [trending, setTrending] = useState(SAMPLE_PRODUCTS)
    const [newArrivals, setNewArrivals] = useState(SAMPLE_PRODUCTS.slice(4, 12))
    const [activeBanner, setActiveBanner] = useState(0)
    const navigate = useNavigate()

    // Auto-cycle banners
    useEffect(() => {
        const interval = setInterval(() => setActiveBanner(prev => (prev + 1) % BANNERS.length), 4000)
        return () => clearInterval(interval)
    }, [])

    // Fetch real products
    useEffect(() => {
        // Trending
        api.get('/products?isTrending=true&limit=8')
            .then(res => { if (res.data?.products?.length) setTrending(res.data.products) })
            .catch(() => { })

        // New Arrivals
        api.get('/products?category=new-arrivals&limit=8')
            .then(res => { if (res.data?.products?.length) setNewArrivals(res.data.products) })
            .catch(() => { })
    }, [])

    return (
        <div className="home-page">
            <SEO 
                title="Home | Premier Marketplace" 
                description="Browse luxury watches, stationery, and premium gifts at wholesale and retail prices on FancyBazaar."
            />
            {/* Announcement Bar */}
            {/* ===== HERO BANNER ===== */}
            <section className="hero" aria-label="Featured promotions">
                {BANNERS.map((banner, i) => (
                    <div
                        key={banner.id}
                        className={`hero__slide${i === activeBanner ? ' hero__slide--active' : ''}`}
                        style={{ background: banner.gradient }}
                        aria-hidden={i !== activeBanner}
                    >
                        <div className="hero__content container">
                            <div className="hero__text animate-fade-in-up">
                                <span className="badge badge-accent hero__badge">✨ Featured</span>
                                <h1 className="hero__title">{banner.title}</h1>
                                <p className="hero__subtitle">{banner.subtitle}</p>
                                <Link
                                    to={`/categories/${banner.slug}`}
                                    className="btn btn-accent btn-lg hero__cta"
                                    id={`hero-cta-${banner.id}`}
                                >
                                    {banner.cta} <FiArrowRight />
                                </Link>
                            </div>
                            <div className="hero__visual" aria-hidden="true">
                                <div className="hero__gem-ring">
                                    <div className="hero__gem" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Banner indicators */}
                <div className="hero__indicators" role="tablist" aria-label="Banner navigation">
                    {BANNERS.map((b, i) => (
                        <button
                            key={b.id}
                            className={`hero__indicator${i === activeBanner ? ' hero__indicator--active' : ''}`}
                            onClick={() => setActiveBanner(i)}
                            role="tab"
                            aria-selected={i === activeBanner}
                            aria-label={`${b.title} banner`}
                        />
                    ))}
                </div>
            </section>

            {/* ===== PERKS BAR ===== */}
            <section className="perks-bar" aria-label="Why shop with us">
                <div className="container">
                    <div className="perks-bar__grid">
                        {PERKS.map((p) => (
                            <div key={p.title} className="perk-item">
                                <div className="perk-item__icon" style={{ color: p.color, background: `${p.color}18` }}>
                                    {p.icon}
                                </div>
                                <div>
                                    <h3 className="perk-item__title">{p.title}</h3>
                                    <p className="perk-item__desc">{p.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SHOPS PREVIEW ===== */}
            <section className="section shops-preview-section" aria-labelledby="shops-heading">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title" id="shops-heading">🏪 Browse <span className="gradient-text">Shops</span></h2>
                            <p className="section-subtitle">Explore curated stationery shops — click to see all items</p>
                        </div>
                        <Link to="/shops" className="btn btn-ghost btn-sm hidden-mobile" id="home-view-all-shops">
                            View All Shops <FiArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="home-shops-grid">
                        {PREVIEW_SHOPS.map((shop) => (
                            <article
                                key={shop.id}
                                className="home-shop-card"
                                onClick={() => navigate(`/shops/${shop.id}`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && navigate(`/shops/${shop.id}`)}
                                aria-label={`Open ${shop.name}`}
                            >
                                <div className="home-shop-card__img-wrap">
                                    <img src={shop.image} alt={shop.name} className="home-shop-card__img" loading="lazy" />
                                    <span className="home-shop-card__badge" style={{ background: shop.badgeColor }}>{shop.badge}</span>
                                    <div className="home-shop-card__overlay" />
                                </div>
                                <div className="home-shop-card__body">
                                    <h3 className="home-shop-card__name">{shop.name}</h3>
                                    <p className="home-shop-card__tagline">{shop.tagline}</p>
                                    <div className="home-shop-card__meta">
                                        <span className="home-shop-card__rating">
                                            <FiStar fill="#F59E0B" color="#F59E0B" size={13} />
                                            {shop.rating}
                                            <span className="home-shop-card__rev">({shop.reviews})</span>
                                        </span>
                                        <span className="home-shop-card__items">{shop.items}+ items</span>
                                    </div>
                                    <span className="home-shop-card__addr">
                                        <FiMapPin size={11} /> {shop.address}
                                    </span>
                                    <span className="home-shop-card__cta">Explore Shop <FiArrowRight size={12} /></span>
                                </div>
                            </article>
                        ))}
                    </div>
                    <div className="shops-preview-more">
                        <Link to="/shops" className="btn btn-primary" id="home-shops-more-btn">
                            View All 6 Shops <FiArrowRight size={15} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== TRENDING PRODUCTS ===== */}
            <section className="section" aria-labelledby="trending-heading">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title" id="trending-heading">🔥 Trending <span className="gradient-text">Right Now</span></h2>
                            <p className="section-subtitle">What everyone is buying this season</p>
                        </div>
                        <Link to="/categories/trending" className="btn btn-ghost btn-sm hidden-mobile">
                            See All <FiArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="products-grid" role="list">
                        {trending.map((product) => (
                            <div key={product._id} role="listitem">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== WHOLESALE BANNER ===== */}
            <section className="wholesale-banner" aria-labelledby="wholesale-heading">
                <div className="container">
                    <div className="wholesale-banner__inner">
                        <div className="wholesale-banner__content">
                            <span className="badge badge-accent">🏭 For Businesses</span>
                            <h2 className="wholesale-banner__title" id="wholesale-heading">
                                Buy Wholesale at <span className="gradient-text">Unbeatable Prices</span>
                            </h2>
                            <p className="wholesale-banner__desc">
                                Order 10+ items and save 15%. Order 50+ and save 30%. Exclusive pricing tiers for registered wholesale buyers.
                            </p>
                            <div className="wholesale-tier-cards">
                                {[
                                    { tier: 'Mid', qty: '10-49 items', discount: '15% OFF', color: 'var(--clr-primary)' },
                                    { tier: 'High', qty: '50+ items', discount: '30% OFF', color: 'var(--clr-secondary)' },
                                ].map(t => (
                                    <div key={t.tier} className="tier-card" style={{ borderColor: t.color }}>
                                        <span className="tier-card__tier" style={{ color: t.color }}>{t.tier} Volume</span>
                                        <span className="tier-card__qty">{t.qty}</span>
                                        <span className="tier-card__discount" style={{ color: t.color }}>{t.discount}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="wholesale-banner__actions">
                                <Link to="/auth/register-wholesale" className="btn btn-accent btn-lg" id="wholesale-register-btn">
                                    Register as Wholesaler
                                </Link>
                                <Link to="/categories/wholesale" className="btn btn-secondary">
                                    Browse Wholesale
                                </Link>
                            </div>
                        </div>
                        <div className="wholesale-banner__graphic" aria-hidden="true">
                            <div className="wholesale-banner__stat">
                                <span className="wholesale-banner__stat-num">2,500+</span>
                                <span className="wholesale-banner__stat-label">Products Available</span>
                            </div>
                            <div className="wholesale-banner__stat">
                                <span className="wholesale-banner__stat-num">500+</span>
                                <span className="wholesale-banner__stat-label">Wholesale Buyers</span>
                            </div>
                            <div className="wholesale-banner__stat">
                                <span className="wholesale-banner__stat-num">30%</span>
                                <span className="wholesale-banner__stat-label">Max Savings</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== NEW ARRIVALS ===== */}
            <section className="section" aria-labelledby="new-arrivals-heading">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title" id="new-arrivals-heading">✨ New <span className="gradient-text">Arrivals</span></h2>
                            <p className="section-subtitle">Fresh additions to our collection</p>
                        </div>
                        <Link to="/categories/new-arrivals" className="btn btn-ghost btn-sm hidden-mobile">
                            View All <FiArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="products-grid" role="list">
                        {newArrivals.map((product) => (
                            <div key={product._id} role="listitem">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    )
}
