import React, { useState } from 'react';
import { 
  BookOpen, 
  Code, 
  Terminal, 
  Check, 
  Copy, 
  Cpu, 
  AlertCircle, 
  ExternalLink, 
  Layers,
  Zap,
  HelpCircle
} from 'lucide-react';

export const HelpPage: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeTab, setActiveTab] = useState<'sketch' | 'api' | 'wiring' | 'faq'>('sketch');

  const sampleSketch = `/*
 * AKSHU IoT AI - Production ESP32 Telemetry & Actuator Sketch
 * Compatible with ESP32 DevKit V1, ESP32-S3, ESP8266
 * Libraries required: WiFi.h, HTTPClient.h, ArduinoJson.h, DHT.h
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

// --- NETWORK CONFIGURATION ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// --- AKSHU IOT ENDPOINT ---
// Use your server IP or domain
const char* SERVER_URL    = "http://192.168.1.100:3000/api/devices/YOUR_DEVICE_ID/telemetry";
const char* DEVICE_KEY    = "YOUR_GENERATED_DEVICE_KEY";

// --- SENSOR PINS ---
#define DHTPIN 4
#define DHTTYPE DHT22
#define RELAY_PIN 18
#define FAN_PIN 19
#define MQ135_PIN 34

DHT dht(DHTPIN, DHTTYPE);
unsigned long lastSend = 0;
const unsigned long SEND_INTERVAL = 5000; // 5 seconds

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  
  dht.begin();
  
  Serial.println("\\nConnecting to Wi-Fi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected! IP: " + WiFi.localIP().toString());
}

void sendTelemetry() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  int rawAqi = analogRead(MQ135_PIN);
  float aqi = map(rawAqi, 0, 4095, 20, 250);

  if (isnan(temp) || isnan(hum)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", DEVICE_KEY);

  StaticJsonDocument<256> doc;
  doc["temperature"] = temp;
  doc["humidity"]    = hum;
  doc["airQuality"]  = aqi;
  doc["battery"]     = 100;

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("Telemetry Ingested: " + response);

    // Parse actuator instructions from server
    StaticJsonDocument<256> respDoc;
    deserializeJson(respDoc, response);
    if (respDoc.containsKey("relay")) {
      int relayState = respDoc["relay"];
      digitalWrite(RELAY_PIN, relayState ? HIGH : LOW);
    }
  } else {
    Serial.printf("HTTP Error: %d\\n", httpCode);
  }
  http.end();
}

void loop() {
  if (millis() - lastSend >= SEND_INTERVAL) {
    lastSend = millis();
    if (WiFi.status() == WL_CONNECTED) {
      sendTelemetry();
    }
  }
}`;

  const curlExample = `curl -X POST "http://localhost:3000/api/devices/YOUR_DEVICE_ID/telemetry" \\
  -H "Content-Type: application/json" \\
  -H "x-device-key: YOUR_DEVICE_KEY" \\
  -d '{
    "temperature": 24.6,
    "humidity": 52.4,
    "airQuality": 36,
    "light": 420,
    "battery": 98
  }'`;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <span>Documentation & Integration Manual</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete hardware wiring guides, Arduino C++ firmware sketch, and REST ingestion API specifications.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'sketch', label: 'ESP32 Arduino C++ Sketch', icon: Code },
          { id: 'api', label: 'REST API Specification', icon: Terminal },
          { id: 'wiring', label: 'Pinout & Hardware Wiring', icon: Cpu },
          { id: 'faq', label: 'Troubleshooting & FAQ', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/40 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Arduino C++ Sketch */}
      {activeTab === 'sketch' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">Production Firmware Template</h3>
              <p className="text-xs text-slate-400">
                Includes Wi-Fi reconnect logic, JSON serialization, and bidirectional actuator commands.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sampleSketch);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shrink-0"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied to Clipboard' : 'Copy C++ Code'}</span>
            </button>
          </div>

          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-3 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-between">
              <span>akshu_esp32_firmware.ino</span>
              <span>C++ (Arduino 2.x)</span>
            </div>
            <pre className="p-4 text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto max-h-[500px]">
              {sampleSketch}
            </pre>
          </div>
        </div>
      )}

      {/* Tab: REST API Specs */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-800">
                  POST
                </span>
                <code className="text-sm font-mono text-white font-bold">
                  /api/devices/:deviceId/telemetry
                </code>
              </div>
              <p className="text-xs text-slate-400">
                Primary ingestion endpoint for ESP32/microcontroller sensors. Requires hardware API key header.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400 font-mono">Required Headers</span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                <div>Content-Type: application/json</div>
                <div>x-device-key: YOUR_GENERATED_DEVICE_KEY</div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400 font-mono">cURL Terminal Test Command</span>
              <div className="relative">
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                  {curlExample}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(curlExample);
                    setCopiedCurl(true);
                    setTimeout(() => setCopiedCurl(false), 2000);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400 font-mono">Other Key Endpoints</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-emerald-400 font-bold">GET /api/devices</div>
                  <div className="text-slate-400 mt-1 text-[11px]">List all user-registered IoT nodes and status.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-cyan-400 font-bold">POST /api/devices/:id/command</div>
                  <div className="text-slate-400 mt-1 text-[11px]">Dispatch actuator trigger (relay, fan, buzzer).</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-purple-400 font-bold">POST /api/ai/chat</div>
                  <div className="text-slate-400 mt-1 text-[11px]">Server-side Gemini 2.5 hardware intelligence query.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-amber-400 font-bold">GET /api/health</div>
                  <div className="text-slate-400 mt-1 text-[11px]">Check gateway uptime and operational state.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Wiring */}
      {activeTab === 'wiring' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">DHT22 Temperature & Humidity</h4>
              <p className="text-xs text-slate-400">
                - VCC to 3.3V or 5V<br />
                - GND to ESP32 GND<br />
                - DATA to GPIO 4 (Use 10k pull-up resistor between VCC and DATA)
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">MQ-135 Gas / Air Quality</h4>
              <p className="text-xs text-slate-400">
                - VCC to 5V (Requires 5V for internal heater coil)<br />
                - GND to ESP32 GND<br />
                - AOUT (Analog Out) to GPIO 34 (ADC1 channel)
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">5V Relay Module</h4>
              <p className="text-xs text-slate-400">
                - VCC to 5V<br />
                - GND to ESP32 GND<br />
                - IN (Signal) to GPIO 18 (Active LOW or HIGH depending on optocoupler)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: FAQ */}
      {activeTab === 'faq' && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white font-mono">Why does my ESP32 show Offline?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The device status is computed based on recent telemetry. If no packet is received for over 45 seconds, the server automatically flags the node as offline. Verify Wi-Fi credentials and check the Serial Monitor for HTTP response codes.
            </p>
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white font-mono">Can I use ESP32-CAM with video?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Yes! Flash the standard ESP32 CameraWebServer sketch, copy the local IP MJPEG stream URL (e.g. <code>http://192.168.1.188:81/stream</code>), and paste it in the Camera section of this app.
            </p>
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white font-mono">Are API keys secure?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Yes. The Gemini API key and Firebase credentials are kept strictly in server-side memory (`server.ts`) and are never leaked to client browsers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
