import { Link } from 'react-router-dom'
import { FiBarChart2, FiPackage, FiUsers, FiDollarSign, FiTrendingUp, FiSettings } from 'react-icons/fi'
import { formatINR } from '../../utils/pricing'

const STATS = [
    { label: 'Total Revenue', value: '₹4,82,300', icon: <FiDollarSign />, color: 'var(--clr-primary)', change: '+12.3%' },
    { label: 'Total Orders', value: '1,247', icon: <FiPackage />, color: 'var(--clr-info)', change: '+8.1%' },
    { label: 'Registered Users', value: '3,891', icon: <FiUsers />, color: 'var(--clr-success)', change: '+24.5%' },
    { label: 'Avg Order Value', value: '₹386', icon: <FiTrendingUp />, color: 'var(--clr-secondary)', change: '+3.7%' },
]

export default function AdminDashboard() {
    return (
        <div style={{ padding: 'var(--space-8) 0 var(--space-12)' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                    <h1>Admin Dashboard</h1>
                    <span className="badge badge-accent">🛡️ Admin</span>
                </div>

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                    {STATS.map(stat => (
                        <div key={stat.label} className="card" style={{ padding: 'var(--space-5)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${stat.color}18`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{stat.icon}</div>
                                <span style={{ fontSize: '0.78rem', color: 'var(--clr-success)', fontWeight: 600 }}>{stat.change}</span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--clr-text)', marginBottom: 4 }}>{stat.value}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Nav links */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
                    {[
                        { to: '/admin/products', label: 'Manage Products', icon: <FiPackage />, desc: 'Add, edit, remove products' },
                        { to: '/admin/orders', label: 'Manage Orders', icon: <FiBarChart2 />, desc: 'View and update orders' },
                        { to: '/admin/users', label: 'Manage Users', icon: <FiUsers />, desc: 'Retail & wholesale accounts' },
                    ].map(link => (
                        <Link key={link.to} to={link.to} className="card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', cursor: 'pointer' }}>
                            <div style={{ fontSize: '1.5rem', color: 'var(--clr-primary)' }}>{link.icon}</div>
                            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600 }}>{link.label}</h3>
                            <p style={{ fontSize: '0.85rem' }}>{link.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
