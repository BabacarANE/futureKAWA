import React, { useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Mail,
  Radio,
  Settings as SettingsIcon,
  Info,
  Circle,
} from "lucide-react";

/* ============================================================================
   FutureKawa — Centre de notifications
   Design system repris de la page Entrepôts :
   - Fond page : #f4f2ef
   - Cartes : #fff, bordure 0.5px #e0ddd7, radius 10px
   - Accent actif (filtres / bouton primaire) : vert foncé #1a2e1a
   - Badges niveau : critique (rouge), important (ambre), info (bleu), ok (vert)
   ========================================================================= */

type NotifType = "alert" | "mail" | "iot" | "system" | "info";
type NotifLevel = "critical" | "important" | "info" | "ok";

interface Notification {
  id: number;
  type: NotifType;
  level: NotifLevel;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  actions: string[];
}

type FilterKey = "all" | "unread" | "alert" | "mail" | "iot" | "system";

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "alert",
    level: "critical",
    title: "Température critique — W-002 Colombie",
    description:
      "Le capteur S-3 relève 28.4°C dans la zone B, au-dessus du seuil configuré de 25°C. Vérifiez la climatisation immédiatement.",
    time: "il y a 3 min",
    unread: true,
    actions: ["Voir l'alerte", "Résoudre", "Notifier"],
  },
  {
    id: 2,
    type: "iot",
    level: "important",
    title: "Capteur S-9 hors ligne — W-003 Équateur",
    description:
      "Aucune donnée reçue depuis 47 minutes. Batterie faible (2.8V). Un technicien doit intervenir.",
    time: "il y a 12 min",
    unread: true,
    actions: ["Diagnostiquer", "Planifier intervention"],
  },
  {
    id: 3,
    type: "mail",
    level: "info",
    title: "Rapport hebdomadaire envoyé",
    description:
      "Le rapport de supervision du 17 au 23 juin a été généré et envoyé à 4 destinataires : direction@futurekawa.com, ops@futurekawa.com…",
    time: "il y a 28 min",
    unread: true,
    actions: ["Voir le rapport", "Télécharger PDF"],
  },
  {
    id: 4,
    type: "alert",
    level: "important",
    title: "Humidité élevée — W-001 Brésil",
    description:
      "Zone C : 79% d'humidité relative, seuil à 75%. Le lot LOT-88 pourrait être affecté si la situation persiste.",
    time: "il y a 1h",
    unread: false,
    actions: ["Voir l'alerte", "Résoudre"],
  },
  {
    id: 5,
    type: "system",
    level: "ok",
    title: "Sauvegarde automatique réussie",
    description:
      "Sauvegarde complète de la base de données effectuée avec succès à 03:00. Taille : 2.4 GB. Stocké sur S3 us-east-1.",
    time: "il y a 4h",
    unread: false,
    actions: ["Voir les logs"],
  },
  {
    id: 6,
    type: "iot",
    level: "info",
    title: "Nouveau capteur enregistré — W-001",
    description:
      "Le capteur S-12 (température/humidité) a été détecté et enregistré automatiquement. Calibration en cours.",
    time: "il y a 6h",
    unread: false,
    actions: ["Configurer", "Ignorer"],
  },
  {
    id: 7,
    type: "system",
    level: "important",
    title: "Mise à jour système disponible",
    description:
      "FutureKawa v2.4.1 est disponible. Corrections de sécurité critiques et nouvelles fonctionnalités analytics. Redémarrage requis.",
    time: "il y a 8h",
    unread: true,
    actions: ["Mettre à jour", "Reporter"],
  },
  {
    id: 8,
    type: "mail",
    level: "info",
    title: "Invitation partagée — rapport Colombie",
    description:
      'Carlos Mendez a partagé le rapport "Audit Q2 — W-002" avec vous. Consultez-le dans Documents.',
    time: "Hier, 16:42",
    unread: false,
    actions: ["Ouvrir", "Télécharger"],
  },
];

const ICON_MAP: Record<NotifType, React.ElementType> = {
  alert: AlertTriangle,
  mail: Mail,
  iot: Radio,
  system: SettingsIcon,
  info: Info,
};

const ICON_STYLES: Record<NotifType, { bg: string; color: string }> = {
  alert: { bg: "#FCEBEB", color: "#A32D2D" },
  mail: { bg: "#E6F1FB", color: "#185FA5" },
  iot: { bg: "#E1F5EE", color: "#0F6E56" },
  system: { bg: "#F1EFE8", color: "#5F5E5A" },
  info: { bg: "#FAEEDA", color: "#854F0B" },
};

const LEVEL_STYLES: Record<NotifLevel, { bg: string; color: string; label: string }> = {
  critical: { bg: "#FCEBEB", color: "#A32D2D", label: "Critique" },
  important: { bg: "#FAEEDA", color: "#854F0B", label: "Important" },
  info: { bg: "#E6F1FB", color: "#185FA5", label: "Info" },
  ok: { bg: "#EAF3DE", color: "#3B6D11", label: "OK" },
};

const FILTERS: { key: FilterKey; label: string; icon?: React.ElementType }[] = [
  { key: "all", label: "Toutes" },
  { key: "unread", label: "Non lues", icon: Circle },
  { key: "alert", label: "Alertes", icon: AlertTriangle },
  { key: "mail", label: "Emails", icon: Mail },
  { key: "iot", label: "IoT", icon: Radio },
  { key: "system", label: "Système", icon: SettingsIcon },
];

/* ----------------------------- Sous-composants ---------------------------- */

function FilterButton({
  active,
  label,
  count,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  icon?: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="fb"
      style={{
        padding: "5px 14px",
        borderRadius: 999,
        border: active ? "0.5px solid #1a2e1a" : "0.5px solid #d0ccc5",
        background: active ? "#1a2e1a" : "#fff",
        color: active ? "#fff" : "#5a5650",
        fontSize: 11,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5,
        transition: "all .12s",
        fontFamily: "inherit",
      }}
    >
      {Icon && <Icon size={12} aria-hidden="true" />}
      {label}
      <span
        style={{
          fontSize: 10,
          background: active ? "rgba(255,255,255,.25)" : "#e8e4dc",
          color: active ? "#fff" : "#5a5650",
          borderRadius: 999,
          padding: "1px 5px",
          minWidth: 16,
          textAlign: "center",
        }}
      >
        {count}
      </span>
    </button>
  );
}

function NotificationCard({
  notif,
  onAction,
}: {
  notif: Notification;
  onAction: (id: number, action: string) => void;
}) {
  const Icon = ICON_MAP[notif.type];
  const iconStyle = ICON_STYLES[notif.type];
  const levelStyle = LEVEL_STYLES[notif.level];

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #e0ddd7",
        borderLeft: notif.unread ? "3px solid #1a2e1a" : "0.5px solid #e0ddd7",
        borderRadius: 10,
        padding: "1rem",
        display: "flex",
        gap: 12,
        transition: "border-color .12s",
      }}
      onMouseEnter={(e) => {
        if (!notif.unread) e.currentTarget.style.borderColor = "#b0aca4";
      }}
      onMouseLeave={(e) => {
        if (!notif.unread) e.currentTarget.style.borderColor = "#e0ddd7";
      }}
    >
      <div style={{ width: 7, flexShrink: 0, marginTop: 4 }}>
        {notif.unread && (
          <div
            aria-label="Non lue"
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#1a2e1a",
            }}
          />
        )}
      </div>

      <div
        aria-hidden="true"
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: iconStyle.bg,
          color: iconStyle.color,
        }}
      >
        <Icon size={17} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: "#1c1a17" }}>
            {notif.title}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span
              style={{
                fontSize: 10,
                padding: "2px 7px",
                borderRadius: 999,
                fontWeight: 500,
                background: levelStyle.bg,
                color: levelStyle.color,
              }}
            >
              {levelStyle.label}
            </span>
            <span style={{ fontSize: 11, color: "#7a766f" }}>{notif.time}</span>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "#7a766f", lineHeight: 1.5, marginBottom: 8 }}>
          {notif.description}
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {notif.actions.map((action, i) => (
            <button
              key={action}
              onClick={() => onAction(notif.id, action)}
              style={{
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 6,
                border: i === 0 ? "0.5px solid #1a2e1a" : "0.5px solid #d0ccc5",
                background: i === 0 ? "#1a2e1a" : "transparent",
                color: i === 0 ? "#fff" : "#1c1a17",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {action}
            </button>
          ))}
          {notif.unread && (
            <button
              onClick={() => onAction(notif.id, "read")}
              style={{
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 6,
                border: "0.5px solid #d0ccc5",
                background: "transparent",
                color: "#1c1a17",
                cursor: "pointer",
                fontFamily: "inherit",
                marginLeft: "auto",
              }}
            >
              Marquer lu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Page principale ------------------------ */

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const counts = useMemo(
    () => ({
      all: notifs.length,
      unread: notifs.filter((n) => n.unread).length,
      alert: notifs.filter((n) => n.type === "alert").length,
      mail: notifs.filter((n) => n.type === "mail").length,
      iot: notifs.filter((n) => n.type === "iot").length,
      system: notifs.filter((n) => n.type === "system").length,
    }),
    [notifs]
  );

  const filtered = useMemo(() => {
    if (activeFilter === "all") return notifs;
    if (activeFilter === "unread") return notifs.filter((n) => n.unread);
    return notifs.filter((n) => n.type === activeFilter);
  }, [notifs, activeFilter]);

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function clearAll() {
    setNotifs([]);
  }

  function handleAction(id: number, action: string) {
    if (action === "read") {
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
    } else if (action === "Résoudre" || action === "Ignorer") {
      setNotifs((prev) => prev.filter((n) => n.id !== id));
    }
  }

  return (
    <div style={{ background: "#f4f2ef", padding: "1.25rem", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 500, color: "#1c1a17", margin: 0 }}>
            Notifications{" "}
            {counts.unread > 0 && (
              <span style={{ fontSize: 13, fontWeight: 400, color: "#7a766f" }}>
                · {counts.unread} non lue{counts.unread > 1 ? "s" : ""}
              </span>
            )}
          </h1>
          <div style={{ fontSize: 12, color: "#7a766f", marginTop: 2 }}>
            Centre de messages et alertes
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={markAllRead}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 11px",
              borderRadius: 7,
              border: "0.5px solid #d0ccc5",
              background: "#fff",
              fontSize: 12,
              cursor: "pointer",
              color: "#1c1a17",
              fontFamily: "inherit",
            }}
          >
            <CheckCheck size={14} aria-hidden="true" /> Tout marquer lu
          </button>
          <button
            onClick={clearAll}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 11px",
              borderRadius: 7,
              border: "0.5px solid #F09595",
              background: "#FCEBEB",
              fontSize: 12,
              cursor: "pointer",
              color: "#A32D2D",
              fontFamily: "inherit",
            }}
          >
            <Trash2 size={14} aria-hidden="true" /> Vider
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <FilterButton
            key={f.key}
            active={activeFilter === f.key}
            label={f.label}
            count={counts[f.key]}
            icon={f.icon}
            onClick={() => setActiveFilter(f.key)}
          />
        ))}
      </div>

      {/* Liste */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontSize: 13,
              color: "#7a766f",
              background: "#fff",
              borderRadius: 10,
              border: "0.5px solid #e0ddd7",
            }}
          >
            <Bell size={20} style={{ marginBottom: 8, opacity: 0.4 }} />
            <div>Aucune notification dans cette catégorie</div>
          </div>
        ) : (
          filtered.map((n) => (
            <NotificationCard key={n.id} notif={n} onAction={handleAction} />
          ))
        )}
      </div>
    </div>
  );
}