import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiChevronRight, FiX } from 'react-icons/fi'
import api from '../services/api'
import { formatINR, formatDate } from '../utils/pricing'
import './Orders.css'

const STATUS_COLORS = {
    pending: 'var(--clr-warning)',
    confirmed: 'var(--clr-info)',
    packed: 'var(--clr-primary)',
    shipped: 'var(--clr-primary)',
    delivered: 'var(--clr-success)',
    cancelled: 'var(--clr-danger)',
    returned: 'var(--clr-text-faint)',
}

const DEMO_ORDERS = [
    { _id: 'ord1', orderNumber: 'FB2025001', status: 'delivered', createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), items: [{ product: { name: 'Crystal Hair Pin Set', images: [{ url: 'https://picsum.photos/seed/ord1/80/80' }] }, qty: 2, unitPrice: 299 }], pricing: { total: 731.2 } },
    { _id: 'ord2', orderNumber: 'FB2025002', status: 'shipped', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), items: [{ product: { name: 'Pearl Stud Earrings', images: [{ url: 'https://picsum.photos/seed/ord2/80/80' }] }, qty: 1, unitPrice: 299 }], pricing: { total: 413.7 } },
    { _id: 'ord3', orderNumber: 'FB2025003', status: 'pending', createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), items: [{ product: { name: 'Rhinestone Headband (×50)', images: [{ url: 'https://picsum.photos/seed/ord3/80/80' }] }, qty: 50, unitPrice: 174 }], pricing: { total: 11920.5 } },
]

export default function Orders() {
    const [orders, setOrders] = useState(DEMO_ORDERS)
    const [loading, setLoading] = useState(true)
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [cancelling, setCancelling] = useState(null)

    useEffect(() => {
        api.get('/orders')
            .then(res => { if (res.data?.orders?.length) setOrders(res.data.orders) })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const filtered = selectedStatus === 'all' ? orders : orders.filter(o => o.status === selectedStatus)

    async function handleCancel(orderId) {
        const reason = prompt('Reason for cancellation?')
        if (!reason) return
        setCancelling(orderId)
        try {
            await api.patch(`/orders/${orderId}/cancel`, { reason })
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o))
        } catch {
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o))
        } finally {
            setCancelling(null)
        }
    }

    return (
        <div className="orders-page">
            <div className="container">
                <h1 className="orders-title">My Orders</h1>

                {/* Filter tabs */}
                <div className="orders-filters" role="tablist">
                    {['all', 'pending', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <button key={s} className={`orders-filter-btn${selectedStatus === s ? ' active' : ''}`} onClick={() => setSelectedStatus(s)} role="tab" aria-selected={selectedStatus === s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)} {s === 'all' ? `(${orders.length})` : `(${orders.filter(o => o.status === s).length})`}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="orders-list">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 140 }} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="orders-empty">
                        <div style={{ fontSize: '3rem' }}>📦</div>
                        <h3>{selectedStatus === 'all' ? 'No orders yet' : `No ${selectedStatus} orders`}</h3>
                        <Link to="/" className="btn btn-primary">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="orders-list" role="list">
                        {filtered.map(order => (
                            <article key={order._id} className="order-card card" role="listitem" aria-label={`Order ${order.orderNumber}`}>
                                <div className="order-card__header">
                                    <div>
                                        <p className="order-card__number">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
                                        <p className="order-card__date">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div className="order-card__status" style={{ color: STATUS_COLORS[order.status] }}>
                                        <span className="order-card__status-dot" style={{ background: STATUS_COLORS[order.status] }} aria-hidden="true" />
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </div>
                                </div>

                                <div className="order-card__items">
                                    {order.items.slice(0, 3).map((item, i) => (
                                        <div key={i} className="order-card__item">
                                            <img src={item.product?.images?.[0]?.url} alt={item.product?.name} className="order-card__item-img" loading="lazy" />
                                            <div className="order-card__item-info">
                                                <span className="order-card__item-name">{item.product?.name}</span>
                                                <span className="order-card__item-qty">Qty: {item.qty} × {formatINR(item.unitPrice)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <p className="order-card__more">+{order.items.length - 3} more items</p>
                                    )}
                                </div>

                                <div className="order-card__footer">
                                    <span className="order-card__total">Total: <strong>{formatINR(order.pricing?.total)}</strong></span>
                                    <div className="order-card__actions">
                                        {['pending', 'confirmed'].includes(order.status) && (
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => handleCancel(order._id)}
                                                disabled={cancelling === order._id}
                                                aria-label={`Cancel order ${order.orderNumber}`}
                                            >
                                                <FiX size={14} /> {cancelling === order._id ? 'Cancelling…' : 'Cancel'}
                                            </button>
                                        )}
                                        <Link to={`/order-success/${order._id}`} className="btn btn-primary btn-sm" aria-label={`View order ${order.orderNumber} details`}>
                                            <FiPackage size={14} /> Details <FiChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
