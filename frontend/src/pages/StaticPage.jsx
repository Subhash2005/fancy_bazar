import { useEffect } from 'react'
import SEO from '../components/layout/SEO'

export default function StaticPage({ title, children }) {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="container" style={{ padding: '60px 20px', maxWidth: '800px' }}>
            <SEO title={`${title} | FancyBazaar`} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '30px' }}>{title}</h1>
            <div style={{ lineHeight: '1.8', color: 'var(--clr-text-muted)' }}>
                {children}
            </div>
        </div>
    )
}
