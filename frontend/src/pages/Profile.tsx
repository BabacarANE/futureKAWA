import React, { useState } from "react";
import {
  MapPin,
  ShieldCheck,
  Activity,
  Clock,
  Laptop,
  Smartphone,
  Lock,
  Camera,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  LogIn,
  Settings as SettingsIcon,
} from "lucide-react";

/* ============================================================================
   FutureKawa — Profil utilisateur
   Sections : Avatar/Nom/Rôle/Pays · Statistiques · Activité récente ·
              Sécurité · Sessions ouvertes · Changer mot de passe
   ========================================================================= */

const ACTIVITY_LOG = [
  { icon: CheckCircle2, tone: "green", text: "Alerte #12 résolue — W-001 Brésil", time: "Il y a 22 min" },
  { icon: FileText, tone: "blue", text: "Export du rapport Analytics (PDF)", time: "Il y a 1h" },
  { icon: AlertTriangle, tone: "amber", text: "Seuil de température modifié — W-002", time: "Hier, 18:03" },
  { icon: LogIn, tone: "gray", text: "Connexion depuis macOS · Chrome", time: "Hier, 08:12" },
  { icon: SettingsIcon, tone: "gray", text: "Configuration MQTT mise à jour", time: "20/06, 14:45" },
];

const SESSIONS = [
  { icon: Laptop, device: "macOS · Chrome", ip: "192.168.1.10", since: "Cette session", current: true },
  { icon: Smartphone, device: "iOS · Safari", ip: "10.0.0.42", since: "Il y a 2h", current: false },
  { icon: Laptop, device: "Windows · Edge", ip: "10.0.1.88", since: "Il y a 1j", current: false },
];

const TONE_COLORS: Record<string, { bg: string; color: string }> = {
  green: { bg: "#EAF3DE", color: "#3B6D11" },
  amber: { bg: "#FAEEDA", color: "#854F0B" },
  blue: { bg: "#E6F1FB", color: "#185FA5" },
  gray: { bg: "#F1EFE8", color: "#5F5E5A" },
};

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
        padding: "1.25rem",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: "#1c1a17" }}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        background: "#faf8f5",
        border: "0.5px solid #e0ddd7",
        borderRadius: 9,
        padding: "0.875rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 600, color: "#1c1a17" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#7a766f", marginTop: 3 }}>{label}</div>
    </div>
  );
}

function GhostButton({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 7,
        fontSize: 12,
        cursor: "pointer",
        fontFamily: "inherit",
        border: danger ? "0.5px solid #F09595" : "0.5px solid #d0ccc5",
        background: danger ? "#FCEBEB" : "#fff",
        color: danger ? "#A32D2D" : "#1c1a17",
      }}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 8,
        fontSize: 12.5,
        cursor: "pointer",
        fontFamily: "inherit",
        border: "0.5px solid #1a2e1a",
        background: "#1a2e1a",
        color: "#fff",
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}

export default function ProfilePage() {
  const [showPwdForm, setShowPwdForm] = useState(false);

  return (
    <div style={{ background: "#f4f2ef", padding: "1.25rem", minHeight: "100%" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 19, fontWeight: 500, color: "#1c1a17", margin: 0 }}>
          Mon profil
        </h1>
        <div style={{ fontSize: 12, color: "#7a766f", marginTop: 2 }}>
          Informations personnelles, activité et sécurité du compte
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, alignItems: "start" }}>
        {/* Colonne gauche : identité + sécurité */}
        <div>
          <div
            style={{
              background: "#fff",
              border: "0.5px solid #e0ddd7",
              borderRadius: 10,
              padding: "1.5rem",
              textAlign: "center",
              marginBottom: 14,
            }}
          >
            <div style={{ position: "relative", display: "inline-block", marginBottom: 14 }}>
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #F1C9A0, #C9783F)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  fontWeight: 600,
                  margin: "0 auto",
                }}
              >
                A
              </div>
              <button
                aria-label="Changer la photo de profil"
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#1a2e1a",
                  border: "2px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Camera size={13} color="#fff" />
              </button>
            </div>

            <div style={{ fontSize: 17, fontWeight: 600, color: "#1c1a17" }}>Admin Siège</div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                padding: "2px 9px",
                borderRadius: 999,
                background: "#FCEBEB",
                color: "#A32D2D",
                fontWeight: 500,
                marginTop: 6,
              }}
            >
              <ShieldCheck size={11} /> Super Admin
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 16,
                paddingTop: 16,
                borderTop: "0.5px solid #f0ece8",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#5a5650" }}>
                <Mail size={14} /> admin@futurekawa.com
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#5a5650" }}>
                <MapPin size={14} /> Siège — Paris, France
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#5a5650" }}>
                <Calendar size={14} /> Membre depuis mars 2024
              </div>
            </div>
          </div>

          <Card title="Sécurité">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: "#5a5650" }}>Authentification 2FA</span>
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "#EAF3DE",
                    color: "#3B6D11",
                    fontWeight: 500,
                  }}
                >
                  Activée
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: "#5a5650" }}>Dernier changement de mot de passe</span>
                <span style={{ color: "#1c1a17" }}>Il y a 38 jours</span>
              </div>

              {!showPwdForm ? (
                <GhostButton onClick={() => setShowPwdForm(true)}>
                  <Lock size={13} /> Changer le mot de passe
                </GhostButton>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginTop: 4,
                    padding: 12,
                    background: "#faf8f5",
                    borderRadius: 8,
                    border: "0.5px solid #e0ddd7",
                  }}
                >
                  <input
                    type="password"
                    placeholder="Mot de passe actuel"
                    style={{
                      padding: "7px 9px",
                      borderRadius: 7,
                      border: "0.5px solid #d0ccc5",
                      fontSize: 12,
                      fontFamily: "inherit",
                    }}
                  />
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    style={{
                      padding: "7px 9px",
                      borderRadius: 7,
                      border: "0.5px solid #d0ccc5",
                      fontSize: 12,
                      fontFamily: "inherit",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                    <PrimaryButton onClick={() => setShowPwdForm(false)}>Confirmer</PrimaryButton>
                    <GhostButton onClick={() => setShowPwdForm(false)}>Annuler</GhostButton>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Sessions ouvertes">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SESSIONS.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: i === SESSIONS.length - 1 ? 0 : 10,
                    borderBottom: i === SESSIONS.length - 1 ? "none" : "0.5px solid #f0ece8",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <s.icon size={15} color="#5a5650" />
                    <div>
                      <div style={{ fontSize: 12.5, color: "#1c1a17" }}>{s.device}</div>
                      <div style={{ fontSize: 11, color: "#7a766f" }}>
                        {s.ip} · {s.since}
                      </div>
                    </div>
                  </div>
                  {!s.current && (
                    <button
                      style={{
                        fontSize: 11,
                        padding: "3px 9px",
                        borderRadius: 6,
                        border: "0.5px solid #F09595",
                        background: "#FCEBEB",
                        color: "#A32D2D",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Révoquer
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Colonne droite : stats + activité */}
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <StatTile value="247" label="Alertes traitées" />
            <StatTile value="18" label="Rapports exportés" />
            <StatTile value="3" label="Entrepôts gérés" />
            <StatTile value="94%" label="Taux de résolution" />
          </div>

          <Card
            title="Activité récente"
            action={<GhostButton>Voir tout l'historique</GhostButton>}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              {ACTIVITY_LOG.map((a, i) => {
                const tone = TONE_COLORS[a.tone];
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: i === ACTIVITY_LOG.length - 1 ? "none" : "0.5px solid #f0ece8",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: tone.bg,
                        color: tone.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <a.icon size={14} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#1c1a17" }}>{a.text}</div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#7a766f",
                          marginTop: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Clock size={10} /> {a.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Pays et entrepôts gérés">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { country: "Brésil", warehouse: "W-001" },
                { country: "Colombie", warehouse: "W-002" },
                { country: "Équateur", warehouse: "W-003" },
              ].map((w) => (
                <div
                  key={w.warehouse}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 9,
                    border: "0.5px solid #e0ddd7",
                    background: "#faf8f5",
                    fontSize: 12.5,
                  }}
                >
                  <MapPin size={13} color="#854F0B" />
                  <span style={{ color: "#1c1a17", fontWeight: 500 }}>{w.warehouse}</span>
                  <span style={{ color: "#7a766f" }}>· {w.country}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}