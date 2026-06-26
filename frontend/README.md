# FutureKawa — Coffee Intelligence Platform

Dashboard de gestion de stocks de café avec authentification, rôles et monitoring IoT.

---

## Stack technique
- **React 18** + **TypeScript**
- **React Router v6** — routing + routes protégées
- **Tailwind CSS** — dark mode class-based
- **Vite** — build tool

---

## Installation

```bash
npm create vite@latest futurekawa -- --template react-ts
cd futurekawa
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Copier tous les fichiers src/ dans le projet, puis :

```bash
npm run dev
```

---

## Structure des fichiers

```
src/
├── assets/
│   ├── futurekawa-logo.png     # Logo coffee art
│   └── logoBase64.ts           # Logo encodé base64 pour import TS
├── components/
│   ├── Auth/
│   │   ├── AuthInput.tsx       # Input réutilisable avec show/hide password
│   │   ├── AuthToast.tsx       # Toast notification auth
│   │   └── ProtectedRoute.tsx  # Route guard RBAC
│   ├── Layout/
│   │   └── Layout.tsx          # Sidebar + topbar
│   └── Shared/
│       └── index.tsx           # KpiCard, Badge, Button, SearchBar, etc.
├── context/
│   └── AuthContext.tsx         # Auth state, login, logout, gestion users
├── hooks/
│   └── useTheme.ts             # Dark/light mode toggle
├── pages/
│   ├── Auth/
│   │   ├── LoginPage.tsx       # Page de connexion principale
│   │   ├── RegisterPage.tsx    # Inscription (statut pending)
│   │   ├── ForgotPasswordPage.tsx
│   │   └── UnauthorizedPage.tsx
│   ├── DashboardPage.tsx
│   ├── CountriesPage.tsx
│   ├── WarehousesPage.tsx
│   ├── LotsPage.tsx
│   ├── IoTPage.tsx
│   ├── AlertsPage.tsx
│   ├── AnalyticsPage.tsx
│   └── AdminPage.tsx           # Gestion utilisateurs (admin only)
├── types/
│   └── auth.ts                 # Types auth, rôles, statuts
├── mockData.ts                 # Données fictives (entrepôts, lots, capteurs...)
├── types.ts                    # Types domaine métier
└── App.tsx                     # Router complet
```

---

## Comptes de test

| Email                    | Mot de passe | Rôle          | Statut  |
|--------------------------|-------------|---------------|---------|
| admin@futurekawa.com     | admin123    | Administrateur| Actif   |
| marie@futurekawa.com     | marie123    | Exploitation  | Actif   |
| carlos@futurekawa.com    | carlos123   | Entrepôt      | En attente |

---

## Fonctionnalités auth

### Connexion
- Email + mot de passe avec validation côté client
- Affichage / masquage du mot de passe
- "Se souvenir de moi" (localStorage vs sessionStorage)
- Blocage après 5 tentatives (15 min)
- Connexion Google (OAuth stub — brancher Firebase/Supabase)
- Thème clair/sombre persisté

### Inscription
- Formulaire avec indicateur de force du mot de passe
- Statut "En attente" automatique
- Workflow de validation admin

### RBAC (contrôle d'accès par rôle)
| Rôle                     | Accès                                          |
|--------------------------|------------------------------------------------|
| `admin`                  | Tout + tableau admin                           |
| `siege`                  | Tout sauf admin                                |
| `responsable_exploitation` | Dashboard, entrepôts, lots, alertes, IoT    |
| `responsable_entrepot`   | Dashboard, entrepôts, lots, IoT               |
| `qualite`                | Dashboard, lots, analytics                     |
| `supply_chain`           | Dashboard, lots, pays, analytics               |

### Admin
- Liste tous les comptes avec statuts
- Approuver / Refuser les demandes en attente
- Activer / Désactiver un compte
- Modifier le rôle (inline)
- Supprimer un compte
- Journal des connexions et actions

---

## Sécurité (production)
Remplacer le mock par :
- **Backend** : FastAPI + JWT signé (HS256 ou RS256)
- **Mots de passe** : bcrypt (jamais stockés en clair)
- **Google OAuth** : Firebase Auth ou Supabase Auth
- **Sessions** : HTTP-only cookies ou localStorage avec token rotation
- **Rate limiting** : côté serveur (ex. slowapi)
- **HTTPS** : obligatoire en production