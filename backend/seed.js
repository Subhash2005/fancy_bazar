require('dotenv').config()
const mongoose = require('mongoose')
const Product = require('./models/Product')
const Category = require('./models/Category')

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fancybazaar')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1) })

// ─── Categories ────────────────────────────────────────────────
const categories = [
    { name: 'Writing Instruments', slug: 'writing-instruments', description: 'Pens, pencils, markers and more', commissionPct: 8 },
    { name: 'Paper Products', slug: 'paper-products', description: 'Notebooks, A4, sticky notes and more', commissionPct: 8 },
    { name: 'Office Supplies', slug: 'office-supplies', description: 'Clips, staplers, scissors and more', commissionPct: 8 },
    { name: 'Art & Craft', slug: 'art-craft', description: 'Colors, brushes, canvases and more', commissionPct: 10 },
    { name: 'Filing & Storage', slug: 'filing-storage', description: 'Files, folders, binders and more', commissionPct: 8 },
]

// ─── A–Z Products ──────────────────────────────────────────────
// Images from Unsplash (free, no auth needed)
const products = [
    {
        name: 'A4 Paper Ream (500 Sheets)',
        slug: 'a4-paper-ream-500-sheets',
        description: 'Premium A4 size printing paper, 75 GSM, 500 sheets per ream. Compatible with all inkjet and laser printers.',
        brand: 'PaperMate',
        categorySlug: 'paper-products',
        images: [{ url: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600', alt: 'A4 Paper Ream' }],
        tags: ['a4', 'paper', 'printing', 'ream', 'office'],
        variants: [{ sku: 'A4-REAM-500', stock: 200, retailPrice: 249, wholesalePrices: { low: 249, mid: 220, high: 195 } }],
        isFeatured: true, isTrending: true, gstRate: 12,
    },
    {
        name: 'Ball Pen Blue (Pack of 10)',
        slug: 'ball-pen-blue-pack-10',
        description: 'Smooth writing ball pens with blue ink. Ergonomic grip for comfortable writing. Ideal for office and school use.',
        brand: 'Reynolds',
        categorySlug: 'writing-instruments',
        images: [{ url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600', alt: 'Ball Pen Blue' }],
        tags: ['pen', 'ballpen', 'blue ink', 'writing'],
        variants: [{ sku: 'BP-BLUE-10', stock: 500, retailPrice: 99, wholesalePrices: { low: 99, mid: 85, high: 70 } }],
        isFeatured: true, gstRate: 12,
    },
    {
        name: 'Correction Pen (White-out)',
        slug: 'correction-pen-whiteout',
        description: 'Quick-dry correction pen with fine tip for precise corrections on paper. Opaque white formula.',
        brand: 'Faber-Castell',
        categorySlug: 'office-supplies',
        images: [{ url: 'https://images.unsplash.com/photo-1606189934846-a527add8a77b?w=600', alt: 'Correction Pen' }],
        tags: ['correction', 'whiteout', 'eraser', 'office'],
        variants: [{ sku: 'CORR-PEN-WH', stock: 300, retailPrice: 49, wholesalePrices: { low: 49, mid: 42, high: 35 } }],
        gstRate: 12,
    },
    {
        name: 'Drawing Compass Set',
        slug: 'drawing-compass-set',
        description: 'Professional geometry compass set with pencil, ruler, protractor and set squares. Ideal for students and architects.',
        brand: 'Camlin',
        categorySlug: 'art-craft',
        images: [{ url: 'https://images.unsplash.com/photo-1602080858428-35be98ed7905?w=600', alt: 'Drawing Compass Set' }],
        tags: ['compass', 'geometry', 'drawing', 'set'],
        variants: [{ sku: 'DRAW-COMP-SET', stock: 150, retailPrice: 199, wholesalePrices: { low: 199, mid: 170, high: 145 } }],
        gstRate: 18,
    },
    {
        name: 'Eraser (White Vinyl, Pack of 5)',
        slug: 'eraser-white-vinyl-pack-5',
        description: 'Soft white vinyl erasers that cleanly remove pencil marks without tearing paper. Pack of 5.',
        brand: 'Natraj',
        categorySlug: 'writing-instruments',
        images: [{ url: 'https://images.unsplash.com/photo-1544239265-ee5eedde4a2b?w=600', alt: 'White Eraser' }],
        tags: ['eraser', 'rubber', 'pencil', 'stationery'],
        variants: [{ sku: 'ERASE-WH-5', stock: 600, retailPrice: 39, wholesalePrices: { low: 39, mid: 32, high: 25 } }],
        gstRate: 12,
    },
    {
        name: 'Fountain Pen with Ink Cartridges',
        slug: 'fountain-pen-ink-cartridges',
        description: 'Elegant fountain pen with 5 blue ink cartridges. Stainless steel nib, lightweight aluminium body.',
        brand: 'Parker',
        categorySlug: 'writing-instruments',
        images: [{ url: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600', alt: 'Fountain Pen' }],
        tags: ['fountain pen', 'ink', 'parker', 'premium pen'],
        variants: [{ sku: 'FOUNT-PEN-BL', stock: 80, retailPrice: 599, wholesalePrices: { low: 599, mid: 520, high: 450 } }],
        isFeatured: true, gstRate: 18,
    },
    {
        name: 'Glue Stick (Pack of 6)',
        slug: 'glue-stick-pack-6',
        description: 'Non-toxic, washable glue sticks for paper, cardboard and photos. Pack of 6 sticks (21g each).',
        brand: 'Fevi Stick',
        categorySlug: 'office-supplies',
        images: [{ url: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=600', alt: 'Glue Stick' }],
        tags: ['glue', 'adhesive', 'craft', 'school'],
        variants: [{ sku: 'GLUE-STK-6', stock: 400, retailPrice: 119, wholesalePrices: { low: 119, mid: 99, high: 80 } }],
        gstRate: 12,
    },
    {
        name: 'Highlighter Pens (6 Colors)',
        slug: 'highlighter-pens-6-colors',
        description: 'Fluorescent water-based highlighters in 6 vibrant colors. Chisel tip for broad and fine lines. No bleed-through.',
        brand: 'Stabilo',
        categorySlug: 'writing-instruments',
        images: [{ url: '/images/prod_highlighter6.png', alt: 'Highlighter Pens' }],
        tags: ['highlighter', 'marker', 'color', 'stabilo'],
        variants: [{ sku: 'HIGH-6COL', stock: 250, retailPrice: 199, wholesalePrices: { low: 199, mid: 170, high: 145 } }],
        isFeatured: true, isTrending: true, gstRate: 12,
    },
    {
        name: 'Index Cards (100 Pack, Ruled)',
        slug: 'index-cards-100-ruled',
        description: 'White ruled index cards, 4x6 inch, 100 per pack. Perfect for notes, flashcards and presentations.',
        brand: 'Oxford',
        categorySlug: 'paper-products',
        images: [{ url: 'https://images.unsplash.com/photo-1544396821-4bc158d290b3?w=600', alt: 'Index Cards' }],
        tags: ['index card', 'flashcard', 'ruled', 'notes'],
        variants: [{ sku: 'IDX-CARD-100', stock: 300, retailPrice: 149, wholesalePrices: { low: 149, mid: 125, high: 105 } }],
        gstRate: 12,
    },
    {
        name: 'Jumbo Binder Clips (Pack of 12)',
        slug: 'jumbo-binder-clips-pack-12',
        description: 'Heavy-duty jumbo binder clips, 51mm wide. Holds up to 170 sheets. Spring-loaded for strong grip.',
        brand: 'Kores',
        categorySlug: 'office-supplies',
        images: [{ url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600', alt: 'Binder Clips' }],
        tags: ['binder clip', 'clip', 'paper clip', 'office'],
        variants: [{ sku: 'BIND-CLIP-J12', stock: 500, retailPrice: 79, wholesalePrices: { low: 79, mid: 65, high: 52 } }],
        gstRate: 12,
    },
    {
        name: 'Kraft Paper Roll (3 meters)',
        slug: 'kraft-paper-roll-3m',
        description: 'Natural brown kraft paper roll, 3 meters long x 60cm wide. Ideal for wrapping, crafts and packaging.',
        brand: 'CraftMate',
        categorySlug: 'art-craft',
        images: [{ url: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600', alt: 'Kraft Paper Roll' }],
        tags: ['kraft', 'wrapping paper', 'craft', 'brown paper'],
        variants: [{ sku: 'KRAFT-3M', stock: 200, retailPrice: 129, wholesalePrices: { low: 129, mid: 110, high: 92 } }],
        gstRate: 12,
    },
    {
        name: 'Letter File Folder (A4, Pack of 5)',
        slug: 'letter-file-folder-a4-pack-5',
        description: 'Polypropylene A4 letter file folders with clear front pocket. Pack of 5 in assorted colors.',
        brand: 'Solo',
        categorySlug: 'filing-storage',
        images: [{ url: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600', alt: 'File Folder' }],
        tags: ['folder', 'file', 'a4', 'office', 'storage'],
        variants: [{ sku: 'FILE-FOLD-5', stock: 300, retailPrice: 179, wholesalePrices: { low: 179, mid: 150, high: 125 } }],
        gstRate: 12,
    },
    {
        name: 'Mechanical Pencil (0.5mm, Pack of 3)',
        slug: 'mechanical-pencil-05mm-pack-3',
        description: 'Slim mechanical pencils with 0.5mm HB leads. Rubberized grip section for comfort. Comes with extra leads.',
        brand: 'Pentel',
        categorySlug: 'writing-instruments',
        images: [{ url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600', alt: 'Mechanical Pencil' }],
        tags: ['mechanical pencil', 'pencil', 'drafting', '0.5mm'],
        variants: [{ sku: 'MECH-PEN-05-3', stock: 200, retailPrice: 149, wholesalePrices: { low: 149, mid: 125, high: 105 } }],
        gstRate: 12,
    },
    {
        name: 'Notebook A5 Spiral (200 Pages)',
        slug: 'notebook-a5-spiral-200-pages',
        description: 'A5 spiral-bound notebook with 200 ruled pages, 70 GSM paper. Flexible cover with bookmark ribbon.',
        brand: 'Classmate',
        categorySlug: 'paper-products',
        images: [{ url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600', alt: 'Spiral Notebook' }],
        tags: ['notebook', 'spiral', 'a5', 'ruled', 'classmate'],
        variants: [{ sku: 'NB-A5-SPRL-200', stock: 400, retailPrice: 129, wholesalePrices: { low: 129, mid: 110, high: 92 } }],
        isFeatured: true, isTrending: true, gstRate: 12,
    },
    {
        name: 'Oil Pastels (25 Colors)',
        slug: 'oil-pastels-25-colors',
        description: 'Vibrant oil pastels set with 25 rich colors. Smooth, buttery texture. Ideal for kids and professional artists.',
        brand: 'Camlin',
        categorySlug: 'art-craft',
        images: [{ url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600', alt: 'Oil Pastels' }],
        tags: ['oil pastel', 'art', 'colors', 'drawing', 'craft'],
        variants: [{ sku: 'OIL-PAST-25', stock: 180, retailPrice: 199, wholesalePrices: { low: 199, mid: 170, high: 145 } }],
        isTrending: true, gstRate: 18,
    },
    {
        name: 'Pencil Box (Metal, Magnetic Lock)',
        slug: 'pencil-box-metal-magnetic',
        description: 'Sturdy metal pencil box with magnetic snap lock. Double-layer storage. Fits pens, erasers, rulers and more.',
        brand: 'Apsara',
        categorySlug: 'office-supplies',
        images: [{ url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600', alt: 'Pencil Box' }],
        tags: ['pencil box', 'storage', 'metal', 'school'],
        variants: [
            { sku: 'PEN-BOX-BLUE', color: 'Blue', stock: 100, retailPrice: 249, wholesalePrices: { low: 249, mid: 210, high: 180 } },
            { sku: 'PEN-BOX-RED', color: 'Red', stock: 100, retailPrice: 249, wholesalePrices: { low: 249, mid: 210, high: 180 } },
        ],
        gstRate: 18,
    },
    {
        name: 'Quick-Dry Ink Stamp Pad (Blue)',
        slug: 'quick-dry-ink-stamp-pad-blue',
        description: 'Fast-drying blue ink stamp pad for rubber stamps. Re-inkable, acid-free, suitable for all rubber stamps.',
        brand: 'Trodat',
        categorySlug: 'office-supplies',
        images: [{ url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600', alt: 'Stamp Pad' }],
        tags: ['stamp pad', 'ink', 'office', 'rubber stamp'],
        variants: [{ sku: 'STAMP-PAD-BL', stock: 200, retailPrice: 89, wholesalePrices: { low: 89, mid: 75, high: 62 } }],
        gstRate: 12,
    },
    {
        name: 'Ruler (30cm Transparent, Pack of 3)',
        slug: 'ruler-30cm-transparent-pack-3',
        description: 'Clear transparent plastic rulers 30cm with metric and imperial markings. Shatter-resistant. Pack of 3.',
        brand: 'Classmate',
        categorySlug: 'office-supplies',
        images: [{ url: 'https://images.unsplash.com/photo-1602080858428-35be98ed7905?w=600', alt: 'Transparent Ruler' }],
        tags: ['ruler', 'scale', 'measuring', '30cm'],
        variants: [{ sku: 'RULER-30-3', stock: 350, retailPrice: 59, wholesalePrices: { low: 59, mid: 49, high: 40 } }],
        gstRate: 12,
    },
    {
        name: 'Scissors (Stainless Steel, 8 inch)',
        slug: 'scissors-stainless-steel-8inch',
        description: 'Premium stainless steel scissors with comfortable soft-grip handles. Razor-sharp blades, 8 inch.',
        brand: 'Faber-Castell',
        categorySlug: 'office-supplies',
        images: [{ url: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=600', alt: 'Scissors' }],
        tags: ['scissors', 'cutting', 'craft', 'office'],
        variants: [{ sku: 'SCISS-SS-8', stock: 200, retailPrice: 149, wholesalePrices: { low: 149, mid: 125, high: 105 } }],
        gstRate: 18,
    },
    {
        name: 'Tape Dispenser with Refill Roll',
        slug: 'tape-dispenser-with-refill-roll',
        description: 'Desktop tape dispenser with 1 refill roll (12mm x 25m). Heavy base, serrated blade for clean cuts.',
        brand: '3M Scotch',
        categorySlug: 'office-supplies',
        images: [{ url: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600', alt: 'Tape Dispenser' }],
        tags: ['tape', 'dispenser', 'scotch', 'office', 'adhesive'],
        variants: [{ sku: 'TAPE-DISP-REF', stock: 150, retailPrice: 199, wholesalePrices: { low: 199, mid: 170, high: 145 } }],
        gstRate: 18,
    },
    {
        name: 'Ultrasmooth HB Pencils (Pack of 12)',
        slug: 'ultrasmooth-hb-pencils-pack-12',
        description: 'Hexagonal HB graphite pencils with ultra-smooth writing. Pre-sharpened tips. Break-resistant graphite core. Pack of 12.',
        brand: 'Apsara',
        categorySlug: 'writing-instruments',
        images: [{ url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600', alt: 'HB Pencils' }],
        tags: ['pencil', 'hb', 'graphite', 'school', 'drawing'],
        variants: [{ sku: 'HB-PEN-12', stock: 600, retailPrice: 69, wholesalePrices: { low: 69, mid: 58, high: 48 } }],
        isTrending: true, gstRate: 12,
    },
    {
        name: 'Velcro Cable Ties (Pack of 20)',
        slug: 'velcro-cable-ties-pack-20',
        description: 'Reusable velcro cable ties for organizing cables and wires on your desk. 20cm long, pack of 20.',
        brand: 'Deli',
        categorySlug: 'office-supplies',
        images: [{ url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600', alt: 'Velcro Cable Ties' }],
        tags: ['cable tie', 'velcro', 'organizer', 'desk', 'cable management'],
        variants: [{ sku: 'VELCRO-CT-20', stock: 300, retailPrice: 129, wholesalePrices: { low: 129, mid: 109, high: 90 } }],
        gstRate: 18,
    },
    {
        name: 'Watercolor Paint Set (24 Colors)',
        slug: 'watercolor-paint-set-24-colors',
        description: 'Professional watercolor paint set with 24 vibrant colors, 1 brush and mixing palette. Non-toxic, washable.',
        brand: 'Camlin',
        categorySlug: 'art-craft',
        images: [{ url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600', alt: 'Watercolor Paint Set' }],
        tags: ['watercolor', 'paint', 'art', 'craft', 'colors'],
        variants: [{ sku: 'WATER-24', stock: 150, retailPrice: 299, wholesalePrices: { low: 299, mid: 255, high: 215 } }],
        isFeatured: true, isTrending: true, gstRate: 18,
    },
    {
        name: 'Xtra Wide Sticky Notes (5x5 inch, 4 Pads)',
        slug: 'xtra-wide-sticky-notes-5x5-4pads',
        description: 'Super sticky notes in 4 neon colors, 5x5 inch size, 100 sheets per pad. Repositionable adhesive.',
        brand: 'Post-it',
        categorySlug: 'paper-products',
        images: [{ url: 'https://images.unsplash.com/photo-1544396821-4bc158d290b3?w=600', alt: 'Sticky Notes' }],
        tags: ['sticky notes', 'post-it', 'notes', 'neon', 'reminder'],
        variants: [{ sku: 'STICKY-5X5-4', stock: 250, retailPrice: 249, wholesalePrices: { low: 249, mid: 210, high: 175 } }],
        isFeatured: true, gstRate: 12,
    },
    {
        name: 'Yellow Highlighter Marker (Pack of 2)',
        slug: 'yellow-highlighter-marker-pack-2',
        description: 'Classic yellow fluorescent highlighters with chisel tip. Smear-proof on ink, laser print and photocopy. Pack of 2.',
        brand: 'Luxor',
        categorySlug: 'writing-instruments',
        images: [{ url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600', alt: 'Yellow Highlighter' }],
        tags: ['highlighter', 'yellow', 'marker', 'fluorescent'],
        variants: [{ sku: 'HIGH-YEL-2', stock: 400, retailPrice: 59, wholesalePrices: { low: 59, mid: 49, high: 40 } }],
        gstRate: 12,
    },
    {
        name: 'Zip-Lock Storage Bags (A4 Size, Pack of 50)',
        slug: 'ziplock-storage-bags-a4-pack-50',
        description: 'Transparent A4-size zip-lock bags for storing documents, craft materials and stationery. Pack of 50.',
        brand: 'Deli',
        categorySlug: 'filing-storage',
        images: [{ url: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600', alt: 'Zip Lock Bags' }],
        tags: ['zip lock', 'storage bag', 'transparent', 'document', 'a4'],
        variants: [{ sku: 'ZIP-A4-50', stock: 300, retailPrice: 179, wholesalePrices: { low: 179, mid: 150, high: 125 } }],
        gstRate: 18,
    },
    // ─── Extra Items (hair clips & fancy desk accessories) ───
    {
        name: 'Hair Clips Assorted (Pack of 20)',
        slug: 'hair-clips-assorted-pack-20',
        description: 'Assorted colorful hair clips in various sizes. Non-slip grip, strong spring. Pack of 20 in mixed colors.',
        brand: 'FancyBazaar',
        categorySlug: 'office-supplies',
        images: [{ url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600', alt: 'Hair Clips' }],
        tags: ['hair clip', 'clip', 'colorful', 'accessories'],
        variants: [
            { sku: 'HAIR-CLIP-20-MIX', color: 'Mixed', stock: 300, retailPrice: 99, wholesalePrices: { low: 99, mid: 80, high: 65 } },
            { sku: 'HAIR-CLIP-20-BLK', color: 'Black', stock: 200, retailPrice: 79, wholesalePrices: { low: 79, mid: 65, high: 52 } },
        ],
        isTrending: true, gstRate: 12,
    },
    {
        name: 'Ink Pen Refills (Blue, Pack of 20)',
        slug: 'ink-pen-refills-blue-pack-20',
        description: 'Standard blue ink pen refills compatible with most Reynolds and Click ballpoint pens. Pack of 20.',
        brand: 'Reynolds',
        categorySlug: 'writing-instruments',
        images: [{ url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600', alt: 'Pen Refills' }],
        tags: ['refill', 'ink', 'ballpen', 'reynolds'],
        variants: [{ sku: 'INK-REF-BL-20', stock: 600, retailPrice: 49, wholesalePrices: { low: 49, mid: 40, high: 32 } }],
        gstRate: 12,
    },
    {
        name: 'Marker Pens Permanent (12 Colors)',
        slug: 'marker-pens-permanent-12-colors',
        description: 'Alcohol-based permanent markers in 12 colors. Works on paper, glass, plastic and metal. Fine tip.',
        brand: 'Camlin',
        categorySlug: 'writing-instruments',
        images: [{ url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600', alt: 'Permanent Markers' }],
        tags: ['marker', 'permanent', 'color', 'art', 'sketch'],
        variants: [{ sku: 'MKR-PERM-12', stock: 200, retailPrice: 249, wholesalePrices: { low: 249, mid: 210, high: 175 } }],
        isFeatured: true, gstRate: 12,
    },
    {
        name: 'Paper Clips (Silver, Box of 100)',
        slug: 'paper-clips-silver-box-100',
        description: 'Standard silver steel paper clips, 32mm. Smooth finish, rust-resistant. Box of 100.',
        brand: 'Kores',
        categorySlug: 'office-supplies',
        images: [{ url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600', alt: 'Paper Clips' }],
        tags: ['paper clip', 'clip', 'silver', 'office', 'steel'],
        variants: [{ sku: 'PCLIP-SLV-100', stock: 800, retailPrice: 39, wholesalePrices: { low: 39, mid: 32, high: 25 } }],
        gstRate: 12,
    },
    {
        name: 'Stapler with 1000 Staples',
        slug: 'stapler-with-1000-staples',
        description: 'Desktop stapler, binds up to 25 sheets. Includes 1000 standard staples (26/6). Non-slip base.',
        brand: 'Kangaro',
        categorySlug: 'office-supplies',
        images: [{ url: '/images/prod_stapler.jpg', alt: 'Stapler' }],
        tags: ['stapler', 'staples', 'binding', 'office'],
        variants: [
            { sku: 'STAPLER-BLK', color: 'Black', stock: 150, retailPrice: 299, wholesalePrices: { low: 299, mid: 255, high: 215 } },
            { sku: 'STAPLER-RED', color: 'Red', stock: 100, retailPrice: 299, wholesalePrices: { low: 299, mid: 255, high: 215 } },
        ],
        isFeatured: true, gstRate: 18,
    },
]

// ─── Seed Function ─────────────────────────────────────────────
async function seed() {
    try {
        // Clear existing data
        await Product.deleteMany({})
        await Category.deleteMany({})
        console.log('🗑️  Cleared existing products and categories')

        // Insert categories
        const insertedCats = await Category.insertMany(categories)
        console.log(`✅ Inserted ${insertedCats.length} categories`)

        // Build slug → id map
        const catMap = {}
        insertedCats.forEach(c => { catMap[c.slug] = c._id })

        // Attach category _id to each product
        const productsWithCat = products.map(p => ({
            ...p,
            category: catMap[p.categorySlug],
            categorySlug: undefined,
        }))

        const inserted = await Product.insertMany(productsWithCat)
        console.log(`✅ Inserted ${inserted.length} products (A–Z stationery)`)

        console.log('\n📦 Products seeded:')
        inserted.forEach((p, i) => console.log(`  ${String(i + 1).padStart(2, '0')}. ${p.name}`))

        process.exit(0)
    } catch (err) {
        console.error('❌ Seed error:', err.message)
        process.exit(1)
    }
}

mongoose.connection.once('open', seed)
