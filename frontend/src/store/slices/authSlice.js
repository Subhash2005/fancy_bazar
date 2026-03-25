import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const { data } = await api.post('/auth/login', credentials)
        localStorage.setItem('fb_token', data.token)
        return data.user
    } catch (err) {
        const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || err.message || 'Login failed'
        return rejectWithValue(msg)
    }
})

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
    try {
        const endpoint = payload.gstNumber ? '/auth/register-wholesale' : '/auth/register'
        const { data } = await api.post(endpoint, payload)
        localStorage.setItem('fb_token', data.token)
        return data.user
    } catch (err) {
        const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || err.message || 'Registration failed'
        return rejectWithValue(msg)
    }
})

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get('/auth/me')
        return data.user
    } catch (err) {
        return rejectWithValue(err.response?.data?.message)
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: false,
        error: null,
        initialized: false,
    },
    reducers: {
        logout(state) {
            state.user = null
            localStorage.removeItem('fb_token')
        },
        clearError(state) {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
            .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
            .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
            .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
            .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload })
            .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => { state.user = action.payload; state.initialized = true })
            .addCase(fetchCurrentUser.rejected, (state) => { state.initialized = true })
    },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
