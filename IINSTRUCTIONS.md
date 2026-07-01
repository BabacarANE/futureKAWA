# FutureKawa — Intégration Frontend ↔ Backend

## Fichiers modifiés / créés

```
backend-pays/
  app/
    main.py                    ← MODIFIÉ : ajoute routes /warehouses/ et /exploitations/
    api/
      warehouses.py            ← CRÉÉ : routes GET/POST/PUT/DELETE entrepôts + exploitations

backend-siege/
  app/
    main.py                    ← MODIFIÉ : ajoute routers warehouses, exploitations, stats
    api/
      warehouses.py            ← CRÉÉ : proxy agrégé /warehouses/
      exploitations.py         ← CRÉÉ : proxy agrégé /exploitations/
      stats.py                 ← CRÉÉ : KPIs globaux /stats/

frontend/
  vite.config.ts               ← MODIFIÉ : proxy dev vers localhost:8000
  .env.example                 ← CRÉÉ : variable VITE_API_URL
  src/
    context/AuthContext.tsx    ← MODIFIÉ : connecté au vrai JWT backend (plus de mock)
    services/api.ts            ← MODIFIÉ : toutes les routes réelles
    pages/
      Auth/LoginPage.tsx       ← MODIFIÉ : appel login() réel
      CountriesPage.tsx        ← MODIFIÉ : getAllCountries() réel
      WarehousesPage.tsx       ← MODIFIÉ : getAllWarehouses() + mesures + alertes
      LotsPage.tsx             ← MODIFIÉ : getCountryLots() avec sélecteur pays
      SupervisionPage.tsx      ← MODIFIÉ : alertes réelles depuis tous les pays
```

---

## Démarrage rapide

### 1. Backend complet (Docker)

```bash
# Depuis la racine du projet
docker-compose up --build
```

Services démarrés :
- `backend-siege`  → http://localhost:8000  (point d'entrée frontend)
- `api-bresil`     → http://localhost:8001
- `api-equateur`   → http://localhost:8002
- `api-colombie`   → http://localhost:8003
- Bases PostgreSQL  → ports 5433/5434/5435
- Brokers MQTT     → ports 1884/1885/1886

### 2. Frontend (dev local)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# → http://localhost:3000
```

Le proxy Vite redirige automatiquement vers localhost:8000.

---

## Comptes de test

Créés par `seed.py` au premier démarrage de chaque backend pays :

| Email                          | Mot de passe    | Rôle                    | Pays     |
|-------------------------------|-----------------|-------------------------|----------|
| admin.bresil@futurekawa.com   | futurekawa2024  | responsable_exploitation | Brésil   |
| admin.equateur@futurekawa.com | futurekawa2024  | responsable_exploitation | Équateur |
| admin.colombie@futurekawa.com | futurekawa2024  | responsable_exploitation | Colombie |
| admin.siege@futurekawa.com    | futurekawa2024  | siege                   | (tous)   |

> Le compte **siege** peut se connecter depuis n'importe quel backend pays.

---

## Architecture de connexion

```
Browser (localhost:3000)
    │
    │ HTTP + JWT Bearer
    ▼
backend-siege (localhost:8000)   ← seul point de contact frontend
    │
    ├── /auth/token   → proxy vers BR / EC / CO (essai séquentiel)
    ├── /auth/me      → proxy vers BR / EC / CO
    ├── /consolidated/{code}/lots    → api-{pays}:8000/lots/
    ├── /consolidated/{code}/alerts  → api-{pays}:8000/alerts/
    ├── /consolidated/{code}/measures → api-{pays}:8000/measures/
    ├── /warehouses/  → agrège api-BR + api-EC + api-CO
    ├── /exploitations/ → agrège tous les pays
    └── /stats/       → calcule KPIs globaux
```

---

## Ce qui était statique → maintenant dynamique

| Page             | Avant                  | Après                               |
|------------------|------------------------|-------------------------------------|
| Login            | Mock localStorage      | JWT réel `/auth/token` + `/auth/me` |
| AuthContext      | Faux users hardcodés   | Token JWT + profil `/auth/me`       |
| CountriesPage    | SAMPLE[] statique      | `/consolidated` réel                |
| WarehousesPage   | SAMPLE[] statique      | `/warehouses/` + mesures + alertes  |
| LotsPage         | Fetch BR seulement     | Sélecteur 3 pays + `/consolidated/{code}/lots` |
| SupervisionPage  | fetch('/alerts') local | Alertes de tous les pays agrégées   |
| DashboardPage    | Already connected ✓    | Inchangé                            |

---

## Variables d'environnement backend

Déjà configurées dans `docker-compose.yml`. Pour dev local sans Docker :

```bash
# backend-pays (lancer 3x avec PAYS différent)
PAYS=bresil
DATABASE_URL=postgresql://postgres:changeme@localhost:5433/futurekawa
MQTT_BROKER=localhost
SECRET_KEY=changeme-secret-key

# backend-siege
API_BRESIL=http://localhost:8001
API_EQUATEUR=http://localhost:8002
API_COLOMBIE=http://localhost:8003
SECRET_KEY=changeme-secret-key
```