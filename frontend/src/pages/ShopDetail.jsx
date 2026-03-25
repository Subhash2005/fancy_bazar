import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
    FiMapPin, FiPhone, FiClock, FiStar, FiArrowLeft,
    FiShoppingCart, FiEye, FiSearch, FiPackage
} from 'react-icons/fi'
import AIColorPreview from '../components/products/ColorPreview'
import api from '../services/api'
import './ShopDetail.css'

// ─── Shop + Item data ──────────────────────────────────────────
const ALL_SHOPS = [
    {
        id: 'apsara-stationery',
        name: 'Apsara Stationery Mart',
        tagline: 'Pencils, Pens & More Since 1985',
        address: '12, MG Road, Connaught Place, New Delhi – 110001',
        phone: '+91 98100 12345',
        hours: 'Mon–Sat: 9:00 AM – 8:00 PM',
        rating: 4.8, reviews: 312,
        image: '/images/shop_apsara.png',
        items: [
            { id: 'bp-blue-10', name: 'Ball Pen Blue (Pack of 10)', price: 99, originalPrice: 120, image: '/images/prod_ballpen.png', brand: 'Reynolds', rating: 4.5, reviews: 210, inStock: true, tag: 'Best Seller' },
            { id: 'fountain-pen', name: 'Fountain Pen with Ink Cartridges', price: 599, originalPrice: 750, image: '/images/prod_fountain_pen.png', brand: 'Parker', rating: 4.8, reviews: 98, inStock: true, tag: 'Premium' },
            { id: 'mech-pencil', name: 'Mechanical Pencil (0.5mm, Pack of 3)', price: 149, originalPrice: 180, image: '/images/prod_mech_pencil.png', brand: 'Pentel', rating: 4.6, reviews: 134, inStock: true, tag: null },
            { id: 'hb-pencils', name: 'Ultrasmooth HB Pencils (Pack of 12)', price: 69, originalPrice: 85, image: '/images/prod_hb_pencils.png', brand: 'Apsara', rating: 4.7, reviews: 320, inStock: true, tag: 'Popular' },
            { id: 'high-6col', name: 'Highlighter Pens (6 Colors)', price: 199, originalPrice: 240, image: '/images/prod_highlighter6.png', brand: 'Stabilo', rating: 4.9, reviews: 445, inStock: true, tag: '🔥 Trending' },
            { id: 'eraser-5', name: 'Eraser (White Vinyl, Pack of 5)', price: 39, originalPrice: 50, image: '/images/prod_eraser.png', brand: 'Natraj', rating: 4.3, reviews: 67, inStock: true, tag: null },
            { id: 'high-yel', name: 'Yellow Highlighter Marker (Pack of 2)', price: 59, originalPrice: 70, image: '/images/prod_yellow_highlighter.png', brand: 'Luxor', rating: 4.4, reviews: 112, inStock: true, tag: null },
            { id: 'ink-refill', name: 'Ink Pen Refills (Blue, Pack of 20)', price: 49, originalPrice: 60, image: '/images/prod_ink_refills.png', brand: 'Reynolds', rating: 4.2, reviews: 88, inStock: true, tag: null },
            { id: 'marker-12', name: 'Marker Pens Permanent (12 Colors)', price: 249, originalPrice: 300, image: '/images/prod_markers12.png', brand: 'Camlin', rating: 4.6, reviews: 176, inStock: true, tag: 'New' },
        ],
    },
    {
        id: 'classmate-paper-house',
        name: 'Classmate Paper House',
        tagline: 'All Paper Needs Under One Roof',
        address: '34, Brigade Road, Bengaluru – 560025',
        phone: '+91 80 2345 6789',
        hours: 'Mon–Sun: 8:30 AM – 9:00 PM',
        rating: 4.6, reviews: 198,
        image: '/images/shop_classmate.png',
        items: [
            { id: 'a4-ream', name: 'A4 Paper Ream (500 Sheets)', price: 249, originalPrice: 299, image: '/images/prod_a4_ream.png', brand: 'PaperMate', rating: 4.7, reviews: 310, inStock: true, tag: 'Best Seller' },
            { id: 'notebook-a5', name: 'Notebook A5 Spiral (200 Pages)', price: 129, originalPrice: 160, image: '/images/prod_notebook_a5.png', brand: 'Classmate', rating: 4.8, reviews: 524, inStock: true, tag: '🔥 Trending' },
            { id: 'index-cards', name: 'Index Cards (100 Pack, Ruled)', price: 149, originalPrice: 180, image: 'https://images.unsplash.com/photo-1512138664757-360e0aad5132?w=400&q=80', brand: 'Oxford', rating: 4.4, reviews: 89, inStock: true, tag: null },
            { id: 'kraft-roll', name: 'Kraft Paper Roll (3 meters)', price: 129, originalPrice: 155, image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&q=80', brand: 'CraftMate', rating: 4.3, reviews: 67, inStock: true, tag: null },
            { id: 'sticky-notes', name: 'Xtra Wide Sticky Notes (5×5, 4 Pads)', price: 249, originalPrice: 299, image: 'https://images.unsplash.com/photo-1544396821-4bc158d290b3?w=400&q=80', brand: 'Post-it', rating: 4.9, reviews: 387, inStock: true, tag: 'Popular' },
        ],
    },
    {
        id: 'camlin-art-studio',
        name: 'Camlin Art & Craft Studio',
        tagline: 'Colors That Bring Ideas to Life',
        address: '8, Linking Road, Bandra West, Mumbai – 400050',
        phone: '+91 22 2640 7890',
        hours: 'Tue–Sun: 10:00 AM – 7:30 PM',
        rating: 4.9, reviews: 445,
        image: '/images/shop_camlin.png',
        items: [
            { id: 'oil-past', name: 'Oil Pastels (25 Colors)', price: 199, originalPrice: 240, image: '/images/oil_pastels_set.png', brand: 'Camlin', rating: 4.8, reviews: 213, inStock: true, tag: '🔥 Trending' },
            { id: 'watercolor', name: 'Watercolor Paint Set (24 Colors)', price: 299, originalPrice: 360, image: '/images/watercolor_set.png', brand: 'Camlin', rating: 4.9, reviews: 332, inStock: true, tag: 'Premium' },
            { id: 'compass', name: 'Drawing Compass Set', price: 199, originalPrice: 250, image: 'https://images.unsplash.com/photo-1602080858428-35be98ed7905?w=400&q=80', brand: 'Camlin', rating: 4.5, reviews: 145, inStock: true, tag: null },
            { id: 'kraft-art', name: 'Kraft Paper Roll (3 meters)', price: 129, originalPrice: 155, image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&q=80', brand: 'CraftMate', rating: 4.3, reviews: 67, inStock: true, tag: null },
        ],
    },
    {
        id: 'solo-office-supplies',
        name: 'Solo Office Supplies Co.',
        tagline: 'Everything for Your Desk & Beyond',
        address: '21, Anna Salai, Teynampet, Chennai – 600018',
        phone: '+91 44 4321 9876',
        hours: 'Mon–Sat: 9:00 AM – 7:00 PM',
        rating: 4.5, reviews: 167,
        image: '/images/shop_solo.png',
        items: [
            { id: 'correction-pen', name: 'Correction Pen (White-out)', price: 49, originalPrice: 60, image: 'https://plus.unsplash.com/premium_photo-1751302790709-59c136f328ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Y29ycmVjdGlvbiUyMGZsdWlkJTIwd2hpdGUlMjBvdXQlMjBwZW58ZW58MHx8fHwxNzczNDgxOTE5fDA&ixlib=rb-4.1.0&q=80&w=400', brand: 'Faber-Castell', rating: 4.3, reviews: 98, inStock: true, tag: null },
            { id: 'glue-stick', name: 'Glue Stick (Pack of 6)', price: 119, originalPrice: 145, image: 'https://plus.unsplash.com/premium_photo-1664303224802-c27cfe80ee4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Z2x1ZSUyMHN0aWNrJTIwYWRoZXNpdmUlMjBzY2hvb2x8ZW58MHx8fHwxNzczNDgxOTE5fDA&ixlib=rb-4.1.0&q=80&w=400', brand: 'Fevi Stick', rating: 4.5, reviews: 187, inStock: true, tag: 'Popular' },
            { id: 'binder-clips', name: 'Jumbo Binder Clips (Pack of 12)', price: 79, originalPrice: 99, image: 'https://plus.unsplash.com/premium_photo-1681776287690-728cd4650065?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8YmluZGVyJTIwY2xpcHMlMjBvZmZpY2UlMjBibGFja3xlbnwwfHx8fDE3NzM0ODE5MjB8MA&ixlib=rb-4.1.0&q=80&w=400', brand: 'Kores', rating: 4.4, reviews: 134, inStock: true, tag: null },
            { id: 'stamp-pad', name: 'Quick-Dry Ink Stamp Pad (Blue)', price: 89, originalPrice: 110, image: 'https://plus.unsplash.com/premium_photo-1661499024751-7084544d6c5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8aW5rJTIwc3RhbXAlMjBwYWQlMjBydWJiZXJ8ZW58MHx8fHwxNzczNDgxOTIxfDA&ixlib=rb-4.1.0&q=80&w=400', brand: 'Trodat', rating: 4.2, reviews: 56, inStock: true, tag: null },
            { id: 'ruler-3', name: 'Ruler (30cm Transparent, Pack of 3)', price: 59, originalPrice: 75, image: 'https://plus.unsplash.com/premium_photo-1736435137357-d861ad57787c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8cnVsZXIlMjBtZWFzdXJpbmclMjB0b29sJTIwcGxhc3RpY3xlbnwwfHx8fDE3NzM0ODE5MjF8MA&ixlib=rb-4.1.0&q=80&w=400', brand: 'Classmate', rating: 4.5, reviews: 210, inStock: true, tag: null },
            { id: 'scissors', name: 'Scissors (Stainless Steel, 8 inch)', price: 149, originalPrice: 180, image: 'https://plus.unsplash.com/premium_photo-1672759455088-6304728b30fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8c2Npc3NvcnMlMjBvZmZpY2UlMjBzdGFpbmxlc3N8ZW58MHx8fHwxNzczNDgxOTIyfDA&ixlib=rb-4.1.0&q=80&w=400', brand: 'Faber-Castell', rating: 4.6, reviews: 178, inStock: true, tag: 'Best Seller' },
            { id: 'tape-disp', name: 'Tape Dispenser with Refill Roll', price: 199, originalPrice: 240, image: 'https://plus.unsplash.com/premium_photo-1731622157180-809e81fb79c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8dGFwZSUyMGRpc3BlbnNlciUyMHNjb3RjaCUyMGNsZWFyfGVufDB8fHx8MTc3MzQ4MTkyMnww&ixlib=rb-4.1.0&q=80&w=400', brand: '3M Scotch', rating: 4.7, reviews: 203, inStock: true, tag: 'Popular' },
            { id: 'velcro', name: 'Velcro Cable Ties (Pack of 20)', price: 129, originalPrice: 155, image: 'https://plus.unsplash.com/premium_photo-1762138951115-3abb551ec6ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Y2FibGUlMjB0aWVzJTIwdmVsY3JvJTIwc3RyYXB8ZW58MHx8fHwxNzczNDgxOTIzfDA&ixlib=rb-4.1.0&q=80&w=400', brand: 'Deli', rating: 4.3, reviews: 87, inStock: true, tag: null },
            { id: 'paper-clips', name: 'Paper Clips (Silver, Box of 100)', price: 39, originalPrice: 50, image: 'https://plus.unsplash.com/premium_photo-1685136481363-3402f56f018b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8cGFwZXIlMjBjbGlwcyUyMHNpbHZlcnxlbnwwfHx8fDE3NzM0ODE5MjR8MA&ixlib=rb-4.1.0&q=80&w=400', brand: 'Kores', rating: 4.4, reviews: 312, inStock: true, tag: null },
            { id: 'stapler', name: 'Stapler with 1000 Staples', price: 299, originalPrice: 360, image: '/images/stapler_1000_staples.png', brand: 'Kangaro', rating: 4.7, reviews: 256, inStock: true, tag: 'Best Seller' },
            { id: 'hair-clips', name: 'Hair Clips Assorted (Pack of 20)', price: 99, originalPrice: 120, image: 'https://plus.unsplash.com/premium_photo-1661657788827-4f4984bb5f7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8aGFpciUyMGNsaXBzJTIwY2xhdyUyMGFjY2Vzc29yaWVzfGVufDB8fHx8MTc3MzQ4MTkyNXww&ixlib=rb-4.1.0&q=80&w=400', brand: 'FancyBazaar', rating: 4.5, reviews: 143, inStock: true, tag: '🔥 Trending' },
        ],
    },
    {
        id: 'fancybazaar-stationery',
        name: 'FancyBazaar Stationery Hub',
        tagline: 'Your One-Stop Stationery Destination',
        address: '5, Park Street, Kolkata – 700016',
        phone: '+91 33 2229 0011',
        hours: 'Mon–Sun: 10:00 AM – 9:00 PM',
        rating: 4.7, reviews: 523,
        image: '/images/shop_fancybazaar.png',
        items: [
            { id: 'fb-a4', name: 'A4 Paper Ream (500 Sheets)', price: 249, originalPrice: 299, image: '/images/prod_a4_ream.png', brand: 'PaperMate', rating: 4.7, reviews: 310, inStock: true, tag: 'Best Seller' },
            { id: 'fb-bp', name: 'Ball Pen Blue (Pack of 10)', price: 99, originalPrice: 120, image: '/images/prod_ballpen.png', brand: 'Reynolds', rating: 4.5, reviews: 210, inStock: true, tag: null },
            { id: 'fb-nb', name: 'Notebook A5 Spiral (200 Pages)', price: 129, originalPrice: 160, image: '/images/prod_notebook_a5.png', brand: 'Classmate', rating: 4.8, reviews: 524, inStock: true, tag: '🔥 Trending' },
            { id: 'fb-hi', name: 'Highlighter Pens (6 Colors)', price: 199, originalPrice: 240, image: '/images/prod_highlighter6.png', brand: 'Stabilo', rating: 4.9, reviews: 445, inStock: true, tag: 'Popular' },
            { id: 'fb-wc', name: 'Watercolor Paint Set (24 Colors)', price: 299, originalPrice: 360, image: '/images/watercolor_set.png', brand: 'Camlin', rating: 4.9, reviews: 332, inStock: true, tag: 'Premium' },
            { id: 'fb-st', name: 'Stapler with 1000 Staples', price: 299, originalPrice: 360, image: '/images/stapler_1000_staples.png', brand: 'Kangaro', rating: 4.7, reviews: 256, inStock: true, tag: null },
            { id: 'fb-sc', name: 'Scissors (Stainless Steel, 8 inch)', price: 149, originalPrice: 180, image: 'https://plus.unsplash.com/premium_photo-1676581944446-7f6adf293dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8c2Npc3NvcnMlMjBvZmZpY2UlMjBjdXR0aW5nJTIwdG9vbHxlbnwwfHx8fDE3NzM0ODE5MTN8MA&ixlib=rb-4.1.0&q=80&w=400', brand: 'Faber-Castell', rating: 4.6, reviews: 178, inStock: true, tag: null },
            { id: 'fb-op', name: 'Oil Pastels (25 Colors)', price: 199, originalPrice: 240, image: '/images/oil_pastels_set.png', brand: 'Camlin', rating: 4.8, reviews: 213, inStock: true, tag: null },
            { id: 'fb-sn', name: 'Xtra Wide Sticky Notes (5×5, 4 Pads)', price: 249, originalPrice: 299, image: 'https://plus.unsplash.com/premium_photo-1685136482322-0ac2453016d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8cG9zdCUyMGl0JTIwbm90ZXMlMjBzdGlja3klMjBub3RlcyUyMHN0YWNrfGVufDB8fHx8MTc3MzQ4MTkxNHww&ixlib=rb-4.1.0&q=80&w=400', brand: 'Post-it', rating: 4.9, reviews: 387, inStock: true, tag: null },
            { id: 'fb-pc', name: 'Paper Clips (Silver, Box of 100)', price: 39, originalPrice: 50, image: 'https://plus.unsplash.com/premium_photo-1683309558415-6724de9be256?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8cGFwZXIlMjBjbGlwcyUyMG9mZmljZSUyMG1ldGFsfGVufDB8fHx8MTc3MzQ4MTkxNXww&ixlib=rb-4.1.0&q=80&w=400', brand: 'Kores', rating: 4.4, reviews: 312, inStock: true, tag: null },
            { id: 'fb-mp', name: 'Mechanical Pencil (0.5mm, Pack of 3)', price: 149, originalPrice: 180, image: '/images/prod_mech_pencil.png', brand: 'Pentel', rating: 4.6, reviews: 134, inStock: true, tag: null },
            { id: 'fb-er', name: 'Eraser (White Vinyl, Pack of 5)', price: 39, originalPrice: 50, image: '/images/prod_eraser.png', brand: 'Natraj', rating: 4.3, reviews: 67, inStock: true, tag: null },
        ],
    },
    {
        id: 'kores-filing-center',
        name: 'Kores Filing & Storage Center',
        tagline: 'Organize Your Space, Organize Your Life',
        address: '67, FC Road, Shivaji Nagar, Pune – 411004',
        phone: '+91 20 2567 3344',
        hours: 'Mon–Fri: 9:30 AM – 6:30 PM',
        rating: 4.4, reviews: 89,
        image: '/images/shop_kores.png',
        items: [
            { id: 'file-folder', name: 'Letter File Folder (A4, Pack of 5)', price: 179, originalPrice: 220, image: 'https://plus.unsplash.com/premium_photo-1677402408071-232d1c3c3787?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8ZmlsZSUyMGZvbGRlciUyMGRvY3VtZW50JTIwb2ZmaWNlfGVufDB8fHx8MTc3MzQ4MTkxNXww&ixlib=rb-4.1.0&q=80&w=400', brand: 'Solo', rating: 4.5, reviews: 143, inStock: true, tag: 'Best Seller' },
            { id: 'ziplock', name: 'Zip-Lock Storage Bags (A4, Pack of 50)', price: 179, originalPrice: 210, image: 'https://plus.unsplash.com/premium_photo-1661944522798-0ec14d717135?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8emlwbG9jfGVufDB8fHx8MTc3MzQ4MTkxNnww&ixlib=rb-4.1.0&q=80&w=400', brand: 'Deli', rating: 4.4, reviews: 98, inStock: true, tag: null },
            { id: 'bclips-k', name: 'Jumbo Binder Clips (Pack of 12)', price: 79, originalPrice: 99, image: 'https://plus.unsplash.com/premium_photo-1658527142437-f68d188abc46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8YmluZGVyfGVufDB8fHx8MTc3MzQ4MTkxN3ww&ixlib=rb-4.1.0&q=80&w=400', brand: 'Kores', rating: 4.4, reviews: 134, inStock: true, tag: null },
            { id: 'pclips-k', name: 'Paper Clips (Silver, Box of 100)', price: 39, originalPrice: 50, image: 'https://plus.unsplash.com/premium_photo-1678007790650-e768e15d297a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8cGFwZXIlMjBjbGlwcyUyMG1ldGFsJTIwc2lsdmVyfGVufDB8fHx8MTc3MzQ4MTkxOHww&ixlib=rb-4.1.0&q=80&w=400', brand: 'Kores', rating: 4.4, reviews: 312, inStock: true, tag: 'Popular' },
        ],
    },
]

function StarRow({ rating }) {
    return (
        <span className="sd-stars">
            {[1, 2, 3, 4, 5].map(n => (
                <FiStar key={n} size={12}
                    fill={n <= Math.round(rating) ? '#F59E0B' : 'transparent'}
                    color={n <= Math.round(rating) ? '#F59E0B' : '#555'} />
            ))}
            <span className="sd-stars__num">{rating}</span>
        </span>
    )
}

export default function ShopDetail() {
    const { shopId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [search, setSearch] = useState('')
    const [cart, setCart] = useState({})
    const [toasted, setToasted] = useState(null)
    const [itemColors, setItemColors] = useState({})
    const [colorPreviewItem, setColorPreviewItem] = useState(null)
    const [loading, setLoading] = useState(false)
    const [shop, setShop] = useState(null)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        // 1. Try static list first (fast, no network)
        const staticShop = ALL_SHOPS.find(s => s.id === shopId)
        if (staticShop) {
            setShop(staticShop)
            return
        }
        // 2. Fall back to API (for vendor shops registered in DB)
        setLoading(true)
        api.get(`/shops/${shopId}`)
            .then(res => {
                const s = res.data.shop
                // Normalize vendor products to match the item shape ShopDetail expects
                const items = (s.products || []).map(p => ({
                    id: p._id,
                    name: p.name,
                    price: p.price,
                    originalPrice: Math.round(p.price * 1.15), // show a "was" price
                    image: p.imageUrl || `https://picsum.photos/seed/${p._id}/400/400`,
                    brand: s.name,
                    rating: 4.5,
                    reviews: 0,
                    inStock: p.quantity > 0,
                    tag: p.quantity < 5 ? '⚠️ Low Stock' : null,
                    category: p.category,
                }))
                setShop({
                    id: s._id,
                    name: s.name,
                    tagline: s.description || 'Merchant Shop on FancyBazaar',
                    address: s.location || 'Location not set',
                    phone: s.phone || 'Not provided',
                    hours: 'Open Daily',
                    rating: s.rating || 4.5,
                    reviews: s.reviews || 0,
                    image: s.image || `https://picsum.photos/seed/${s._id}/800/300`,
                    items,
                    isVendor: true,
                })
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [shopId])

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏪</div>
            <p>Loading shop…</p>
        </div>
    )

    if (notFound || (!loading && !shop)) return (
        <div className="sd-notfound">
            <h2>Shop not found</h2>
            <button onClick={() => navigate('/shops')}>← Back to Shops</button>
        </div>
    )

    if (!shop) return null

    const q = search.toLowerCase()
    const filtered = !q
        ? shop.items
        : shop.items.filter(item =>
            (item.name || '').toLowerCase().includes(q) ||
            (item.brand || '').toLowerCase().includes(q) ||
            (item.category || '').toLowerCase().includes(q)
        )

    function addToCart(item) {
        setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))
        setToasted(item.name)
        setTimeout(() => setToasted(null), 2200)
    }

    function selectItemColor(itemId, hex) {
        setItemColors(prev => ({ ...prev, [itemId]: hex }))
    }

    function toggleColorPreview(itemId) {
        setColorPreviewItem(prev => prev === itemId ? null : itemId)
    }

    const totalInCart = Object.values(cart).reduce((a, b) => a + b, 0)
    const discount = (item) => Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)

    return (
        <div className="sd-page">

            {/* ── Toast ── */}
            {toasted && (
                <div className="sd-toast">
                    <FiShoppingCart size={16} /> Added: <strong>{toasted}</strong>
                </div>
            )}

            {/* ── Shop Banner ── */}
            <section className="sd-banner">
                <img src={shop.image} alt={shop.name} className="sd-banner__img" />
                <div className="sd-banner__overlay" />
                <div className="container sd-banner__content">
                    <button className="sd-back-btn" onClick={() => navigate('/shops')}>
                        <FiArrowLeft size={16} /> All Shops
                    </button>
                    <h1 className="sd-banner__name">{shop.name}</h1>
                    <p className="sd-banner__tagline">{shop.tagline}</p>
                    <div className="sd-banner__meta">
                        <span><FiStar fill="#F59E0B" color="#F59E0B" size={15} /> {shop.rating} ({shop.reviews} reviews)</span>
                        <span><FiMapPin size={14} /> {shop.address}</span>
                        <span><FiPhone size={14} /> {shop.phone}</span>
                        <span><FiClock size={14} /> {shop.hours}</span>
                    </div>
                </div>
            </section>

            {/* ── Toolbar ── */}
            <div className="sd-toolbar container">
                <div className="sd-search-wrap">
                    <FiSearch className="sd-search-icon" />
                    <input
                        className="sd-search"
                        placeholder="Search items in this shop…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        id="shop-detail-search"
                    />
                </div>
                {totalInCart > 0 && (
                    <Link to="/cart" className="sd-cart-btn">
                        <FiShoppingCart size={17} /> {totalInCart} item{totalInCart > 1 ? 's' : ''} in cart
                    </Link>
                )}
            </div>

            {/* ── Items count ── */}
            <div className="container sd-count">
                <FiPackage size={14} /> Showing {filtered.length} of {shop.items.length} items
            </div>

            {/* ── Items Grid ── */}
            <div className="container sd-grid">
                {filtered.length === 0 ? (
                    <div className="sd-empty">
                        <span>🔍</span>
                        <p>No items found for "<strong>{search}</strong>"</p>
                    </div>
                ) : (
                    filtered.map(item => {
                        const selectedHex = itemColors[item.id] || null
                        const isPreviewOpen = colorPreviewItem === item.id
                        const imgFilter = selectedHex ? (() => {
                            const r = parseInt(selectedHex.slice(1, 3), 16) / 255, g = parseInt(selectedHex.slice(3, 5), 16) / 255, b = parseInt(selectedHex.slice(5, 7), 16) / 255
                            const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
                            if (max === min) return `brightness(${l > 0.7 ? 1.4 : 0.7}) saturate(0.2)`
                            let h = 0; const d = max - min
                            switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break }
                            return `hue-rotate(${Math.round(h * 360)}deg) saturate(1.5) brightness(${l > 0.7 ? 1.3 : l < 0.3 ? 0.7 : 1.0})`
                        })() : 'none'
                        return (
                            <article key={item.id} className={`sd-item-card${isPreviewOpen ? ' sd-item-card--open' : ''}`}>
                                {item.tag && <span className="sd-item-tag">{item.tag}</span>}
                                <div className="sd-item-img-wrap">
                                    <img src={item.image} alt={item.name} className="sd-item-img" loading="lazy"
                                        style={{ filter: imgFilter, transition: 'filter 0.35s ease' }} />
                                    <span className="sd-discount">-{discount(item)}%</span>
                                    {selectedHex && <span className="sd-color-dot-badge" style={{ background: selectedHex }} />}
                                </div>
                                <div className="sd-item-body">
                                    <p className="sd-item-brand">{item.brand}</p>
                                    <h3 className="sd-item-name">{item.name}</h3>
                                    <StarRow rating={item.rating} />
                                    <span className="sd-item-rev">({item.reviews} reviews)</span>
                                    <div className="sd-item-prices">
                                        <span className="sd-item-price">₹{item.price}</span>
                                        <span className="sd-item-orig">₹{item.originalPrice}</span>
                                    </div>
                                    {/* 🤖 AI Color toggle button */}
                                    <button className="sd-ai-toggle" onClick={() => toggleColorPreview(item.id)}>
                                        🤖 {isPreviewOpen ? 'Close Preview' : 'AI Color Preview'}
                                    </button>
                                    {/* Expanded AI color panel */}
                                    {isPreviewOpen && (
                                        <div className="sd-ai-panel">
                                            <AIColorPreview
                                                imageUrl={item.image}
                                                colors={['#FF6B6B', '#FFD700', '#10B981', '#3B82F6', '#8B5CF6', '#000000', '#F0F0F0', '#FF69B4', '#FFA500', '#C0C0C0']}
                                                selectedColor={selectedHex || '#FFD700'}
                                                onSelect={(hex) => selectItemColor(item.id, hex)}
                                                label="Color Preview"
                                            />
                                        </div>
                                    )}
                                    <div className="sd-item-actions">
                                        <Link to={`/product/${item.id}`} className="sd-btn-view">
                                            <FiEye size={15} /> View
                                        </Link>
                                        <button className="sd-btn-cart" onClick={() => addToCart(item)} disabled={!item.inStock}>
                                            <FiShoppingCart size={15} />
                                            {cart[item.id] ? `Add (${cart[item.id]})` : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        )
                    })

                )}
            </div>
        </div>
    )
}
