import React from 'react'

/**
 * StarRating
 * - readOnly: if true, renders static stars (no click)
 * - value: number 0..5 (can be float for display)
 * - onChange: (n) => void (for interactive mode)
 * - size: 'sm' | 'md' | 'lg'
 */
export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
    const steps = [1, 2, 3, 4, 5]
    const cls = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-2xl'

    function handleSelect(n) {
        if (readOnly || !onChange) return
        onChange(n)
    }

    return (
        <div className="inline-flex items-center gap-1" aria-label={`Rating: ${value} out of 5`}>
            {steps.map(n => {
                const filled = value >= n - 0.5
                return (
                    <button
                        key={n}
                        type="button"
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                        onClick={() => handleSelect(n)}
                        className={`leading-none ${cls} ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                        title={readOnly ? '' : `Set to ${n}`}
                    >
                        <span className={filled ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                    </button>
                )
            })}
        </div>
    )
}
