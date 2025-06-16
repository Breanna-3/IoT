#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include "DFRobot_Heartrate.h"

// --- WiFi credentials ---
const char* ssid = "CommunityFibre10Gb_21C84";
const char* password = "4nBft1haj@";

// --- MQTT Broker ---
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

// --- MQTT topics ---
#define TOPIC_TEMP    "home/esp32/temp"
#define TOPIC_HUM     "home/esp32/hum"
#define TOPIC_BPM     "home/esp32/bpm"
#define TOPIC_LED     "home/esp32/led"
#define TOPIC_BUZZER  "home/esp32/buzzer"

// --- Pins ---
#define DHTPIN 27
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

#define HEART_PIN 34
DFRobot_Heartrate heartrate(DIGITAL_MODE);

#define LED_PIN 19
#define BUZZER_PIN 2
#define BLUE_LED_PIN 22

WiFiClient espClient;
PubSubClient client(espClient);

bool ledState = false;
bool buzzerState = false;

unsigned long lastMsg = 0;

// --- MQTT Callback ---
void callback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];

  if (String(topic) == TOPIC_LED) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    // Blink blue LED for visual feedback
    digitalWrite(BLUE_LED_PIN, HIGH);
    delay(120);
    digitalWrite(BLUE_LED_PIN, LOW);
  }
  else if (String(topic) == TOPIC_BUZZER) {
    buzzerState = !buzzerState;
    if (buzzerState) {
      tone(BUZZER_PIN, 1000, 200); // short beep
    }
    else {
      noTone(BUZZER_PIN);
    }
  }
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected, IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe(TOPIC_LED);
      client.subscribe(TOPIC_BUZZER);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BLUE_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BLUE_LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  dht.begin();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > 1500) {
    lastMsg = now;

    // --- DHT22 ---
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (!isnan(t) && !isnan(h)) {
      Serial.printf("🌡️ Temp: %.2f °C, 💧 Humidity: %.2f %%\n", t, h);

      client.publish(TOPIC_TEMP, String(t, 2).c_str());
      client.publish(TOPIC_HUM, String(h, 2).c_str());
    }

    // --- Heart rate ---
    uint8_t bpm;
    heartrate.getValue(HEART_PIN);
    bpm = heartrate.getRate();
    if (bpm) {
      Serial.print("💓 BPM: "); Serial.println(bpm);
      client.publish(TOPIC_BPM, String(bpm).c_str());

      // Short low tone for each detected beat (avoid keeping buzzer on)
      tone(BUZZER_PIN, 190, 50); // Only for beat indication (not dashboard toggle)
      digitalWrite(BLUE_LED_PIN, HIGH);
      delay(50);
      digitalWrite(BLUE_LED_PIN, LOW);
    }
  }
}

