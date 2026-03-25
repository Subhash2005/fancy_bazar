import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
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
const NotFound = lazy(() => import('./pages/NotFound'))

// Protected route wrapper
function ProtectedRoute({ children, role }) {
  const { user } = useSelector(state => state.auth)
  if (!user) return <Navigate to="/auth/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content" id="main-content" role="main">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/shops/:shopId" element={<ShopDetail />} />
            <Route path="/categories/:slug" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={
              <ProtectedRoute><Checkout /></ProtectedRoute>
            } />
            <Route path="/order-success/:id" element={
              <ProtectedRoute><OrderSuccess /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><Orders /></ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute><Wishlist /></ProtectedRoute>
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
              <ProtectedRoute role="vendor"><VendorDashboard /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
