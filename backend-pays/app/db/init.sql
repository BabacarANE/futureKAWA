-- Countries with ideal conditions
CREATE TABLE IF NOT EXISTS countries (
    code VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    ideal_temp FLOAT NOT NULL,
    ideal_humidity FLOAT NOT NULL,
    tolerance_temp FLOAT NOT NULL DEFAULT 3.0,
    tolerance_humidity FLOAT NOT NULL DEFAULT 2.0
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    country_code VARCHAR REFERENCES countries(code) ON DELETE SET NULL
);

-- Exploitations
CREATE TABLE IF NOT EXISTS exploitations (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    country_code VARCHAR NOT NULL REFERENCES countries(code),
    city VARCHAR
);

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    location VARCHAR,
    exploitation_id INTEGER NOT NULL REFERENCES exploitations(id)
);

-- Lots
CREATE TABLE IF NOT EXISTS lots (
    id VARCHAR PRIMARY KEY,
    exploitation_id INTEGER NOT NULL REFERENCES exploitations(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    storage_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR DEFAULT 'compliant',
    quality_notes VARCHAR,
    shipped_at TIMESTAMP,
    shipped_by INTEGER REFERENCES users(id)
);

-- Measures
CREATE TABLE IF NOT EXISTS measures (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    temperature FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    status VARCHAR DEFAULT 'normal'
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    lot_id VARCHAR REFERENCES lots(id) ON DELETE SET NULL,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    type VARCHAR NOT NULL,
    message TEXT NOT NULL,
    triggered_at TIMESTAMP DEFAULT NOW()
);

-- Alert <-> User junction table
CREATE TABLE IF NOT EXISTS alert_users (
    alert_id INTEGER REFERENCES alerts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    emailed_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (alert_id, user_id)
);

-- ─── Seed data ────────────────────────────────────────────────────────────────

INSERT INTO countries (code, name, ideal_temp, ideal_humidity, tolerance_temp, tolerance_humidity)
VALUES
    ('BR', 'Bresil',   29.0, 55.0, 3.0, 2.0),
    ('EC', 'Equateur', 31.0, 60.0, 3.0, 2.0),
    ('CO', 'Colombie', 26.0, 80.0, 3.0, 2.0)
ON CONFLICT (code) DO NOTHING;

INSERT INTO exploitations (name, country_code, city)
VALUES
    ('Exploitation Amazonie', 'BR', 'Manaus'),
    ('Exploitation Andes',    'EC', 'Quito'),
    ('Exploitation Cauca',    'CO', 'Popayan')
ON CONFLICT DO NOTHING;

INSERT INTO warehouses (name, location, exploitation_id)
VALUES
    ('Entrepot Principal BR', 'Zone A', 1),
    ('Entrepot Principal EC', 'Zone A', 2),
    ('Entrepot Principal CO', 'Zone A', 3)
ON CONFLICT DO NOTHING;

-- ─── USERS (mot de passe : futurekawa2024) ────────────────────────────────────
INSERT INTO users (name, email, hashed_password, role, country_code)
VALUES
    (
        'Admin Siege',
        'admin.siege@futurekawa.com',
        '$2b$12$2YPAeNqJGKLAcW1ICkRvretEK8UYb2viMp4o5yGaJDWqcN6gaq.uu',
        'siege',
        NULL
    ),
    (
        'Admin Bresil',
        'admin.bresil@futurekawa.com',
        '$2b$12$3JSNLPUPlbAOIe.mJ1BKqO.ML9cdwjN7Exq4oC1zV4pI3lVXyq9I2',
        'responsable_exploitation',
        'BR'
    ),
    (
        'Admin Equateur',
        'admin.equateur@futurekawa.com',
        '$2b$12$rP/qpKDhdSU926iPF.PYDOQlHM011eQfyoRyXxoSAm4KbAToR9O.u',
        'responsable_exploitation',
        'EC'
    ),
    (
        'Admin Colombie',
        'admin.colombie@futurekawa.com',
        '$2b$12$cnDVDIr8zHSTyFwcsEEHl.GnZwYqOXvrFxuNNKRHBIDYRR5uZOt.W',
        'responsable_exploitation',
        'CO'
    )
ON CONFLICT (email) DO NOTHING;
