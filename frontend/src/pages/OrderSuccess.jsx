import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiCheckCircle, FiPackage, FiTruck, FiMapPin } from 'react-icons/fi'
import api from '../services/api'
import { formatINR, formatDate } from '../utils/pricing'
import './OrderSuccess.css'

export default function OrderSuccess() {
    const { id } = useParams()
    const [order, setOrder] = useState(null)

    useEffect(() => {
        api.get(`/orders/${id}`).then(res => setOrder(res.data.order)).catch(() => { })
    }, [id])

    const estimatedDelivery = new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

    return (
        <div className="order-success-page">
            <div className="container">
                <div className="order-success-card card">
                    <div className="order-success-icon animate-pulse-glow" aria-hidden="true">
                        <FiCheckCircle size={60} />
                    </div>
                    <h1 className="order-success-title">Order Placed Successfully! 🎉</h1>
                    <p className="order-success-id">Order ID: <strong>#{id?.replace('ORD', '')?.slice(-8).toUpperCase() || id}</strong></p>
                    <p className="order-success-msg">Thank you for shopping with FancyBazaar! You'll receive an email & SMS confirmation shortly.</p>

                    <div className="order-success-timeline">
                        {[
                            { icon: <FiCheckCircle />, label: 'Placed', status: ['pending', 'confirmed'] },
                            { icon: <FiPackage />, label: 'Packed', status: ['packed'] },
                            { icon: <FiTruck />, label: 'Shipped', status: ['shipped', 'out-for-delivery'] },
                            { icon: <FiMapPin />, label: 'Delivered', status: ['delivered'] },
                        ].map((step, i) => {
                            const currentStatus = order?.delivery?.status?.toLowerCase() || 'pending';
                            const statuses = ['pending', 'confirmed', 'packed', 'shipped', 'out-for-delivery', 'delivered'];
                            const currentIdx = statuses.indexOf(currentStatus);
                            const stepIdx = statuses.indexOf(step.status[0]);
                            const isDone = currentIdx >= stepIdx;

                            return (
                                <div key={i} className={`timeline-step${isDone ? ' done' : ''}`}>
                                    <div className="timeline-step__icon">{step.icon}</div>
                                    <span className="timeline-step__label">{step.label}</span>
                                    {i < 3 && <div className="timeline-step__line" />}
                                </div>
                            )
                        })}
                    </div>

                    {order?.delivery?.driverName && (
                        <div className="order-delivery-driver card" style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '24px' }}>🚚</div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Delivery Partner</p>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>{order.delivery.driverName}</p>
                                    {order.delivery.driverPhone && (
                                        <a href={`tel:${order.delivery.driverPhone}`} style={{ fontSize: '0.9rem', color: 'var(--clr-primary)', fontWeight: '600', textDecoration: 'none' }}>
                                            📞 Call {order.delivery.driverPhone}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="order-success-info">
                        <div className="order-success-info__item">
                            <span>Expected Delivery</span>
                            <strong>{estimatedDelivery}</strong>
                        </div>
                        {order?.pricing?.total && (
                            <div className="order-success-info__item">
                                <span>Amount Paid</span>
                                <strong>{formatINR(order.pricing.total)}</strong>
                            </div>
                        )}
                        {order?.payment?.method && (
                            <div className="order-success-info__item">
                                <span>Payment Method</span>
                                <strong style={{ textTransform: 'capitalize' }}>{order.payment.method}</strong>
                            </div>
                        )}
                    </div>

                    <div className="order-success-actions">
                        <Link to="/orders" className="btn btn-primary btn-lg" id="view-orders-btn">
                            <FiPackage /> View My Orders
                        </Link>
                        <Link to="/" className="btn btn-ghost btn-lg">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
