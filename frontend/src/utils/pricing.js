// Charge calculation utilities (mirrors backend logic)

export const COMMISSION_PCT = 0.08  // 8%
export const GST_PCT = 0.18         // 18%
export const DONATION_OPTIONS = [1, 5, 10]

/**
 * Calculate delivery charge based on subtotal
 */
export function calcDeliveryCharge(subtotal) {
    if (subtotal >= 999) return 0
    if (subtotal >= 500) return 49
    return 99
}

/**
 * Get wholesale tier discount
 */
export function getWholesaleTier(qty) {
    if (qty >= 50) return { tier: 'high', discount: 0.30, label: 'High Volume (50+)' }
    if (qty >= 10) return { tier: 'mid', discount: 0.15, label: 'Mid Volume (10-49)' }
    return { tier: 'low', discount: 0, label: 'Retail (<10)' }
}

/**
 * Get price for item based on buyer type and qty
 */
export function getEffectivePrice(variant, qty, buyerType) {
    if (buyerType === 'wholesale') {
        const { tier } = getWholesaleTier(qty)
        return variant.wholesalePrices?.[tier] ?? variant.retailPrice
    }
    return variant.retailPrice
}

/**
 * Full order cost breakdown
 */
export function calcOrderBreakdown(items, donation = { enabled: false, amount: 0 }) {
    const subtotal = items.reduce((sum, item) => {
        const price = getEffectivePrice(item.variant, item.qty, item.buyerType)
        return sum + price * item.qty
    }, 0)

    const commission = subtotal * COMMISSION_PCT
    const deliveryCharge = calcDeliveryCharge(subtotal)
    const taxableAmount = subtotal + commission + deliveryCharge
    const gst = taxableAmount * GST_PCT
    const donationAmt = donation.enabled ? donation.amount : 0
    const total = taxableAmount + gst + donationAmt

    return {
        subtotal: round(subtotal),
        commission: round(commission),
        deliveryCharge: round(deliveryCharge),
        gst: round(gst),
        donation: donationAmt,
        total: round(total),
    }
}

export function round(val) {
    return Math.round(val * 100) / 100
}

export function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    })
}

export function debounce(fn, delay) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}
