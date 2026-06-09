import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FiChevronRight, FiCheck, FiMapPin, FiCreditCard, FiPackage } from 'react-icons/fi'
import { calcOrderBreakdown, formatINR } from '../utils/pricing'
import { clearCart } from '../store/slices/cartSlice'
import api from '../services/api'
import toast from 'react-hot-toast'
import './Checkout.css'

const STEPS = ['Address', 'Payment', 'Review']

const PAYMENT_METHODS = [
    { id: 'upi', label: 'UPI', icon: '📱', desc: 'Pay via UPI ID or QR code' },
    { id: 'card', label: 'Card', icon: '💳', desc: 'Debit or credit card' },
    { id: 'wallet', label: 'Wallet', icon: '👜', desc: 'FancyBazaar wallet balance' },
    { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
]

export default function Checkout() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, donation } = useSelector(state => state.cart)
    const { user } = useSelector(state => state.auth)

    const [activeStep, setActiveStep] = useState(0)
    const [placing, setPlacing] = useState(false)

    // Address form
    const [address, setAddress] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        type: 'home',
    })

    // Payment
    const [paymentMethod, setPaymentMethod] = useState('upi')
    const [upiId, setUpiId] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [cardExpiry, setCardExpiry] = useState('')
    const [cardCvv, setCardCvv] = useState('')
    const [cardName, setCardName] = useState('')
    const [upiOtpSent, setUpiOtpSent] = useState(false)

    const breakdown = calcOrderBreakdown(items, donation)
    const canProceedAddress = address.name && address.phone && address.street && address.city && address.state && address.pincode

    async function handlePlaceOrder() {
        setPlacing(true)
        try {
            const orderPayload = {
                items: items.map(i => ({
                    product: i.product._id,
                    isVendorProduct: i.product.type === 'vendor',
                    shopId: i.product._vendorShopId || null,
                    variant: i.variant.sku,
                    qty: i.qty,
                    unitPrice: i.variant.retailPrice,
                    buyerType: i.buyerType,
                })),
                deliveryAddress: address,
                payment: { method: paymentMethod },
                pricing: breakdown,
            }
            const { data } = await api.post('/orders', orderPayload)
            const orderId = data.order._id

            // Razorpay Payment flow (UPI/Card)
            if (paymentMethod === 'upi' || paymentMethod === 'card' || paymentMethod === 'wallet') {
                await startRazorpayPayment(orderId)
                return // Page navigation happens in Razorpay success callback
            }

            // Cash on Delivery
            if (paymentMethod === 'cod') {
                await api.post('/payments/cod-confirm', { orderId })
                dispatch(clearCart())
                toast.success('Order placed successfully! 🎉')
                navigate(`/order-success/${orderId}`)
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order')
        } finally {
            setPlacing(false)
        }
    }

    async function startRazorpayPayment(orderId) {
        try {
            // 1. Get transaction details from backend
            const { data: op } = await api.post('/payments/initiate', { orderId })
            
            if (op.demo) {
                // If backend is in demo mode (no keys), auto-confirm after user sees it
                toast('Demo Mode: Auto-confirming payment', { icon: '🛡️' })
                await api.post('/payments/verify', {
                    razorpayOrderId: op.razorpayOrderId,
                    orderId
                })
                dispatch(clearCart())
                navigate(`/order-success/${orderId}`)
                return
            }

            // 2. Open Razorpay Checktout UI
            const options = {
                key: op.key, // Your Razorpay Key ID
                amount: op.amount,
                currency: 'INR',
                name: 'FancyBazaar',
                description: `Bill for Order #${op.orderDetails?.orderNumber || 'FB' + Date.now().toString().slice(0,6)}`,
                order_id: op.razorpayOrderId,
                handler: async function (response) {
                    try {
                        // 3. Verify payment on server
                        await api.post('/payments/verify', {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            orderId
                        })
                        toast.success('Payment verified! 🎉')
                        dispatch(clearCart())
                        navigate(`/order-success/${orderId}`)
                    } catch (e) {
                        toast.error('Payment verification failed. Contact support.')
                    }
                },
                prefill: {
                    name: address.name,
                    contact: address.phone,
                    email: user?.email || '',
                },
                theme: { color: "#7C3AED" }
            }

            const rzp = new window.Razorpay(options)
            rzp.on('payment.failed', function (res) {
                toast.error(res.error.description || 'Payment failed')
            })
            rzp.open()
        } catch (err) {
            toast.error('Failed to initialize payment gateway')
        }
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <h1 className="checkout-title">Checkout</h1>

                {/* Step indicator */}
                <div className="checkout-steps" aria-label="Checkout steps" role="list">
                    {STEPS.map((step, idx) => (
                        <div key={step} className={`checkout-step${idx === activeStep ? ' active' : ''}${idx < activeStep ? ' done' : ''}`} role="listitem">
                            <div className="checkout-step__dot" aria-hidden="true">
                                {idx < activeStep ? <FiCheck size={14} /> : idx + 1}
                            </div>
                            <span className="checkout-step__label">{step}</span>
                            {idx < STEPS.length - 1 && <div className="checkout-step__line" aria-hidden="true" />}
                        </div>
                    ))}
                </div>

                <div className="checkout-layout">
                    {/* ===== LEFT — Forms ===== */}
                    <div className="checkout-forms">

                        {/* STEP 0: Address */}
                        {activeStep === 0 && (
                            <section className="checkout-section card" aria-labelledby="address-heading">
                                <div className="checkout-section__header">
                                    <FiMapPin size={18} aria-hidden="true" />
                                    <h2 id="address-heading">Delivery Address</h2>
                                </div>
                                <div className="checkout-address-form">
                                    <div className="checkout-form-row">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="addr-name">Full Name *</label>
                                            <input id="addr-name" className="form-input" value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} placeholder="Your full name" required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="addr-phone">Phone Number *</label>
                                            <input id="addr-phone" className="form-input" type="tel" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="10-digit mobile number" required pattern="[0-9]{10}" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="addr-street">Street Address *</label>
                                        <input id="addr-street" className="form-input" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="House no., Building, Area" required />
                                    </div>
                                    <div className="checkout-form-row">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="addr-city">City *</label>
                                            <input id="addr-city" className="form-input" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="City" required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="addr-state">State *</label>
                                            <select id="addr-state" className="form-input" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} required>
                                                <option value="">Select state</option>
                                                {['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="addr-pincode">Pincode *</label>
                                            <input id="addr-pincode" className="form-input" value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} placeholder="6-digit pincode" pattern="[0-9]{6}" maxLength={6} required />
                                        </div>
                                    </div>
                                    <div className="addr-type-group" role="group" aria-label="Address type">
                                        {['home', 'office', 'other'].map(t => (
                                            <button
                                                key={t}
                                                className={`addr-type-btn${address.type === t ? ' active' : ''}`}
                                                onClick={() => setAddress({ ...address, type: t })}
                                                role="radio"
                                                aria-checked={address.type === t}
                                                type="button"
                                            >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => setActiveStep(1)}
                                    disabled={!canProceedAddress}
                                    id="continue-to-payment-btn"
                                >
                                    Continue to Payment <FiChevronRight />
                                </button>
                            </section>
                        )}

                        {/* STEP 1: Payment */}
                        {activeStep === 1 && (
                            <section className="checkout-section card" aria-labelledby="payment-heading">
                                <div className="checkout-section__header">
                                    <FiCreditCard size={18} aria-hidden="true" />
                                    <h2 id="payment-heading">Payment Method</h2>
                                </div>
                                <div className="payment-methods" role="radiogroup" aria-label="Payment methods">
                                    {PAYMENT_METHODS.map(pm => (
                                        <label
                                            key={pm.id}
                                            className={`payment-method${paymentMethod === pm.id ? ' selected' : ''}`}
                                            htmlFor={`pm-${pm.id}`}
                                        >
                                            <input
                                                type="radio"
                                                id={`pm-${pm.id}`}
                                                name="payment-method"
                                                value={pm.id}
                                                checked={paymentMethod === pm.id}
                                                onChange={() => setPaymentMethod(pm.id)}
                                                className="sr-only"
                                            />
                                            <span className="payment-method__icon" aria-hidden="true">{pm.icon}</span>
                                            <div className="payment-method__info">
                                                <span className="payment-method__label">{pm.label}</span>
                                                <span className="payment-method__desc">{pm.desc}</span>
                                            </div>
                                            <div className={`payment-method__check${paymentMethod === pm.id ? ' active' : ''}`} aria-hidden="true">
                                                {paymentMethod === pm.id && <FiCheck size={12} />}
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {/* UPI input */}
                                {paymentMethod === 'upi' && (
                                    <div className="payment-detail-form animate-fade-in">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="upi-id">UPI ID</label>
                                            <div className="upi-input-row">
                                                <input id="upi-id" className="form-input" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" aria-describedby="upi-hint" />
                                                <button className="btn btn-ghost btn-sm" onClick={() => { if (upiId) { setUpiOtpSent(true); toast.success('OTP sent!') } }}>Verify</button>
                                            </div>
                                            <p id="upi-hint" className="form-hint">e.g. yourname@okicici, 9876543210@paytm</p>
                                        </div>
                                        {upiOtpSent && (
                                            <div className="form-group">
                                                <label className="form-label" htmlFor="upi-otp">Enter OTP</label>
                                                <input id="upi-otp" className="form-input" maxLength={6} placeholder="6-digit OTP" aria-label="One-time password" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Card input */}
                                {paymentMethod === 'card' && (
                                    <div className="payment-detail-form animate-fade-in">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="card-name">Name on Card</label>
                                            <input id="card-name" className="form-input" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="As printed on card" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="card-number">Card Number</label>
                                            <input id="card-number" className="form-input" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())} placeholder="1234 5678 9012 3456" maxLength={19} inputMode="numeric" aria-label="Card number" />
                                        </div>
                                        <div className="checkout-form-row">
                                            <div className="form-group">
                                                <label className="form-label" htmlFor="card-expiry">Expiry</label>
                                                <input id="card-expiry" className="form-input" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} inputMode="numeric" />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label" htmlFor="card-cvv">CVV</label>
                                                <input id="card-cvv" className="form-input" value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="•••" maxLength={4} type="password" inputMode="numeric" aria-label="Card CVV" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* COD */}
                                {paymentMethod === 'cod' && (
                                    <div className="cod-info animate-fade-in">
                                        <p>💵 Pay in cash when your order is delivered. ₹30 COD handling fee applies on orders below ₹500.</p>
                                    </div>
                                )}

                                <div className="checkout-section__actions">
                                    <button className="btn btn-ghost" onClick={() => setActiveStep(0)}>← Back</button>
                                    <button className="btn btn-primary btn-lg" onClick={() => setActiveStep(2)} id="continue-to-review-btn">
                                        Review Order <FiChevronRight />
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* STEP 2: Review */}
                        {activeStep === 2 && (
                            <section className="checkout-section card" aria-labelledby="review-heading">
                                <div className="checkout-section__header">
                                    <FiPackage size={18} aria-hidden="true" />
                                    <h2 id="review-heading">Review Your Order</h2>
                                </div>

                                <div className="review-address">
                                    <h3 className="review-section-label">📍 Delivering to</h3>
                                    <p className="review-address__text">
                                        <strong>{address.name}</strong> · {address.phone}<br />
                                        {address.street}, {address.city}, {address.state} — {address.pincode}
                                    </p>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveStep(0)}>Change</button>
                                </div>

                                <div className="review-payment">
                                    <h3 className="review-section-label">💳 Payment</h3>
                                    <p>{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.icon} {PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</p>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveStep(1)}>Change</button>
                                </div>

                                <div className="review-items">
                                    <h3 className="review-section-label">🛍️ Items ({items.length})</h3>
                                    {items.map(item => (
                                        <div key={item.key} className="review-item">
                                            <img src={item.product.images?.[0]?.url || `https://picsum.photos/seed/${item.product._id}/60/60`} alt={item.product.name} className="review-item__img" loading="lazy" />
                                            <div className="review-item__info">
                                                <span className="review-item__name">{item.product.name}</span>
                                                <span className="review-item__qty">Qty: {item.qty}</span>
                                            </div>
                                            <span className="price review-item__price">{formatINR(item.variant.retailPrice * item.qty)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="checkout-section__actions">
                                    <button className="btn btn-ghost" onClick={() => setActiveStep(1)}>← Back</button>
                                    <button
                                        className="btn btn-accent btn-lg"
                                        onClick={handlePlaceOrder}
                                        disabled={placing}
                                        id="place-order-btn"
                                    >
                                        {placing ? 'Placing Order…' : `Place Order · ${formatINR(breakdown.total)}`}
                                    </button>
                                </div>

                                <p className="checkout-terms">
                                    By placing your order, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>. All prices include GST.
                                </p>
                            </section>
                        )}
                    </div>

                    {/* ===== RIGHT — Summary ===== */}
                    <aside className="checkout-summary" aria-label="Order summary">
                        <div className="card" style={{ padding: 'var(--space-5)' }}>
                            <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Order Summary</h2>
                            <dl className="cart-summary__lines">
                                <div className="cart-summary__line"><dt>Subtotal</dt><dd>{formatINR(breakdown.subtotal)}</dd></div>
                                <div className="cart-summary__line"><dt>Commission (8%)</dt><dd>{formatINR(breakdown.commission)}</dd></div>
                                <div className="cart-summary__line"><dt>Delivery</dt><dd>{breakdown.deliveryCharge === 0 ? <span style={{ color: 'var(--clr-success)' }}>FREE</span> : formatINR(breakdown.deliveryCharge)}</dd></div>
                                <div className="cart-summary__line"><dt>GST (18%)</dt><dd>{formatINR(breakdown.gst)}</dd></div>
                                {donation.enabled && <div className="cart-summary__line"><dt>💚 Donation</dt><dd>₹{breakdown.donation}</dd></div>}
                                <div className="divider" />
                                <div className="cart-summary__line cart-summary__line--total"><dt>Total</dt><dd>{formatINR(breakdown.total)}</dd></div>
                            </dl>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
