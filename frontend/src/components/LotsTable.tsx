import { PackageSearch } from 'lucide-react'
import type { Lot } from '../types'

interface LotsTableProps {
  lots: Lot[]
  countryCode: string
  onRowClick: (lot: Lot) => void
}

export default function LotsTable({ lots, onRowClick }: LotsTableProps) {
  if (!lots || lots.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-8 gap-2">
        <PackageSearch size={26} className="text-coffee-300" />
        <p className="text-sm text-coffee-700/50 dark:text-coffee-200/40">
          Aucun lot enregistré pour ce pays
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-coffee-900/8 dark:divide-white/8">
      {lots.map(lot => (
        <li key={lot.id}>
          <button
            onClick={() => onRowClick(lot)}
            className="w-full flex items-center justify-between gap-3 py-2.5 text-left hover:bg-coffee-50 dark:hover:bg-coffee-800/50 rounded-lg px-1.5 -mx-1.5 transition-colors"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium text-coffee-900 dark:text-coffee-50 truncate">
                Lot #{(lot as any).reference ?? lot.id}
              </div>
              <div className="text-xs text-coffee-700/50 dark:text-coffee-200/40">
                Entrepôt {lot.warehouse_id}
              </div>
            </div>
            <span className="text-xs font-medium text-coffee-700/60 dark:text-coffee-200/45 shrink-0">
              {(lot as any).quantity ? `${(lot as any).quantity} kg` : ''}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
