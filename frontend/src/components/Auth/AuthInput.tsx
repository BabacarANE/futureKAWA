import { type InputHTMLAttributes, forwardRef, useState } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  leftIcon?: string
  id: string
}

export const AuthInput = forwardRef<HTMLInputElement, Props>(
  ({ label, error, leftIcon, id, type, className = '', ...rest }, ref) => {
    const [showPwd, setShowPwd] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPwd ? 'text' : 'password') : type

    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          {label}
        </label>

        <div className="relative group">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 text-sm pointer-events-none select-none transition-colors group-focus-within:text-stone-600 dark:group-focus-within:text-stone-300">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={inputType}
            className={`
              w-full px-4 py-3 text-sm rounded-xl border bg-white dark:bg-stone-900
              text-stone-900 dark:text-stone-100
              placeholder:text-stone-400 dark:placeholder:text-stone-600
              transition-all duration-200 outline-none
              ${leftIcon ? 'pl-10' : ''}
              ${isPassword ? 'pr-11' : ''}
              ${error
                ? 'border-rose-300 dark:border-rose-700 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900'
                : 'border-stone-200 dark:border-stone-700 focus:border-stone-400 dark:focus:border-stone-500 focus:ring-2 focus:ring-stone-100 dark:focus:ring-stone-800'
              }
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPwd(s => !s)}
              aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors text-sm p-0.5 rounded"
            >
              {showPwd ? '○' : '●'}
            </button>
          )}
        </div>

        {error && (
          <p id={`${id}-error`} role="alert" className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    )
  }
)
AuthInput.displayName = 'AuthInput'