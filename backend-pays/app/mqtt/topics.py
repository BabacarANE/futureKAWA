from app.config import get_settings

settings = get_settings()

def get_sensor_topic() -> str:
    return f"{settings.mqtt_topic_prefix}/sensors"

def get_alert_topic() -> str:
    return f"{settings.mqtt_topic_prefix}/alerts"
