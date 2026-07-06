import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  Bell, CheckCheck, Trash2, AlertTriangle,
  Radio, RefreshCw, Circle, ThermometerSun, Package,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { getCountryAlerts } from "../services/api"
import type { Alert } from "../types"

/* ============================================================================
   FutureKawa — Centre de notifications (données réelles)
   Source : API /consolidated/{code}/alerts pour tous les pays accessibles
   ========================================================================= */

type NotifType  = "alert" | "iot"
type NotifLevel = "critical" | "important" | "info"
type FilterKey  = "all" | "unread" | "alert" | "iot"

interface Notification {
  id:          string
  rawId:       number
  type:        NotifType
  level:       NotifLevel
  title:       string
  description: string
  time:        string
  country:     string
  warehouseId: number
  unread:      boolean
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return `il y a ${diff}s`
  if (diff < 3600)  return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
  return `il y a ${Math.floor(diff / 86400)}j`
}

const COUNTRY_LABELS: Record<string, string> = { BR: 'Brésil', EC: 'Équateur', CO: 'Colombie' }

function mapAlert(a: Alert, country: string): Notification {
  const isOOR = a.type === 'out_of_range'
  return {
    id:          `${country}-${a.id}`,
    rawId:       a.id,
    type:        isOOR ? 'iot' : 'alert',
    level:       isOOR ? 'critical' : 'important',
    title:       isOOR
      ? `Mesure hors plage — Entrepôt #${a.warehouse_id} · ${COUNTRY_LABELS[country] ?? country}`
      : `Lot expiré — Entrepôt #${a.warehouse_id} · ${COUNTRY_LABELS[country] ?? country}`,
    description: a.message,
    time:        timeAgo(a.triggered_at),
    country,
    warehouseId: a.warehouse_id,
    unread:      true,
  }
}

// ── Styles ───────────────────────────────────────────────────────────────────
const ICON_MAP: Record<NotifType, React.ElementType> = {
  alert: Package,
  iot:   ThermometerSun,
}

const ICON_STYLES: Record<NotifType, { bg: string; color: string }> = {
  alert: { bg: "#FAEEDA", color: "#854F0B" },
  iot:   { bg: "#FCEBEB", color: "#A32D2D" },
}

const LEVEL_STYLES: Record<NotifLevel, { bg: string; color: string; label: string }> = {
  critical:  { bg: "#FCEBEB", color: "#A32D2D", label: "Critique"  },
  important: { bg: "#FAEEDA", color: "#854F0B", label: "Important" },
  info:      { bg: "#E6F1FB", color: "#185FA5", label: "Info"      },
}

const FILTERS: { key: FilterKey; label: string; icon?: React.ElementType }[] = [
  { key: "all",    label: "Toutes"  },
  { key: "unread", label: "Non lues", icon: Circle       },
  { key: "alert",  label: "Lots",     icon: AlertTriangle },
  { key: "iot",    label: "IoT",      icon: Radio         },
]

// ── Sous-composants ──────────────────────────────────────────────────────────
function FilterButton({
  active, label, count, icon: Icon, onClick,
}: {
  active: boolean; label: string; count: number
  icon?: React.ElementType; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px", borderRadius: 999,
        border: active ? "0.5px solid #4a2810" : "0.5px solid #d0ccc5",
        background: active ? "#4a2810" : "#fff",
        color: active ? "#fff" : "#5a5650",
        fontSize: 11, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 5,
        transition: "all .12s", fontFamily: "inherit",
      }}
    >
      {Icon && <Icon size={12} aria-hidden="true" />}
      {label}
      <span style={{
        fontSize: 10,
        background: active ? "rgba(255,255,255,.25)" : "#e8e4dc",
        color: active ? "#fff" : "#5a5650",
        borderRadius: 999, padding: "1px 5px", minWidth: 16, textAlign: "center",
      }}>
        {count}
      </span>
    </button>
  )
}

function NotificationCard({
  notif, onMarkRead, onDismiss,
}: {
  notif: Notification
  onMarkRead: (id: string) => void
  onDismiss:  (id: string) => void
}) {
  const Icon       = ICON_MAP[notif.type]
  const iconStyle  = ICON_STYLES[notif.type]
  const levelStyle = LEVEL_STYLES[notif.level]

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #e0ddd7",
        borderLeft: notif.unread ? "3px solid #4a2810" : "0.5px solid #e0ddd7",
        borderRadius: 10, padding: "1rem",
        display: "flex", gap: 12, transition: "border-color .12s",
      }}
    >
      <div style={{ width: 7, flexShrink: 0, marginTop: 4 }}>
        {notif.unread && (
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4a2810" }} />
        )}
      </div>

      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: iconStyle.bg, color: iconStyle.color,
      }}>
        <Icon size={17} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#1c1a17" }}>{notif.title}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 999, fontWeight: 500,
              background: levelStyle.bg, color: levelStyle.color,
            }}>
              {levelStyle.label}
            </span>
            <span style={{ fontSize: 11, color: "#7a766f" }}>{notif.time}</span>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "#7a766f", lineHeight: 1.5, marginBottom: 8 }}>
          {notif.description}
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={() => onDismiss(notif.id)}
            style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 6,
              border: "0.5px solid #4a2810", background: "#4a2810",
              color: "#fff", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Résoudre
          </button>
          {notif.unread && (
            <button
              onClick={() => onMarkRead(notif.id)}
              style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 6,
                border: "0.5px solid #d0ccc5", background: "transparent",
                color: "#1c1a17", cursor: "pointer", fontFamily: "inherit", marginLeft: "auto",
              }}
            >
              Marquer lu
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page principale ──────────────────────────────────────────────────────────
const ALL_COUNTRIES = ['BR', 'EC', 'CO']

export default function NotificationsPage() {
  const { user } = useAuth()
  const isSiege = user?.role === 'siege' || user?.role === 'admin'
  const countries = isSiege
    ? ALL_COUNTRIES
    : user?.country_code ? [user.country_code] : ALL_COUNTRIES

  const [rawNotifs, setRawNotifs]   = useState<Notification[]>([])
  const [readIds,   setReadIds]     = useState<Set<string>>(new Set())
  const [dismissed, setDismissed]   = useState<Set<string>>(new Set())
  const [loading,   setLoading]     = useState(true)
  const [error,     setError]       = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all")

  const fetchAlerts = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const results = await Promise.allSettled(
        countries.map(c => getCountryAlerts(c).then(alerts => ({ alerts, country: c })))
      )
      const all: Notification[] = []
      results.forEach(r => {
        if (r.status === 'fulfilled') {
          r.value.alerts.forEach(a => all.push(mapAlert(a, r.value.country)))
        }
      })
      all.sort((a, b) =>
        new Date((b as any).triggered_at ?? 0).getTime() - new Date((a as any).triggered_at ?? 0).getTime()
      )
      setRawNotifs(all)
    } catch {
      setError('Impossible de charger les notifications')
    } finally {
      setLoading(false)
    }
  }, [countries.join(',')])  // eslint-disable-line

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  // Appliquer l'état lu/dismissed par dessus les données API
  const notifs = useMemo(() =>
    rawNotifs
      .filter(n => !dismissed.has(n.id))
      .map(n => ({ ...n, unread: !readIds.has(n.id) })),
    [rawNotifs, readIds, dismissed]
  )

  const counts = useMemo(() => ({
    all:    notifs.length,
    unread: notifs.filter(n => n.unread).length,
    alert:  notifs.filter(n => n.type === 'alert').length,
    iot:    notifs.filter(n => n.type === 'iot').length,
  }), [notifs])

  const filtered = useMemo(() => {
    if (activeFilter === 'all')    return notifs
    if (activeFilter === 'unread') return notifs.filter(n => n.unread)
    return notifs.filter(n => n.type === activeFilter)
  }, [notifs, activeFilter])

  const markAllRead = () => setReadIds(new Set(notifs.map(n => n.id)))
  const clearAll    = () => setDismissed(new Set(notifs.map(n => n.id)))
  const markRead    = (id: string) => setReadIds(prev => new Set([...prev, id]))
  const dismiss     = (id: string) => setDismissed(prev => new Set([...prev, id]))

  return (
    <div style={{ background: "#f4f2ef", padding: "1.25rem", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 500, color: "#1c1a17", margin: 0 }}>
            Notifications
            {counts.unread > 0 && (
              <span style={{ fontSize: 13, fontWeight: 400, color: "#7a766f" }}>
                {" "}· {counts.unread} non lue{counts.unread > 1 ? "s" : ""}
              </span>
            )}
          </h1>
          <div style={{ fontSize: 12, color: "#7a766f", marginTop: 2 }}>
            Alertes en temps réel — {countries.map(c => COUNTRY_LABELS[c]).join(', ')}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={fetchAlerts}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 11px", borderRadius: 7,
              border: "0.5px solid #d0ccc5", background: "#fff",
              fontSize: 12, cursor: "pointer", color: "#1c1a17", fontFamily: "inherit",
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin .8s linear infinite' : undefined }} />
            Actualiser
          </button>
          <button
            onClick={markAllRead}
            disabled={counts.unread === 0}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 11px", borderRadius: 7,
              border: "0.5px solid #d0ccc5", background: "#fff",
              fontSize: 12, cursor: counts.unread === 0 ? "default" : "pointer",
              color: "#1c1a17", fontFamily: "inherit",
              opacity: counts.unread === 0 ? 0.5 : 1,
            }}
          >
            <CheckCheck size={14} /> Tout marquer lu
          </button>
          <button
            onClick={clearAll}
            disabled={notifs.length === 0}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 11px", borderRadius: 7,
              border: "0.5px solid #F09595", background: "#FCEBEB",
              fontSize: 12, cursor: "pointer", color: "#A32D2D", fontFamily: "inherit",
              opacity: notifs.length === 0 ? 0.5 : 1,
            }}
          >
            <Trash2 size={14} /> Vider
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <FilterButton
            key={f.key}
            active={activeFilter === f.key}
            label={f.label}
            count={counts[f.key as keyof typeof counts] ?? 0}
            icon={f.icon}
            onClick={() => setActiveFilter(f.key)}
          />
        ))}
      </div>

      {/* État chargement */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              height: 90, borderRadius: 10, background: "#e8e4dc",
              animation: "pulse 1.5s ease-in-out infinite",
              opacity: 1 - i * 0.15,
            }} />
          ))}
        </div>
      )}

      {/* Erreur */}
      {!loading && error && (
        <div style={{
          padding: "1rem", borderRadius: 10, background: "#FCEBEB",
          border: "0.5px solid #F09595", fontSize: 13, color: "#A32D2D",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <AlertTriangle size={16} />
          {error}
          <button onClick={fetchAlerts} style={{ marginLeft: "auto", textDecoration: "underline", background: "none", border: "none", color: "#A32D2D", cursor: "pointer", fontSize: 12 }}>
            Réessayer
          </button>
        </div>
      )}

      {/* Liste */}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: "2rem", textAlign: "center", fontSize: 13,
              color: "#7a766f", background: "#fff", borderRadius: 10,
              border: "0.5px solid #e0ddd7",
            }}>
              <Bell size={20} style={{ marginBottom: 8, opacity: 0.4, display: "block", margin: "0 auto 8px" }} />
              {rawNotifs.length === 0
                ? "Aucune alerte active — tous les entrepôts sont conformes"
                : "Aucune notification dans cette catégorie"}
            </div>
          ) : (
            filtered.map(n => (
              <NotificationCard
                key={n.id}
                notif={n}
                onMarkRead={markRead}
                onDismiss={dismiss}
              />
            ))
          )}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}`}</style>
    </div>
  )
}
