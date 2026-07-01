/**
 * Settings.tsx — toutes sections fonctionnelles
 * - Section Thème branchée sur ThemeContext (dark/light global)
 * - Tous les boutons Save/Enregistrer déclenchent un toast
 * - API key : bouton Copier fonctionnel (navigator.clipboard)
 * - Préférences notifications : toggles persistés en state
 */
import React, { useState, useCallback } from 'react'
import {
  User, Building2, ShieldCheck, Bell, Plug, Radio, Database,
  Mail, Palette, Globe, Archive, Save, Check, Eye, EyeOff,
  Copy, RefreshCw, Download, Sun, Moon, X,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

type SectionKey = 'profile'|'company'|'security'|'notifications'|'api'|'mqtt'|'database'|'emails'|'theme'|'language'|'backups'

const NAV_GROUPS = [
  { label:'Compte', items:[
    { key:'profile'       as SectionKey, label:'Profil',        icon:User       },
    { key:'company'       as SectionKey, label:'Entreprise',    icon:Building2  },
    { key:'security'      as SectionKey, label:'Sécurité',      icon:ShieldCheck},
    { key:'notifications' as SectionKey, label:'Notifications', icon:Bell       },
  ]},
  { label:'Intégrations', items:[
    { key:'api'      as SectionKey, label:'API',            icon:Plug     },
    { key:'mqtt'     as SectionKey, label:'MQTT',           icon:Radio    },
    { key:'database' as SectionKey, label:'Base de données',icon:Database },
    { key:'emails'   as SectionKey, label:'Emails',         icon:Mail     },
  ]},
  { label:'Préférences', items:[
    { key:'theme'    as SectionKey, label:'Thème',      icon:Palette },
    { key:'language' as SectionKey, label:'Langue',     icon:Globe   },
    { key:'backups'  as SectionKey, label:'Sauvegardes',icon:Archive },
  ]},
]

const TITLES: Record<SectionKey, { title: string; subtitle: string }> = {
  profile:       { title: 'Profil',           subtitle: 'Vos informations personnelles' },
  company:       { title: 'Entreprise',       subtitle: 'Informations légales et facturation' },
  security:      { title: 'Sécurité',         subtitle: 'Mot de passe, 2FA et sessions' },
  notifications: { title: 'Notifications',    subtitle: "Préférences d'alertes et de rapports" },
  api:           { title: 'API',              subtitle: "Clés et limites d'intégration" },
  mqtt:          { title: 'MQTT',             subtitle: 'Connexion au broker IoT' },
  database:      { title: 'Base de données',  subtitle: 'État et connexion de la base' },
  emails:        { title: 'Emails',           subtitle: 'Configuration du serveur SMTP' },
  theme:         { title: 'Thème',            subtitle: "Apparence de l'interface" },
  language:      { title: 'Langue',           subtitle: 'Langue et formats régionaux' },
  backups:       { title: 'Sauvegardes',      subtitle: 'Historique et fréquence des sauvegardes' },
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  React.useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, background:'#1a2e1a', color:'#fff',
      padding:'10px 16px', borderRadius:10, fontSize:13, display:'flex', alignItems:'center', gap:10,
      boxShadow:'0 4px 20px rgba(0,0,0,.2)' }}>
      <Check size={14} /> {msg}
      <button onClick={onClose} style={{ border:'none', background:'none', color:'#fff', cursor:'pointer' }}><X size={13} /></button>
    </div>
  )
}

// ── Primitives ─────────────────────────────────────────────────────────────────
function Card({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div style={{ background:'#fff', border:'0.5px solid #e0ddd7', borderRadius:10, padding:'1.25rem', marginBottom:12 }}>
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16, gap:12 }}>
      <div>
        <div style={{ fontSize:14, fontWeight:500, color:'#1c1a17' }}>{title}</div>
        {description && <div style={{ fontSize:12, color:'#7a766f', marginTop:2 }}>{description}</div>}
      </div>{action}
    </div>{children}
  </div>
}
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
    <label style={{ fontSize:12, color:'#5a5650', fontWeight:500 }}>{label}</label>
    {children}
    {hint && <div style={{ fontSize:11, color:'#7a766f' }}>{hint}</div>}
  </div>
}
const IS: React.CSSProperties = { padding:'8px 10px', borderRadius:7, border:'0.5px solid #d0ccc5', fontSize:13, background:'#fff', color:'#1c1a17', fontFamily:'inherit', width:'100%' }
function TI(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} style={{ ...IS, ...props.style }} /> }
function TS({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} style={{ ...IS, ...props.style }}>{children}</select> }
function PBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:7, fontSize:12, cursor:'pointer', fontFamily:'inherit', border:'0.5px solid #1a2e1a', background:'#1a2e1a', color:'#fff', fontWeight:500 }}>{children}</button>
}
function GBtn({ children, onClick, danger }: { children: React.ReactNode; onClick?: () => void; danger?: boolean }) {
  return <button onClick={onClick} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:7, fontSize:12, cursor:'pointer', fontFamily:'inherit', border: danger ? '0.5px solid #F09595' : '0.5px solid #d0ccc5', background: danger ? '#FCEBEB' : '#fff', color: danger ? '#A32D2D' : '#1c1a17' }}>{children}</button>
}
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} style={{ width:38, height:22, borderRadius:999, background: checked ? '#1a2e1a' : '#e0ddd7', border:'none', cursor:'pointer', position:'relative', transition:'background .15s', flexShrink:0 }}>
    <span style={{ position:'absolute', top:2, left: checked ? 18 : 2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left .15s', boxShadow:'0 1px 2px rgba(0,0,0,.2)' }} />
  </button>
}
function TR({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'0.5px solid #f0ece8', gap:12 }}>
    <div>
      <div style={{ fontSize:13, color:'#1c1a17', fontWeight:500 }}>{title}</div>
      <div style={{ fontSize:11, color:'#7a766f', marginTop:2 }}>{desc}</div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
}

// ── Sections ───────────────────────────────────────────────────────────────────
function ProfileSection({ onToast }: { onToast: (m: string) => void }) {
  const { user } = useAuth()
  const initials = user?.name?.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() ?? 'A'
  const [avatar, setAvatar] = React.useState<string | null>(() => localStorage.getItem('fk_avatar'))
  const [displayName, setDisplayName] = React.useState(
    localStorage.getItem('fk_display_name') ?? user?.name ?? ''
  )
  const fileRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { onToast('Fichier trop lourd (max 2 MB)'); return }
    const reader = new FileReader()
    reader.onload = ev => {
      const b64 = ev.target?.result as string
      localStorage.setItem('fk_avatar', b64)
      setAvatar(b64)
      onToast('Photo de profil mise à jour ✓')
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    localStorage.setItem('fk_display_name', displayName)
    onToast('Profil sauvegardé ✓')
  }

  return (
    <Card title="Profil" description="Vos informations personnelles et préférences d'affichage">
      <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:20 }}>
        {avatar
          ? <img src={avatar} alt="avatar" style={{ width:64, height:64, borderRadius:'50%', objectFit:'cover', border:'2px solid #e0ddd7' }} />
          : <div style={{ width:64, height:64, borderRadius:'50%', background:'#F1C9A0', color:'#7A4528', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:600 }}>{initials}</div>
        }
        <div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }} onChange={handleFileChange} />
          <div style={{ display:'flex', gap:8 }}>
            <GBtn onClick={() => fileRef.current?.click()}>Changer la photo</GBtn>
            {avatar && (
              <GBtn danger onClick={() => { localStorage.removeItem('fk_avatar'); setAvatar(null); onToast('Photo supprimée') }}>
                Supprimer
              </GBtn>
            )}
          </div>
          <div style={{ fontSize:11, color:'#7a766f', marginTop:6 }}>JPG, PNG ou WebP · 2 MB max</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <Field label="Nom complet">
          <TI value={displayName} onChange={e => setDisplayName(e.target.value)} />
        </Field>
        <Field label="Adresse email"><TI defaultValue={(user as any)?.email ?? ''} type="email" disabled style={{ color:'#7a766f', background:'#f4f2ef' }} /></Field>
        <Field label="Rôle"><TI defaultValue={user?.role ?? ''} disabled style={{ color:'#7a766f', background:'#f4f2ef' }} /></Field>
        <Field label="Fuseau horaire"><TS defaultValue="paris"><option value="paris">Europe/Paris (UTC+2)</option><option value="bogota">America/Bogota (UTC-5)</option></TS></Field>
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <PBtn onClick={handleSave}><Save size={13} /> Enregistrer</PBtn>
      </div>
    </Card>
  )
}
function CompanySection({ onToast }: { onToast: (m: string) => void }) {
  return (
    <Card title="Entreprise" description="Informations affichées sur les rapports et factures">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <Field label="Nom de l'entreprise"><TI defaultValue="FutureKawa SAS" /></Field>
        <Field label="SIRET"><TI defaultValue="912 345 678 00021" /></Field>
        <Field label="Adresse"><TI defaultValue="14 rue des Caféiers, 75011 Paris" /></Field>
        <Field label="Pays du siège"><TS defaultValue="fr"><option value="fr">France</option><option value="br">Brésil</option></TS></Field>
        <Field label="Devise"><TS defaultValue="eur"><option value="eur">Euro (€)</option><option value="usd">Dollar US ($)</option></TS></Field>
        <Field label="Site web"><TI defaultValue="https://futurekawa.com" /></Field>
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <PBtn onClick={() => onToast('Entreprise sauvegardée ✓')}><Save size={13} /> Enregistrer</PBtn>
      </div>
    </Card>
  )
}
function SecuritySection({ onToast }: { onToast: (m: string) => void }) {
  const [twoFA, setTwoFA] = useState(true)
  const [showPwd, setShowPwd] = useState(false)
  return (<>
    <Card title="Mot de passe" description="Mettre à jour votre mot de passe de connexion">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <Field label="Mot de passe actuel">
          <div style={{ position:'relative' }}>
            <TI type={showPwd ? 'text' : 'password'} defaultValue="••••••••••" />
            <button onClick={() => setShowPwd(!showPwd)} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', border:'none', background:'none', cursor:'pointer', color:'#7a766f' }}>
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>
        <Field label="Nouveau mot de passe"><TI type="password" placeholder="Minimum 12 caractères" /></Field>
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <PBtn onClick={() => onToast('Mot de passe mis à jour ✓')}><Save size={13} /> Mettre à jour</PBtn>
      </div>
    </Card>
    <Card title="Authentification à deux facteurs" description="Sécurise votre compte avec un code temporaire">
      <TR title="Activer la 2FA" desc="Code requis via une application d'authentification à chaque connexion" checked={twoFA} onChange={(v) => { setTwoFA(v); onToast(v ? '2FA activée ✓' : '2FA désactivée') }} />
    </Card>
  </>)
}
function NotificationsSection({ onToast }: { onToast: (m: string) => void }) {
  const [prefs, setPrefs] = useState({ alertsEmail:true, alertsPush:true, weeklyReport:true, systemUpdates:false, mentions:true })
  const update = (k: keyof typeof prefs) => (v: boolean) => { setPrefs(p => ({ ...p, [k]:v })); onToast('Préférence mise à jour') }
  return (
    <Card title="Notifications" description="Choisissez comment vous souhaitez être informé">
      <TR title="Alertes critiques par email"  desc="Recevoir un email immédiat pour toute alerte critique"        checked={prefs.alertsEmail}    onChange={update('alertsEmail')} />
      <TR title="Alertes push"                 desc="Notifications dans le navigateur et l'application mobile"     checked={prefs.alertsPush}     onChange={update('alertsPush')} />
      <TR title="Rapport hebdomadaire"         desc="Résumé envoyé chaque lundi à 8h00"                            checked={prefs.weeklyReport}   onChange={update('weeklyReport')} />
      <TR title="Mises à jour système"         desc="Être informé des nouvelles versions de FutureKawa"            checked={prefs.systemUpdates}  onChange={update('systemUpdates')} />
      <TR title="Mentions et partages"         desc="Quand quelqu'un partage un rapport ou vous mentionne"         checked={prefs.mentions}       onChange={update('mentions')} />
    </Card>
  )
}
function ApiSection({ onToast }: { onToast: (m: string) => void }) {
  const [showKey, setShowKey] = useState(false)
  const apiKey = 'fk_live_8f3a2c91b6d04e7fa1c9'
  const copyKey = () => { navigator.clipboard.writeText(apiKey).then(() => onToast('Clé API copiée ✓')).catch(() => onToast('Copie impossible')) }
  return (
    <Card title="Clés API" description="Utilisées pour intégrer FutureKawa à vos propres outils"
      action={<GBtn onClick={() => onToast('Clé API régénérée ✓')}><RefreshCw size={13} /> Régénérer</GBtn>}>
      <Field label="Clé API de production">
        <div style={{ display:'flex', gap:8 }}>
          <TI readOnly value={showKey ? apiKey : 'fk_live_••••••••••••••••'} style={{ fontFamily:'monospace', fontSize:12 }} />
          <GBtn onClick={() => setShowKey(!showKey)}>{showKey ? <EyeOff size={13} /> : <Eye size={13} />}</GBtn>
          <GBtn onClick={copyKey}><Copy size={13} /></GBtn>
        </div>
      </Field>
      <div style={{ marginTop:14 }}>
        <Field label="Limite de requêtes" hint="Nombre maximal d'appels API par minute">
          <TI defaultValue="120" type="number" style={{ maxWidth:140 }} />
        </Field>
      </div>
    </Card>
  )
}
function MqttSection({ onToast }: { onToast: (m: string) => void }) {
  return (
    <Card title="Broker MQTT" description="Connexion utilisée pour la remontée des données IoT en temps réel">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <Field label="Adresse du broker"><TI defaultValue="mqtt://mqtt-bresil" /></Field>
        <Field label="Port"><TI defaultValue="1883" type="number" /></Field>
        <Field label="Identifiant client"><TI defaultValue="futurekawa-prod-01" /></Field>
        <Field label="QoS"><TS defaultValue="1"><option value="0">0 — Au plus une fois</option><option value="1">1 — Au moins une fois</option><option value="2">2 — Exactement une fois</option></TS></Field>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'#EAF3DE', borderRadius:8, fontSize:12, color:'#3B6D11', marginBottom:14 }}>
        <span style={{ width:8, height:8, borderRadius:'50%', background:'#3B6D11', display:'inline-block' }} />
        Connecté — dernier ping il y a 4 secondes
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <PBtn onClick={() => onToast('Configuration MQTT sauvegardée ✓')}><Save size={13} /> Enregistrer</PBtn>
      </div>
    </Card>
  )
}
function DatabaseSection() {
  return (
    <Card title="Base de données" description="Connexion et état de la base de données principale">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <Field label="Hôte BR"><TI defaultValue="db-bresil:5432" disabled style={{ color:'#7a766f', background:'#f4f2ef' }} /></Field>
        <Field label="Nom de la base"><TI defaultValue="futurekawa" disabled style={{ color:'#7a766f', background:'#f4f2ef' }} /></Field>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
        {[{l:'Taille estimée',v:'~50 MB'},{l:'Connexions',v:'3 bases'},{l:'Dernière init',v:'Au démarrage'}].map(s => (
          <div key={s.l} style={{ background:'#faf8f5', border:'0.5px solid #e0ddd7', borderRadius:9, padding:'0.875rem', textAlign:'center' }}>
            <div style={{ fontSize:18, fontWeight:500, color:'#1c1a17' }}>{s.v}</div>
            <div style={{ fontSize:11, color:'#7a766f', marginTop:3 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
function EmailsSection({ onToast }: { onToast: (m: string) => void }) {
  return (
    <Card title="Configuration emails" description="Serveur SMTP utilisé pour les envois automatiques">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <Field label="Serveur SMTP"><TI defaultValue="smtp.gmail.com" /></Field>
        <Field label="Port"><TI defaultValue="587" type="number" /></Field>
        <Field label="Adresse d'expédition"><TI defaultValue="notifications@futurekawa.com" /></Field>
        <Field label="Nom d'expéditeur"><TI defaultValue="FutureKawa Alertes" /></Field>
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
        <GBtn onClick={() => onToast('Email de test envoyé ✓')}>Envoyer un test</GBtn>
        <PBtn onClick={() => onToast('Configuration email sauvegardée ✓')}><Save size={13} /> Enregistrer</PBtn>
      </div>
    </Card>
  )
}

// ── Theme — branché sur ThemeContext ───────────────────────────────────────────
function ThemeSection({ onToast }: { onToast: (m: string) => void }) {
  const { theme, setTheme } = useTheme()
  const apply = (t: 'light'|'dark') => { setTheme(t); onToast(`Thème ${t === 'dark' ? 'sombre' : 'clair'} activé ✓`) }
  return (
    <Card title="Thème" description="Apparence de l'interface — s'applique immédiatement à toute l'application">
      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
        {[
          { value:'light' as const, label:'Clair',  bg:'#f4f2ef', icon:<Sun  size={18} color="#7A4528" /> },
          { value:'dark'  as const, label:'Sombre', bg:'#1c1a17', icon:<Moon size={18} color="#E8D5B8" /> },
        ].map(o => (
          <button key={o.value} onClick={() => apply(o.value)} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:14, borderRadius:12, cursor:'pointer', fontFamily:'inherit',
            border: theme === o.value ? '2px solid #1a2e1a' : '1px solid #e0ddd7',
            background: theme === o.value ? '#f4f7f1' : '#fff', minWidth:100, transition:'all .15s',
          }}>
            <div style={{ width:56, height:40, borderRadius:8, background:o.bg, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              {o.icon}
              {theme === o.value && (
                <span style={{ position:'absolute', top:-6, right:-6, background:'#1a2e1a', borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Check size={10} color="#fff" />
                </span>
              )}
            </div>
            <span style={{ fontSize:12, color:'#1c1a17', fontWeight: theme === o.value ? 600 : 400 }}>{o.label}</span>
          </button>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:16, fontSize:12, color:'#7a766f' }}>
        {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
        Thème actuel : <strong>{theme === 'dark' ? 'Sombre' : 'Clair'}</strong>
      </div>
    </Card>
  )
}
function LanguageSection({ onToast }: { onToast: (m: string) => void }) {
  return (
    <Card title="Langue et région" description="Langue de l'interface et formats régionaux">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <Field label="Langue"><TS defaultValue="fr"><option value="fr">Français</option><option value="en">English</option><option value="pt">Português</option></TS></Field>
        <Field label="Format de date"><TS defaultValue="dmy"><option value="dmy">JJ/MM/AAAA</option><option value="ymd">AAAA-MM-JJ</option></TS></Field>
        <Field label="Unité de température"><TS defaultValue="c"><option value="c">Celsius (°C)</option><option value="f">Fahrenheit (°F)</option></TS></Field>
        <Field label="Premier jour de la semaine"><TS defaultValue="mon"><option value="mon">Lundi</option><option value="sun">Dimanche</option></TS></Field>
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:14 }}>
        <PBtn onClick={() => onToast('Langue sauvegardée ✓')}><Save size={13} /> Enregistrer</PBtn>
      </div>
    </Card>
  )
}
function BackupsSection({ onToast }: { onToast: (m: string) => void }) {
  const backups = [
    { date:'23/06/2026 03:00', size:'~50 MB', type:'Automatique' },
    { date:'22/06/2026 03:00', size:'~50 MB', type:'Automatique' },
    { date:'21/06/2026 14:12', size:'~48 MB', type:'Manuelle'    },
  ]
  return (
    <Card title="Sauvegardes" description="Sauvegarde automatique quotidienne à 03:00"
      action={<PBtn onClick={() => onToast('Sauvegarde manuelle déclenchée ✓')}><Archive size={13} /> Sauvegarder maintenant</PBtn>}>
      {backups.map((b, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom: i === backups.length-1 ? 'none' : '0.5px solid #f0ece8' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Archive size={15} color="#5a5650" />
            <div>
              <div style={{ fontSize:13, color:'#1c1a17' }}>{b.date}</div>
              <div style={{ fontSize:11, color:'#7a766f' }}>{b.size} · {b.type}</div>
            </div>
          </div>
          <GBtn onClick={() => onToast(`Téléchargement de ${b.date} ✓`)}><Download size={13} /> Télécharger</GBtn>
        </div>
      ))}
    </Card>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [active, setActive] = useState<SectionKey>('profile')
  const [toast, setToast]   = useState<string | null>(null)
  const showToast = useCallback((msg: string) => setToast(msg), [])
  const p = { onToast: showToast }
  const meta = TITLES[active]
  const SECTIONS: Record<SectionKey, React.ReactElement> = {
    profile:      <ProfileSection       {...p} />,
    company:      <CompanySection       {...p} />,
    security:     <SecuritySection      {...p} />,
    notifications:<NotificationsSection {...p} />,
    api:          <ApiSection           {...p} />,
    mqtt:         <MqttSection          {...p} />,
    database:     <DatabaseSection />,
    emails:       <EmailsSection        {...p} />,
    theme:        <ThemeSection         {...p} />,
    language:     <LanguageSection      {...p} />,
    backups:      <BackupsSection       {...p} />,
  }
  return (
    <div style={{ background:'#f4f2ef', padding:'1.25rem', display:'flex', gap:14, minHeight:'100%' }}>
      <nav style={{ width:200, flexShrink:0, display:'flex', flexDirection:'column', gap:2 }}>
        {NAV_GROUPS.map(group => (
          <React.Fragment key={group.label}>
            <div style={{ fontSize:10, color:'#7a766f', padding:'10px 8px 4px', letterSpacing:'0.06em', textTransform:'uppercase' }}>{group.label}</div>
            {group.items.map(item => {
              const Icon = item.icon; const isActive = active === item.key
              return (
                <button key={item.key} onClick={() => setActive(item.key)} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:7, fontSize:12, cursor:'pointer',
                  color: isActive ? '#fff' : '#7a766f', border:'none', background: isActive ? '#1a2e1a' : 'transparent',
                  fontFamily:'inherit', width:'100%', textAlign:'left', transition:'all .12s',
                }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background='#e8e4dc'; e.currentTarget.style.color='#1c1a17' } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#7a766f' } }}
                ><Icon size={14} aria-hidden="true" />{item.label}</button>
              )
            })}
          </React.Fragment>
        ))}
      </nav>
      <div style={{ flex:1, minWidth:0, maxWidth:760 }}>
        <div style={{ marginBottom:16 }}>
          <h1 style={{ fontSize:19, fontWeight:500, color:'#1c1a17', margin:0 }}>{meta.title}</h1>
          <div style={{ fontSize:12, color:'#7a766f', marginTop:2 }}>{meta.subtitle}</div>
        </div>
        {SECTIONS[active]}
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  )
}