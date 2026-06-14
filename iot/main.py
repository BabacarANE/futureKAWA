import network
import time
import dht
import machine
import json
from umqtt.simple import MQTTClient
import config

# ── Périphériques ──────────────────────────────────────
sensor = dht.DHT22(machine.Pin(config.DHT_PIN))
led_green = machine.Pin(config.LED_GREEN_PIN, machine.Pin.OUT)
led_red = machine.Pin(config.LED_RED_PIN, machine.Pin.OUT)
buzzer = machine.Pin(config.BUZZER_PIN, machine.Pin.OUT)

led_green.off()
led_red.off()
buzzer.off()

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print("Connexion WiFi...")
        wlan.connect(config.WIFI_SSID, config.WIFI_PASSWORD)
        timeout = 15
        while not wlan.isconnected() and timeout > 0:
            time.sleep(1)
            timeout -= 1
            print(".", end="")
    if wlan.isconnected():
        print("\nWiFi connecté —", wlan.ifconfig()[0])
        return True
    print("\nEchec WiFi")
    return False

def connect_mqtt():
    client = MQTTClient(
        config.MQTT_CLIENT_ID,
        config.MQTT_BROKER,
        port=config.MQTT_PORT,
        keepalive=60
    )
    client.connect()
    print(f"MQTT connecté — {config.MQTT_BROKER}:{config.MQTT_PORT}")
    return client

def alert_ok():
    led_green.on()
    led_red.off()
    buzzer.off()

def alert_warning():
    led_green.off()
    led_red.on()
    for _ in range(3):
        buzzer.on()
        time.sleep(0.1)
        buzzer.off()
        time.sleep(0.1)

def read_sensor():
    time.sleep(2)
    sensor.measure()
    return sensor.temperature(), sensor.humidity()

def publish(client, temperature, humidity, status):
    payload = json.dumps({
        "warehouse_id": config.WAREHOUSE_ID,
        "temperature": temperature,
        "humidity": humidity,
        "status": status,
        "client_id": config.MQTT_CLIENT_ID
    })
    client.publish(config.MQTT_TOPIC, payload.encode())
    print(f"Publié → {payload}")

def main():
    if not connect_wifi():
        led_red.on()
        return

    client = None
    retry = 0
    while client is None and retry < 5:
        try:
            client = connect_mqtt()
        except Exception as e:
            print(f"MQTT erreur: {e} — retry {retry+1}/5")
            retry += 1
            time.sleep(3)

    if client is None:
        print("Impossible de connecter MQTT")
        led_red.on()
        return

    print("Démarrage boucle de mesures...")
    alert_ok()

    while True:
        try:
            temp, hum = read_sensor()
            print(f"Temp: {temp}°C  Humidité: {hum}%")

            status = "normal"
            if temp > 32 or temp < 26 or hum > 57 or hum < 53:
                status = "out_of_range"
                alert_warning()
            else:
                alert_ok()

            publish(client, temp, hum, status)

        except OSError as e:
            print(f"Erreur capteur: {e}")
            led_red.on()

        except Exception as e:
            print(f"Erreur MQTT: {e}")
            try:
                client = connect_mqtt()
            except:
                pass

        time.sleep(config.INTERVAL)

main()
