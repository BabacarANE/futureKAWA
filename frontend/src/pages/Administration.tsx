import React, { useState, useEffect, useCallback } from 'react'
import {
  Users, Shield, Key, MapPin, Warehouse, Settings as SettingsIcon,
  Terminal, ListChecks, Laptop, Plus, Check, Save, LogOut,
  Trash2, Edit2, X, UserPlus, RefreshCw,
} from 'lucide-react'
import api, { getUsers, deleteUser, getAllCountries, getAllWarehouses } from '../services/api'
import type { ApiUser } from '../services/api'
import { useAuth } from '../context/AuthContext'
import CreateUserModal from '../components/CreateUserModal'

type SectionKey = 'users'|'roles'|'perms'|'countries'|'warehouses'|'config'|'logs'|'audit'|'sessions'

const NAV_GROUPS = [
  { label: 'Gestion', items: [
    { key: 'users'      as SectionKey, label: 'Utilisateurs',  icon: Users     },
    { key: 'roles'      as SectionKey, label: 'Rôles',          icon: Shield    },
    { key: 'perms'      as SectionKey, label: 'Permissions',    icon: Key       },
    { key: 'countries'  as SectionKey, label: 'Pays',           icon: MapPin    },
    { key: 'warehouses' as SectionKey, label: 'Entrepôts',      icon: Warehouse },
  ]},
  { label: 'Système', items: [
    { key: 'config'   as SectionKey, label: 'Configuration', icon: SettingsIcon },
    { key: 'logs'     as SectionKey, label: 'Logs',          icon: Terminal     },
    { key: 'audit'    as SectionKey, label: 'Audit',         icon: ListChecks   },
    { key: 'sessions' as SectionKey, label: 'Sessions',      icon: Laptop       },
  ]},
]

const ROLE_BADGE: Record<string, string> = {
  siege: 'red', responsable_exploitation: 'blue',
  responsable_entrepot: 'amber', qualite: 'green', supply_chain: 'gray',
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999,
      background:'#1a2e1a', color:'#fff', padding:'10px 16px', borderRadius:10,
      fontSize:13, display:'flex', alignItems:'center', gap:10, boxShadow:'0 4px 20px rgba(0,0,0,.2)' }}>
      <Check size={14} /> {msg}
      <button onClick={onClose} style={{ border:'none', background:'none', color:'#fff', cursor:'pointer' }}>
        <X size={13} />
      </button>
    </div>
  )
}

// ── Primitives ─────────────────────────────────────────────────────────────────
const BADGE: Record<string, { bg: string; color: string }> = {
  green: { bg:'#EAF3DE', color:'#3B6D11' }, amber: { bg:'#FAEEDA', color:'#854F0B' },
  gray:  { bg:'#F1EFE8', color:'#5F5E5A' }, blue:  { bg:'#E6F1FB', color:'#185FA5' },
  red:   { bg:'#FCEBEB', color:'#A32D2D' },
}
function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  const s = BADGE[tone] ?? BADGE.gray
  return <span style={{ fontSize:10, padding:'2px 7px', borderRadius:999, fontWeight:500,
    display:'inline-block', background:s.bg, color:s.color }}>{children}</span>
}
function Av({ name, size=26 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()
  return <span style={{ width:size, height:size, borderRadius:'50%', background:'#E6F1FB',
    color:'#185FA5', fontSize:size<=20?9:10, fontWeight:500, display:'inline-flex',
    alignItems:'center', justifyContent:'center', marginRight:6, verticalAlign:'middle', flexShrink:0 }}>{initials}</span>
}
function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div style={{ background:'#fff', border:'0.5px solid #e0ddd7', borderRadius:10, padding:'1rem', marginBottom:10 }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
      <span style={{ fontSize:14, fontWeight:500, color:'#1c1a17' }}>{title}</span>
      {action}
    </div>{children}</div>
}
function Btn({ children, primary, danger, small, onClick, disabled }: {
  children: React.ReactNode; primary?: boolean; danger?: boolean; small?: boolean; onClick?: () => void; disabled?: boolean
}) {
  return <button onClick={onClick} disabled={disabled} style={{
    display:'flex', alignItems:'center', gap:5,
    padding: small ? '3px 8px' : '5px 12px', borderRadius:7,
    fontSize: small ? 11 : 12, cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily:'inherit', opacity: disabled ? .5 : 1,
    border: danger ? '0.5px solid #F09595' : primary ? '0.5px solid #1a2e1a' : '0.5px solid #d0ccc5',
    background: danger ? '#FCEBEB' : primary ? '#1a2e1a' : '#fff',
    color: danger ? '#A32D2D' : primary ? '#fff' : '#1c1a17',
  }}>{children}</button>
}
function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
    <thead><tr>{head.map(h => <th key={h} style={{ textAlign:'left', padding:'6px 8px', fontSize:11, fontWeight:500, color:'#7a766f', borderBottom:'0.5px solid #e0ddd7' }}>{h}</th>)}</tr></thead>
    <tbody>{children}</tbody>
  </table>
}
function Row({ children }: { children: React.ReactNode }) {
  return <tr onMouseEnter={e=>(e.currentTarget.style.background='#faf8f5')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>{children}</tr>
}
function Td({ children, muted, style }: { children: React.ReactNode; muted?: boolean; style?: React.CSSProperties }) {
  return <td style={{ padding:8, borderBottom:'0.5px solid #f0ece8', color: muted ? '#7a766f' : '#1c1a17', verticalAlign:'middle', ...style }}>{children}</td>
}

// ── Users section ──────────────────────────────────────────────────────────────
function UsersSection({ onToast, users, loading, onRefresh }: {
  onToast: (m: string) => void
  users: ApiUser[]
  loading: boolean
  onRefresh: () => void
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter]         = useState('')
  const { user: me } = useAuth()

  const handleDelete = async (u: ApiUser) => {
    if (!window.confirm(`Supprimer ${u.name} ?`)) return
    try {
      await deleteUser(u.id)
      onToast(`${u.name} supprimé`)
      onRefresh()
    } catch {
      onToast('Erreur lors de la suppression')
    }
  }

  const filtered = users.filter(u =>
    !filter
    || u.name.toLowerCase().includes(filter.toLowerCase())
    || u.email.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <>
    {showCreate && (
      <CreateUserModal
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false)
          onToast('Utilisateur créé avec succès')
          onRefresh()
        }}
      />
    )}
    <Card title={`Utilisateurs (${users.length})`} action={
      <div style={{ display:'flex', gap:8 }}>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Rechercher…"
          style={{ padding:'4px 8px', fontSize:12, borderRadius:7, border:'0.5px solid #d0ccc5', fontFamily:'inherit' }} />
        <Btn onClick={onRefresh}><RefreshCw size={12} /></Btn>
        <Btn primary onClick={() => setShowCreate(true)}><UserPlus size={13} /> Créer un utilisateur</Btn>
      </div>
    }>
      {loading
        ? <div style={{ padding:'1rem', color:'#7a766f', fontSize:12 }}>Chargement des utilisateurs…</div>
        : (
        <Table head={['Nom','Email','Rôle','Pays','Actions']}>
          {filtered.map(u => (
            <Row key={u.id}>
              <Td><Av name={u.name} />{u.name}</Td>
              <Td muted>{u.email}</Td>
              <Td><Badge tone={ROLE_BADGE[u.role] ?? 'gray'}>{u.role}</Badge></Td>
              <Td muted>{u.country_code ?? '—'}</Td>
              <Td>
                <div style={{ display:'flex', gap:4 }}>
                  <Btn small onClick={() => onToast(`Édition de ${u.name} (formulaire à implémenter)`)}><Edit2 size={12} /></Btn>
                  {u.email !== me?.email && (
                    <Btn small danger onClick={() => handleDelete(u)}><Trash2 size={12} /></Btn>
                  )}
                </div>
              </Td>
            </Row>
          ))}
        </Table>
      )}
    </Card>
    </>
  )
}

// ── Roles ──────────────────────────────────────────────────────────────────────
const ROLE_DESC: Record<string, string> = {
  siege:                    'Accès global à tous les pays',
  responsable_exploitation: 'Gestion entrepôts, lots, alertes',
  responsable_entrepot:     'Gestion entrepôts et lots',
  qualite:                  'Lecture lots et analytics',
  supply_chain:             'Lecture lots, pays et analytics',
}

function RolesSection({ users, onToast }: { users: ApiUser[]; onToast: (m: string) => void }) {
  const roleCounts = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1
    return acc
  }, {})

  const roles = Object.keys(ROLE_DESC).map(name => ({
    name,
    users: roleCounts[name] ?? 0,
    desc: ROLE_DESC[name],
    badge: ROLE_BADGE[name] ?? 'gray',
  }))

  return (
    <Card title="Rôles" action={<Btn primary onClick={() => onToast('Les rôles sont définis côté serveur')}><Plus size={13} /> Nouveau rôle</Btn>}>
      <Table head={['Rôle','Utilisateurs','Description']}>
        {roles.map(r => (
          <Row key={r.name}>
            <Td><Badge tone={r.badge}>{r.name}</Badge></Td>
            <Td muted>{r.users}</Td>
            <Td muted>{r.desc}</Td>
          </Row>
        ))}
      </Table>
    </Card>
  )
}

// ── Permissions ────────────────────────────────────────────────────────────────
function PermissionsSection({ onToast }: { onToast: (m: string) => void }) {
  const cols = ['siege','resp. exploitation','resp. entrepôt','qualite','supply_chain']
  const [perms, setPerms] = useState<boolean[][]>([
    [true,true,true, true, true ],
    [true,true,true, false,false],
    [true,true,false,false,false],
    [true,true,true, true, true ],
    [true,true,true, true, false],
    [true,false,false,false,false],
    [true,false,false,false,false],
  ])
  const labels = ['Voir dashboard','Gérer alertes','Modifier lots','Voir analytics','Export données','Admin utilisateurs','Config système']
  const toggle = (ri: number, ci: number) => {
    if (ci === 0) return
    setPerms(p => p.map((r,i) => i !== ri ? r : r.map((v,j) => j !== ci ? v : !v)))
    onToast('Permission mise à jour')
  }
  return (
    <Card title="Permissions" action={<Btn primary onClick={() => onToast('Permissions sauvegardées ✓')}><Save size={13} /> Sauvegarder</Btn>}>
      <div style={{ overflowX:'auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:`160px repeat(${cols.length},1fr)`, gap:4, fontSize:11, minWidth:600 }}>
          <div />
          {cols.map(c => <div key={c} style={{ fontWeight:500, color:'#7a766f', padding:4, textAlign:'center', fontSize:10 }}>{c}</div>)}
          {labels.map((label,ri) => (
            <React.Fragment key={label}>
              <div style={{ fontSize:12, color:'#1c1a17', padding:'4px 0', display:'flex', alignItems:'center' }}>{label}</div>
              {perms[ri].map((on,ci) => (
                <div key={ci} style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:4 }}>
                  <button onClick={() => toggle(ri,ci)} style={{
                    width:16, height:16, borderRadius:4, cursor: ci===0?'default':'pointer',
                    background: on ? '#1a2e1a' : 'transparent',
                    border: on ? 'none' : '1.5px solid #d0ccc5',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {on && <Check size={10} color="#fff" />}
                  </button>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ── Countries ──────────────────────────────────────────────────────────────────
function CountriesSection({ onToast }: { onToast: (m: string) => void }) {
  const [countries, setCountries] = useState<{ code: string; name: string; lots: number; alerts: number }[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getAllCountries().then((data: any[]) => {
      setCountries(data.map((c: any) => ({
        code:   c.country_code,
        name:   ({ BR:'Brésil', EC:'Équateur', CO:'Colombie' } as Record<string,string>)[c.country_code] ?? c.country_code,
        lots:   c.lots?.length ?? 0,
        alerts: c.alerts?.length ?? 0,
      })))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])
  return (
    <Card title="Pays" action={<Btn primary onClick={() => onToast('Ajout de pays non supporté')}><Plus size={13} /> Ajouter</Btn>}>
      {loading ? <div style={{ padding:'1rem', color:'#7a766f', fontSize:12 }}>Chargement…</div> : (
        <Table head={['Pays','Code','Lots','Alertes','Statut']}>
          {countries.map(c => (
            <Row key={c.code}>
              <Td>{c.name}</Td><Td muted>{c.code}</Td><Td muted>{c.lots}</Td><Td muted>{c.alerts}</Td>
              <Td><Badge tone="green">Actif</Badge></Td>
            </Row>
          ))}
        </Table>
      )}
    </Card>
  )
}

// ── Warehouses ─────────────────────────────────────────────────────────────────
function WarehousesSection({ onToast }: { onToast: (m: string) => void }) {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const load = useCallback(() => {
    setLoading(true)
    getAllWarehouses().then(setWarehouses).catch(() => setWarehouses([])).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])
  return (
    <Card title={`Entrepôts${warehouses.length > 0 ? ` (${warehouses.length})` : ''}`}
      action={<div style={{ display:'flex', gap:6 }}><Btn onClick={load}><RefreshCw size={12} /></Btn><Btn primary onClick={() => onToast('Créer depuis la page Entrepôts')}><Plus size={13} /> Ajouter</Btn></div>}>
      {loading ? <div style={{ padding:'1rem', color:'#7a766f', fontSize:12 }}>Chargement…</div> : (
        <Table head={['Nom','Localisation','Pays','Exploitation']}>
          {warehouses.length === 0
            ? <tr><td colSpan={4} style={{ padding:16, color:'#7a766f', fontSize:12, textAlign:'center' }}>Aucun entrepôt trouvé</td></tr>
            : warehouses.map((w, i) => (
              <Row key={i}>
                <Td>{w.name}</Td>
                <Td muted>{w.location ?? '—'}</Td>
                <Td><Badge tone={w.country_code === 'BR' ? 'green' : w.country_code === 'EC' ? 'amber' : 'blue'}>{w.country_code}</Badge></Td>
                <Td muted>#{w.exploitation_id}</Td>
              </Row>
            ))
          }
        </Table>
      )}
    </Card>
  )
}

// ── Config ─────────────────────────────────────────────────────────────────────
function ConfigSection({ onToast }: { onToast: (m: string) => void }) {
  const [vals, setVals] = useState(['25','75','30','90','alertes@futurekawa.com'])
  const labels = ['Température max (°C)','Humidité max (%)','Intervalle IoT (s)','Rétention logs (jours)','Email notifications']
  return (
    <Card title="Configuration système" action={<Btn primary onClick={() => onToast('Configuration sauvegardée ✓')}><Save size={13} /> Sauvegarder</Btn>}>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {labels.map((l, i) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:12 }}>
            <label style={{ fontSize:12, color:'#7a766f', width:220, flexShrink:0 }}>{l}</label>
            <input value={vals[i]} onChange={e => setVals(v => v.map((x,j) => j===i ? e.target.value : x))}
              style={{ flex:1, padding:'5px 8px', borderRadius:7, border:'0.5px solid #d0ccc5', fontSize:12, fontFamily:'inherit' }} />
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── Logs — chargés depuis le backend ──────────────────────────────────────────
function LogsSection() {
  const [logs, setLogs]   = useState<any[]>([])
  const [filter, setFilter] = useState('Tous')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Reconstruit des logs depuis les alertes réelles
    Promise.all([
      api.get('/consolidated/BR/alerts').catch(() => ({ data: [] })),
      api.get('/consolidated/EC/alerts').catch(() => ({ data: [] })),
      api.get('/consolidated/CO/alerts').catch(() => ({ data: [] })),
    ]).then(([br, ec, co]) => {
      const all: any[] = [
        ...(br.data as any[]).map((a: any) => ({ ts: a.triggered_at, level: 'WARN', msg: `[BR] ${a.message}`, tone: 'amber' })),
        ...(ec.data as any[]).map((a: any) => ({ ts: a.triggered_at, level: 'WARN', msg: `[EC] ${a.message}`, tone: 'amber' })),
        ...(co.data as any[]).map((a: any) => ({ ts: a.triggered_at, level: 'WARN', msg: `[CO] ${a.message}`, tone: 'amber' })),
      ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()).slice(0, 20)
      setLogs(all)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'Tous' ? logs
    : logs.filter(l =>
        (filter === 'Erreurs'  && l.level === 'ERROR') ||
        (filter === 'Warnings' && l.level === 'WARN')  ||
        (filter === 'Info'     && l.level === 'INFO')
      )

  return (
    <Card title={`Logs système (${filtered.length})`} action={
      <select value={filter} onChange={e=>setFilter(e.target.value)}
        style={{ fontSize:12, padding:'4px 8px', borderRadius:7, border:'0.5px solid #d0ccc5', background:'#fff', fontFamily:'inherit' }}>
        {['Tous','Erreurs','Warnings','Info'].map(o=><option key={o}>{o}</option>)}
      </select>
    }>
      {loading ? <div style={{ color:'#7a766f', fontSize:12 }}>Chargement…</div>
      : filtered.length === 0
      ? <div style={{ color:'#7a766f', fontSize:12, padding:'1rem 0', textAlign:'center' }}>Aucun log à afficher</div>
      : filtered.map((l, i) => (
        <div key={i} style={{ display:'flex', gap:10, padding:'7px 0', borderBottom: i===filtered.length-1?'none':'0.5px solid #f0ece8', alignItems:'flex-start', fontSize:12 }}>
          <span style={{ color:'#7a766f', whiteSpace:'nowrap', fontSize:11, minWidth:130, fontFamily:'monospace' }}>
            {new Date(l.ts).toLocaleString('fr-FR')}
          </span>
          <span style={{ flexShrink:0 }}><Badge tone={l.tone}>{l.level}</Badge></span>
          <span style={{ color:'#1c1a17', flex:1 }}>{l.msg}</span>
        </div>
      ))}
    </Card>
  )
}

// ── Audit ──────────────────────────────────────────────────────────────────────
function AuditSection() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/consolidated/BR/alerts').catch(() => ({ data: [] })),
      api.get('/consolidated/EC/alerts').catch(() => ({ data: [] })),
      api.get('/consolidated/CO/alerts').catch(() => ({ data: [] })),
    ]).then(([br, ec, co]) => {
      const all = [
        ...(br.data as any[]).map((a: any) => ({ ...a, country: 'BR' })),
        ...(ec.data as any[]).map((a: any) => ({ ...a, country: 'EC' })),
        ...(co.data as any[]).map((a: any) => ({ ...a, country: 'CO' })),
      ].sort((a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()).slice(0, 10)
      setAlerts(all)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <Card title="Journal d'audit">
      {loading ? <div style={{ color:'#7a766f', fontSize:12 }}>Chargement…</div>
      : alerts.length === 0
      ? <div style={{ color:'#7a766f', fontSize:12, padding:'1rem 0', textAlign:'center' }}>Aucun événement d'audit</div>
      : (
        <Table head={['Date','Pays','Type','Message']}>
          {alerts.map((a, i) => (
            <Row key={i}>
              <Td muted style={{ fontSize:11, whiteSpace:'nowrap' }}>
                {new Date(a.triggered_at).toLocaleString('fr-FR')}
              </Td>
              <Td><Badge tone={a.country === 'BR' ? 'green' : a.country === 'EC' ? 'amber' : 'blue'}>{a.country}</Badge></Td>
              <Td><Badge tone={a.type === 'expired_lot' ? 'red' : 'amber'}>{a.type}</Badge></Td>
              <Td muted>{a.message}</Td>
            </Row>
          ))}
        </Table>
      )}
    </Card>
  )
}

// ── Sessions ───────────────────────────────────────────────────────────────────
function SessionsSection({ users, onToast }: { users: ApiUser[]; onToast: (m: string) => void }) {
  const { user: me, logout } = useAuth()

  // Décode le payload JWT sans vérification de signature (lecture seule)
  const tokenPayload = (() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload as { sub: string; role: string; exp: number; iat?: number }
    } catch { return null }
  })()

  const sessionStart = tokenPayload?.iat
    ? new Date(tokenPayload.iat * 1000).toLocaleString('fr-FR')
    : 'Inconnue'

  const tokenExpires = tokenPayload?.exp
    ? new Date(tokenPayload.exp * 1000).toLocaleString('fr-FR')
    : 'Inconnue'

  const isExpiringSoon = tokenPayload?.exp
    ? tokenPayload.exp * 1000 - Date.now() < 30 * 60 * 1000  // < 30 min
    : false

  const otherUsers = users.filter(u => u.email !== me?.email)

  const handleRevokeAll = () => {
    logout()
    onToast('Session terminée — reconnexion requise')
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {/* Ma session */}
      <Card title="Ma session active" action={
        <Btn danger onClick={handleRevokeAll}><LogOut size={13} /> Déconnecter</Btn>
      }>
        {me ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'0.5px solid #f0ece8' }}>
              <Av name={me.name} size={36} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'#1c1a17' }}>{me.name}</div>
                <div style={{ fontSize:11, color:'#7a766f', marginTop:1 }}>{me.email}</div>
              </div>
              <Badge tone="green">En ligne</Badge>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {[
                { label:'Rôle',         value: me.role },
                { label:'Connecté le',  value: sessionStart },
                { label:'Expire le',    value: tokenExpires },
              ].map(item => (
                <div key={item.label} style={{ background:'#faf8f5', borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:10, color:'#7a766f', marginBottom:2 }}>{item.label}</div>
                  <div style={{ fontSize:12, color: item.label === 'Expire le' && isExpiringSoon ? '#A32D2D' : '#1c1a17', fontFamily:'monospace' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            {isExpiringSoon && (
              <div style={{ background:'#FAEEDA', border:'0.5px solid #F7C879', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#854F0B' }}>
                ⚠ Votre session expire dans moins de 30 minutes — reconnectez-vous pour continuer.
              </div>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'#EAF3DE', borderRadius:8, fontSize:12, color:'#3B6D11' }}>
              <Laptop size={14} />
              {navigator.userAgent.includes('Mobile') ? 'Appareil mobile' : 'Bureau'} · {navigator.userAgent.split(' ').find(p => ['Windows','Mac','Linux','iPhone','Android'].some(os => p.includes(os))) ?? 'OS inconnu'}
            </div>
          </div>
        ) : (
          <div style={{ color:'#7a766f', fontSize:12 }}>Chargement de la session…</div>
        )}
      </Card>

      {/* Autres utilisateurs */}
      <Card title={`Autres utilisateurs (${otherUsers.length})`}>
        {otherUsers.length === 0
          ? <div style={{ color:'#7a766f', fontSize:12, padding:'8px 0', textAlign:'center' }}>Aucun autre utilisateur</div>
          : (
            <Table head={['Utilisateur','Email','Rôle','Pays','Statut session']}>
              {otherUsers.map(u => (
                <Row key={u.id}>
                  <Td><Av name={u.name} />{u.name}</Td>
                  <Td muted>{u.email}</Td>
                  <Td><Badge tone={ROLE_BADGE[u.role] ?? 'gray'}>{u.role}</Badge></Td>
                  <Td muted>{u.country_code ?? '—'}</Td>
                  <Td muted style={{ fontSize:11 }}>Non trackée (JWT stateless)</Td>
                </Row>
              ))}
            </Table>
          )
        }
        <div style={{ marginTop:10, fontSize:11, color:'#9a9690', borderTop:'0.5px solid #f0ece8', paddingTop:10 }}>
          ℹ Les sessions des autres utilisateurs ne sont pas traçables en temps réel car l'authentification est JWT stateless.
          Pour un tracking complet, intégrer un store de sessions Redis côté serveur.
        </div>
      </Card>
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function AdministrationPage() {
  const [active,    setActive]  = useState<SectionKey>('users')
  const [toast,     setToast]   = useState<string | null>(null)
  const [users,     setUsers]   = useState<ApiUser[]>([])
  const [usersLoad, setUsersLoad] = useState(true)
  const [stats,     setStats]   = useState({ users:0, countries:0 })
  const { user: me } = useAuth()

  const showToast = useCallback((msg: string) => setToast(msg), [])

  const loadUsers = useCallback(async () => {
    setUsersLoad(true)
    try {
      const data = await getUsers()
      setUsers(data)
      setStats(s => ({ ...s, users: data.length }))
    } catch {
      showToast('Impossible de charger les utilisateurs')
    } finally {
      setUsersLoad(false)
    }
  }, [showToast])

  useEffect(() => {
    loadUsers()
    // Charge le nombre de pays
    getAllCountries().then((data: any[]) => setStats(s => ({ ...s, countries: data.length }))).catch(() => {})
  }, [loadUsers])

  const p = { onToast: showToast }
  const SECTIONS: Record<SectionKey, React.ReactElement> = {
    users:      <UsersSection     {...p} users={users} loading={usersLoad} onRefresh={loadUsers} />,
    roles:      <RolesSection     users={users} {...p} />,
    perms:      <PermissionsSection {...p} />,
    countries:  <CountriesSection  {...p} />,
    warehouses: <WarehousesSection {...p} />,
    config:     <ConfigSection     {...p} />,
    logs:       <LogsSection />,
    audit:      <AuditSection />,
    sessions:   <SessionsSection   {...p} users={users} />,
  }

  return (
    <div style={{ background:'#f4f2ef', padding:'1.25rem', display:'flex', gap:14, minHeight:'100%' }}>
      <nav style={{ width:180, flexShrink:0, display:'flex', flexDirection:'column', gap:2 }}>
        {NAV_GROUPS.map(group => (
          <React.Fragment key={group.label}>
            <div style={{ fontSize:10, color:'#7a766f', padding:'10px 8px 4px', letterSpacing:'0.06em', textTransform:'uppercase' }}>
              {group.label}
            </div>
            {group.items.map(item => {
              const Icon = item.icon; const isActive = active === item.key
              return (
                <button key={item.key} onClick={() => setActive(item.key)} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
                  borderRadius:7, fontSize:12, cursor:'pointer',
                  color: isActive ? '#fff' : '#7a766f', border:'none',
                  background: isActive ? '#1a2e1a' : 'transparent', fontFamily:'inherit',
                  width:'100%', textAlign:'left', transition:'all .12s',
                }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background='#e8e4dc'; e.currentTarget.style.color='#1c1a17' } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#7a766f' } }}
                >
                  <Icon size={14} aria-hidden="true" />{item.label}
                </button>
              )
            })}
          </React.Fragment>
        ))}
      </nav>

      <div style={{ flex:1, minWidth:0 }}>
        {/* Stats réelles */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:10 }}>
          {[
            { n: usersLoad ? '…' : String(stats.users),     l:'Utilisateurs'    },
            { n: usersLoad ? '…' : String(stats.countries), l:'Pays actifs'     },
            { n: me?.role === 'siege' ? 'Siège' : (me?.role ?? '—'), l:'Votre rôle' },
          ].map(s => (
            <div key={s.l} style={{ background:'#fff', border:'0.5px solid #e0ddd7', borderRadius:9, padding:'0.875rem', textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:500, color:'#1c1a17' }}>{s.n}</div>
              <div style={{ fontSize:11, color:'#7a766f', marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>
        {SECTIONS[active]}
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
