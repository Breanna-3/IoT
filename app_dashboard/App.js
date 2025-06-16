import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import { Buffer } from 'buffer';
import mqtt from 'mqtt/dist/mqtt';

global.Buffer = Buffer; // Needed for mqtt.js in React Native

// --- MQTT config (same as web) ---
const BROKER = 'wss://broker.hivemq.com:8884/mqtt';
const TOPIC_TEMP = 'home/esp32/temp';
const TOPIC_HUM  = 'home/esp32/hum';
const TOPIC_BPM  = 'home/esp32/bpm';
const TOPIC_LED  = 'home/esp32/led';
const TOPIC_BUZZ = 'home/esp32/buzzer';

export default function App() {
  const [status, setStatus] = useState('🔄 Connecting to MQTT...');
  const [temp, setTemp] = useState('--');
  const [hum, setHum] = useState('--');
  const [bpm, setBpm] = useState('--');
  const [ledActive, setLedActive] = useState(false);
  const [buzzActive, setBuzzActive] = useState(false);

  const clientRef = useRef(null);

  useEffect(() => {
    const client = mqtt.connect(BROKER);

    client.on('connect', () => {
      setStatus('🟢 Connected to MQTT');
      client.subscribe([TOPIC_TEMP, TOPIC_HUM, TOPIC_BPM]);
    });

    client.on('reconnect', () => setStatus('🔄 Reconnecting...'));
    client.on('offline', () => setStatus('🔴 Disconnected'));

    client.on('message', (topic, message) => {
      if (topic === TOPIC_TEMP) setTemp(message.toString());
      if (topic === TOPIC_HUM) setHum(message.toString());
      if (topic === TOPIC_BPM) setBpm(message.toString());
    });

    clientRef.current = client;
    return () => client.end();
  }, []);

  const handleToggleLED = () => {
    if (clientRef.current) {
      clientRef.current.publish(TOPIC_LED, 'toggle');
      setLedActive(x => !x);
    }
  };

  const handleToggleBuzz = () => {
    if (clientRef.current) {
      clientRef.current.publish(TOPIC_BUZZ, 'toggle');
      setBuzzActive(x => !x);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1976d2" barStyle="light-content"/>
      <Text style={styles.title}>ESP32 Live Dashboard</Text>
      <View style={styles.card}>
        <Text style={styles.reading}>
          <Text style={styles.label}>🌡️ Temp </Text>{temp} <Text style={styles.unit}>°C</Text>
        </Text>
        <Text style={styles.reading}>
          <Text style={styles.label}>💧 Humidity </Text>{hum} <Text style={styles.unit}>%</Text>
        </Text>
        <Text style={styles.reading}>
          <Text style={styles.label}>💓 BPM </Text>{bpm}
        </Text>
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, ledActive && styles.activeBtn]}
          onPress={handleToggleLED}
        >
          <Text style={styles.btnText}>{ledActive ? "LED On" : "Toggle LED"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, buzzActive && styles.activeBtn]}
          onPress={handleToggleBuzz}
        >
          <Text style={styles.btnText}>{buzzActive ? "Buzzer On" : "Toggle Buzzer"}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#f8fafc',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  title: {
    fontSize: 28, fontWeight: '700', color: '#1565c0', marginBottom: 32, letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20, padding: 28, width: '100%', maxWidth: 370,
    alignItems: 'center', marginBottom: 28,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { height: 3, width: 0 },
    elevation: 6,
  },
  reading: {
    fontSize: 22, marginVertical: 6, fontWeight: '500', color: '#2b3440',
  },
  label: { color: '#789', fontWeight: '400', fontSize: 16 },
  unit: { color: '#aaa', fontSize: 18 },
  row: { flexDirection: 'row', gap: 14, marginVertical: 8 },
  btn: {
    backgroundColor: '#1976d2',
    borderRadius: 24, paddingVertical: 12, paddingHorizontal: 32,
    marginHorizontal: 4,
  },
  activeBtn: { backgroundColor: '#d32f2f' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  status: { marginTop: 18, fontSize: 16, color: '#028845', fontWeight: '500' }
});

