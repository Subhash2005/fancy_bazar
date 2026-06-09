require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const mongoose = require('mongoose')

const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const categoryRoutes = require('./routes/categories')
const cartRoutes = require('./routes/cart')
const orderRoutes = require('./routes/orders')
const paymentRoutes = require('./routes/payments')
const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shops')

const app = express()

// Trust proxy for Render/Vercel (required for rate limiting behind reverse proxies)
app.set('trust proxy', 1)

// ——— Security ———
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https://images.unsplash.com", "https://picsum.photos"],
        },
    },
}))
app.use(cors({
    origin: function (origin, callback) {
        // Allow local development and Vercel production domains
        const allowedOrigins = [
            process.env.CLIENT_URL,
            'http://localhost:5173',
            'http://localhost:3000',
            'https://fancybazaar.vercel.app' // Expected Vercel URL
        ];
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
}))

// ——— Rate limiting ———
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false })
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 50, message: { success: false, message: 'Too many attempts. Try again in 1 minute.' } })
app.use(globalLimiter)

// ——— Body parsing ———
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

// ——— Logging (dev only) ———
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))

// ——— Database ———
async function connectDB() {
    try {
        let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fancybazaar';
        if (process.env.USE_LOCAL_DB === 'true') {
            console.log('⏳ Starting Local In-Memory Database (Bypassing ISP Block)...');
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
        }

        await mongoose.connect(uri);
        console.log('✅ MongoDB connected');

        // Auto-seed local in-memory DB if empty
        if (process.env.USE_LOCAL_DB === 'true') {
            const Product = require('./models/Product');
            if (await Product.countDocuments() === 0) {
                console.log('🌱 Seeding local database...');
                const { execSync } = require('child_process');
                execSync('node seed.js', { stdio: 'inherit', env: { ...process.env, MONGODB_URI: uri } });
            }
        }
    } catch (err) {
        console.error('❌ MongoDB error:', err.message);
    }
}
connectDB();

// ——— Routes ———
app.use('/api/v1/auth', authLimiter, authRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/cart', cartRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/shops', shopRoutes)

// ——— Root route ———
app.get('/', (req, res) => res.json({
    success: true,
    message: '🛍️ Welcome to FancyBazaar API',
    version: '1.0.0',
    docs: '/health',
}))

// ——— Health check ———
app.get('/health', (req, res) => res.json({
    status: 'OK',
    version: '1.0.0',
    service: 'FancyBazaar API',
    time: new Date().toISOString(),
}))

// ——— 404 handler ———
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` })
})

// ——— Global error handler ———
app.use((err, req, res, next) => {
    console.error(err.stack)
    const status = err.statusCode || err.status || 500
    res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 FancyBazaar API running on port ${PORT}`))
module.exports = app
