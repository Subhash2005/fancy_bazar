require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => { console.error('❌ Connection error:', err); process.exit(1); });

const REAL_CATEGORIES = [
    { label: 'Hair Accessories', slug: 'hair-accessories', icon: '💇' },
    { label: 'Jewellery', slug: 'jewellery', icon: '💍' },
    { label: 'Bags & Purses', slug: 'bags-purses', icon: '👜' },
    { label: 'Watches', slug: 'watches', icon: '⌚' },
    { label: 'Scarves & Stoles', slug: 'scarves-stoles', icon: '🧣' },
    { label: 'Sunglasses', slug: 'sunglasses', icon: '🕶️' },
    { label: 'Keychains', slug: 'keychains', icon: '🔑' },
    { label: 'Gift Sets', slug: 'gift-sets', icon: '🎁' },
];

const sampleProducts = [
    { name: 'Crystal Hair Clip', slug: 'crystal-hair-clip', categorySlug: 'hair-accessories', price: 149, img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600' },
    { name: 'Gold Necklace', slug: 'gold-necklace', categorySlug: 'jewellery', price: 999, img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600' },
    { name: 'Leather Handbag', slug: 'leather-handbag', categorySlug: 'bags-purses', price: 1299, img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600' },
    { name: 'Luxury Rose Gold Watch', slug: 'luxury-watch', categorySlug: 'watches', price: 2499, img: 'https://images.unsplash.com/photo-1524592091214-8f97ad332c67?w=600' },
    { name: 'Silk Scarf Blue', slug: 'silk-scarf-blue', categorySlug: 'scarves-stoles', price: 499, img: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa82?w=600' },
    { name: 'Classic Aviators', slug: 'classic-aviators', categorySlug: 'sunglasses', price: 899, img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600' },
    { name: 'Silver Keychain', slug: 'silver-keychain', categorySlug: 'keychains', price: 99, img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600' },
    { name: 'Deluxe Gift Set', slug: 'deluxe-gift-set', categorySlug: 'gift-sets', price: 1599, img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600' },
];

async function seed() {
    try {
        console.log('🌱 Starting seed...');
        
        for (const catData of REAL_CATEGORIES) {
            await Category.findOneAndUpdate(
                { slug: catData.slug },
                { name: catData.label, slug: catData.slug, commissionPct: 8 },
                { upsert: true, new: true }
            );
        }
        console.log('✅ Categories created/updated');

        const categories = await Category.find();
        const catMap = {};
        categories.forEach(c => catMap[c.slug] = c._id);

        for (const p of sampleProducts) {
            await Product.findOneAndUpdate(
                { slug: p.slug },
                {
                    name: p.name,
                    slug: p.slug,
                    category: catMap[p.categorySlug],
                    description: `${p.name} - high quality fancy item.`,
                    images: [{ url: p.img, alt: p.name }],
                    isActive: true,
                    variants: [{
                        sku: `SKU-${p.slug.toUpperCase()}`,
                        retailPrice: p.price,
                        stock: 100
                    }]
                },
                { upsert: true }
            );
        }
        console.log('✅ Products created/updated');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
