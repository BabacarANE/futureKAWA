import React, { useState } from "react";
import {
  User,
  Building2,
  ShieldCheck,
  Bell,
  Plug,
  Radio,
  Database,
  Mail,
  Palette,
  Globe,
  Archive,
  Save,
  Check,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Download,
  Upload,
  Sun,
  Moon,
  Smartphone,
  Laptop,
} from "lucide-react";

/* ============================================================================
   FutureKawa — Paramètres (Settings) premium
   Sections : Profil · Entreprise · Sécurité · Notifications · API ·
              MQTT · Base de données · Emails · Thème · Langue · Sauvegardes
   ========================================================================= */

type SectionKey =
  | "profile"
  | "company"
  | "security"
  | "notifications"
  | "api"
  | "mqtt"
  | "database"
  | "emails"
  | "theme"
  | "language"
  | "backups";

const NAV_GROUPS: { label: string; items: { key: SectionKey; label: string; icon: React.ElementType }[] }[] = [
  {
    label: "Compte",
    items: [
      { key: "profile", label: "Profil", icon: User },
      { key: "company", label: "Entreprise", icon: Building2 },
      { key: "security", label: "Sécurité", icon: ShieldCheck },
      { key: "notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Intégrations",
    items: [
      { key: "api", label: "API", icon: Plug },
      { key: "mqtt", label: "MQTT", icon: Radio },
      { key: "database", label: "Base de données", icon: Database },
      { key: "emails", label: "Emails", icon: Mail },
    ],
  },
  {
    label: "Préférences",
    items: [
      { key: "theme", label: "Thème", icon: Palette },
      { key: "language", label: "Langue", icon: Globe },
      { key: "backups", label: "Sauvegardes", icon: Archive },
    ],
  },
];

/* --------------------------------- Primitives ------------------------------ */

function PageCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
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
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#1c1a17" }}>{title}</div>
          {description && (
            <div style={{ fontSize: 12, color: "#7a766f", marginTop: 2 }}>{description}</div>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, color: "#5a5650", fontWeight: 500 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: "#7a766f" }}>{hint}</div>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 7,
  border: "0.5px solid #d0ccc5",
  fontSize: 13,
  background: "#fff",
  color: "#1c1a17",
  fontFamily: "inherit",
  width: "100%",
};

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

function SelectInput({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} style={{ ...inputStyle, ...props.style }}>
      {children}
    </select>
  );
}

function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        borderRadius: 7,
        fontSize: 12,
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
        padding: "7px 14px",
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 38,
        height: 22,
        borderRadius: 999,
        background: checked ? "#1a2e1a" : "#e0ddd7",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background .15s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left .15s",
          boxShadow: "0 1px 2px rgba(0,0,0,.2)",
        }}
      />
    </button>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "0.5px solid #f0ece8",
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 13, color: "#1c1a17", fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 11, color: "#7a766f", marginTop: 2 }}>{description}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function SwatchOption({
  color,
  label,
  active,
  onClick,
}: {
  color: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: 10,
        borderRadius: 9,
        border: active ? "1.5px solid #1a2e1a" : "0.5px solid #e0ddd7",
        background: active ? "#f4f7f1" : "#fff",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {active && <Check size={14} color="#fff" />}
      </div>
      <span style={{ fontSize: 11, color: "#1c1a17" }}>{label}</span>
    </button>
  );
}

/* ----------------------------------- Sections ------------------------------- */

function ProfileSection() {
  return (
    <PageCard title="Profil" description="Vos informations personnelles et préférences d'affichage">
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#F1C9A0",
            color: "#7A4528",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          A
        </div>
        <div>
          <GhostButton>
            <Upload size={13} /> Changer la photo
          </GhostButton>
          <div style={{ fontSize: 11, color: "#7a766f", marginTop: 6 }}>JPG ou PNG, 2MB max</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Field label="Nom complet">
          <TextInput defaultValue="Admin Siège" />
        </Field>
        <Field label="Adresse email">
          <TextInput defaultValue="admin@futurekawa.com" type="email" />
        </Field>
        <Field label="Rôle">
          <TextInput defaultValue="Super Admin" disabled style={{ color: "#7a766f", background: "#f4f2ef" }} />
        </Field>
        <Field label="Fuseau horaire">
          <SelectInput defaultValue="paris">
            <option value="paris">Europe/Paris (UTC+2)</option>
            <option value="bogota">America/Bogota (UTC-5)</option>
            <option value="sao_paulo">America/Sao_Paulo (UTC-3)</option>
          </SelectInput>
        </Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <PrimaryButton>
          <Save size={13} /> Enregistrer
        </PrimaryButton>
      </div>
    </PageCard>
  );
}

function CompanySection() {
  return (
    <PageCard title="Entreprise" description="Informations affichées sur les rapports et factures">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Field label="Nom de l'entreprise">
          <TextInput defaultValue="FutureKawa SAS" />
        </Field>
        <Field label="SIRET">
          <TextInput defaultValue="912 345 678 00021" />
        </Field>
        <Field label="Adresse">
          <TextInput defaultValue="14 rue des Caféiers, 75011 Paris" />
        </Field>
        <Field label="Pays du siège">
          <SelectInput defaultValue="fr">
            <option value="fr">France</option>
            <option value="br">Brésil</option>
            <option value="co">Colombie</option>
          </SelectInput>
        </Field>
        <Field label="Devise">
          <SelectInput defaultValue="eur">
            <option value="eur">Euro (€)</option>
            <option value="usd">Dollar US ($)</option>
            <option value="brl">Real brésilien (R$)</option>
          </SelectInput>
        </Field>
        <Field label="Site web">
          <TextInput defaultValue="https://futurekawa.com" />
        </Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <PrimaryButton>
          <Save size={13} /> Enregistrer
        </PrimaryButton>
      </div>
    </PageCard>
  );
}

function SecuritySection() {
  const [twoFA, setTwoFA] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  return (
    <>
      <PageCard title="Mot de passe" description="Mettre à jour votre mot de passe de connexion">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <Field label="Mot de passe actuel">
            <div style={{ position: "relative" }}>
              <TextInput type={showPwd ? "text" : "password"} defaultValue="••••••••••" />
              <button
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#7a766f",
                }}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <Field label="Nouveau mot de passe">
            <TextInput type="password" placeholder="Minimum 12 caractères" />
          </Field>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <PrimaryButton>
            <Save size={13} /> Mettre à jour
          </PrimaryButton>
        </div>
      </PageCard>

      <PageCard title="Authentification à deux facteurs" description="Sécurise votre compte avec un code temporaire">
        <ToggleRow
          title="Activer la 2FA"
          description="Code requis via une application d'authentification à chaque connexion"
          checked={twoFA}
          onChange={setTwoFA}
        />
      </PageCard>

      <PageCard title="Sessions ouvertes" description="Appareils actuellement connectés à votre compte">
        {[
          { device: "macOS · Chrome", icon: Laptop, ip: "192.168.1.10", since: "Cet appareil" },
          { device: "iOS · Safari", icon: Smartphone, ip: "10.0.0.42", since: "Il y a 2h" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: i === 1 ? "none" : "0.5px solid #f0ece8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <s.icon size={16} color="#5a5650" />
              <div>
                <div style={{ fontSize: 13, color: "#1c1a17" }}>{s.device}</div>
                <div style={{ fontSize: 11, color: "#7a766f" }}>
                  {s.ip} · {s.since}
                </div>
              </div>
            </div>
            {s.since !== "Cet appareil" && <GhostButton danger>Révoquer</GhostButton>}
          </div>
        ))}
      </PageCard>
    </>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    alertsEmail: true,
    alertsPush: true,
    weeklyReport: true,
    systemUpdates: false,
    mentions: true,
  });
  const update = (k: keyof typeof prefs) => (v: boolean) =>
    setPrefs((p) => ({ ...p, [k]: v }));
  return (
    <PageCard title="Notifications" description="Choisissez comment vous souhaitez être informé">
      <ToggleRow
        title="Alertes critiques par email"
        description="Recevoir un email immédiat pour toute alerte critique"
        checked={prefs.alertsEmail}
        onChange={update("alertsEmail")}
      />
      <ToggleRow
        title="Alertes push"
        description="Notifications dans le navigateur et l'application mobile"
        checked={prefs.alertsPush}
        onChange={update("alertsPush")}
      />
      <ToggleRow
        title="Rapport hebdomadaire"
        description="Résumé envoyé chaque lundi à 8h00"
        checked={prefs.weeklyReport}
        onChange={update("weeklyReport")}
      />
      <ToggleRow
        title="Mises à jour système"
        description="Être informé des nouvelles versions de FutureKawa"
        checked={prefs.systemUpdates}
        onChange={update("systemUpdates")}
      />
      <ToggleRow
        title="Mentions et partages"
        description="Quand quelqu'un partage un rapport ou vous mentionne"
        checked={prefs.mentions}
        onChange={update("mentions")}
      />
    </PageCard>
  );
}

function ApiSection() {
  const [showKey, setShowKey] = useState(false);
  const apiKey = "fk_live_8f3a2c91b6d04e7fa1c9";
  return (
    <PageCard
      title="Clés API"
      description="Utilisées pour intégrer FutureKawa à vos propres outils"
      action={
        <GhostButton>
          <RefreshCw size={13} /> Régénérer
        </GhostButton>
      }
    >
      <Field label="Clé API de production">
        <div style={{ display: "flex", gap: 8 }}>
          <TextInput
            readOnly
            value={showKey ? apiKey : "fk_live_••••••••••••••••"}
            style={{ fontFamily: "monospace", fontSize: 12 }}
          />
          <GhostButton onClick={() => setShowKey(!showKey)}>
            {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
          </GhostButton>
          <GhostButton>
            <Copy size={13} />
          </GhostButton>
        </div>
      </Field>
      <div style={{ marginTop: 14 }}>
        <Field label="Limite de requêtes" hint="Nombre maximal d'appels API par minute">
          <TextInput defaultValue="120" type="number" style={{ maxWidth: 140 }} />
        </Field>
      </div>
    </PageCard>
  );
}

function MqttSection() {
  return (
    <PageCard title="Broker MQTT" description="Connexion utilisée pour la remontée des données IoT en temps réel">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Field label="Adresse du broker">
          <TextInput defaultValue="mqtt://broker.futurekawa.com" />
        </Field>
        <Field label="Port">
          <TextInput defaultValue="8883" type="number" />
        </Field>
        <Field label="Identifiant client">
          <TextInput defaultValue="futurekawa-prod-01" />
        </Field>
        <Field label="QoS">
          <SelectInput defaultValue="1">
            <option value="0">0 — Au plus une fois</option>
            <option value="1">1 — Au moins une fois</option>
            <option value="2">2 — Exactement une fois</option>
          </SelectInput>
        </Field>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "#EAF3DE",
          borderRadius: 8,
          fontSize: 12,
          color: "#3B6D11",
          marginBottom: 14,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B6D11" }} />
        Connecté — dernier ping il y a 4 secondes
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <PrimaryButton>
          <Save size={13} /> Enregistrer
        </PrimaryButton>
      </div>
    </PageCard>
  );
}

function DatabaseSection() {
  return (
    <PageCard title="Base de données" description="Connexion et état de la base de données principale">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Field label="Hôte">
          <TextInput defaultValue="db-prod-01.futurekawa.internal" disabled style={{ color: "#7a766f", background: "#f4f2ef" }} />
        </Field>
        <Field label="Nom de la base">
          <TextInput defaultValue="futurekawa_production" disabled style={{ color: "#7a766f", background: "#f4f2ef" }} />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 4 }}>
        {[
          { l: "Taille actuelle", v: "4.8 GB" },
          { l: "Connexions actives", v: "18" },
          { l: "Dernière sauvegarde", v: "Il y a 4h" },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              background: "#faf8f5",
              border: "0.5px solid #e0ddd7",
              borderRadius: 9,
              padding: "0.875rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 500, color: "#1c1a17" }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "#7a766f", marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </PageCard>
  );
}

function EmailsSection() {
  return (
    <PageCard title="Configuration emails" description="Serveur SMTP utilisé pour les envois automatiques">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Field label="Serveur SMTP">
          <TextInput defaultValue="smtp.futurekawa.com" />
        </Field>
        <Field label="Port">
          <TextInput defaultValue="587" type="number" />
        </Field>
        <Field label="Adresse d'expédition">
          <TextInput defaultValue="notifications@futurekawa.com" />
        </Field>
        <Field label="Nom d'expéditeur">
          <TextInput defaultValue="FutureKawa Alertes" />
        </Field>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <GhostButton>Envoyer un test</GhostButton>
        <PrimaryButton>
          <Save size={13} /> Enregistrer
        </PrimaryButton>
      </div>
    </PageCard>
  );
}

function ThemeSection() {
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  return (
    <PageCard title="Thème" description="Apparence de l'interface FutureKawa">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxWidth: 420 }}>
        <SwatchOption color="#f4f2ef" label="Clair" active={theme === "light"} onClick={() => setTheme("light")} />
        <SwatchOption color="#1c1a17" label="Sombre" active={theme === "dark"} onClick={() => setTheme("dark")} />
        <SwatchOption color="linear-gradient(135deg,#f4f2ef 50%,#1c1a17 50%)" label="Auto" active={theme === "auto"} onClick={() => setTheme("auto")} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 12, color: "#7a766f" }}>
        {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
        Le thème s'applique immédiatement à toute l'interface
      </div>
    </PageCard>
  );
}

function LanguageSection() {
  return (
    <PageCard title="Langue et région" description="Langue de l'interface et formats régionaux">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Langue de l'interface">
          <SelectInput defaultValue="fr">
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
            <option value="es">Español</option>
          </SelectInput>
        </Field>
        <Field label="Format de date">
          <SelectInput defaultValue="dmy">
            <option value="dmy">JJ/MM/AAAA</option>
            <option value="mdy">MM/JJ/AAAA</option>
            <option value="ymd">AAAA-MM-JJ</option>
          </SelectInput>
        </Field>
        <Field label="Unité de température">
          <SelectInput defaultValue="c">
            <option value="c">Celsius (°C)</option>
            <option value="f">Fahrenheit (°F)</option>
          </SelectInput>
        </Field>
        <Field label="Premier jour de la semaine">
          <SelectInput defaultValue="mon">
            <option value="mon">Lundi</option>
            <option value="sun">Dimanche</option>
          </SelectInput>
        </Field>
      </div>
    </PageCard>
  );
}

function BackupsSection() {
  const backups = [
    { date: "23/06/2026 03:00", size: "2.4 GB", type: "Automatique" },
    { date: "22/06/2026 03:00", size: "2.4 GB", type: "Automatique" },
    { date: "21/06/2026 14:12", size: "2.3 GB", type: "Manuelle" },
    { date: "21/06/2026 03:00", size: "2.3 GB", type: "Automatique" },
  ];
  return (
    <PageCard
      title="Sauvegardes"
      description="Sauvegarde automatique quotidienne à 03:00, conservée 30 jours"
      action={
        <PrimaryButton>
          <Archive size={13} /> Sauvegarder maintenant
        </PrimaryButton>
      }
    >
      <div>
        {backups.map((b, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: i === backups.length - 1 ? "none" : "0.5px solid #f0ece8",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Archive size={15} color="#5a5650" />
              <div>
                <div style={{ fontSize: 13, color: "#1c1a17" }}>{b.date}</div>
                <div style={{ fontSize: 11, color: "#7a766f" }}>
                  {b.size} · {b.type}
                </div>
              </div>
            </div>
            <GhostButton>
              <Download size={13} /> Télécharger
            </GhostButton>
          </div>
        ))}
      </div>
    </PageCard>
  );
}

const SECTION_COMPONENTS: Record<SectionKey, React.ElementType> = {
  profile: ProfileSection,
  company: CompanySection,
  security: SecuritySection,
  notifications: NotificationsSection,
  api: ApiSection,
  mqtt: MqttSection,
  database: DatabaseSection,
  emails: EmailsSection,
  theme: ThemeSection,
  language: LanguageSection,
  backups: BackupsSection,
};

const SECTION_TITLES: Record<SectionKey, { title: string; subtitle: string }> = {
  profile: { title: "Profil", subtitle: "Vos informations personnelles" },
  company: { title: "Entreprise", subtitle: "Informations légales et facturation" },
  security: { title: "Sécurité", subtitle: "Mot de passe, 2FA et sessions" },
  notifications: { title: "Notifications", subtitle: "Préférences d'alertes et de rapports" },
  api: { title: "API", subtitle: "Clés et limites d'intégration" },
  mqtt: { title: "MQTT", subtitle: "Connexion au broker IoT" },
  database: { title: "Base de données", subtitle: "État et connexion de la base" },
  emails: { title: "Emails", subtitle: "Configuration du serveur SMTP" },
  theme: { title: "Thème", subtitle: "Apparence de l'interface" },
  language: { title: "Langue", subtitle: "Langue et formats régionaux" },
  backups: { title: "Sauvegardes", subtitle: "Historique et fréquence des sauvegardes" },
};

/* --------------------------------- Page principale -------------------------- */

export default function SettingsPage() {
  const [active, setActive] = useState<SectionKey>("profile");
  const ActiveSection = SECTION_COMPONENTS[active];
  const meta = SECTION_TITLES[active];

  return (
    <div style={{ background: "#f4f2ef", padding: "1.25rem", display: "flex", gap: 14, minHeight: "100%" }}>
      <nav
        aria-label="Sections paramètres"
        style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}
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

      <div style={{ flex: 1, minWidth: 0, maxWidth: 760 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 19, fontWeight: 500, color: "#1c1a17", margin: 0 }}>
            {meta.title}
          </h1>
          <div style={{ fontSize: 12, color: "#7a766f", marginTop: 2 }}>{meta.subtitle}</div>
        </div>
        <ActiveSection />
      </div>
    </div>
  );
}