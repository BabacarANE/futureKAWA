import { useEffect, type JSX } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

interface AuthToastProps {
  message: string
  type: 'error' | 'success' | 'info' | 'warning'
  onClose: () => void
}

const STYLES: Record<AuthToastProps['type'], { bg: string; border: string; icon: JSX.Element }> = {
  success: { bg: 'bg-green-500/15', border: 'border-green-500/30', icon: <CheckCircle2 size={16} className="text-green-400" /> },
  error:   { bg: 'bg-red-500/15',   border: 'border-red-500/30',   icon: <XCircle size={16} className="text-red-400" /> },
  info:    { bg: 'bg-blue-500/15',  border: 'border-blue-500/30',  icon: <Info size={16} className="text-blue-400" /> },
  warning: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', icon: <AlertTriangle size={16} className="text-amber-400" /> },
}

export default function AuthToast({ message, type, onClose }: AuthToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const s = STYLES[type]

  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border ${s.bg} ${s.border} backdrop-blur-sm`}>
      {s.icon}
      <span className="text-sm text-white flex-1">{message}</span>
      <button onClick={onClose} className="text-white/50 hover:text-white/80 transition-colors">
        <X size={14} />
      </button>
    </div>
  )
}
