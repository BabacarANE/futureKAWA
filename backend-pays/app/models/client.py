from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from app.db.database import Base


class Client(Base):
    __tablename__ = "clients"

    id      = Column(Integer, primary_key=True, index=True)
    name    = Column(String, nullable=False)
    company = Column(String, nullable=True)
    email   = Column(String, nullable=True)
    phone   = Column(String, nullable=True)
    address = Column(String, nullable=True)
    notes   = Column(String, nullable=True)

    expeditions = relationship("Expedition", back_populates="client")
