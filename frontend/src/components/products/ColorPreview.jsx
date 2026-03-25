import { useState, useEffect, useRef } from 'react'
import './ColorPreview.css'

// ─── Hex → HSL conversion ────────────────────────────────────────
function hexToHsl(hex) {
    if (!hex || !hex.startsWith('#')) return { h: 0, s: 70, l: 50 }
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2
    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
            case g: h = ((b - r) / d + 2) / 6; break
            case b: h = ((r - g) / d + 4) / 6; break
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

// Given a target hex color, compute CSS filter to recolor an image
function colorToFilter(hex) {
    if (!hex || !hex.startsWith('#')) return ''
    const { h, s, l } = hexToHsl(hex)
    // hue-rotate shifts hue; saturate boosts color; brightness adjusts lightness
    const brightness = l > 70 ? 1.3 : l < 30 ? 0.7 : 1.0
    const saturation = s < 20 ? 0.3 : s > 80 ? 1.8 : 1.2
    return `hue-rotate(${h}deg) saturate(${saturation}) brightness(${brightness})`
}

// Friendly color name lookup
const COLOR_NAMES = {
    '#FFD700': 'Golden Yellow', '#C0C0C0': 'Silver', '#B76E79': 'Rose Gold',
    '#F0F0F0': 'Pearl White', '#FF0000': 'Red', '#00FF00': 'Green',
    '#0000FF': 'Blue', '#FF69B4': 'Hot Pink', '#800080': 'Purple',
    '#FFA500': 'Orange', '#000000': 'Black', '#FFFFFF': 'White',
    '#8B4513': 'Brown', '#008080': 'Teal', '#FF6B6B': 'Coral Red',
    '#6A0572': 'Deep Violet', '#00BCD4': 'Cyan Blue', '#E91E63': 'Deep Pink',
    '#9D3FE5': 'Violet',
}
function getColorName(hex) {
    return COLOR_NAMES[hex?.toUpperCase()] || COLOR_NAMES[hex] || hex
}

/**
 * AIColorPreview
 * Props:
 *   imageUrl      — current product image URL
 *   colors        — array of hex strings OR variant objects { color, label? }
 *   selectedColor — currently selected hex
 *   onSelect      — callback(hex)
 *   label         — section header label (default "AI Color Preview")
 */
export default function AIColorPreview({ imageUrl, colors = [], selectedColor, onSelect, label = 'AI Color Preview' }) {
    const [transitioning, setTransitioning] = useState(false)
    // null = no filter applied (show original image)
    const [displayColor, setDisplayColor] = useState(selectedColor || null)
    const prevColor = useRef(selectedColor || null)
    const prevImageUrl = useRef(imageUrl)

    // Reset filter when the item (imageUrl) changes
    useEffect(() => {
        if (imageUrl !== prevImageUrl.current) {
            setDisplayColor(null)
            prevColor.current = null
            prevImageUrl.current = imageUrl
        }
    }, [imageUrl])

    // Animate on color change
    useEffect(() => {
        if (selectedColor === prevColor.current) return
        setTransitioning(true)
        const t = setTimeout(() => {
            setDisplayColor(selectedColor || null)
            setTransitioning(false)
            prevColor.current = selectedColor || null
        }, 180)
        return () => clearTimeout(t)
    }, [selectedColor])

    if (!colors.length) return null

    // Only apply filter when a color is actually selected
    const filter = displayColor ? colorToFilter(displayColor) : 'none'
    const colorName = displayColor ? getColorName(displayColor) : 'Original'

    return (
        <div className="acp-wrap" aria-label="AI Color Preview">
            {/* Header */}
            <div className="acp-header">
                <span className="acp-badge">🤖 AI</span>
                <span className="acp-label">{label}</span>
                <span className="acp-tagline">Tap a color to preview instantly</span>
            </div>

            {/* Preview image with live color filter */}
            <div className="acp-preview-wrap" style={{ position: 'relative' }}>
                <img
                    src={imageUrl}
                    alt={`Preview in ${colorName}`}
                    className={`acp-preview-img${transitioning ? ' acp-preview-img--fade' : ''}`}
                    style={{ filter }} // Application of the computed CSS filter
                />
                
                {/* Simplified Overlay for light colors (like white paper) */}
                {displayColor && (displayColor === '#FFFFFF' || displayColor === '#F0F0F0') && (
                    <div 
                        style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'white',
                            opacity: 0.1,
                            pointerEvents: 'none',
                        }}
                    />
                )}

                {/* Color overlay badge */}
                {displayColor ? (
                    <div className="acp-color-label" style={{ background: displayColor, zIndex: 10 }}>
                        <span className="acp-color-dot" />
                        <span>{colorName}</span>
                    </div>
                ) : (
                    <div className="acp-color-label" style={{ background: 'rgba(0,0,0,0.55)', zIndex: 10 }}>
                        <span>👆 Pick a color below</span>
                    </div>
                )}
                {transitioning && <div className="acp-shimmer" style={{ zIndex: 11 }} />}
            </div>

            {/* Color swatches */}
            <div className="acp-swatches" role="radiogroup" aria-label="Select color">
                {colors.map((c) => {
                    const hex = typeof c === 'string' ? c : c.color
                    const name = (typeof c === 'object' && c.label) ? c.label : getColorName(hex)
                    const isSelected = selectedColor === hex
                    return (
                        <button
                            key={hex}
                            className={`acp-swatch${isSelected ? ' acp-swatch--selected' : ''}`}
                            style={{ background: hex, boxShadow: isSelected ? `0 0 0 3px #fff, 0 0 0 5px ${hex}` : 'none' }}
                            onClick={() => onSelect(hex)}
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={`Color: ${name}`}
                            title={name}
                        >
                            {isSelected && <span className="acp-swatch__check">✓</span>}
                        </button>
                    )
                })}
            </div>

            {/* Selected color info */}
            <div className="acp-info">
                <span className="acp-info__dot" style={{ background: displayColor }} />
                <span className="acp-info__name">{colorName}</span>
                <span className="acp-info__code">{displayColor}</span>
            </div>
        </div>
    )
}
