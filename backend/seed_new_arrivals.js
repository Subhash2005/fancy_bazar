require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => { console.error('❌ Connection error:', err); process.exit(1); });

async function seedNewArrivals() {
    try {
        const categories = await Category.find();
        const catMap = {};
        categories.forEach(c => catMap[c.slug] = c._id);

        const newArrivals = [
            {
                name: 'Designer Sunglasses',
                slug: 'designer-sunglasses-v2',
                category: catMap['sunglasses'],
                description: 'Luxury designer sunglasses with polarized lenses and UV400 protection. Crafted with premium acetate frames for ultimate style and comfort.',
                brand: 'FancyLux',
                images: [{ url: 'https://images.unsplash.com/photo-1511499767390-90342f16b147?w=600', alt: 'Designer Sunglasses' }],
                variants: [{ sku: 'SUN-DSG-01', retailPrice: 1599, stock: 50, color: 'Black/Gold' }],
                isFeatured: true,
                tags: ['sunglasses', 'luxury', 'designer', 'eyewear']
            },
            {
                name: 'Scented Candle Set',
                slug: 'scented-candle-set-premium',
                category: catMap['gift-sets'],
                description: 'A set of 4 hand-poured soy wax candles with essential oil scents: Lavender, Sandalwood, Jasmine, and Ocean Breeze. Perfect for home decor and aromatherapy.',
                brand: 'AromaBliss',
                images: [{ url: 'https://images.unsplash.com/photo-1603006905393-f437648d88da?w=600', alt: 'Scented Candle Set' }],
                variants: [{ sku: 'GFT-CNDL-SET', retailPrice: 899, stock: 100 }],
                isFeatured: true,
                tags: ['candles', 'gift set', 'home decor', 'aroma']
            },
            {
                name: 'Embroidered Tote Bag',
                slug: 'embroidered-tote-bag-floral',
                category: catMap['bags-purses'],
                description: 'Exquisite hand-embroidered floral tote bag. Made with eco-friendly canvas and reinforced handles. Style meets sustainability.',
                brand: 'ArtisanalTouch',
                images: [{ url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600', alt: 'Embroidered Tote Bag' }],
                variants: [{ sku: 'BAG-TOTE-EMB', retailPrice: 1299, stock: 30, design: 'Floral Embroidery' }],
                isFeatured: true,
                tags: ['tote bag', 'embroidery', 'handcrafted', 'bag']
            }
        ];

        for (const p of newArrivals) {
            await Product.findOneAndUpdate(
                { slug: p.slug },
                p,
                { upsert: true, new: true }
            );
        }

        console.log('✅ 3 New Arrival products added successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedNewArrivals();
