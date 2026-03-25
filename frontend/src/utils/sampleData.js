// Shared sample data utilities
const COLORS = ['#FFD700', '#F0F0F0', '#9D3FE5', '#E91E63', '#00BCD4', '#FF6B35', '#4CAF50', '#FF0000']

export function getSampleProducts(slug = 'all', count = 12) {
    return Array.from({ length: count }, (_, i) => ({
        _id: `${slug}_${i}`,
        name: `Fancy ${slug.replace(/-/g, ' ')} Item ${i + 1}`,
        category: { name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) },
        images: [{ url: `https://picsum.photos/seed/${slug}${i + 10}/400/400`, alt: `Product ${i + 1}` }],
        variants: [{ sku: `SKU_${slug}_${i}`, retailPrice: Math.round((99 + i * 37) / 10) * 10, stock: i % 7 !== 0 ? 20 : 0, color: COLORS[i % COLORS.length], wholesalePrices: { low: Math.round((99 + i * 37) / 10) * 10, mid: Math.round((99 + i * 37) * 0.85 / 10) * 10, high: Math.round((99 + i * 37) * 0.70 / 10) * 10 } }],
        ratings: { avg: parseFloat((3.5 + Math.random()).toFixed(1)), count: Math.floor(20 + Math.random() * 300) },
        isTrending: i < 3,
    }))
}

export const SAMPLE_PRODUCTS_MAP = {}
