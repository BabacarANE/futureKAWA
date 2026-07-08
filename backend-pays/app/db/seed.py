from app.db.database import SessionLocal, engine, Base
from app.models.user import User
from app.api.auth import hash_password
import os

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Vérifier si déjà seedé
        if db.query(User).first():
            print("Already seeded — skipping")
            return

        pays = os.getenv("PAYS", "bresil")
        country_map = {
            "bresil":   "BR",
            "equateur": "EC",
            "colombie": "CO",
        }
        code = country_map.get(pays, "BR")

        # User admin
        admin = User(
            name=f"Admin {pays.capitalize()}",
            email=f"admin.{pays}@futurekawa.com",
            hashed_password=hash_password("futurekawa2024"),
            role="responsable_exploitation",
            country_code=code
        )
        db.add(admin)

        # User siège
        siege = User(
            name="Admin Siège",
            email="admin.siege@futurekawa.com",
            hashed_password=hash_password("futurekawa2024"),
            role="siege",
            country_code=None
        )
        db.add(siege)

        db.commit()
        print(f"Seed done — users created for {pays}")
        print(f"  → admin.{pays}@futurekawa.com / futurekawa2024")
        print("  → admin.siege@futurekawa.com / futurekawa2024")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
