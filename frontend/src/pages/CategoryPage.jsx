import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { FiFilter, FiX, FiChevronDown, FiGrid, FiList, FiStar } from 'react-icons/fi'
import ProductCard from '../components/products/ProductCard'
import api from '../services/api'
import { SAMPLE_PRODUCTS_MAP } from '../utils/sampleData'
import './CategoryPage.css'

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Top Rated' },
]

const PRICE_RANGES = [
    { label: 'Under ₹200', min: 0, max: 200 },
    { label: '₹200 – ₹500', min: 200, max: 500 },
    { label: '₹500 – ₹1000', min: 500, max: 1000 },
    { label: 'Above ₹1000', min: 1000, max: 99999 },
]

const COLORS = ['#FFD700', '#F0F0F0', '#9D3FE5', '#E91E63', '#00BCD4', '#FF6B35', '#4CAF50', '#FF0000', '#000000']
const RATINGS = [4, 3, 2, 1]

// No longer using hardcoded sample products to prevent checkout errors


export default function CategoryPage() {
    const { slug } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const q = searchParams.get('q') || ''

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [viewMode, setViewMode] = useState('grid')

    // Filter state
    const [sort, setSort] = useState('newest')
    const [selectedColors, setSelectedColors] = useState([])
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [minRating, setMinRating] = useState(0)
    const [inStockOnly, setInStockOnly] = useState(false)

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams({
            category: slug, sort, page, limit: 12,
            ...(q && { q }),
            ...(minPrice && { minPrice }),
            ...(maxPrice && { maxPrice }),
            ...(minRating && { minRating }),
            ...(inStockOnly && { inStock: true }),
            ...(selectedColors.length && { colors: selectedColors.join(',') }),
        })
        try {
            const { data } = await api.get(`/products?${params}`)
            setProducts(data.products || [])
            setTotal(data.total || 0)
        } catch {
            setProducts([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }, [slug, sort, page, q, minPrice, maxPrice, minRating, inStockOnly, selectedColors])

    useEffect(() => {
        setPage(1)
        fetchProducts()
    }, [slug, sort, q, minPrice, maxPrice, minRating, inStockOnly, selectedColors])

    useEffect(() => { fetchProducts() }, [page])

    const toggleColor = (c) => setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

    const clearFilters = () => {
        setSelectedColors([])
        setMinPrice('')
        setMaxPrice('')
        setMinRating(0)
        setInStockOnly(false)
    }

    const categoryName = slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'All Products'
    const totalPages = Math.ceil(total / 12)
    const hasActiveFilters = selectedColors.length || minPrice || maxPrice || minRating || inStockOnly

    return (
        <div className="category-page">
            {/* Breadcrumb */}
            <div className="category-breadcrumb">
                <div className="container">
                    <nav aria-label="Breadcrumb">
                        <Link to="/">Home</Link>
                        <span aria-hidden="true"> / </span>
                        <span aria-current="page">{q ? `Search: "${q}"` : categoryName}</span>
                    </nav>
                </div>
            </div>

            {slug === 'wholesale' ? (
                <div className="container" style={{ padding: '40px 0' }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <h1 className="section-title">🏭 Wholesale Categories</h1>
                        <p className="section-subtitle">Browse bulk items by category</p>
                    </div>
                    <div className="wholesale-categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                        {[
                            { slug: 'a4', name: 'A4 Paper', icon: '📄', desc: 'Premium copier & printer papers', img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80' },
                            { slug: 'hairclips', name: 'Hairclips', icon: '🎀', desc: 'Fancy clips & accessories', img: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80' },
                            { slug: 'chart', name: 'Chart Paper', icon: '🖼️', desc: 'Large colored chart papers', img: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=400&q=80' },
                            { slug: 'writing-instruments', name: 'Pens & Markers', icon: '🖊️', desc: 'Bulk writing instruments', img: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=80' },
                            { slug: 'office-supplies', name: 'Office Supplies', icon: '📎', desc: 'Staplers, pins, files, etc.', img: 'https://images.unsplash.com/photo-1497911270199-1c552a70cb60?w=400&q=80' },
                            { slug: 'art-craft', name: 'Art & Craft', icon: '🎨', desc: 'Watercolors, pastels, brushes', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80' },
                        ].map(cat => (
                            <Link key={cat.slug} to={`/categories/${cat.slug}`} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s', borderRadius: '12px' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                <div style={{ height: 180, overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
                                    <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>{cat.icon} {cat.name}</h3>
                                    <p style={{ margin: 0, color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>{cat.desc}</p>
                                    <span className="btn btn-ghost btn-sm" style={{ marginTop: 16, display: 'inline-flex' }}>Browse all →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="container">
                <div className="category-layout">

                    {/* ===== SIDEBAR FILTERS ===== */}
                    <aside className={`filters-sidebar${filtersOpen ? ' filters-sidebar--open' : ''}`} aria-label="Product filters">
                        <div className="filters-header">
                            <h2 className="filters-title">Filters</h2>
                            {hasActiveFilters && (
                                <button className="filters-clear" onClick={clearFilters}>Clear all</button>
                            )}
                            <button className="filters-close show-mobile" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                                <FiX />
                            </button>
                        </div>

                        {/* Price Range */}
                        <div className="filter-group">
                            <h3 className="filter-group__title">Price Range</h3>
                            <div className="filter-price-ranges">
                                {PRICE_RANGES.map(r => (
                                    <button
                                        key={r.label}
                                        className={`filter-price-btn${minPrice == r.min && maxPrice == r.max ? ' active' : ''}`}
                                        onClick={() => { setMinPrice(r.min); setMaxPrice(r.max) }}
                                    >{r.label}</button>
                                ))}
                            </div>
                            <div className="filter-price-custom">
                                <input type="number" placeholder="Min ₹" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="form-input filter-price-input" aria-label="Minimum price" />
                                <span>–</span>
                                <input type="number" placeholder="Max ₹" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="form-input filter-price-input" aria-label="Maximum price" />
                            </div>
                        </div>

                        {/* Color */}
                        <div className="filter-group">
                            <h3 className="filter-group__title">Color</h3>
                            <div className="filter-colors">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        className={`filter-color-dot${selectedColors.includes(c) ? ' selected' : ''}`}
                                        style={{ background: c }}
                                        onClick={() => toggleColor(c)}
                                        aria-label={`Color ${c}`}
                                        aria-pressed={selectedColors.includes(c)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Minimum Rating */}
                        <div className="filter-group">
                            <h3 className="filter-group__title">Minimum Rating</h3>
                            <div className="filter-ratings">
                                {RATINGS.map(r => (
                                    <button
                                        key={r}
                                        className={`filter-rating-btn${minRating === r ? ' active' : ''}`}
                                        onClick={() => setMinRating(minRating === r ? 0 : r)}
                                        aria-pressed={minRating === r}
                                    >
                                        {'★'.repeat(r)}{'☆'.repeat(4 - r)} & Up
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* In Stock */}
                        <div className="filter-group">
                            <label className="filter-stock">
                                <label className="toggle" htmlFor="instock-toggle">
                                    <input id="instock-toggle" type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
                                    <span className="toggle-slider" />
                                </label>
                                <span>In Stock Only</span>
                            </label>
                        </div>
                    </aside>

                    {/* Sidebar overlay */}
                    {filtersOpen && <div className="filters-overlay show-mobile" onClick={() => setFiltersOpen(false)} aria-hidden="true" />}

                    {/* ===== PRODUCTS AREA ===== */}
                    <main className="category-main">
                        {/* Toolbar */}
                        <div className="category-toolbar">
                            <div className="category-toolbar__left">
                                <button
                                    className="btn btn-ghost btn-sm show-mobile"
                                    onClick={() => setFiltersOpen(true)}
                                    aria-expanded={filtersOpen}
                                    id="filter-toggle-btn"
                                >
                                    <FiFilter size={15} /> Filters
                                    {hasActiveFilters && <span className="badge badge-primary" aria-label={`${hasActiveFilters ? 'Active' : ''} filters`}>●</span>}
                                </button>
                                <p className="category-toolbar__count">
                                    {loading ? 'Loading…' : `${total} products`}
                                    {q && <span> for "<strong>{q}</strong>"</span>}
                                </p>
                            </div>
                            <div className="category-toolbar__right">
                                <select
                                    className="form-input category-sort-select"
                                    value={sort}
                                    onChange={e => setSort(e.target.value)}
                                    aria-label="Sort products"
                                >
                                    {SORT_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <div className="view-toggle" role="group" aria-label="View mode">
                                    <button
                                        className={`view-toggle-btn${viewMode === 'grid' ? ' active' : ''}`}
                                        onClick={() => setViewMode('grid')}
                                        aria-pressed={viewMode === 'grid'}
                                        aria-label="Grid view"
                                    ><FiGrid size={16} /></button>
                                    <button
                                        className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`}
                                        onClick={() => setViewMode('list')}
                                        aria-pressed={viewMode === 'list'}
                                        aria-label="List view"
                                    ><FiList size={16} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        {loading ? (
                            <div className={`products-grid${viewMode === 'list' ? ' products-grid--list' : ''}`}>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="skeleton" style={{ height: 320 }} aria-hidden="true" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="category-empty">
                                <div className="category-empty__icon">🔍</div>
                                <h3>No products found</h3>
                                <p>Try adjusting your filters or search query</p>
                                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
                            </div>
                        ) : (
                            <div className={`products-grid${viewMode === 'list' ? ' products-grid--list' : ''}`} role="list">
                                {products.map(product => (
                                    <div key={product._id} role="listitem">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination" role="navigation" aria-label="Pagination">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    aria-label="Previous page"
                                >Previous</button>
                                <div className="pagination__pages">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                        .reduce((acc, p, idx, arr) => {
                                            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                                            acc.push(p)
                                            return acc
                                        }, [])
                                        .map((p, i) =>
                                            p === '...'
                                                ? <span key={`dots-${i}`} className="pagination__dots">…</span>
                                                : <button key={p} className={`pagination__page${p === page ? ' active' : ''}`} onClick={() => setPage(p)} aria-current={p === page ? 'page' : undefined}>{p}</button>
                                        )
                                    }
                                </div>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    aria-label="Next page"
                                >Next</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            )}
        </div>
    )
}
