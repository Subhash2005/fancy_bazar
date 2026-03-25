import { createSlice } from '@reduxjs/toolkit'

const loadCartFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem('fb_cart') || '[]')
    } catch { return [] }
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: loadCartFromStorage(),
        donation: { enabled: false, amount: 5 },
        loading: false,
    },
    reducers: {
        addToCart(state, action) {
            const { product, variant, qty, buyerType } = action.payload
            
            // Robust key generation
            const variantId = variant?.sku || variant?._id || 'default'
            const key = `${product._id}_${variantId}`
            
            const existing = state.items.find(i => i.key === key)
            const numQty = Number(qty) || 1

            if (existing) {
                existing.qty = (existing.qty || 0) + numQty
            } else {
                state.items.push({ key, product, variant, qty: numQty, buyerType })
            }
            localStorage.setItem('fb_cart', JSON.stringify(state.items))
        },
        updateQty(state, action) {
            const { key, qty } = action.payload
            const item = state.items.find(i => i.key === key)
            if (item) item.qty = qty
            localStorage.setItem('fb_cart', JSON.stringify(state.items))
        },
        removeFromCart(state, action) {
            state.items = state.items.filter(i => i.key !== action.payload)
            localStorage.setItem('fb_cart', JSON.stringify(state.items))
        },
        clearCart(state) {
            state.items = []
            localStorage.removeItem('fb_cart')
        },
        setDonation(state, action) {
            state.donation = action.payload
        },
    },
})

export const { addToCart, updateQty, removeFromCart, clearCart, setDonation } = cartSlice.actions

// Selectors
export const selectCartTotal = (state) =>
    state.cart.items.reduce((sum, item) => {
        const price = getItemPrice(item)
        return sum + price * item.qty
    }, 0)

export const selectCartCount = (state) =>
    state.cart.items.reduce((sum, item) => sum + item.qty, 0)

function getItemPrice(item) {
    const { variant, qty, buyerType } = item
    if (buyerType === 'wholesale') {
        if (qty >= 50) return variant.wholesalePrices?.high ?? variant.retailPrice
        if (qty >= 10) return variant.wholesalePrices?.mid ?? variant.retailPrice
    }
    return variant.retailPrice
}

export { getItemPrice }

export default cartSlice.reducer
