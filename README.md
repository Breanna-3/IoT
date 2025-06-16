# IoT


# IoT ESP32 Health Dashboard Project

This repository contains:
- Arduino code for ESP32 (heart rate, temperature, humidity, MQTT)
- A web dashboard (HTML/JS)
- A mobile app (React Native/Expo)

---

## Structure

- `/esp32_code/` : Arduino code for ESP32, send sensor data to MQTT
- `/web_dashboard/` : Web dashboard, open `index.html` in your browser for live data
- `/esp32-dashboard-app/` : React Native Expo app for mobile (run with Expo CLI)

---

## How to Use

1. **Upload Arduino code:** Flash `esp32_code/temp_monitor.ino` to your ESP32 via Arduino IDE.
2. **Run Web Dashboard:** Open `web_dashboard/index.html` in your browser.
3. **Run Mobile App:**  
   - `cd esp32-dashboard-app`
   - `npm install`
   - `npx expo start`
   - Open with Expo Go app or run in emulator.

---

## MQTT Broker/Topics

Uses public [HiveMQ broker](https://broker.hivemq.com).
- Temp: `home/esp32/temp`
- Humidity: `home/esp32/hum`
- BPM: `home/esp32/bpm`
- LED control: `home/esp32/led`
- Buzzer control: `home/esp32/buzzer`
