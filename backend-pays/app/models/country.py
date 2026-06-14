from sqlalchemy import Column, String, Float
from app.db.database import Base

class Country(Base):
    __tablename__ = "countries"

    code = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    ideal_temp = Column(Float, nullable=False)
    ideal_humidity = Column(Float, nullable=False)
    tolerance_temp = Column(Float, nullable=False, default=3.0)
    tolerance_humidity = Column(Float, nullable=False, default=2.0)
