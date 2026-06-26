import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const COUNTRIES = [
  { code: 'BR', label: 'Brésil', flag: '🇧🇷' },
  { code: 'CO', label: 'Colombie', flag: '🇨🇴' },
  { code: 'EC', label: 'Équateur', flag: '🇪🇨' },
]

interface CountrySelectorProps {
  selected: string
  onChange: (code: string) => void
}

export default function CountrySelector({ selected, onChange }: CountrySelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = COUNTRIES.find(c => c.code === selected) ?? COUNTRIES[0]

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-coffee-900/10 dark:border-white/10
                   bg-white dark:bg-coffee-900/40 hover:bg-coffee-50 dark:hover:bg-coffee-900/70
                   text-sm font-medium text-coffee-900 dark:text-coffee-50 transition-colors"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown size={14} className={`text-coffee-700/50 dark:text-coffee-200/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 mt-2 w-48 rounded-xl border border-coffee-900/10 dark:border-white/10
                     bg-white dark:bg-coffee-900 shadow-card dark:shadow-card-dark z-50 py-1.5"
        >
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              onClick={() => { onChange(c.code); setOpen(false) }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-coffee-900 dark:text-coffee-50
                         hover:bg-coffee-50 dark:hover:bg-coffee-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span>{c.label}</span>
              </span>
              {c.code === selected && <Check size={14} className="text-coffee-700 dark:text-coffee-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
