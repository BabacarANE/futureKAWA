import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe2, Save } from 'lucide-react'
import { createCountryConfig } from '../services/api'

const inputCls = `w-full px-3 py-2.5 rounded-lg border border-stone-200 dark:border-white/10
  bg-white dark:bg-white/5 text-sm text-stone-800 dark:text-stone-100
  placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7a4528]/40
  focus:border-[#7a4528] transition-colors`

const labelCls = 'block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5'

export default function CountryCreatePage() {
  const navigate = useNavigate()

  const [code,       setCode]       = useState('')
  const [name,       setName]       = useState('')
  const [idealTemp,  setIdealTemp]  = useState('25')
  const [idealHum,   setIdealHum]   = useState('60')
  const [tolTemp,    setTolTemp]    = useState('3')
  const [tolHum,     setTolHum]     = useState('5')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!code.trim() || !name.trim()) {
      setError('Le code et le nom sont requis')
      return
    }
    if (code.length < 2 || code.length > 4) {
      setError('Le code doit faire 2 à 4 caractères (ex : BR, PE, CO)')
      return
    }
    setLoading(true)
    try {
      await createCountryConfig({
        code:              code.trim().toUpperCase(),
        name:              name.trim(),
        ideal_temp:        parseFloat(idealTemp),
        ideal_humidity:    parseFloat(idealHum),
        tolerance_temp:    parseFloat(tolTemp),
        tolerance_humidity: parseFloat(tolHum),
      })
      navigate('/countries')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const minMax = (val: string) => {
    const t = parseFloat(idealTemp), h = parseFloat(idealHum)
    const tt = parseFloat(tolTemp), th = parseFloat(tolHum)
    if (val === 'temp')
      return `Alerte si temp. hors [${(t - tt).toFixed(1)} – ${(t + tt).toFixed(1)} °C]`
    return `Alerte si humidité hors [${(h - th).toFixed(1)} – ${(h + th).toFixed(1)} %]`
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-stone-200
                     dark:border-white/10 text-stone-500 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Nouveau pays</h1>
          <p className="text-xs text-stone-400 mt-0.5">Ajouter un nouveau pays et ses seuils IoT</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}
        className="bg-white dark:bg-[#1c1a17] rounded-2xl border border-stone-100 dark:border-white/8 p-6 space-y-5">

        {/* Identité */}
        <div className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300 border-b border-stone-100 dark:border-white/8 pb-2">
          <Globe2 size={14} /> Identité
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Code pays <span className="text-red-500">*</span></label>
            <input className={inputCls} placeholder="BR" maxLength={4}
              value={code} onChange={e => setCode(e.target.value.toUpperCase())} required />
            <p className="text-[11px] text-stone-400 mt-1">2–4 lettres (ex : BR, PE, CO)</p>
          </div>
          <div>
            <label className={labelCls}>Nom complet <span className="text-red-500">*</span></label>
            <input className={inputCls} placeholder="Brésil"
              value={name} onChange={e => setName(e.target.value)} required />
          </div>
        </div>

        {/* Seuils IoT */}
        <div className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300 border-b border-stone-100 dark:border-white/8 pb-2 pt-1">
          🌡 Seuils IoT
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Température idéale (°C)</label>
            <input className={inputCls} type="number" step="0.1" placeholder="25"
              value={idealTemp} onChange={e => setIdealTemp(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Humidité idéale (%)</label>
            <input className={inputCls} type="number" step="0.1" placeholder="60"
              value={idealHum} onChange={e => setIdealHum(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Tolérance température (±°C)</label>
            <input className={inputCls} type="number" step="0.1" min="0" placeholder="3"
              value={tolTemp} onChange={e => setTolTemp(e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Tolérance humidité (±%)</label>
            <input className={inputCls} type="number" step="0.1" min="0" placeholder="5"
              value={tolHum} onChange={e => setTolHum(e.target.value)} required />
          </div>
        </div>

        {/* Aperçu plage d'alerte */}
        <div className="rounded-lg bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/8 p-3 space-y-1">
          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Plage acceptable</p>
          <p className="text-xs text-stone-700 dark:text-stone-300">{minMax('temp')}</p>
          <p className="text-xs text-stone-700 dark:text-stone-300">{minMax('hum')}</p>
        </div>

        {error && (
          <div className="px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30
                          text-xs text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => navigate(-1)}
            className="flex-1 py-2.5 rounded-lg border border-stone-300 dark:border-white/15
                       text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-[#7a4528] hover:bg-[#6a3a20]
                       text-white text-sm font-medium disabled:opacity-60 transition-colors
                       flex items-center justify-center gap-1.5">
            {loading ? 'Création…' : <><Save size={13} /> Créer le pays</>}
          </button>
        </div>
      </form>
    </div>
  )
}
