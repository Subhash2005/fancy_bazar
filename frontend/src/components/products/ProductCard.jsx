import { Link } from 'react-router-dom'
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../store/slices/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '../../store/slices/wishlistSlice'
import { formatINR } from '../../utils/pricing'
import toast from 'react-hot-toast'
import './ProductCard.css'

export default function ProductCard({ product }) {
    const dispatch = useDispatch()
    const isWishlisted = useSelector(selectIsWishlisted(product._id))
    const { user } = useSelector(state => state.auth)
    const defaultVariant = product.variants?.[0] || {}

    const discountPct = defaultVariant.originalPrice
        ? Math.round((1 - defaultVariant.retailPrice / defaultVariant.originalPrice) * 100)
        : null

    function handleAddToCart(e) {
        e.preventDefault()
        const qty = user?.role === 'wholesale' ? 10 : (user?.role === 'merchant' ? 5 : 1)
        const buyerType = user?.role === 'wholesale' ? 'wholesale' : 'retail'
        dispatch(addToCart({ product, variant: defaultVariant, qty, buyerType }))
        toast.success(`${qty > 1 ? qty + 'x ' : ''}${product.name} added to cart!`)
    }

    function handleWishlist(e) {
        e.preventDefault()
        dispatch(toggleWishlist(product._id))
        toast(isWishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist')
    }
    const productLink = product.type === 'vendor' ? `/shops/${product._vendorShopId}` : `/product/${product._id}`

    return (
        <article className="product-card card" aria-label={product.name}>
            <div className="product-card__img-wrap">
                <Link to={productLink} tabIndex={-1}>
                    <img
                        src={product.images?.[0]?.url || `https://picsum.photos/seed/${product._id}/300/300`}
                        alt={product.images?.[0]?.alt || product.name}
                        className="product-card__img"
                        loading="lazy"
                    />
                </Link>
                {product.isTrending && (
                    <span className="badge badge-accent product-card__badge product-card__badge--trending">🔥 Trending</span>
                )}
                {product.type === 'vendor' && (
                    <span className="badge badge-primary product-card__badge product-card__badge--vendor" style={{ top: 10, right: 10, background: '#10B981' }}>🏪 Shop Item</span>
                )}
                {discountPct && !product.type && (
                    <span className="badge badge-success product-card__badge product-card__badge--discount">{discountPct}% OFF</span>
                )}
                <button
                    className={`product-card__wishlist${isWishlisted ? ' product-card__wishlist--active' : ''}`}
                    onClick={handleWishlist}
                    aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                >
                    <FiHeart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
            </div>

            <div className="product-card__body">
                <p className="product-card__category">
                    {product.type === 'vendor' ? `Seller: ${product.brand}` : (product.category?.name || 'Accessories')}
                </p>
                <Link to={productLink}>
                    <h3 className="product-card__name" title={product.name}>{product.name}</h3>
                </Link>

                {/* Ratings */}
                {product.ratings?.count > 0 && (
                    <div className="product-card__rating" aria-label={`Rating: ${product.ratings.avg} out of 5`}>
                        <FiStar size={12} fill="currentColor" aria-hidden="true" />
                        <span>{product.ratings.avg?.toFixed(1)}</span>
                        <span className="product-card__rating-count">({product.ratings.count})</span>
                    </div>
                )}

                {/* Colors */}
                {product.variants?.length > 1 && (
                    <div className="product-card__colors" aria-label="Available colors">
                        {product.variants.slice(0, 5).map((v) => (
                            <span
                                key={v.sku}
                                className="product-card__color-dot"
                                style={{ background: v.color || '#888' }}
                                title={v.color}
                                aria-label={v.color}
                            />
                        ))}
                        {product.variants.length > 5 && (
                            <span className="product-card__more-colors">+{product.variants.length - 5}</span>
                        )}
                    </div>
                )}

                {/* Price & CTA */}
                <div className="product-card__footer">
                    <div className="product-card__prices">
                        <span className="price product-card__price">
                            {formatINR(defaultVariant.retailPrice || 0)}
                        </span>
                        {defaultVariant.originalPrice && (
                            <span className="price-original">
                                {formatINR(defaultVariant.originalPrice)}
                            </span>
                        )}
                    </div>
                    <button
                        className="product-card__cart-btn"
                        onClick={handleAddToCart}
                        aria-label={`Add ${product.name} to cart`}
                        disabled={defaultVariant.stock === 0}
                    >
                        <FiShoppingCart size={16} />
                    </button>
                </div>
                {defaultVariant.stock === 0 && (
                    <p className="product-card__oos" role="alert">Out of Stock</p>
                )}
            </div>
        </article>
    )
}
