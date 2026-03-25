import { createSlice } from '@reduxjs/toolkit'

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: JSON.parse(localStorage.getItem('fb_wishlist') || '[]'),
    },
    reducers: {
        toggleWishlist(state, action) {
            const id = action.payload
            const idx = state.items.indexOf(id)
            if (idx === -1) state.items.push(id)
            else state.items.splice(idx, 1)
            localStorage.setItem('fb_wishlist', JSON.stringify(state.items))
        },
    },
})

export const { toggleWishlist } = wishlistSlice.actions
export const selectIsWishlisted = (id) => (state) => state.wishlist.items.includes(id)
export default wishlistSlice.reducer
