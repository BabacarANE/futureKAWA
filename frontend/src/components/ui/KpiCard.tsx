import React from 'react'

export default function KpiCard({ title, value, delta, icon, className = '' }: { title: string; value: React.ReactNode; delta?: string; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-4 transform transition-transform hover:-translate-y-1 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        {icon && <div className="text-coffee-700">{icon}</div>}
      </div>
      {delta && <div className="mt-3 text-sm text-green-600">{delta}</div>}
    </div>
  )
}
