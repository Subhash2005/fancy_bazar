import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi'
import { updateQty, removeFromCart, setDonation, selectCartTotal, getItemPrice } from '../store/slices/cartSlice'
import { formatINR, calcOrderBreakdown, DONATION_OPTIONS } from '../utils/pricing'
import toast from 'react-hot-toast'
import './Cart.css'

export default function Cart() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, donation } = useSelector(state => state.cart)
    const { user } = useSelector(state => state.auth)

    const breakdown = calcOrderBreakdown(items, donation)

    if (items.length === 0) {
        return (
            <div className="cart-empty" role="main">
                <div className="cart-empty__icon" aria-hidden="true">🛒</div>
                <h1 className="cart-empty__title">Your cart is empty</h1>
                <p className="cart-empty__desc">Add some fancy items to get started!</p>
                <Link to="/" className="btn btn-primary btn-lg" id="continue-shopping-btn">
                    <FiShoppingBag /> Continue Shopping
                </Link>
            </div>
        )
    }

    function handleQty(key, delta, currentQty, buyerType) {
        const newQty = currentQty + delta
        const min = buyerType === 'wholesale' ? 10 : 1
        if (newQty < min) {
            toast.error(`Minimum quantity is ${min}`)
            return
        }
        dispatch(updateQty({ key, qty: newQty }))
    }

    function handleRemove(key, name) {
        dispatch(removeFromCart(key))
        toast(`${name} removed from cart`)
    }

    function handleCheckout() {
        if (!user) {
            toast.error('Please sign in to checkout')
            navigate('/auth/login')
            return
        }
        navigate('/checkout')
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="cart-page__title">Shopping Cart <span className="cart-page__count">({items.length} items)</span></h1>

                <div className="cart-layout">
                    {/* ===== CART ITEMS ===== */}
                    <main className="cart-items" aria-label="Cart items">
                        {items.map(item => {
                            const price = getItemPrice(item)
                            return (
                                <article key={item.key} className="cart-item card" aria-label={item.product.name}>
                                    <Link to={`/product/${item.product._id}`} className="cart-item__img-wrap" tabIndex={-1}>
                                        <img
                                            src={item.product.images?.[0]?.url || `https://picsum.photos/seed/${item.product._id}/120/120`}
                                            alt={item.product.name}
                                            className="cart-item__img"
                                            loading="lazy"
                                        />
                                    </Link>
                                    <div className="cart-item__info">
                                        <div className="cart-item__header">
                                            <div>
                                                <p className="cart-item__category">{item.product.category?.name}</p>
                                                <Link to={`/product/${item.product._id}`}>
                                                    <h3 className="cart-item__name">{item.product.name}</h3>
                                                </Link>
                                                <div className="cart-item__meta">
                                                    {item.variant.color && (
                                                        <span className="cart-item__variant">
                                                            <span className="cart-item__color-dot" style={{ background: item.variant.color }} aria-hidden="true" />
                                                            <span className="sr-only">Color: {item.variant.color}</span>
                                                        </span>
                                                    )}
                                                    {item.variant.size && <span className="cart-item__variant">Size: {item.variant.size}</span>}
                                                    {item.buyerType === 'wholesale' && (
                                                        <span className="badge badge-primary cart-item__wholesale-badge">Wholesale</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                className="cart-item__remove"
                                                onClick={() => handleRemove(item.key, item.product.name)}
                                                aria-label={`Remove ${item.product.name}`}
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="cart-item__footer">
                                            <div className="cart-item__qty" role="group" aria-label={`Quantity for ${item.product.name}`}>
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => handleQty(item.key, -1, item.qty, item.buyerType)}
                                                    aria-label="Decrease quantity"
                                                ><FiMinus size={12} /></button>
                                                <span className="qty-value" aria-live="polite">{item.qty}</span>
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => handleQty(item.key, 1, item.qty, item.buyerType)}
                                                    aria-label="Increase quantity"
                                                ><FiPlus size={12} /></button>
                                            </div>
                                            <div className="cart-item__price">
                                                <span className="price cart-item__total" aria-label={`Total: ${formatINR(price * item.qty)}`}>
                                                    {formatINR(price * item.qty)}
                                                </span>
                                                {item.qty > 1 && (
                                                    <span className="cart-item__unit-price">{formatINR(price)} each</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            )
                        })}

                        {/* Donation section */}
                        <div className="donation-card card" role="group" aria-labelledby="donation-heading">
                            <div className="donation-card__header">
                                <div>
                                    <h3 className="donation-card__title" id="donation-heading">💚 Round Up for a Cause</h3>
                                    <p className="donation-card__desc">Add a small donation to support education for underprivileged children</p>
                                </div>
                                <label className="toggle" htmlFor="donation-toggle" aria-label="Enable donation">
                                    <input
                                        id="donation-toggle"
                                        type="checkbox"
                                        checked={donation.enabled}
                                        onChange={e => dispatch(setDonation({ ...donation, enabled: e.target.checked }))}
                                    />
                                    <span className="toggle-slider" />
                                </label>
                            </div>
                            {donation.enabled && (
                                <div className="donation-amounts" role="radiogroup" aria-label="Donation amount">
                                    {DONATION_OPTIONS.map(amt => (
                                        <button
                                            key={amt}
                                            className={`donation-amount-btn${donation.amount === amt ? ' active' : ''}`}
                                            onClick={() => dispatch(setDonation({ ...donation, amount: amt }))}
                                            role="radio"
                                            aria-checked={donation.amount === amt}
                                        >₹{amt}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </main>

                    {/* ===== ORDER SUMMARY ===== */}
                    <aside className="cart-summary" aria-label="Order summary">
                        <div className="cart-summary__card card">
                            <h2 className="cart-summary__title">Order Summary</h2>
                            <dl className="cart-summary__lines">
                                <div className="cart-summary__line">
                                    <dt>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</dt>
                                    <dd>{formatINR(breakdown.subtotal)}</dd>
                                </div>
                                <div className="cart-summary__line">
                                    <dt>Platform Commission (8%)</dt>
                                    <dd>{formatINR(breakdown.commission)}</dd>
                                </div>
                                <div className="cart-summary__line">
                                    <dt>Delivery Charge</dt>
                                    <dd>
                                        {breakdown.deliveryCharge === 0
                                            ? <span style={{ color: 'var(--clr-success)' }}>FREE 🎉</span>
                                            : formatINR(breakdown.deliveryCharge)
                                        }
                                    </dd>
                                </div>
                                <div className="cart-summary__line">
                                    <dt>GST (18%)</dt>
                                    <dd>{formatINR(breakdown.gst)}</dd>
                                </div>
                                {donation.enabled && (
                                    <div className="cart-summary__line cart-summary__line--donation">
                                        <dt>💚 Donation</dt>
                                        <dd>₹{breakdown.donation}</dd>
                                    </div>
                                )}
                                <div className="divider" />
                                <div className="cart-summary__line cart-summary__line--total">
                                    <dt>Total</dt>
                                    <dd>{formatINR(breakdown.total)}</dd>
                                </div>
                            </dl>

                            {breakdown.deliveryCharge > 0 && (
                                <p className="cart-summary__free-shipping-hint" aria-live="polite">
                                    Add {formatINR(999 - breakdown.subtotal)} more for <strong>FREE delivery!</strong>
                                </p>
                            )}

                            <button
                                className="btn btn-primary btn-lg btn-full cart-summary__cta"
                                onClick={handleCheckout}
                                id="proceed-checkout-btn"
                            >
                                Proceed to Checkout <FiArrowRight />
                            </button>
                            <Link to="/" className="btn btn-ghost btn-full" style={{ marginTop: 8 }}>
                                Continue Shopping
                            </Link>
                        </div>

                        {/* Payment method icons */}
                        <div className="cart-payment-badges" aria-label="Accepted payment methods">
                            <p className="cart-payment-badges__label">We accept</p>
                            <div className="cart-payment-badges__icons">
                                {['UPI', 'VISA', 'MC', 'Wallet', 'COD'].map(m => (
                                    <span key={m} className="footer__payment-tag">{m}</span>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
