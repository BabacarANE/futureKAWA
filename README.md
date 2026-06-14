# FutureKawa — Système de suivi des stocks de café vert

## Lancement rapide

```bash
docker compose up --build
```

## Services disponibles

| Service         | URL                          |
|----------------|------------------------------|
| Frontend        | http://localhost:3000        |
| Backend siège   | http://localhost:8000/docs   |
| API Brésil      | http://localhost:8001/docs   |
| API Équateur    | http://localhost:8002/docs   |
| API Colombie    | http://localhost:8003/docs   |

## Brokers MQTT

| Pays      | Port hôte |
|-----------|-----------|
| Brésil    | 1884      |
| Équateur  | 1885      |
| Colombie  | 1886      |

## Stack technique

- Backend : Python 3.12 / FastAPI / SQLAlchemy
- Base de données : PostgreSQL 16
- Broker MQTT : Eclipse Mosquitto 2
- Frontend : React 18 / TypeScript / Vite
- CI/CD : Jenkins
- Conteneurisation : Docker / Docker Compose

## Structure du projet
futurekawa/

├── backend-pays/     # API locale (×3 pays via env vars)

├── backend-siege/    # Agrégateur central

├── frontend/         # Interface React

├── iot/              # Firmware ESP32 MicroPython

└── docs/             # Documentation technique
