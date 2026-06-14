from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    exploitation_id = Column(Integer, ForeignKey("exploitations.id"), nullable=False)

    exploitation = relationship("Exploitation", back_populates="warehouses")
    lots = relationship("Lot", back_populates="warehouse")
    measures = relationship("Measure", back_populates="warehouse")
    alerts = relationship("Alert", back_populates="warehouse")
