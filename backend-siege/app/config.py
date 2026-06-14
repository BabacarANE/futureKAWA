from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    api_bresil: str = "http://api-bresil:8000"
    api_equateur: str = "http://api-equateur:8000"
    api_colombie: str = "http://api-colombie:8000"
    secret_key: str = "changeme-secret-key"

    class Config:
        env_file = ".env"

    def get_country_urls(self) -> dict:
        return {
            "BR": self.api_bresil,
            "EC": self.api_equateur,
            "CO": self.api_colombie,
        }

@lru_cache()
def get_settings() -> Settings:
    return Settings()
