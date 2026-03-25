import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiHeart, FiShoppingCart, FiTruck, FiShield, FiStar, FiMinus, FiPlus, FiShare2, FiChevronLeft, FiChevronRight, FiArrowLeft, FiRefreshCw } from 'react-icons/fi'
import SEO from '../components/layout/SEO'
import { addToCart } from '../store/slices/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '../store/slices/wishlistSlice'
import { formatINR, getEffectivePrice, getWholesaleTier } from '../utils/pricing'
import AIColorPreview from '../components/products/ColorPreview'
import api from '../services/api'
import toast from 'react-hot-toast'
import './ProductDetail.css'

// Demo product data
const DEMO_PRODUCT = {
    _id: 'demo_001',
    name: 'Crystal Hair Pin Collection',
    description: 'Elevate your look with this exquisite set of crystal-encrusted hair pins, handcrafted with premium Austrian crystals. Perfect for weddings, parties, or everyday elegance. Each set includes 6 uniquely designed pins that shimmer in any light.',
    category: { name: 'Hair Accessories', slug: 'hair-accessories' },
    brand: 'FancyBazaar Exclusive',
    deliveryDays: 3,
    gstRate: 12,
    hsn: '96151100',
    ratings: { avg: 4.7, count: 342 },
    images: [
        { url: 'https://images.unsplash.com/photo-1603006905393-f437648d88da?w=800', alt: 'Premium Product View 1' },
        { url: 'https://images.unsplash.com/photo-1596435707100-2b1032cf4cca?w=800', alt: 'Premium Product View 2' },
        { url: 'https://images.unsplash.com/photo-1615485240364-531639f7274f?w=800', alt: 'Premium Product View 3' },
        { url: 'https://images.unsplash.com/photo-1620843021912-1436cc5505c2?w=800', alt: 'Premium Product View 4' },
    ],
    variants: [
        { sku: 'CHP-GLD-M', color: '#FFD700', size: 'Medium', design: 'Classic', stock: 24, retailPrice: 299, originalPrice: 399, wholesalePrices: { low: 299, mid: 254, high: 209 } },
        { sku: 'CHP-SLV-M', color: '#C0C0C0', size: 'Medium', design: 'Classic', stock: 18, retailPrice: 299, originalPrice: 399, wholesalePrices: { low: 299, mid: 254, high: 209 } },
        { sku: 'CHP-RSG-M', color: '#B76E79', size: 'Medium', design: 'Floral', stock: 0, retailPrice: 349, originalPrice: 449, wholesalePrices: { low: 349, mid: 297, high: 244 } },
        { sku: 'CHP-GLD-L', color: '#FFD700', size: 'Large', design: 'Classic', stock: 12, retailPrice: 349, originalPrice: 449, wholesalePrices: { low: 349, mid: 297, high: 244 } },
        { sku: 'CHP-PRL-L', color: '#F0F0F0', size: 'Large', design: 'Pearl', stock: 8, retailPrice: 399, originalPrice: 499, wholesalePrices: { low: 399, mid: 339, high: 279 } },
    ],
    reviews: [
        { _id: 'r1', user: { name: 'Priya S.' }, rating: 5, comment: 'Absolutely stunning! The crystals are so sparkly and the quality is amazing.', createdAt: '2025-12-15T00:00:00Z' },
        { _id: 'r2', user: { name: 'Anjali R.' }, rating: 4, comment: 'Beautiful pins. Exactly as shown in photos. Fast delivery!', createdAt: '2025-12-08T00:00:00Z' },
        { _id: 'r3', user: { name: 'Meera K.' }, rating: 5, comment: 'Ordered 50 sets for my boutique. Perfect for wholesale. Great discount!', createdAt: '2025-11-20T00:00:00Z' },
    ],
    isFeatured: true,
    isTrending: true,
}

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector(state => state.auth)
    const isWishlisted = useSelector(selectIsWishlisted(id))

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(0)
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [qty, setQty] = useState(1)
    const [buyerType, setBuyerType] = useState('retail')
    const [activeTab, setActiveTab] = useState('description')

    useEffect(() => {
        setLoading(true)
        api.get(`/products/${id}`)
            .then(res => { setProduct(res.data.product); setSelectedVariant(res.data.product.variants?.[0]) })
            .catch(() => { 
                // Context-aware fallback to avoid "Golden Gate Bridge" confusion
                let mock = { ...DEMO_PRODUCT, _id: id }
                
                // Specific mocks for common local path triggers
                if (id.toLowerCase().includes('a4')) {
                    mock.name = 'Premium A4 Copier Paper';
                    mock.images = [{ url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&q=80', alt: 'A4 Paper' }];
                    mock.category = { name: 'Paper Products', slug: 'paper-products' };
                } else if (id.toLowerCase().includes('sunglasses')) {
                    mock.name = 'Designer Sunglasses';
                    mock.images = [{ url: 'https://images.unsplash.com/photo-1511499767390-90342f16b147?w=800&q=80', alt: 'Sunglasses' }];
                    mock.category = { name: 'Sunglasses', slug: 'sunglasses' };
                } else if (id.toLowerCase().includes('scarf')) {
                    mock.name = 'Silk Scarf Blue';
                    mock.images = [
                        { url: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa82?w=800', alt: 'Silk Scarf' },
                        { url: 'https://images.unsplash.com/photo-1456885284447-7dd4bb87208f?w=800', alt: 'Scarf Detail' }
                    ]
                    mock.category = { name: 'Scarves & Stoles', slug: 'scarves-stoles' };
                } else if (id.toLowerCase().includes('rose') || id.toLowerCase().includes('watch')) {
                    mock.name = 'Luxury Rose Gold Watch';
                    mock.images = [
                        { url: 'https://images.unsplash.com/photo-1524592091214-8f97ad332c67?w=800', alt: 'Rose Gold Watch' },
                        { url: 'https://images.unsplash.com/photo-1434056886845-dac89997b0ee?w=800', alt: 'Watch Detail' }
                    ]
                    mock.category = { name: 'Watches', slug: 'watches' };
                } else {
                    // Default fallback images that are NOT random bridges
                    mock.images = [
                        { url: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=800&q=80', alt: 'Fancy Item' }
                    ]
                }
                
                setProduct(mock); 
                setSelectedVariant(mock.variants[0]) 
            })
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div className="product-detail-loading container">
            <div className="product-detail-skeleton">
                <div className="skeleton" style={{ height: 480, borderRadius: 16 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: [32, 20, 44, 60, 80, 48][i] }} />
                    ))}
                </div>
            </div>
        </div>
    )

    if (!product) return null

    const price = selectedVariant ? getEffectivePrice(selectedVariant, qty, buyerType) : 0
    const tier = buyerType === 'wholesale' ? getWholesaleTier(qty) : null
    const discountPct = selectedVariant?.originalPrice
        ? Math.round((1 - price / selectedVariant.originalPrice) * 100)
        : null
    const deliveryDate = new Date(Date.now() + (product.deliveryDays || 3) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })

    // Unique colours available
    const uniqueColors = [...new Map(product.variants.map(v => [v.color, v])).values()]
    const uniqueSizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))]

    function handleAddToCart() {
        if (!selectedVariant || selectedVariant.stock === 0) { toast.error('Please select an available variant'); return }
        dispatch(addToCart({ product, variant: selectedVariant, qty, buyerType }))
        toast.success('Added to cart!')
    }

    function handleBuyNow() {
        handleAddToCart()
        navigate('/cart')
    }

    function selectColor(color) {
        const v = product.variants.find(v => v.color === color)
        if (v) setSelectedVariant(v)
    }

    function selectSize(size) {
        const v = product.variants.find(v => v.size === size && (selectedVariant?.color ? v.color === selectedVariant.color : true))
        if (v) setSelectedVariant(v)
    }
    if (loading) return (
        <div className="pd-loading">
            <SEO title="Loading Product..." />
            <div className="skeleton pd-skeleton-hero" />
        </div>
    )

    if (!product) return (
        <div className="pd-error">
            <SEO title="Product Not Found" />
            <h2>Product not found</h2>
            <button onClick={() => navigate('/')} className="btn btn-primary">Go Home</button>
        </div>
    )

    const price = selectedVariant ? getEffectivePrice(selectedVariant, qty, buyerType) : 0
    const tier = buyerType === 'wholesale' ? getWholesaleTier(qty) : null
    const discountPct = selectedVariant?.originalPrice
        ? Math.round((1 - price / selectedVariant.originalPrice) * 100)
        : null
    const deliveryDate = new Date(Date.now() + (product.deliveryDays || 3) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })

    // Unique colours available
    const uniqueColors = [...new Map(product.variants.map(v => [v.color, v])).values()]
    const uniqueSizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))]

    return (
        <div className="product-detail-page">
            <SEO 
                title={product.name} 
                description={product.description} 
                image={product.images?.[0]?.url}
                type="product"
            />
            {/* Announcement / Breadcrumb strip */}
            <div className="container">
                {/* Breadcrumb */}
                <nav className="product-breadcrumb" aria-label="Breadcrumb">
                    <button onClick={() => navigate(-1)} className="product-breadcrumb__back" aria-label="Go back">
                        <FiChevronLeft size={14} /> Back
                    </button>
                    <span>/ {product.category?.name} / <span aria-current="page">{product.name}</span></span>
                </nav>

                <div className="product-detail__grid">

                    {/* ===== IMAGE GALLERY ===== */}
                    <div className="product-gallery">
                        <div className="product-gallery__main">
                            <img
                                src={product.images?.[activeImage]?.url}
                                alt={product.images?.[activeImage]?.alt || product.name}
                                className="product-gallery__img"
                                id="product-main-image"
                            />
                            {product.isTrending && (
                                <span className="badge badge-accent product-gallery__badge">🔥 Trending</span>
                            )}
                            {/* Nav arrows */}
                            {product.images.length > 1 && (
                                <>
                                    <button
                                        className="product-gallery__arrow product-gallery__arrow--left"
                                        onClick={() => setActiveImage(i => (i - 1 + product.images.length) % product.images.length)}
                                        aria-label="Previous image"
                                    ><FiChevronLeft /></button>
                                    <button
                                        className="product-gallery__arrow product-gallery__arrow--right"
                                        onClick={() => setActiveImage(i => (i + 1) % product.images.length)}
                                        aria-label="Next image"
                                    ><FiChevronRight /></button>
                                </>
                            )}
                        </div>
                        <div className="product-gallery__thumbs" role="tablist" aria-label="Product images">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    className={`product-gallery__thumb${i === activeImage ? ' active' : ''}`}
                                    onClick={() => setActiveImage(i)}
                                    role="tab"
                                    aria-selected={i === activeImage}
                                    aria-label={img.alt || `Image ${i + 1}`}
                                >
                                    <img src={img.url} alt={img.alt || ''} loading="lazy" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ===== PRODUCT INFO ===== */}
                    <div className="product-info">
                        <div className="product-info__header">
                            <span className="product-info__category">{product.category?.name}</span>
                            <div className="product-info__actions">
                                <button
                                    className={`product-info__action-btn${isWishlisted ? ' active' : ''}`}
                                    onClick={() => dispatch(toggleWishlist(product._id))}
                                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                    aria-pressed={isWishlisted}
                                >
                                    <FiHeart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                    className="product-info__action-btn"
                                    onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!') }}
                                    aria-label="Share product"
                                >
                                    <FiShare2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h1 className="product-info__name">{product.name}</h1>

                        {/* Rating */}
                        {product.ratings?.count > 0 && (
                            <div className="product-info__rating" aria-label={`${product.ratings.avg} out of 5 stars, ${product.ratings.count} reviews`}>
                                <div className="stars" aria-hidden="true">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <FiStar key={i} size={14} fill={i < Math.round(product.ratings.avg) ? 'currentColor' : 'none'} />
                                    ))}
                                </div>
                                <span className="product-info__rating-val">{product.ratings.avg?.toFixed(1)}</span>
                                <a href="#reviews" className="product-info__rating-count">({product.ratings.count} reviews)</a>
                            </div>
                        )}

                        {/* Buyer type toggle */}
                        <div className="buyer-toggle" role="group" aria-label="Buyer type">
                            <button
                                className={`buyer-toggle__btn${buyerType === 'retail' ? ' active' : ''}`}
                                onClick={() => setBuyerType('retail')}
                                aria-pressed={buyerType === 'retail'}
                            >🛍️ Retail Buyer</button>
                            <button
                                className={`buyer-toggle__btn${buyerType === 'wholesale' ? ' active' : ''}`}
                                onClick={() => { setBuyerType('wholesale'); if (qty < 10) setQty(10) }}
                                aria-pressed={buyerType === 'wholesale'}
                            >🏭 Wholesale Buyer</button>
                        </div>

                        {/* Price */}
                        <div className="product-price">
                            <span className="product-price__current" aria-label={`Price: ${formatINR(price)}`}>
                                {formatINR(price)}
                            </span>
                            {selectedVariant?.originalPrice && price < selectedVariant.originalPrice && (
                                <span className="price-original product-price__original" aria-label={`Original price: ${formatINR(selectedVariant.originalPrice)}`}>
                                    {formatINR(selectedVariant.originalPrice)}
                                </span>
                            )}
                            {discountPct > 0 && (
                                <span className="badge badge-success" aria-label={`${discountPct}% discount`}>{discountPct}% OFF</span>
                            )}
                        </div>

                        {/* Wholesale tier info */}
                        {buyerType === 'wholesale' && (
                            <div className="wholesale-tier-info" role="note">
                                <p className="wholesale-tier-info__label">💡 Wholesale Pricing for <strong>{product.name}</strong></p>
                                <table className="wholesale-tier-table" aria-label="Wholesale pricing tiers">
                                    <thead>
                                        <tr><th>Qty</th><th>Price / item</th><th>Savings</th></tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            ['1 – 9', selectedVariant?.wholesalePrices?.low, 0],
                                            ['10 – 49', selectedVariant?.wholesalePrices?.mid, 15],
                                            ['50+', selectedVariant?.wholesalePrices?.high, 30],
                                        ].map(([q, p, s]) => (
                                            <tr key={q}>
                                                <td>{q}</td>
                                                <td>
                                                    <span className="price">{formatINR(p)}</span>
                                                </td>
                                                <td>{s > 0 ? <span className="badge badge-success">{s}% off</span> : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {tier && <p className="wholesale-tier-info__current">You're on <strong>{tier.label}</strong> tier</p>}
                            </div>
                        )}

                        {/* AI Color Preview — shown if product has color variants */}
                        {uniqueColors.length > 0 && (
                            <AIColorPreview
                                imageUrl={product.images?.[activeImage]?.url}
                                colors={uniqueColors.map(v => v.color).filter(Boolean)}
                                selectedColor={selectedVariant?.color || uniqueColors[0]?.color}
                                onSelect={(hex) => selectColor(hex)}
                            />
                        )}

                        {/* Size selector */}
                        {uniqueSizes.length > 1 && (
                            <div className="variant-selector">
                                <p className="variant-selector__label">Size</p>
                                <div className="variant-selector__sizes" role="radiogroup" aria-label="Select size">
                                    {uniqueSizes.map(size => (
                                        <button
                                            key={size}
                                            className={`variant-size-btn${selectedVariant?.size === size ? ' selected' : ''}`}
                                            onClick={() => selectSize(size)}
                                            role="radio"
                                            aria-checked={selectedVariant?.size === size}
                                            aria-label={`Size: ${size}`}
                                        >{size}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="qty-selector" role="group" aria-label="Quantity">
                            <p className="variant-selector__label">Quantity {buyerType === 'wholesale' && <span className="badge badge-primary">(Min 10 for wholesale)</span>}</p>
                            <div className="qty-selector__controls">
                                <button
                                    className="qty-btn"
                                    onClick={() => setQty(q => Math.max(buyerType === 'wholesale' ? 10 : 1, q - 1))}
                                    disabled={qty <= (buyerType === 'wholesale' ? 10 : 1)}
                                    aria-label="Decrease quantity"
                                ><FiMinus size={14} /></button>
                                <span className="qty-value" aria-live="polite" aria-label={`Quantity: ${qty}`}>{qty}</span>
                                <button
                                    className="qty-btn"
                                    onClick={() => setQty(q => q + 1)}
                                    disabled={selectedVariant?.stock && qty >= selectedVariant.stock}
                                    aria-label="Increase quantity"
                                ><FiPlus size={14} /></button>
                            </div>
                            {selectedVariant && (
                                <p className="qty-stock" aria-live="polite">
                                    {selectedVariant.stock === 0 ? (
                                        <span style={{ color: 'var(--clr-danger)' }}>Out of stock</span>
                                    ) : selectedVariant.stock <= 5 ? (
                                        <span style={{ color: 'var(--clr-warning)' }}>⚠️ Only {selectedVariant.stock} left!</span>
                                    ) : (
                                        <span style={{ color: 'var(--clr-success)' }}>✓ In stock</span>
                                    )}
                                </p>
                            )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="product-cta">
                            <button
                                className="btn btn-primary btn-lg product-cta__cart"
                                onClick={handleAddToCart}
                                disabled={selectedVariant?.stock === 0}
                                id="add-to-cart-btn"
                            >
                                <FiShoppingCart /> Add to Cart
                            </button>
                            <button
                                className="btn btn-accent btn-lg"
                                onClick={handleBuyNow}
                                disabled={selectedVariant?.stock === 0}
                                id="buy-now-btn"
                            >
                                Buy Now
                            </button>
                        </div>

                        {/* Delivery & other info */}
                        <div className="product-meta">
                            <div className="product-meta__item">
                                <FiTruck size={16} aria-hidden="true" />
                                <span>Estimated delivery: <strong>{deliveryDate}</strong></span>
                            </div>
                            <div className="product-meta__item">
                                <FiShield size={16} aria-hidden="true" />
                                <span>Secure & authenticated checkout</span>
                            </div>
                            <div className="product-meta__item">
                                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-faint)' }}>SKU: {selectedVariant?.sku} | HSN: {product.hsn} | GST: {product.gstRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== TABS: Description / Reviews ===== */}
                <div className="product-tabs" id="reviews">
                    <div className="product-tabs__nav" role="tablist">
                        {['description', 'reviews', 'wholesale-info'].map(tab => (
                            <button
                                key={tab}
                                className={`product-tabs__tab${activeTab === tab ? ' active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                                role="tab"
                                aria-selected={activeTab === tab}
                                id={`tab-${tab}`}
                                aria-controls={`tabpanel-${tab}`}
                            >{tab.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</button>
                        ))}
                    </div>

                    <div className="product-tabs__panel" role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
                        {activeTab === 'description' && (
                            <div className="product-description">
                                <p>{product.description}</p>
                                <ul className="product-description__features">
                                    <li>✨ Premium handcrafted quality</li>
                                    <li>📦 Secure packaging</li>
                                    <li>🔄 7-day return policy</li>
                                    <li>🏭 Wholesale pricing available for 10+ units</li>
                                </ul>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="product-reviews">
                                <div className="product-reviews__summary">
                                    <div className="product-reviews__avg">
                                        <span className="product-reviews__avg-num">{product.ratings.avg}</span>
                                        <div className="stars" aria-hidden="true">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <FiStar key={i} size={20} fill={i < Math.round(product.ratings.avg) ? 'currentColor' : 'none'} />
                                            ))}
                                        </div>
                                        <span style={{ color: 'var(--clr-text-faint)', fontSize: '0.85rem' }}>{product.ratings.count} ratings</span>
                                    </div>
                                </div>
                                <div className="product-reviews__list">
                                    {product.reviews.map(review => (
                                        <div key={review._id} className="review-card">
                                            <div className="review-card__header">
                                                <div className="review-card__avatar" aria-hidden="true">{review.user?.name?.charAt(0)}</div>
                                                <div>
                                                    <strong>{review.user?.name}</strong>
                                                    <div className="stars" style={{ fontSize: '12px' }} aria-label={`${review.rating} stars`}>
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <FiStar key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="review-card__date">{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                                            </div>
                                            <p className="review-card__comment">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'wholesale-info' && (
                            <div className="product-wholesale-info">
                                <h3>Bulk Order Benefits</h3>
                                <p>FancyBazaar offers tiered pricing for wholesale buyers. Register as a wholesale buyer and enjoy:</p>
                                <ul>
                                    <li>🔹 <strong>Mid tier (10-49 units):</strong> 15% discount on retail price</li>
                                    <li>🔸 <strong>High tier (50+ units):</strong> 30% discount on retail price</li>
                                    <li>📦 Dedicated wholesale support team</li>
                                    <li>🚚 Priority shipping for bulk orders</li>
                                    <li>📄 GST invoice provided</li>
                                </ul>
                                <Link to="/auth/register-wholesale" className="btn btn-accent" style={{ marginTop: 16, alignSelf: 'flex-start' }}>
                                    Register as Wholesaler
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
