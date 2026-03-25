import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiLogOut } from 'react-icons/fi'
import { logout } from '../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Profile() {
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })

    function handleSave() {
        toast.success('Profile updated!')
        setEditing(false)
    }

    function handleLogout() {
        dispatch(logout())
        navigate('/')
        toast('Signed out. See you soon!')
    }

    return (
        <div style={{ padding: 'var(--space-8) 0 var(--space-12)' }}>
            <div className="container" style={{ maxWidth: 640 }}>
                <h1 style={{ marginBottom: 'var(--space-6)' }}>My Profile</h1>

                <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    {/* Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-body)' }}>{user?.name}</h2>
                            <span className={`badge ${user?.role === 'wholesale' ? 'badge-accent' : 'badge-primary'}`}>
                                {user?.role === 'wholesale' ? '🏭 Wholesale' : '🛍️ Retail'} Buyer
                            </span>
                        </div>
                    </div>

                    <div className="divider" />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="profile-name">Full Name</label>
                            <input id="profile-name" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={!editing} aria-label="Full name" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" value={user?.email || '—'} disabled style={{ opacity: 0.7 }} aria-label="Email address" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="profile-phone">Phone</label>
                            <input id="profile-phone" className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={!editing} aria-label="Phone number" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <input className="form-input" value={user?.role || '—'} disabled style={{ textTransform: 'capitalize', opacity: 0.7 }} aria-label="Account role" />
                        </div>
                    </div>

                    {user?.role === 'wholesale' && (
                        <>
                            <div className="divider" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Business Name</label>
                                    <input className="form-input" value={user?.businessName || '—'} disabled style={{ opacity: 0.7 }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">GST Number</label>
                                    <input className="form-input" value={user?.gstNumber || '—'} disabled style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px', opacity: 0.7 }} />
                                </div>
                            </div>
                        </>
                    )}

                    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                        {editing ? (
                            <>
                                <button className="btn btn-primary" onClick={handleSave} id="save-profile-btn"><FiSave /> Save Changes</button>
                                <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                            </>
                        ) : (
                            <button className="btn btn-secondary" onClick={() => setEditing(true)} id="edit-profile-btn"><FiUser /> Edit Profile</button>
                        )}
                        <button className="btn btn-ghost" onClick={handleLogout} style={{ marginLeft: 'auto', color: 'var(--clr-danger)' }} id="logout-btn">
                            <FiLogOut /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
