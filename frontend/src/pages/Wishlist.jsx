import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi'
import { toggleWishlist } from '../store/slices/wishlistSlice'
import ProductCard from '../components/products/ProductCard'
import api from '../services/api'

// Simple helper to fetch products by ID for the wishlist
export default function Wishlist() {
    const dispatch = useDispatch()
    const { items: wishedIds } = useSelector(state => state.wishlist)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (wishedIds.length === 0) {
            setProducts([])
            return
        }

        async function loadWishlist() {
            setLoading(true)
            try {
                // Fetch actual products for the IDs we have
                // Assuming an endpoint exists to get multiple products
                const { data } = await api.get(`/products?ids=${wishedIds.join(',')}`)
                setProducts(data.products || [])
            } catch (err) {
                // Fallback: If API fails, we could show generic placeholders or just empty
                console.error('Failed to load wishlist items', err)
            } finally {
                setLoading(false)
            }
        }
        loadWishlist()
    }, [wishedIds])

    return (
        <div className="orders-page">
            <div className="container">
                <div className="section-header" style={{ marginBottom: 30, display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ padding: '0 8px', height: '24px', minHeight: 'auto', display: 'flex', alignItems: 'center', alignSelf: 'flex-start', marginBottom: '8px' }}>← Back</button>
                    <h1 className="orders-title" style={{ margin: 0 }}>
                        <FiHeart style={{ color: '#EF4444', marginRight: 12 }} />
                        My Wishlist ({wishedIds.length})
                    </h1>
                    {wishedIds.length > 0 && (
                        <p style={{ color: 'var(--clr-text-muted)' }}>Items you've saved for later</p>
                    )}
                </div>

                {wishedIds.length === 0 ? (
                    <div className="orders-empty animate-fade-in">
                        <div style={{ fontSize: '4rem', marginBottom: 20 }}>💝</div>
                        <h3>Your wishlist is empty</h3>
                        <p style={{ marginBottom: 25, color: 'var(--clr-text-muted)' }}>
                            Save items you love and they'll appear here!
                        </p>
                        <Link to="/" className="btn btn-primary btn-lg">Explore Collections</Link>
                    </div>
                ) : (
                    <div className="products-grid animate-fade-in" role="list">
                        {loading ? (
                             Array.from({ length: wishedIds.length }).map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: 350, borderRadius: 16 }} />
                             ))
                        ) : (
                            products.map(product => (
                                <div key={product._id} role="listitem">
                                    <ProductCard product={product} />
                                </div>
                            ))
                        )}
                        
                        {/* Fallback for sample products not yet in DB */}
                        {!loading && products.length < wishedIds.length && (
                             <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px dashed var(--clr-border)' }}>
                                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
                                    Some items are local sample data and cannot be displayed here yet.
                                </p>
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
