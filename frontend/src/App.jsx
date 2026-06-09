import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCurrentUser } from './store/slices/authSlice'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingScreen from './components/ui/LoadingScreen'

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const Orders = lazy(() => import('./pages/Orders'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Profile = lazy(() => import('./pages/Profile'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const RegisterWholesale = lazy(() => import('./pages/auth/RegisterWholesale'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'))
const Shops = lazy(() => import('./pages/Shops'))
const ShopDetail = lazy(() => import('./pages/ShopDetail'))
const StaticPage = lazy(() => import('./pages/StaticPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Protected route wrapper
function ProtectedRoute({ children, role }) {
  const { user, initialized } = useSelector(state => state.auth)
  if (!initialized) return <LoadingScreen />
  if (!user) return <Navigate to="/auth/login" replace />
  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(user.role)) return <Navigate to="/" replace />
    } else {
      if (user.role !== role) return <Navigate to="/" replace />
    }
  }
  return children
}

// Consumer route wrapper (blocks Traders from viewing normal pages)
function ConsumerRoute({ children }) {
  const { user, initialized } = useSelector(state => state.auth)
  if (!initialized) return <LoadingScreen />
  // If user is logged in and is a trader type, block them from consumer pages
  if (user && ['vendor', 'trader_low', 'trader_bulk'].includes(user.role)) {
    return <Navigate to="/vendor" replace />
  }
  return children
}

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    if (localStorage.getItem('fb_token')) {
      dispatch(fetchCurrentUser())
    } else {
      dispatch({ type: 'auth/me/rejected' })
    }
  }, [dispatch])

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content" id="main-content" role="main">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<ConsumerRoute><Home /></ConsumerRoute>} />
            <Route path="/shops" element={<ConsumerRoute><Shops /></ConsumerRoute>} />
            <Route path="/shops/:shopId" element={<ConsumerRoute><ShopDetail /></ConsumerRoute>} />
            <Route path="/categories/:slug" element={<ConsumerRoute><CategoryPage /></ConsumerRoute>} />
            <Route path="/product/:id" element={<ConsumerRoute><ProductDetail /></ConsumerRoute>} />
            <Route path="/cart" element={<ConsumerRoute><Cart /></ConsumerRoute>} />
            <Route path="/checkout" element={
              <ProtectedRoute><ConsumerRoute><Checkout /></ConsumerRoute></ProtectedRoute>
            } />
            <Route path="/order-success/:id" element={
              <ProtectedRoute><ConsumerRoute><OrderSuccess /></ConsumerRoute></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><ConsumerRoute><Orders /></ConsumerRoute></ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute><ConsumerRoute><Wishlist /></ConsumerRoute></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/register-wholesale" element={<RegisterWholesale />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin" element={
              <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute role="admin"><AdminProducts /></ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>
            } />
            <Route path="/vendor" element={
              <ProtectedRoute role={['vendor', 'trader_low', 'trader_bulk']}><VendorDashboard /></ProtectedRoute>
            } />
            <Route path="/help" element={<StaticPage title="Help Center">
              <p>Welcome to the FancyBazaar Help Center! We are dedicated to ensuring you have a seamless shopping experience.</p>
              <p>If you face any issues with your orders, payments, or account, our support team is available around the clock to assist you.</p>
              <p>For immediate assistance regarding urgent orders or cancellations, please reach out to us via phone.</p>
              <p>You can contact our support team directly at: <strong>+91 7695903778</strong>.</p>
              <p>Alternatively, you can email us your queries, and we will get back to you within 24 hours.</p>
              <p>Your satisfaction is our priority, and we're always here to help!</p>
            </StaticPage>} />
            <Route path="/shipping" element={<StaticPage title="Shipping Policy">
              <p>At FancyBazaar, we ensure that your items reach you safely and quickly.</p>
              <p>We offer <strong>Free Shipping</strong> on all orders above ₹999 across India.</p>
              <p>For orders below ₹999, a nominal delivery fee applies depending on your exact location.</p>
              <p>Standard delivery typically takes 3-5 business days for metropolitan areas, and 5-7 days for rural regions.</p>
              <p>Once your order is dispatched, you will receive a tracking link via SMS and Email to monitor its progress.</p>
              <p>In case of unexpected delays due to weather or logistics, we will proactively keep you updated.</p>
            </StaticPage>} />
            <Route path="/returns" element={<StaticPage title="Return & Refund Policy">
              <p>We want you to love what you order. If something isn't right, let us know.</p>
              <p>FancyBazaar offers a comprehensive 7-day hassle-free return policy on most retail items.</p>
              <p>To be eligible for a return, your item must be unused, in its original condition, and in its original packaging.</p>
              <p>Once we receive and inspect your returned item, your refund will be processed automatically within 48 hours.</p>
              <p>Refunds will be credited directly to your original payment method (UPI, Card, or Wallet).</p>
              <p>Please note that personalized or bulk wholesale orders might not be eligible for standard returns unless defective.</p>
            </StaticPage>} />
            <Route path="/privacy" element={<StaticPage title="Privacy Policy">
              <p>Your privacy is of paramount importance to us at FancyBazaar.</p>
              <p>We collect essential information strictly to process your orders and improve your shopping experience.</p>
              <p>All personal data, including your delivery address and contact details, is stored securely on encrypted servers.</p>
              <p>Your payment information is never stored by us; it is processed through secure, RBI-compliant payment gateways.</p>
              <p>We will never sell or rent your personal information to third-party marketing companies.</p>
              <p>By using our website, you consent to our secure data collection practices as outlined in this policy.</p>
            </StaticPage>} />
            <Route path="/terms" element={<StaticPage title="Terms of Service">
              <p>Welcome to FancyBazaar. By accessing our platform, you agree to comply with the following terms.</p>
              <p>All content, including images and product descriptions, is the intellectual property of FancyBazaar and its vendors.</p>
              <p>We reserve the right to modify prices, discontinue products, or cancel orders in case of unexpected pricing errors.</p>
              <p>Users must provide accurate information during registration and checkout to prevent delivery failures.</p>
              <p>Wholesale buyers must possess valid GST documentation to avail of business discounts and tax benefits.</p>
              <p>Any disputes arising from the use of this website shall be subject to the jurisdiction of the courts in Chennai.</p>
            </StaticPage>} />
            <Route path="/contact" element={<StaticPage title="Contact Us">
              <p>We'd love to hear from you! Whether you have a question about products, wholesale orders, or anything else, our team is ready to answer all your questions.</p>
              <p>Customer satisfaction is our top priority, and we're committed to providing the best support possible for all your stationery needs.</p>
              <p><strong>Email:</strong> subhash1422005s@gmail.com</p>
              <p><strong>Phone:</strong> +91 7695903778</p>
              <p><strong>Location:</strong> Vyasarpadi, Chennai</p>
              <p>Our business hours are Monday through Saturday, 9:00 AM to 8:00 PM IST. We strive to respond to all emails within 24 hours.</p>
            </StaticPage>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
