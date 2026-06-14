const COUNTRIES = [
  { code: 'BR', name: 'Brésil',    flag: '🇧🇷' },
  { code: 'EC', name: 'Équateur',  flag: '🇪🇨' },
  { code: 'CO', name: 'Colombie',  flag: '🇨🇴' },
]

interface Props {
  selected: string
  onChange: (code: string) => void
}

export default function CountrySelector({ selected, onChange }: Props) {
  return (
    <div className="flex gap-3">
      {COUNTRIES.map(c => (
        <button
          key={c.code}
          onClick={() => onChange(c.code)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium
                      text-sm transition-all ${
                        selected === c.code
                          ? 'bg-coffee-700 text-white border-coffee-700 shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-coffee-400'
                      }`}
        >
          <span className="text-lg">{c.flag}</span>
          {c.name}
        </button>
      ))}
    </div>
  )
}
