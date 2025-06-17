# IoT



# IoT Health Monitoring System

This project uses an ESP32 microcontroller to monitor temperature, humidity, and heart rate. Data is sent to an MQTT broker and displayed on a web dashboard. The dashboard also allows control of an LED and a buzzer.

## Components
- ESP32 board
- DHT22 temperature and humidity sensor
- Heart rate sensor
- Red LED
- Blue LED
- Buzzer
- Jumper wires, breadboard

## How it works
- The ESP32 reads sensor data and publishes it to an MQTT broker.
- A web dashboard displays live data (temperature, humidity, BPM).
- The dashboard allows you to toggle the LED and buzzer.



- Humidity: `home/esp32/hum`
- BPM: `home/esp32/bpm`
- LED control: `home/esp32/led`
- Buzzer control: `home/esp32/buzzer`
