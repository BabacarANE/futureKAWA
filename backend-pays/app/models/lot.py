from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base

class Lot(Base):
    __tablename__ = "lots"

    id = Column(String, primary_key=True, index=True)
    exploitation_id = Column(Integer, ForeignKey("exploitations.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    storage_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, default="compliant")  # compliant | alert | expired
    quality_notes = Column(String, nullable=True)

    exploitation = relationship("Exploitation", back_populates="lots")
    warehouse = relationship("Warehouse", back_populates="lots")
    alerts = relationship("Alert", back_populates="lot")
