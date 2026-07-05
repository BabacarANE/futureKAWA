import sys
import types
import json
import pytest

# ── Stubs MicroPython ──────────────────────────────────────
machine_mod = types.ModuleType("machine")
class Pin:
    OUT = 1
    def __init__(self, pin, mode=None): self.pin = pin
    def on(self): pass
    def off(self): pass
machine_mod.Pin = Pin
sys.modules["machine"] = machine_mod

dht_mod = types.ModuleType("dht")
class DHT22:
    def __init__(self, pin): self._temp = 26.9; self._hum = 41.4
    def measure(self): pass
    def temperature(self): return self._temp
    def humidity(self): return self._hum
dht_mod.DHT22 = DHT22
sys.modules["dht"] = dht_mod

network_mod = types.ModuleType("network")
network_mod.STA_IF = 1
class WLAN:
    def __init__(self, _): pass
    def active(self, _): pass
    def isconnected(self): return True
    def connect(self, s, p): pass
    def ifconfig(self): return ("10.0.0.1",)
network_mod.WLAN = WLAN
sys.modules["network"] = network_mod

umqtt_mod = types.ModuleType("umqtt")
simple_mod = types.ModuleType("umqtt.simple")
class MQTTClient:
    def __init__(self, *a, **kw): self.published = []
    def connect(self): pass
    def publish(self, topic, payload): self.published.append((topic, payload))
simple_mod.MQTTClient = MQTTClient
sys.modules["umqtt"] = umqtt_mod
sys.modules["umqtt.simple"] = simple_mod

# ── Tests ──────────────────────────────────────────────────
def test_dht22_read():
    sensor = dht_mod.DHT22(machine_mod.Pin(4))
    sensor.measure()
    assert 0 < sensor.temperature() < 60
    assert 0 < sensor.humidity() < 100

def test_status_out_of_range():
    temp, hum = 26.9, 41.4
    status = "normal"
    if temp > 32 or temp < 26 or hum > 57 or hum < 53:
        status = "out_of_range"
    assert status == "out_of_range"

def test_status_normal():
    temp, hum = 29.0, 55.0
    status = "normal"
    if temp > 32 or temp < 26 or hum > 57 or hum < 53:
        status = "out_of_range"
    assert status == "normal"

def test_mqtt_payload_format():
    payload = json.dumps({
        "warehouse_id": 1,
        "temperature": 26.9,
        "humidity": 41.4,
        "status": "out_of_range",
        "client_id": "esp8266-bresil"
    })
    parsed = json.loads(payload)
    assert parsed["temperature"] == 26.9
    assert parsed["warehouse_id"] == 1
