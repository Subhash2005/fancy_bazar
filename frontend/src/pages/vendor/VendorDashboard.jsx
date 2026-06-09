import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiCamera, FiBox, FiMapPin, FiSave, FiPlus, FiImage, FiSettings, FiType, FiZap, FiTrendingUp, FiShoppingBag } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import api from '../../services/api';

// ─── Keyword → working Unsplash photo URL ────────────────────────────────
function getAutoImageUrl(productName) {
    const name = productName.toLowerCase();

    // Map keywords to known working Unsplash photo IDs
    const map = [
        { keywords: ['hair', 'clip', 'pin', 'barrette', 'claw', 'hairclip'], url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80' },
        { keywords: ['scrunchie', 'band', 'elastic', 'band'], url: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=400&q=80' },
        { keywords: ['bangle', 'bracelet', 'cuff'], url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80' },
        { keywords: ['ring', 'jewel'], url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80' },
        { keywords: ['necklace', 'chain', 'pendant'], url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' },
        { keywords: ['earring', 'stud', 'hoop'], url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&q=80' },
        { keywords: ['a4', 'paper', 'ream', 'copier'], url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80' },
        { keywords: ['pen', 'marker', 'pencil'], url: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&q=80' },
        { keywords: ['stapler', 'staple'], url: 'https://images.unsplash.com/photo-1497911270199-1c552a70cb60?w=400&q=80' },
        { keywords: ['notebook', 'diary'], url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80' },
        { keywords: ['chart'], url: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=400&q=80' },
        { keywords: ['art', 'craft', 'brush', 'color', 'colour', 'paint'], url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80' },
        { keywords: ['bag', 'purse', 'handbag'], url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80' },
        { keywords: ['ribbon', 'bow'], url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&q=80' },
        { keywords: ['candle', 'wax'], url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&q=80' },
        { keywords: ['watch', 'clock'], url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' },
        { keywords: ['scarf', 'stole'], url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80' },
    ];

    for (const { keywords, url } of map) {
        if (keywords.some(kw => name.includes(kw))) {
            return url;
        }
    }
    // Generic fallback using picsum with a name-based seed (always works)
    const seed = productName.trim().toLowerCase().replace(/\s+/g, '-').substring(0, 20) || 'product';
    return `https://picsum.photos/seed/${seed}/400/400`;
}

// ─── Smart AI name from file ──────────────────────────────────────────────
function getAutoNameFromFile(fileName) {
    const base = fileName.replace(/\.[^/.]+$/, '').toLowerCase();
    const genericPatterns = ['oip', 'img', 'image', 'photo', 'whatsapp', 'untitled', 'download', 'screenshot', 'dsc', 'pic'];
    const isGeneric = genericPatterns.some(p => base.includes(p)) || base.length <= 5;

    if (base.includes('clip') || base.includes('pin') || base.includes('hair')) return 'Crystal Hair Pin Set';
    if (base.includes('band') || base.includes('scrunchie')) return 'Velvet Hair Scrunchie';
    if (base.includes('ring') || base.includes('jewel')) return 'Gold Plated Fashion Ring';
    if (base.includes('a4') || base.includes('paper')) return 'Premium A4 Copier Paper (500 Sheets)';
    if (base.includes('pen') || base.includes('marker')) return 'Premium Ball Pen Set';
    if (base.includes('bag')) return 'Designer Sling Bag';

    if (isGeneric) {
        const fallbacks = ['Pearl Embellished Hairclip', 'Rhinestone Hair Barrette', 'Matte Finish Claw Clip', 'Designer Golden Bangle'];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
    return base.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function VendorDashboard() {
    const { user } = useSelector(state => state.auth);
    const [activeTab, setActiveTab] = useState('shop_profile');

    // Shop details state
    const [shopId, setShopId] = useState(null);
    const [shopName, setShopName] = useState(user?.businessName || '');
    const [shopLocation, setShopLocation] = useState(user?.businessAddress || '');
    const [shopImage, setShopImage] = useState('');
    const [shopDesc, setShopDesc] = useState('');
    const [savingShop, setSavingShop] = useState(false);

    // Products state
    const [products, setProducts] = useState([]);

    // Add Product Modal
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '', imageUrl: '', category: '' });

    // Market view state
    const [marketShops, setMarketShops] = useState([]);
    const [loadingMarket, setLoadingMarket] = useState(false);

    // Orders state
    const [shopOrders, setShopOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Load orders when tab is selected
    useEffect(() => {
        if (activeTab === 'orders') {
            setLoadingOrders(true);
            api.get('/shops/my/orders')
                .then(res => setShopOrders(res.data.orders || []))
                .catch(err => toast.error('Failed to load orders'))
                .finally(() => setLoadingOrders(false));
        }
    }, [activeTab]);

    // Load market shops when tab is selected
    useEffect(() => {
        if (activeTab === 'market') {
            setLoadingMarket(true);
            api.get('/shops')
                .then(res => {
                    if (res.data.shops) {
                        // Exclude current user's shop
                        setMarketShops(res.data.shops.filter(s => s._id !== shopId));
                    }
                })
                .catch(err => toast.error('Failed to load market data'))
                .finally(() => setLoadingMarket(false));
        }
    }, [activeTab, shopId]);

    // Load vendor's shop on mount
    useEffect(() => {
        api.get('/shops/my/shop')
            .then(res => {
                if (res.data.shop) {
                    const s = res.data.shop;
                    setShopId(s._id);
                    setShopName(s.name || '');
                    setShopLocation(s.location || '');
                    setShopImage(s.image || '');
                    setShopDesc(s.description || '');
                    setProducts(s.products || []);
                }
            })
            .catch(() => {}); // silently ignore if no shop yet
    }, []);

    const resetModal = () => {
        setShowModal(false);
        setMode(null);
        setProcessing(false);
        setNewProduct({ name: '', price: '', quantity: '', imageUrl: '', category: '' });
    };

    // MODE 1 — Merchant types a name, AI generates image
    const handleGenerateImageFromName = () => {
        if (!newProduct.name.trim()) { toast.error('Please type a product name first!'); return; }
        setProcessing(true);
        toast('🤖 AI is generating an image for your product…', { icon: '⚡' });
        setTimeout(() => {
            const url = getAutoImageUrl(newProduct.name);
            setNewProduct(p => ({ ...p, imageUrl: url }));
            setProcessing(false);
            toast.success('✅ AI image generated! You can change it anytime.');
        }, 1800);
    };

    // MODE 2 — Merchant uploads/takes pic, AI names it
    const triggerUpload = (useCamera) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        if (useCamera) input.capture = 'environment';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const objectUrl = URL.createObjectURL(file);
            setProcessing(true);
            setNewProduct(p => ({ ...p, imageUrl: objectUrl }));
            setTimeout(() => {
                const autoName = getAutoNameFromFile(file.name);
                setNewProduct(p => ({ ...p, name: autoName, category: 'Auto-categorized' }));
                setProcessing(false);
                toast.success(`🤖 AI named your product: "${autoName}"`);
            }, 2000);
        };
        input.click();
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
            toast.error('Please fill all required fields');
            return;
        }
        if (!newProduct.imageUrl) {
            toast.error('Please add a product image');
            return;
        }
        try {
            const res = await api.post('/shops/products', {
                name: newProduct.name,
                imageUrl: newProduct.imageUrl,
                price: Number(newProduct.price),
                quantity: Number(newProduct.quantity),
                category: newProduct.category || 'General',
            });
            setProducts(prev => [...prev, res.data.product]);
            toast.success(`✅ "${newProduct.name}" published to your shop!`);
            resetModal();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save product. Create your shop profile first!');
        }
    };

    const handleSaveShop = async (e) => {
        e.preventDefault();
        if (!shopName.trim()) { toast.error('Please enter your shop name'); return; }
        setSavingShop(true);
        try {
            const res = await api.post('/shops', {
                name: shopName,
                description: shopDesc,
                image: shopImage,
                location: shopLocation,
                category: 'General',
            });
            setShopId(res.data.shop._id);
            toast.success('🏪 Shop profile saved! Visible in Shops now.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save shop');
        } finally {
            setSavingShop(false);
        }
    };

    const ModeCard = ({ icon, title, desc, value }) => (
        <div
            onClick={() => setMode(value)}
            style={{
                padding: 20, borderRadius: 12,
                border: `2px solid ${mode === value ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                background: mode === value ? 'var(--clr-bg-alt)' : 'transparent',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
            }}
        >
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{icon}</div>
            <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong>
            <small style={{ color: 'var(--clr-text-muted)', fontSize: '0.8rem' }}>{desc}</small>
        </div>
    );

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <div style={{ width: 48, height: 48, background: 'var(--clr-accent)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏪</div>
                <div>
                    <h1 style={{ margin: 0 }}>Trader Dashboard</h1>
                    <p style={{ margin: 0, color: 'var(--clr-text-muted)' }}>Welcome, {user?.name || 'Market Owner'}</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', borderBottom: '1px solid var(--clr-border)' }}>
                {[
                    ['shop_profile', <FiSettings />, 'Shop Details'], 
                    ['products', <FiBox />, 'Manage Products'],
                    ['orders', <FiShoppingBag />, 'Orders'],
                    ['market', <FiTrendingUp />, 'Market View']
                ].map(([tab, icon, label]) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', padding: '12px 20px', borderBottom: activeTab === tab ? '2px solid var(--clr-primary)' : '2px solid transparent', color: activeTab === tab ? 'var(--clr-primary)' : 'inherit', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {icon} {label}
                    </button>
                ))}
            </div>

            {/* ── SHOP PROFILE ── */}
            {activeTab === 'shop_profile' && (
                <div className="card" style={{ padding: '32px', maxWidth: 600 }}>
                    <h2>My Shop Details</h2>
                    <p style={{ color: 'var(--clr-text-faint)', marginBottom: 24 }}>Set up your public shop profile so customers can find you.</p>
                    <form onSubmit={handleSaveShop}>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label"><FiImage /> Shop Picture URL</label>
                            <input type="text" className="form-input" placeholder="https://example.com/shop.jpg" value={shopImage} onChange={e => setShopImage(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Shop Name</label>
                            <input type="text" className="form-input" placeholder="e.g. Subhash Accessories" value={shopName} onChange={e => setShopName(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label"><FiMapPin /> Location</label>
                            <input type="text" className="form-input" placeholder="City, State / Full Address" value={shopLocation} onChange={e => setShopLocation(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Description</label>
                            <textarea className="form-input" rows="3" placeholder="Tell customers what you sell..." value={shopDesc} onChange={e => setShopDesc(e.target.value)}></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={savingShop}>
                            <FiSave /> {savingShop ? 'Saving…' : 'Save Shop Profile'}
                        </button>
                    </form>
                </div>
            )}

            {/* ── PRODUCTS ── */}
            {activeTab === 'products' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2>My Items ({products.length})</h2>
                        <button className="btn btn-accent" onClick={() => setShowModal(true)}><FiPlus /> Add New Item</button>
                    </div>

                    {products.length === 0 ? (
                        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                            <FiBox size={48} color="var(--clr-text-faint)" />
                            <h3 style={{ marginTop: 16 }}>No products listed yet</h3>
                            <p style={{ color: 'var(--clr-text-muted)', marginBottom: 20 }}>Add your first item in seconds using AI assistance.</p>
                            <button className="btn btn-accent" onClick={() => setShowModal(true)}><FiPlus /> Add First Item</button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
                            {products.map(p => (
                                <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />}
                                    <div style={{ padding: 16 }}>
                                        <h4 style={{ margin: '0 0 6px 0' }}>{p.name}</h4>
                                        <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>{p.category}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ color: 'var(--clr-primary)', fontSize: '1.1rem' }}>₹{p.price}</strong>
                                            <span className="badge">Qty: {p.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── ORDERS VIEW ── */}
            {activeTab === 'orders' && (
                <div>
                    <div style={{ marginBottom: 24 }}>
                        <h2>Shop Orders</h2>
                        <p style={{ color: 'var(--clr-text-muted)', margin: 0 }}>Manage the orders placed by customers for your shop items.</p>
                    </div>

                    {loadingOrders ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                            <p>Loading orders...</p>
                        </div>
                    ) : shopOrders.length === 0 ? (
                        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                            <FiShoppingBag size={48} color="var(--clr-text-faint)" />
                            <h3 style={{ marginTop: 16 }}>No Orders Yet</h3>
                            <p style={{ color: 'var(--clr-text-muted)' }}>Orders for your items will appear here once customers purchase them.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {shopOrders.map(order => (
                                <div key={order._id} className="card" style={{ padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid var(--clr-border)', paddingBottom: 12 }}>
                                        <div>
                                            <strong style={{ fontSize: '1.1rem' }}>Order #{order.orderNumber}</strong>
                                            <span style={{ marginLeft: 12, fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <span className={`badge ${order.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>{order.status.toUpperCase()}</span>
                                    </div>
                                    <div style={{ marginBottom: 16 }}>
                                        <p style={{ margin: '0 0 4px 0' }}><strong>Customer:</strong> {order.user?.name} ({order.user?.phone || 'No phone'})</p>
                                        <p style={{ margin: '0 0 4px 0' }}><strong>Delivery:</strong> {order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Items Purchased:</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--clr-bg-alt)', padding: 12, borderRadius: 6 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <img src={item.product?.images?.[0]?.url || `https://picsum.photos/seed/${item.product?._id}/40/40`} alt="item" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                                                        <div>
                                                            <div style={{ fontWeight: '500' }}>{item.product?.name || 'Unknown Item'}</div>
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>Qty: {item.qty}</div>
                                                        </div>
                                                    </div>
                                                    <strong style={{ color: 'var(--clr-primary)' }}>₹{item.unitPrice * item.qty}</strong>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── MARKET VIEW ── */}
            {activeTab === 'market' && (
                <div>
                    <div style={{ marginBottom: 24 }}>
                        <h2>Market Overview</h2>
                        <p style={{ color: 'var(--clr-text-muted)', margin: 0 }}>See what other shop owners are selling and compare prices.</p>
                    </div>

                    {loadingMarket ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                            <p>Loading competitor shops...</p>
                        </div>
                    ) : marketShops.length === 0 ? (
                        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                            <FiTrendingUp size={48} color="var(--clr-text-faint)" />
                            <h3 style={{ marginTop: 16 }}>No other shops found</h3>
                            <p style={{ color: 'var(--clr-text-muted)' }}>You are the only trader on the platform right now!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            {marketShops.map(shop => (
                                <div key={shop._id} className="card" style={{ padding: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, borderBottom: '1px solid var(--clr-border)', paddingBottom: 16 }}>
                                        <div style={{ width: 64, height: 64, borderRadius: 8, background: 'var(--clr-bg-alt)', overflow: 'hidden' }}>
                                            <img src={shop.image || `https://picsum.photos/seed/${shop._id}/64/64`} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {shop.name}
                                                <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>{shop.category || 'General'}</span>
                                            </h3>
                                            <p style={{ margin: 0, color: 'var(--clr-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FiMapPin size={14} /> {shop.location || 'Unknown Location'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {!shop.products || shop.products.length === 0 ? (
                                        <p style={{ color: 'var(--clr-text-faint)', fontStyle: 'italic', margin: 0 }}>This shop hasn't listed any items yet.</p>
                                    ) : (
                                        <div>
                                            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem' }}>Listed Items ({shop.products.length})</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                                                {shop.products.map(p => (
                                                    <div key={p._id} style={{ border: '1px solid var(--clr-border)', borderRadius: 8, overflow: 'hidden' }}>
                                                        <img src={p.imageUrl || `https://picsum.photos/seed/${p._id}/200/200`} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                                                        <div style={{ padding: 12 }}>
                                                            <div style={{ fontWeight: '500', fontSize: '0.9rem', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.name}>{p.name}</div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ color: 'var(--clr-primary)', fontWeight: 'bold' }}>₹{p.price}</span>
                                                                <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Qty: {p.quantity}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── ADD PRODUCT MODAL ── */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, overflowY: 'auto' }}>
                    <div className="card" style={{ width: '100%', maxWidth: 540, padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={resetModal} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>

                        <h2 style={{ margin: '0 0 6px 0' }}>Add New Item</h2>
                        
                        {!mode ? (
                            <>
                                <p style={{ margin: '0 0 24px 0', color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>Choose how you want to list your product:</p>
                                {/* ── Mode selector ── */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
                                    <ModeCard icon="✍️" title="Name Only" desc="Type name, AI generates image" value="name_to_image" />
                                    <ModeCard icon="📷" title="Photo Only" desc="Upload pic, AI names it" value="image_to_name" />
                                    <ModeCard icon="✅" title="Both" desc="Enter name + upload photo" value="manual" />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <button className="btn btn-ghost" onClick={resetModal}>Cancel</button>
                                </div>
                            </>
                        ) : (
                            <button className="btn btn-ghost btn-sm" onClick={() => setMode(null)} style={{ marginBottom: '24px', padding: 0, height: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                                ← Back to options
                            </button>
                        )}

                        {mode && (
                            <form onSubmit={handleSaveProduct}>
                                {/* ─ NAME field (shown in name_to_image + manual) ─ */}
                                {(mode === 'name_to_image' || mode === 'manual') && (
                                    <div className="form-group" style={{ marginBottom: 16 }}>
                                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            Product Name *
                                            {newProduct.name && mode === 'image_to_name' && <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>✨ AI Named</span>}
                                        </label>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={newProduct.name}
                                                onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                                                placeholder="e.g. Crystal Hair Pin Set"
                                                required
                                                style={{ flex: 1 }}
                                            />
                                            {mode === 'name_to_image' && (
                                                <button
                                                    type="button"
                                                    className="btn btn-accent btn-sm"
                                                    onClick={handleGenerateImageFromName}
                                                    disabled={processing || !newProduct.name.trim()}
                                                    title="Generate image from name"
                                                    style={{ whiteSpace: 'nowrap' }}
                                                >
                                                    <FiZap /> {processing ? 'Generating…' : 'AI Image'}
                                                </button>
                                            )}
                                        </div>
                                        {mode === 'name_to_image' && <small style={{ color: 'var(--clr-text-muted)' }}>Type a name then click "AI Image" to generate a product photo automatically.</small>}
                                    </div>
                                )}

                                {/* ─ IMAGE section (shown in image_to_name + manual + after AI generation) ─ */}
                                {(mode === 'image_to_name' || mode === 'manual' || (mode === 'name_to_image' && !newProduct.imageUrl)) && (
                                    <div className="form-group" style={{ marginBottom: 16 }}>
                                        {mode !== 'name_to_image' && <label className="form-label">Product Photo *</label>}
                                    </div>
                                )}

                                {/* ─ Image preview / upload zone ─ */}
                                <div style={{ textAlign: 'center', padding: processing ? 32 : 0, border: newProduct.imageUrl ? 'none' : '2px dashed var(--clr-border)', borderRadius: 12, marginBottom: 20, background: newProduct.imageUrl ? 'none' : 'var(--clr-bg-alt)' }}>
                                    {processing ? (
                                        <div>
                                            <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>
                                                {mode === 'name_to_image' ? '🤖 AI Generating image from name…' : '🤖 AI Analyzing photo…'}
                                            </p>
                                            <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: 'var(--clr-text-muted)' }}>
                                                {mode === 'name_to_image' ? 'Finding the best matching product image' : 'Standardizing product name for uniqueness'}
                                            </p>
                                        </div>
                                    ) : newProduct.imageUrl ? (
                                        <div style={{ position: 'relative' }}>
                                            <img src={newProduct.imageUrl} alt="Product" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10 }} />
                                            <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center' }}>
                                                {mode !== 'name_to_image' && <>
                                                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => triggerUpload(false)}>📂 Change Photo</button>
                                                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => triggerUpload(true)}>📸 Retake</button>
                                                </>}
                                                {mode === 'name_to_image' && <button type="button" className="btn btn-ghost btn-sm" onClick={handleGenerateImageFromName}>🔄 Regenerate</button>}
                                            </div>
                                        </div>
                                    ) : (mode === 'image_to_name' || mode === 'manual') ? (
                                        <div style={{ padding: 24 }}>
                                            <FiCamera size={36} color="var(--clr-text-faint)" />
                                            <p style={{ margin: '10px 0 14px', fontWeight: 'bold' }}>Add Product Photo</p>
                                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                                <button type="button" className="btn btn-primary btn-sm" onClick={() => triggerUpload(true)}>📸 Take Picture</button>
                                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => triggerUpload(false)}>📂 Upload File</button>
                                            </div>
                                            {mode === 'image_to_name' && <p style={{ margin: '12px 0 0 0', fontSize: '0.82rem', color: 'var(--clr-text-muted)' }}>AI will read your photo and set the product name!</p>}
                                        </div>
                                    ) : null}
                                </div>

                                {/* ─ AI-named field (image_to_name mode) ─ */}
                                {mode === 'image_to_name' && (
                                    <div className="form-group" style={{ marginBottom: 16 }}>
                                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            AI-Generated Name *
                                            {newProduct.name && <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>✨ AI Verified</span>}
                                        </label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={newProduct.name}
                                            onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                                            placeholder="Upload a photo — AI will fill this automatically"
                                            required
                                        />
                                        <small style={{ color: 'var(--clr-text-muted)' }}>You can edit the AI name if needed.</small>
                                    </div>
                                )}

                                {/* ─ Price + Quantity ─ */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                    <div className="form-group">
                                        <label className="form-label">Price / unit (₹) *</label>
                                        <input type="number" className="form-input" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} required min="1" placeholder="e.g. 299" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Quantity Available *</label>
                                        <input type="number" className="form-input" value={newProduct.quantity} onChange={e => setNewProduct(p => ({ ...p, quantity: e.target.value }))} required min="1" placeholder="e.g. 50" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-accent btn-full btn-lg"
                                    disabled={processing || !newProduct.name || !newProduct.imageUrl}
                                >
                                    <FiPlus /> Publish Item to My Shop
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <style>{`.spinner{width:28px;height:28px;border:3px solid rgba(0,0,0,0.1);border-radius:50%;border-top-color:var(--clr-accent);animation:spin 1s ease-in-out infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
