 

type IconProps = { size?: number; className?: string }

export const LayoutDashboard = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="8" height="8" fill="currentColor" />
    <rect x="13" y="3" width="8" height="5" fill="currentColor" />
    <rect x="13" y="10" width="8" height="11" fill="currentColor" />
  </svg>
)

export const Globe2 = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M2 12h20M12 2c2 4 2 8 0 16" stroke="currentColor" strokeWidth="1" fill="none" />
  </svg>
)

export const Warehouse = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9l9-5 9 5v8a1 1 0 0 1-1 1h-16a1 1 0 0 1-1-1z" fill="currentColor" />
    <rect x="9" y="12" width="6" height="5" fill="#fff" opacity="0.2" />
  </svg>
)

export const Package = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V8l-9-5-9 5v8l9 5 9-5z" fill="currentColor" />
  </svg>
)

export const Activity = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12h4l2-6 4 12 2-6h4" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
)

export const Bell = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2z" fill="currentColor" />
    <path d="M18 8a6 6 0 1 0-12 0v4l-2 2v1h16v-1l-2-2V8z" stroke="currentColor" strokeWidth="1" fill="none" />
  </svg>
)

export const BarChart3 = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="13" width="4" height="8" fill="currentColor" />
    <rect x="10" y="7" width="4" height="14" fill="currentColor" />
    <rect x="17" y="3" width="4" height="18" fill="currentColor" />
  </svg>
)

export const Mail = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1" fill="none" />
  </svg>
)

export const ShieldCheck = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3l7 3v5c0 5-3.5 9.8-7 11-3.5-1.2-7-6-7-11V6l7-3z" stroke="currentColor" strokeWidth="1" fill="none" />
    <path d="M9.5 12.5l1.8 1.8L15 11" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
)

export const Settings = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1" fill="none" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 2.3 16.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.7 0 1.27-.42 1.51-1a1.65 1.65 0 0 0-.33-1.82L4.31 3.7A2 2 0 1 1 7.14.87l.06.06a1.65 1.65 0 0 0 1.82.33h.09C9.58 1.3 10.16 1 10.76 1H13.2c.6 0 1.18.3 1.58.78l.09.09c.6.6 1 1.38 1 2.23v.09c.7 0 1.27.42 1.51 1 .22.56.1 1.18-.33 1.62l-.06.06c-.44.44-.6 1.07-.33 1.62.22.56.79 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.7 0-1.27.42-1.51 1z" stroke="currentColor" strokeWidth="0.5" fill="none" />
  </svg>
)

export const LogOut = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
)

export const PanelLeft = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
    <rect x="7" y="6" width="3" height="12" fill="currentColor" />
  </svg>
)

export const Search = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
)

export const Moon = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
  </svg>
)

export const Sun = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1" fill="none" />
  </svg>
)

export const Users = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="19" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M22 21v-1.5a3 3 0 0 0-2-2.83" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
)

export const Truck = ({ size = 18, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="3" width="15" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M16 8h4l3 4v4h-7V8z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M8 18.5H16" stroke="currentColor" strokeWidth="1" />
  </svg>
)

export default {}
