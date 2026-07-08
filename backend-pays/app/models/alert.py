from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(String, ForeignKey("lots.id"), nullable=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    type = Column(String, nullable=False)  # out_of_range | expired_lot
    message = Column(String, nullable=False)
    triggered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    lot = relationship("Lot", back_populates="alerts")
    warehouse = relationship("Warehouse", back_populates="alerts")
    user_links = relationship("AlertUser", back_populates="alert")


class AlertUser(Base):
    __tablename__ = "alert_users"

    alert_id = Column(Integer, ForeignKey("alerts.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    emailed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    alert = relationship("Alert", back_populates="user_links")
    user = relationship("User", back_populates="alert_links")
