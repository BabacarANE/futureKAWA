# FutureKawa — Système de suivi des stocks de café vert

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et lancé
- [Git](https://git-scm.com/) installé
- [Node.js 20+](https://nodejs.org/) installé
- [Python 3.12+](https://www.python.org/) installé

## Cloner le projet

```bash
git clone https://github.com/BabacarANE/futureKAWA.git
cd futureKAWA
```

## Lancement rapide

```bash
docker compose up --build
```

Le premier lancement prend ~5 minutes (téléchargement des images).

## Services disponibles

| Service | URL | Description |
|---|---|---|
| Frontend | http://localhost:3000 | Interface utilisateur |
| Backend siège | http://localhost:8000/docs | API centrale (Swagger) |
| API Brésil | http://localhost:8001/docs | API pays Brésil |
| API Équateur | http://localhost:8002/docs | API pays Équateur |
| API Colombie | http://localhost:8003/docs | API pays Colombie |

## Brokers MQTT

| Pays | Port hôte | Topic |
|---|---|---|
| Brésil | 1884 | futurekawa/bresil/sensors |
| Équateur | 1885 | futurekawa/equateur/sensors |
| Colombie | 1886 | futurekawa/colombie/sensors |

## Comptes de test

| Email | Mot de passe | Rôle | Pays |
|---|---|---|---|
| admin.bresil@futurekawa.com | futurekawa2024 | responsable_exploitation | Brésil |
| admin.equateur@futurekawa.com | futurekawa2024 | responsable_exploitation | Équateur |
| admin.colombie@futurekawa.com | futurekawa2024 | responsable_exploitation | Colombie |
| admin.siege@futurekawa.com | futurekawa2024 | siege | — |

## Créer les utilisateurs (seed)

Après le premier lancement, exécute le seed sur chaque pays :

```bash
docker cp backend-pays/app/db/seed.py futurekawa-api-bresil-1:/app/seed.py
docker exec futurekawa-api-bresil-1 python //app/seed.py

docker cp backend-pays/app/db/seed.py futurekawa-api-equateur-1:/app/seed.py
docker exec futurekawa-api-equateur-1 python //app/seed.py

docker cp backend-pays/app/db/seed.py futurekawa-api-colombie-1:/app/seed.py
docker exec futurekawa-api-colombie-1 python //app/seed.py
```

## Lancer les tests

```bash
docker compose up --build api-bresil -d

docker compose run --rm \
  -e PAYS=bresil \
  -e DATABASE_URL=sqlite:///./test.db \
  -e MQTT_BROKER=localhost \
  -e MQTT_PORT=1883 \
  -e SECRET_KEY=test-secret-key \
  -e SEUIL_TEMP=29 \
  -e SEUIL_HUMIDITE=55 \
  -e TOLERANCE_TEMP=3 \
  -e TOLERANCE_HUMIDITE=2 \
  api-bresil pytest tests/ -v
```

## Simuler une mesure IoT

```bash
# Obtenir un token
TOKEN=$(curl -s -X POST http://localhost:8001/auth/token \
  -d "username=admin.bresil@futurekawa.com&password=futurekawa2024" \
  | python -m json.tool | grep access_token | cut -d'"' -f4)

# Publier une mesure normale
docker exec futurekawa-mqtt-bresil-1 mosquitto_pub \
  -t "futurekawa/bresil/sensors" \
  -m '{"temperature": 29, "humidity": 55, "warehouse_id": 1}'

# Publier une mesure hors seuil (déclenche une alerte)
docker exec futurekawa-mqtt-bresil-1 mosquitto_pub \
  -t "futurekawa/bresil/sensors" \
  -m '{"temperature": 35, "humidity": 70, "warehouse_id": 1}'
```

## Structure du projet
futurekawa/

├── backend-pays/          # API locale FastAPI (×3 pays via env vars)

│   ├── app/

│   │   ├── api/           # Routes REST (lots, mesures, alertes, auth)

│   │   ├── models/        # Modèles SQLAlchemy

│   │   ├── mqtt/          # Subscriber MQTT

│   │   ├── alerting/      # Règles alertes + email

│   │   └── db/            # BDD, migrations, seed

│   ├── tests/             # Tests unitaires pytest

│   ├── mosquitto/         # Config broker MQTT

│   └── Dockerfile

├── backend-siege/         # Agrégateur central FastAPI

│   ├── app/

│   │   ├── api/           # Routes consolidated + auth

│   │   └── clients/       # Clients HTTP pays

│   └── Dockerfile

├── frontend/              # Interface React + TypeScript

│   ├── src/

│   │   ├── components/    # Layout, LotsTable, Charts, Alerts, Modal

│   │   ├── pages/         # Dashboard, LotPage, LoginPage

│   │   ├── services/      # Appels API axios

│   │   ├── context/       # Auth context JWT

│   │   └── types/         # Types TypeScript

│   └── Dockerfile

├── iot/                   # Firmware ESP8266 MicroPython

│   ├── main.py            # Boucle principale

│   ├── config.py          # Configuration WiFi/MQTT

│   ├── sensor.py          # Lecture DHT22

│   ├── mqtt_client.py     # Client MQTT

│   └── wiring.md          # Schéma de câblage

├── docs/                  # Documentation technique

├── Jenkinsfile            # Pipeline CI/CD

└── docker-compose.yml     # Orchestration complète

## Stack technique

| Composant | Technologie |
|---|---|
| Backend pays | Python 3.12 / FastAPI / SQLAlchemy |
| Backend siège | Python 3.12 / FastAPI / httpx |
| Base de données | PostgreSQL 16 |
| Broker MQTT | Eclipse Mosquitto 2 |
| Frontend | React 18 / TypeScript / Vite / Tailwind v4 |
| IoT | ESP8266 NodeMCU / MicroPython / DHT22 |
| CI/CD | Jenkins |
| Conteneurisation | Docker / Docker Compose |

## Ports utilisés

| Service | Port hôte | Port conteneur |
|---|---|---|
| Frontend | 3000 | 3000 |
| Backend siège | 8000 | 8000 |
| API Brésil | 8001 | 8000 |
| API Équateur | 8002 | 8000 |
| API Colombie | 8003 | 8000 |
| DB Brésil | 5433 | 5432 |
| DB Équateur | 5434 | 5432 |
| DB Colombie | 5435 | 5432 |
| MQTT Brésil | 1884 | 1883 |
| MQTT Équateur | 1885 | 1883 |
| MQTT Colombie | 1886 | 1883 |

## CI/CD Jenkins

Jenkins tourne sur un conteneur séparé du projet :

```bash
cd ~/Desktop/jenkins-futurekawa
docker compose up -d
```

Accès : http://localhost:9090

### Stratégie de branches

| Branche | Action CI/CD |
|---|---|
| `feature/*` | Tests uniquement |
| `develop` | Tests + Build |
| `main` | Tests + Build + Deploy |

## IoT — Matériel requis

- ESP8266 NodeMCU 12-F
- Capteur DHT22 AM2302 3 broches
- LED rouge + LED verte
- Buzzer TMB12A05
- Résistances 220Ω ×2
- Breadboard + câbles

Flash MicroPython sur l'ESP8266 :

```bash
python -m esptool --port COM5 erase-flash
python -m esptool --port COM5 --baud 460800 write-flash \
  --flash-size=detect 0x0 micropython-esp8266.bin
```

Copie `iot/config.py` et `iot/main.py` sur l'ESP8266 via Thonny.
Configure `WIFI_SSID`, `WIFI_PASSWORD` et `MQTT_BROKER` dans `iot/config.py`.

## Arrêter le projet

```bash
docker compose down
```

Supprimer les volumes (reset complet) :

```bash
docker compose down -v
```
