import React, { useState } from "react";
import {
  Users,
  Shield,
  Key,
  MapPin,
  Warehouse,
  Settings as SettingsIcon,
  Terminal,
  ListChecks,
  Laptop,
  Plus,
  MoreHorizontal,
  Check,
  Save,
  LogOut,
  Smartphone,
} from "lucide-react";

/* ============================================================================
   FutureKawa — Panneau d'administration
   Sections : Utilisateurs · Rôles · Permissions · Pays · Entrepôts ·
              Configuration · Logs · Audit · Sessions
   Design system identique à la référence HTML fournie (accent vert #1a2e1a)
   ========================================================================= */

type SectionKey =
  | "users"
  | "roles"
  | "perms"
  | "countries"
  | "warehouses"
  | "config"
  | "logs"
  | "audit"
  | "sessions";

const NAV_GROUPS: { label: string; items: { key: SectionKey; label: string; icon: React.ElementType }[] }[] = [
  {
    label: "Gestion",
    items: [
      { key: "users", label: "Utilisateurs", icon: Users },
      { key: "roles", label: "Rôles", icon: Shield },
      { key: "perms", label: "Permissions", icon: Key },
      { key: "countries", label: "Pays", icon: MapPin },
      { key: "warehouses", label: "Entrepôts", icon: Warehouse },
    ],
  },
  {
    label: "Système",
    items: [
      { key: "config", label: "Configuration", icon: SettingsIcon },
      { key: "logs", label: "Logs", icon: Terminal },
      { key: "audit", label: "Audit", icon: ListChecks },
      { key: "sessions", label: "Sessions", icon: Laptop },
    ],
  },
];

/* ------------------------------- Données mock ----------------------------- */

const USERS = [
  { initials: "AS", name: "Admin Siège", email: "admin@futurekawa.com", role: "Super Admin", roleBadge: "red", status: "Actif", statusBadge: "green", last: "Il y a 4 min" },
  { initials: "CM", name: "Carlos Mendez", email: "c.mendez@futurekawa.com", role: "Opérateur", roleBadge: "blue", status: "Actif", statusBadge: "green", last: "Il y a 2h" },
  { initials: "LF", name: "Lucie Ferreira", email: "l.ferreira@futurekawa.com", role: "Analyste", roleBadge: "amber", status: "Inactif", statusBadge: "amber", last: "Il y a 3j" },
  { initials: "JK", name: "James Kimani", email: "j.kimani@futurekawa.com", role: "Visiteur", roleBadge: "gray", status: "Actif", statusBadge: "green", last: "Il y a 1h" },
];

const ROLES = [
  { name: "Super Admin", users: 1, desc: "Accès complet, gestion système et utilisateurs", badge: "red" },
  { name: "Opérateur", users: 4, desc: "Gestion des entrepôts, lots et alertes", badge: "blue" },
  { name: "Analyste", users: 5, desc: "Lecture, export de données et rapports", badge: "amber" },
  { name: "Visiteur", users: 2, desc: "Lecture seule, sans export", badge: "gray" },
];

const PERMISSIONS_ROWS: [string, boolean, boolean, boolean, boolean][] = [
  ["Voir dashboard", true, true, true, true],
  ["Gérer alertes", true, true, false, false],
  ["Modifier lots", true, true, false, false],
  ["Voir analytics", true, true, true, false],
  ["Export données", true, true, true, false],
  ["Admin utilisateurs", true, false, false, false],
  ["Config système", true, false, false, false],
];

const COUNTRIES = [
  { name: "Brésil", code: "BR", warehouses: 2, status: "Actif", badge: "green" },
  { name: "Colombie", code: "CO", warehouses: 1, status: "Actif", badge: "green" },
  { name: "Équateur", code: "EC", warehouses: 1, status: "Partiel", badge: "amber" },
];

const WAREHOUSES = [
  { name: "W-001", country: "Brésil", capacity: 2000, status: "Online", statusBadge: "green", alerts: 2, alertsBadge: "amber" },
  { name: "W-002", country: "Colombie", capacity: 1200, status: "Dégradé", statusBadge: "amber", alerts: 4, alertsBadge: "red" },
  { name: "W-003", country: "Équateur", capacity: 900, status: "Offline", statusBadge: "gray", alerts: 1, alertsBadge: "blue" },
];

const CONFIG_FIELDS = [
  { label: "Température max (°C)", value: "25" },
  { label: "Humidité max (%)", value: "75" },
  { label: "Intervalle IoT (s)", value: "30" },
  { label: "Rétention logs (jours)", value: "90" },
  { label: "Email notifications", value: "alertes@futurekawa.com" },
];

const LOGS: [string, string, string, string][] = [
  ["2026-06-23 08:12:33", "INFO", "Démarrage du service MQTT broker", "blue"],
  ["2026-06-23 08:14:07", "WARN", "Capteur S-9 — délai de réponse élevé (1240ms)", "amber"],
  ["2026-06-23 08:17:22", "ERROR", "Connexion W-003 perdue — timeout 30s", "red"],
  ["2026-06-23 08:19:05", "INFO", "Sauvegarde automatique déclenchée", "blue"],
  ["2026-06-23 08:22:41", "INFO", "Export analytics généré (user: admin)", "blue"],
  ["2026-06-23 08:25:14", "WARN", "Tentative de connexion échouée — 3 essais", "amber"],
];

const AUDIT_LOG = [
  { date: "23/06 08:22", initials: "AS", name: "Admin Siège", action: "Export", actionBadge: "blue", target: "Analytics PDF" },
  { date: "23/06 07:54", initials: "CM", name: "C. Mendez", action: "Résolution", actionBadge: "green", target: "Alerte #12 — W-001" },
  { date: "22/06 18:03", initials: "AS", name: "Admin Siège", action: "Modification", actionBadge: "amber", target: "Seuil temp. W-002" },
  { date: "22/06 15:30", initials: "JK", name: "J. Kimani", action: "Connexion", actionBadge: "gray", target: "Dashboard" },
];

const SESSIONS = [
  { initials: "AS", name: "Admin Siège", device: "macOS · Chrome", deviceIcon: "laptop", ip: "192.168.1.10", since: "Il y a 4 min" },
  { initials: "CM", name: "C. Mendez", device: "iOS · Safari", deviceIcon: "mobile", ip: "10.0.0.42", since: "Il y a 2h" },
  { initials: "JK", name: "J. Kimani", device: "Windows · Edge", deviceIcon: "laptop", ip: "10.0.1.88", since: "Il y a 1h" },
];

/* --------------------------------- Styles communs -------------------------- */

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  green: { bg: "#EAF3DE", color: "#3B6D11" },
  amber: { bg: "#FAEEDA", color: "#854F0B" },
  gray: { bg: "#F1EFE8", color: "#5F5E5A" },
  blue: { bg: "#E6F1FB", color: "#185FA5" },
  red: { bg: "#FCEBEB", color: "#A32D2D" },
};

function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  const s = BADGE_COLORS[tone] || BADGE_COLORS.gray;
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 7px",
        borderRadius: 999,
        fontWeight: 500,
        display: "inline-block",
        background: s.bg,
        color: s.color,
      }}
    >
      {children}
    </span>
  );
}

function Avatar({ initials, size = 26 }: { initials: string; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#E6F1FB",
        color: "#185FA5",
        fontSize: size <= 20 ? 9 : 10,
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 6,
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #e0ddd7",
        borderRadius: 10,
        padding: "1rem",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: "#1c1a17" }}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function GhostButton({
  children,
  primary,
  danger,
  onClick,
  small,
}: {
  children: React.ReactNode;
  primary?: boolean;
  danger?: boolean;
  small?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: small ? "3px 8px" : "5px 12px",
        borderRadius: 7,
        fontSize: small ? 11 : 12,
        cursor: "pointer",
        fontFamily: "inherit",
        border: danger ? "0.5px solid #F09595" : primary ? "0.5px solid #1a2e1a" : "0.5px solid #d0ccc5",
        background: danger ? "#FCEBEB" : primary ? "#1a2e1a" : "#fff",
        color: danger ? "#A32D2D" : primary ? "#fff" : "#1c1a17",
      }}
    >
      {children}
    </button>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "6px 8px",
        fontSize: 11,
        fontWeight: 500,
        color: "#7a766f",
        borderBottom: "0.5px solid #e0ddd7",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  muted,
  style,
}: {
  children: React.ReactNode;
  muted?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <td
      style={{
        padding: 8,
        borderBottom: "0.5px solid #f0ece8",
        color: muted ? "#7a766f" : "#1c1a17",
        verticalAlign: "middle",
        ...style,
      }}
    >
      {children}
    </td>
  );
}

function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead>
        <tr>
          {head.map((h) => (
            <Th key={h}>{h}</Th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <tr
      onMouseEnter={(e) => (e.currentTarget.style.background = "#faf8f5")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </tr>
  );
}

/* --------------------------------- Sections -------------------------------- */

function UsersSection() {
  return (
    <Card title="Utilisateurs" action={<GhostButton primary><Plus size={13} /> Inviter</GhostButton>}>
      <Table head={["Nom", "Email", "Rôle", "Statut", "Dernière connexion", ""]}>
        {USERS.map((u) => (
          <Row key={u.email}>
            <Td>
              <Avatar initials={u.initials} />
              {u.name}
            </Td>
            <Td muted>{u.email}</Td>
            <Td>
              <Badge tone={u.roleBadge}>{u.role}</Badge>
            </Td>
            <Td>
              <Badge tone={u.statusBadge}>{u.status}</Badge>
            </Td>
            <Td muted>{u.last}</Td>
            <Td>
              <GhostButton small>
                <MoreHorizontal size={13} />
              </GhostButton>
            </Td>
          </Row>
        ))}
      </Table>
    </Card>
  );
}

function RolesSection() {
  return (
    <Card title="Rôles" action={<GhostButton primary><Plus size={13} /> Nouveau rôle</GhostButton>}>
      <Table head={["Rôle", "Utilisateurs", "Description", ""]}>
        {ROLES.map((r) => (
          <Row key={r.name}>
            <Td>
              <Badge tone={r.badge}>{r.name}</Badge>
            </Td>
            <Td muted>{r.users}</Td>
            <Td muted>{r.desc}</Td>
            <Td>
              <GhostButton small>
                <MoreHorizontal size={13} />
              </GhostButton>
            </Td>
          </Row>
        ))}
      </Table>
    </Card>
  );
}

function PermissionsSection() {
  const cols = ["Super Admin", "Opérateur", "Analyste", "Visiteur"];
  return (
    <Card title="Permissions">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "150px repeat(4, 1fr)",
          gap: 4,
          fontSize: 11,
        }}
      >
        <div />
        {cols.map((c) => (
          <div
            key={c}
            style={{ fontWeight: 500, color: "#7a766f", padding: 4, textAlign: "center" }}
          >
            {c}
          </div>
        ))}
        {PERMISSIONS_ROWS.map(([label, ...values]) => (
          <React.Fragment key={label as string}>
            <div
              style={{
                fontSize: 12,
                color: "#1c1a17",
                padding: "4px 0",
                display: "flex",
                alignItems: "center",
              }}
            >
              {label}
            </div>
            {values.map((on, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}
              >
                {on ? (
                  <div
                    aria-label="Autorisé"
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      background: "#1a2e1a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={10} color="#fff" />
                  </div>
                ) : (
                  <div
                    aria-label="Refusé"
                    style={{ width: 16, height: 16, borderRadius: 4, border: "1.5px solid #d0ccc5" }}
                  />
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
}

function CountriesSection() {
  return (
    <Card title="Pays" action={<GhostButton primary><Plus size={13} /> Ajouter</GhostButton>}>
      <Table head={["Pays", "Code", "Entrepôts", "Statut"]}>
        {COUNTRIES.map((c) => (
          <Row key={c.code}>
            <Td>{c.name}</Td>
            <Td muted>{c.code}</Td>
            <Td muted>{c.warehouses}</Td>
            <Td>
              <Badge tone={c.badge}>{c.status}</Badge>
            </Td>
          </Row>
        ))}
      </Table>
    </Card>
  );
}

function WarehousesSection() {
  return (
    <Card title="Entrepôts" action={<GhostButton primary><Plus size={13} /> Ajouter</GhostButton>}>
      <Table head={["Entrepôt", "Pays", "Capacité", "Statut", "Alertes"]}>
        {WAREHOUSES.map((w) => (
          <Row key={w.name}>
            <Td>{w.name}</Td>
            <Td muted>{w.country}</Td>
            <Td muted>{w.capacity}</Td>
            <Td>
              <Badge tone={w.statusBadge}>{w.status}</Badge>
            </Td>
            <Td>
              <Badge tone={w.alertsBadge}>{w.alerts}</Badge>
            </Td>
          </Row>
        ))}
      </Table>
    </Card>
  );
}

function ConfigSection() {
  const [values, setValues] = useState(CONFIG_FIELDS.map((f) => f.value));
  return (
    <Card
      title="Configuration système"
      action={
        <GhostButton primary>
          <Save size={13} /> Sauvegarder
        </GhostButton>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CONFIG_FIELDS.map((f, i) => (
          <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ fontSize: 12, color: "#7a766f", width: 180, flexShrink: 0 }}>
              {f.label}
            </label>
            <input
              value={values[i]}
              onChange={(e) => {
                const next = [...values];
                next[i] = e.target.value;
                setValues(next);
              }}
              style={{
                flex: 1,
                padding: "5px 8px",
                borderRadius: 7,
                border: "0.5px solid #d0ccc5",
                fontSize: 12,
                background: "#fff",
                color: "#1c1a17",
                fontFamily: "inherit",
              }}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

function LogsSection() {
  return (
    <Card
      title="Logs système"
      action={
        <select
          style={{
            fontSize: 12,
            padding: "4px 8px",
            borderRadius: 7,
            border: "0.5px solid #d0ccc5",
            background: "#fff",
            color: "#1c1a17",
            fontFamily: "inherit",
          }}
        >
          <option>Tous</option>
          <option>Erreurs</option>
          <option>Warnings</option>
          <option>Info</option>
        </select>
      }
    >
      <div>
        {LOGS.map(([time, level, msg, tone], i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              padding: "7px 0",
              borderBottom: i === LOGS.length - 1 ? "none" : "0.5px solid #f0ece8",
              alignItems: "flex-start",
              fontSize: 12,
            }}
          >
            <span
              style={{
                color: "#7a766f",
                whiteSpace: "nowrap",
                fontSize: 11,
                minWidth: 130,
                fontFamily: "monospace",
              }}
            >
              {time}
            </span>
            <span style={{ flexShrink: 0, height: "fit-content" }}>
              <Badge tone={tone}>{level}</Badge>
            </span>
            <span style={{ color: "#1c1a17", flex: 1 }}>{msg}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AuditSection() {
  return (
    <Card title="Journal d'audit">
      <Table head={["Date", "Utilisateur", "Action", "Cible"]}>
        {AUDIT_LOG.map((a, i) => (
          <Row key={i}>
            <Td muted style={{ fontSize: 11 }}>
              {a.date}
            </Td>
            <Td>
              <Avatar initials={a.initials} size={20} />
              {a.name}
            </Td>
            <Td>
              <Badge tone={a.actionBadge}>{a.action}</Badge>
            </Td>
            <Td muted>{a.target}</Td>
          </Row>
        ))}
      </Table>
    </Card>
  );
}

function SessionsSection() {
  return (
    <Card
      title="Sessions actives"
      action={
        <GhostButton danger>
          <LogOut size={13} /> Révoquer toutes
        </GhostButton>
      }
    >
      <Table head={["Utilisateur", "Appareil", "IP", "Depuis", ""]}>
        {SESSIONS.map((s, i) => (
          <Row key={i}>
            <Td>
              <Avatar initials={s.initials} />
              {s.name}
            </Td>
            <Td>
              {s.deviceIcon === "laptop" ? (
                <Laptop size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />
              ) : (
                <Smartphone size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />
              )}
              {s.device}
            </Td>
            <Td muted>{s.ip}</Td>
            <Td muted>{s.since}</Td>
            <Td>
              <GhostButton small>Révoquer</GhostButton>
            </Td>
          </Row>
        ))}
      </Table>
    </Card>
  );
}

const SECTION_COMPONENTS: Record<SectionKey, React.ElementType> = {
  users: UsersSection,
  roles: RolesSection,
  perms: PermissionsSection,
  countries: CountriesSection,
  warehouses: WarehousesSection,
  config: ConfigSection,
  logs: LogsSection,
  audit: AuditSection,
  sessions: SessionsSection,
};

/* --------------------------------- Page principale ------------------------- */

export default function AdministrationPage() {
  const [active, setActive] = useState<SectionKey>("users");
  const ActiveSection = SECTION_COMPONENTS[active];

  return (
    <div style={{ background: "#f4f2ef", padding: "1.25rem", display: "flex", gap: 14, minHeight: "100%" }}>
      {/* Sidebar de sections */}
      <nav
        aria-label="Sections administration"
        style={{ width: 180, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}
      >
        {NAV_GROUPS.map((group) => (
          <React.Fragment key={group.label}>
            <div
              style={{
                fontSize: 10,
                color: "#7a766f",
                padding: "10px 8px 4px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {group.label}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    borderRadius: 7,
                    fontSize: 12,
                    cursor: "pointer",
                    color: isActive ? "#fff" : "#7a766f",
                    border: "none",
                    background: isActive ? "#1a2e1a" : "transparent",
                    fontFamily: "inherit",
                    width: "100%",
                    textAlign: "left",
                    transition: "all .12s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#e8e4dc";
                      e.currentTarget.style.color = "#1c1a17";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#7a766f";
                    }
                  }}
                >
                  <Icon size={14} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* Contenu principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Stats globales (toujours visibles) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {[
            { n: 12, l: "Utilisateurs actifs" },
            { n: 4, l: "Rôles définis" },
            { n: 3, l: "Sessions ouvertes" },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                background: "#fff",
                border: "0.5px solid #e0ddd7",
                borderRadius: 9,
                padding: "0.875rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 500, color: "#1c1a17" }}>{s.n}</div>
              <div style={{ fontSize: 11, color: "#7a766f", marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <ActiveSection />
      </div>
    </div>
  );
}