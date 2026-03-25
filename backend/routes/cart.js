const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth')

// Cart is client-side managed (localStorage) for now.
// This stub exists to scaffold server-side cart sync for future use.
router.get('/', auth, (req, res) => {
    res.json({ success: true, items: [], message: 'Cart managed client-side' })
})

module.exports = router
