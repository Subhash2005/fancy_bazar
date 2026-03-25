import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        mobileMenuOpen: false,
        searchOpen: false,
        cartDrawerOpen: false,
    },
    reducers: {
        toggleMobileMenu(state) { state.mobileMenuOpen = !state.mobileMenuOpen },
        closeMobileMenu(state) { state.mobileMenuOpen = false },
        toggleSearch(state) { state.searchOpen = !state.searchOpen },
        closeSearch(state) { state.searchOpen = false },
        openCartDrawer(state) { state.cartDrawerOpen = true },
        closeCartDrawer(state) { state.cartDrawerOpen = false },
    },
})

export const { toggleMobileMenu, closeMobileMenu, toggleSearch, closeSearch, openCartDrawer, closeCartDrawer } = uiSlice.actions
export default uiSlice.reducer
