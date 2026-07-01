from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.db.database import get_db
from app.models.alert import Alert, AlertUser
from app.models.user import User
from app.api.auth import get_current_user
from app.alerting.email import send_alert_email

router = APIRouter()

class AlertResponse(BaseModel):
    id: int
    lot_id: Optional[str]
    warehouse_id: int
    type: str
    message: str
    triggered_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=list[AlertResponse])
def get_alerts(
    warehouse_id: Optional[int] = Query(None),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Alert)
    if warehouse_id:
        query = query.filter(Alert.warehouse_id == warehouse_id)
    if type:
        query = query.filter(Alert.type == type)
    return query.order_by(Alert.triggered_at.desc()).all()

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.post("/test-email")
def test_email(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["siege", "responsable_exploitation"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    recipients = [current_user.email]
    success = send_alert_email(
        recipients=recipients,
        subject="[FutureKawa] Test email alerting",
        body=f"Test email envoyé depuis l'API FutureKawa. "
             f"Utilisateur : {current_user.name} ({current_user.email}). "
             f"Système d'alerting opérationnel."
    )
    if success:
        return {"status": "sent", "recipients": recipients}
    return {"status": "skipped", "reason": "SMTP not configured"}
