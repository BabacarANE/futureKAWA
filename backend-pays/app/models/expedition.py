from sqlalchemy import Column, String, Integer, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base


class Expedition(Base):
    __tablename__ = "expeditions"

    id              = Column(Integer, primary_key=True, index=True)
    lot_id          = Column(String, ForeignKey("lots.id"), nullable=False, unique=True)
    client_id       = Column(Integer, ForeignKey("clients.id"), nullable=True)
    destination     = Column(String, nullable=False)
    carrier         = Column(String, nullable=True)
    tracking_number = Column(String, nullable=True)
    status          = Column(String, default="en_route")  # en_route | livre | annule
    notes           = Column(String, nullable=True)
    shipped_at      = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    estimated_arrival = Column(Date, nullable=True)
    delivered_at    = Column(DateTime, nullable=True)

    lot    = relationship("Lot", back_populates="expedition")
    client = relationship("Client", back_populates="expeditions")
