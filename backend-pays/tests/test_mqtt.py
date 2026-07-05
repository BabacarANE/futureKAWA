import pytest
import json
from unittest.mock import MagicMock, patch
from app.models.measure import Measure
from app.models.warehouse import Warehouse
from app.models.country import Country
from app.models.exploitation import Exploitation

def make_country():
    c = Country()
    c.code = "BR"
    c.name = "Bresil"
    c.ideal_temp = 29.0
    c.ideal_humidity = 55.0
    c.tolerance_temp = 3.0
    c.tolerance_humidity = 2.0
    return c

def make_warehouse(country_code="BR"):
    e = Exploitation()
    e.id = 1
    e.name = "Test Exploitation"
    e.country_code = country_code
    w = Warehouse()
    w.id = 1
    w.name = "Test Warehouse"
    w.exploitation_id = 1
    w.exploitation = e
    return w

def test_measure_status_normal():
    temp, hum = 29.0, 55.0
    country = make_country()
    temp_ok = abs(temp - country.ideal_temp) <= country.tolerance_temp
    hum_ok = abs(hum - country.ideal_humidity) <= country.tolerance_humidity
    assert temp_ok and hum_ok

def test_measure_status_out_of_range_temp():
    temp, hum = 35.0, 55.0
    country = make_country()
    temp_ok = abs(temp - country.ideal_temp) <= country.tolerance_temp
    assert not temp_ok

def test_measure_status_out_of_range_humidity():
    temp, hum = 29.0, 70.0
    country = make_country()
    hum_ok = abs(hum - country.ideal_humidity) <= country.tolerance_humidity
    assert not hum_ok

def test_mqtt_payload_format():
    payload = {
        "warehouse_id": 1,
        "temperature": 26.9,
        "humidity": 41.4,
        "status": "out_of_range",
        "client_id": "esp8266-bresil"
    }
    encoded = json.dumps(payload).encode()
    decoded = json.loads(encoded.decode())
    assert decoded["temperature"] == 26.9
    assert decoded["warehouse_id"] == 1
    assert "status" in decoded

def test_check_measure_alerts_called():
    db = MagicMock()
    # Mock has_recent_alert pour retourner False (pas de cooldown)
    with patch('app.alerting.rules.has_recent_alert', return_value=False), \
         patch('app.alerting.rules.send_alert_email') as mock_email, \
         patch('app.alerting.rules.get_warehouse_responsibles', return_value=[]):

        from app.alerting.rules import check_measure_alerts

        measure = Measure()
        measure.id = 1
        measure.temperature = 35.0
        measure.humidity = 70.0
        measure.warehouse_id = 1
        measure.status = "out_of_range"
        measure.timestamp = None

        warehouse = make_warehouse()
        country = make_country()

        check_measure_alerts(db, measure, warehouse, country)
        assert db.add.called
