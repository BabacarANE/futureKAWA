import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.alert import Alert, AlertUser
from app.models.lot import Lot
from app.models.user import User
from app.models.measure import Measure
from app.models.warehouse import Warehouse
from app.models.country import Country
from app.alerting.email import send_alert_email

logger = logging.getLogger(__name__)

def get_warehouse_responsibles(db: Session, country_code: str) -> list[User]:
    return db.query(User).filter(
        User.country_code == country_code,
        User.role.in_([
            "responsable_exploitation",
            "responsable_entrepot"
        ])
    ).all()

def create_alert(
    db: Session,
    alert_type: str,
    message: str,
    warehouse_id: int,
    lot_id: str | None,
    responsibles: list[User]
) -> Alert:
    alert = Alert(
        type=alert_type,
        message=message,
        warehouse_id=warehouse_id,
        lot_id=lot_id,
        triggered_at=datetime.now(timezone.utc)
    )
    db.add(alert)
    db.flush()

    for user in responsibles:
        link = AlertUser(
            alert_id=alert.id,
            user_id=user.id,
            emailed_at=datetime.now(timezone.utc)
        )
        db.add(link)

    db.commit()

    emails = [u.email for u in responsibles]
    send_alert_email(emails, f"[FutureKawa] {alert_type}", message)

    return alert

def check_measure_alerts(
    db: Session,
    measure: Measure,
    warehouse: Warehouse,
    country: Country
):
    exploitation = warehouse.exploitation
    responsibles = get_warehouse_responsibles(db, country.code)

    message = (
        f"Entrepôt {warehouse.name} ({country.name}) — "
        f"Conditions hors seuil détectées : "
        f"Température={measure.temperature}°C "
        f"(idéal={country.ideal_temp}°C ±{country.tolerance_temp}°C), "
        f"Humidité={measure.humidity}% "
        f"(idéal={country.ideal_humidity}% ±{country.tolerance_humidity}%)"
    )

    create_alert(
        db=db,
        alert_type="out_of_range",
        message=message,
        warehouse_id=warehouse.id,
        lot_id=None,
        responsibles=responsibles
    )
    logger.warning(f"Alert created: {message}")

def check_expired_lots(db: Session):
    expiry_date = datetime.now(timezone.utc) - timedelta(days=365)

    expired_lots = db.query(Lot).filter(
        Lot.storage_date <= expiry_date,
        Lot.status != "expired"
    ).all()

    for lot in expired_lots:
        lot.status = "expired"
        db.flush()

        warehouse = db.query(Warehouse).filter(
            Warehouse.id == lot.warehouse_id
        ).first()

        exploitation = warehouse.exploitation
        country_code = exploitation.country_code
        responsibles = get_warehouse_responsibles(db, country_code)

        message = (
            f"Lot {lot.id} — stocké depuis le "
            f"{lot.storage_date.strftime('%d/%m/%Y')} "
            f"({(datetime.now(timezone.utc) - lot.storage_date).days} jours). "
            f"Entrepôt : {warehouse.name}. Action requise."
        )

        create_alert(
            db=db,
            alert_type="expired_lot",
            message=message,
            warehouse_id=warehouse.id,
            lot_id=lot.id,
            responsibles=responsibles
        )
        logger.warning(f"Expired lot alert: {lot.id}")

    db.commit()
    logger.info(f"Expired lots check done — {len(expired_lots)} lot(s) flagged")
