from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    pays: str = "bresil"

    postgres_user: str = "postgres"
    postgres_password: str = "changeme"
    postgres_db: str = "futurekawa"
    database_url: str = ""

    mqtt_broker: str = "localhost"
    mqtt_port: int = 1883
    mqtt_topic_prefix: str = "futurekawa/bresil"

    seuil_temp: float = 29.0
    seuil_humidite: float = 55.0
    tolerance_temp: float = 3.0
    tolerance_humidite: float = 2.0

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_responsable: str = ""

    class Config:
        env_file = ".env"

    def get_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        return (
            f"postgresql://{self.postgres_user}:"
            f"{self.postgres_password}@"
            f"db-{self.pays}:5432/{self.postgres_db}"
        )

@lru_cache()
def get_settings() -> Settings:
    return Settings()
