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

# Une seule alerte email par type et par entrepôt toutes les 30 minutes
ALERT_COOLDOWN_MINUTES = 30


def has_recent_alert(db: Session, warehouse_id: int, alert_type: str) -> bool:
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=ALERT_COOLDOWN_MINUTES)
    return (
        db.query(Alert)
        .filter(
            Alert.warehouse_id == warehouse_id,
            Alert.type == alert_type,
            Alert.triggered_at >= cutoff,
        )
        .first()
    ) is not None


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
    responsibles: list[User],
    send_email: bool = True,
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

    if send_email:
        emails = [u.email for u in responsibles]
        subject = {
            "out_of_range": "[FutureKawa] ⚠️ Conditions IoT hors seuil",
            "expired_lot":  "[FutureKawa] 📦 Lot expiré — action requise",
        }.get(alert_type, f"[FutureKawa] Alerte {alert_type}")
        send_alert_email(emails, subject, message)

    return alert


def check_measure_alerts(
    db: Session,
    measure: Measure,
    warehouse: Warehouse,
    country: Country
):
    if has_recent_alert(db, warehouse.id, "out_of_range"):
        logger.debug(
            f"Cooldown actif — alerte out_of_range déjà envoyée pour "
            f"entrepôt {warehouse.id} dans les {ALERT_COOLDOWN_MINUTES} dernières minutes"
        )
        return

    responsibles = get_warehouse_responsibles(db, country.code)

    temp_min = country.ideal_temp - country.tolerance_temp
    temp_max = country.ideal_temp + country.tolerance_temp
    hum_min  = country.ideal_humidity - country.tolerance_humidity
    hum_max  = country.ideal_humidity + country.tolerance_humidity

    message = (
        f"Entrepôt {warehouse.name} ({country.name}) — "
        f"conditions hors seuil détectées.\n"
        f"Température : {measure.temperature}°C "
        f"(plage acceptable : {temp_min}–{temp_max}°C)\n"
        f"Humidité : {measure.humidity}% "
        f"(plage acceptable : {hum_min}–{hum_max}%)\n"
        f"Relevé le : {measure.timestamp.strftime('%d/%m/%Y à %H:%M') if measure.timestamp else 'N/A'}"
    )

    create_alert(
        db=db,
        alert_type="out_of_range",
        message=message,
        warehouse_id=warehouse.id,
        lot_id=None,
        responsibles=responsibles,
    )
    logger.warning(f"Alerte créée — entrepôt {warehouse.id} ({country.name}): {measure.temperature}°C / {measure.humidity}%")


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

        days_stored = (datetime.now(timezone.utc) - lot.storage_date).days
        message = (
            f"Lot {lot.id} — stocké depuis le "
            f"{lot.storage_date.strftime('%d/%m/%Y')} "
            f"({days_stored} jours, limite : 365 jours).\n"
            f"Entrepôt : {warehouse.name}. Action requise."
        )

        create_alert(
            db=db,
            alert_type="expired_lot",
            message=message,
            warehouse_id=warehouse.id,
            lot_id=lot.id,
            responsibles=responsibles,
        )
        logger.warning(f"Lot expiré : {lot.id}")

    db.commit()
    logger.info(f"Vérification lots expirés — {len(expired_lots)} lot(s) flaggé(s)")
