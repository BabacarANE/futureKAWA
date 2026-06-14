import json
import logging
import paho.mqtt.client as mqtt
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.measure import Measure
from app.models.warehouse import Warehouse
from app.models.exploitation import Exploitation
from app.models.country import Country
from app.mqtt.topics import get_sensor_topic
from app.alerting.rules import check_measure_alerts
from app.config import get_settings
from datetime import datetime, timezone

logger = logging.getLogger(__name__)
settings = get_settings()

def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        topic = get_sensor_topic()
        client.subscribe(topic)
        logger.info(f"MQTT connected — subscribed to {topic}")
    else:
        logger.error(f"MQTT connection failed — code {rc}")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        temperature = float(payload["temperature"])
        humidity = float(payload["humidity"])
        warehouse_id = int(payload.get("warehouse_id", 1))

        db: Session = SessionLocal()
        try:
            warehouse = db.query(Warehouse).filter(
                Warehouse.id == warehouse_id
            ).first()

            if not warehouse:
                logger.warning(f"Warehouse {warehouse_id} not found")
                return

            exploitation = db.query(Exploitation).filter(
                Exploitation.id == warehouse.exploitation_id
            ).first()

            country = db.query(Country).filter(
                Country.code == exploitation.country_code
            ).first()

            temp_ok = abs(temperature - country.ideal_temp) <= country.tolerance_temp
            hum_ok = abs(humidity - country.ideal_humidity) <= country.tolerance_humidity
            status = "normal" if (temp_ok and hum_ok) else "out_of_range"

            measure = Measure(
                warehouse_id=warehouse_id,
                temperature=temperature,
                humidity=humidity,
                timestamp=datetime.now(timezone.utc),
                status=status
            )
            db.add(measure)
            db.commit()
            db.refresh(measure)

            logger.info(
                f"Measure saved — temp={temperature}°C "
                f"humidity={humidity}% status={status}"
            )

            if status == "out_of_range":
                check_measure_alerts(db, measure, warehouse, country)

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error processing MQTT message: {e}")

def on_disconnect(client, userdata, rc, properties=None):
    logger.warning(f"MQTT disconnected — code {rc}")
    if rc != 0:
        logger.info("Attempting reconnection...")

def create_mqtt_client() -> mqtt.Client:
    client = mqtt.Client(
        mqtt.CallbackAPIVersion.VERSION2,
        client_id=f"futurekawa-{settings.pays}"
    )
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect
    return client

def start_mqtt_client():
    client = create_mqtt_client()
    try:
        client.connect(settings.mqtt_broker, settings.mqtt_port, keepalive=60)
        client.loop_start()
        logger.info(
            f"MQTT client started — "
            f"broker={settings.mqtt_broker}:{settings.mqtt_port}"
        )
        return client
    except Exception as e:
        logger.error(f"Failed to connect to MQTT broker: {e}")
        return None
