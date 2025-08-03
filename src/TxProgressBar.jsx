import React from 'react'

function getColor(status) {
  if (!status) return 'bg-gray-500'
  if (status.startsWith('⏳')) return 'bg-yellow-500'
  if (status.startsWith('🟡')) return 'bg-orange-500'
  if (status.startsWith('🟢')) return 'bg-green-500'
  if (status.startsWith('❌')) return 'bg-red-500'
  return 'bg-gray-500'
}

export function TxProgressBar({ status, elapsed }) {
  const progress = Math.min(status?.startsWith('🟢 Included') ? 100 : elapsed * 10, 100)
  const barColor = getColor(status)

  return (
    <div className="w-full mt-4">
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-400 mt-1 text-right">
        {elapsed}s
      </div>
    </div>
  )
}