import React from 'react'

export default function ProgressBar({ value = 0 }) {
    const v = Math.max(0, Math.min(100, Number(value) || 0))
    return (
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
                className="h-3 bg-blue-600 transition-all"
                style={{ width: `${v}%` }}
                aria-label={`Progress: ${v}%`}
            />
        </div>
    )
}
