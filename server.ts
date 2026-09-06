import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for device states, telemetry, commands, alerts, and automations
// In production or when Firebase is configured, this syncs with Firestore
interface StoredDevice {
  id: string;
  userId: string;
  name: string;
  type: string;
  status: string;
  deviceKey: string;
  ipAddress?: string;
  firmwareVersion?: string;
  wifiRssi?: number;
  battery?: number;
  capabilities: string[];
  isDemo?: boolean;
  lastSeen?: string;
  createdAt: string;
  sensors: Array<{
    id: string;
    deviceId: string;
    name: string;
    type: string;
    unit: string;
    currentValue: number;
    previousValue?: number;
    minRange: number;
    maxRange: number;
    todayMin?: number;
    todayMax?: number;
    status: string;
    lastUpdated: string;
  }>;
}

interface StoredTelemetry {
  id: string;
  deviceId: string;
  userId: string;
  timestamp: string;
  temperature?: number;
  humidity?: number;
  airQuality?: number;
  battery?: number;
  light?: number;
  pressure?: number;
  motion?: boolean;
  raw?: any;
}

interface StoredCommand {
  id: string;
  deviceId: string;
  type: string;
  pin?: number;
  value: any;
  status: 'pending' | 'sent' | 'executed' | 'failed';
  createdAt: string;
  executedAt?: string;
}

const devicesDb = new Map<string, StoredDevice>();
const telemetryDb: StoredTelemetry[] = [];
const commandsDb = new Map<string, StoredCommand[]>();

// Seed default demo device
devicesDb.set('demo_esp32_01', {
  id: 'demo_esp32_01',
  userId: 'guest-user',
  name: 'ESP32 Environmental Node Alpha',
  type: 'ESP32',
  status: 'online',
  deviceKey: 'akshu_key_demo_esp32_alpha',
  ipAddress: '192.168.1.142',
  firmwareVersion: 'v2.4.1-akshu',
  wifiRssi: -58,
  battery: 92,
  capabilities: ['temperature', 'humidity', 'air_quality', 'relay', 'fan', 'buzzer', 'light'],
  isDemo: true,
  lastSeen: new Date().toISOString(),
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  sensors: [
    {
      id: 's_temp_01',
      deviceId: 'demo_esp32_01',
      name: 'Ambient Temperature',
      type: 'temperature',
      unit: '°C',
      currentValue: 24.6,
      previousValue: 24.4,
      minRange: -20,
      maxRange: 60,
      todayMin: 20.8,
      todayMax: 26.1,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 's_hum_01',
      deviceId: 'demo_esp32_01',
      name: 'Relative Humidity',
      type: 'humidity',
      unit: '%',
      currentValue: 52.4,
      previousValue: 52.1,
      minRange: 10,
      maxRange: 90,
      todayMin: 45.0,
      todayMax: 61.2,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 's_aqi_01',
      deviceId: 'demo_esp32_01',
      name: 'Air Quality (AQI)',
      type: 'air_quality',
      unit: 'AQI',
      currentValue: 38,
      previousValue: 37,
      minRange: 0,
      maxRange: 300,
      todayMin: 28,
      todayMax: 54,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    },
  ],
});

// Gemini AI Client Helper
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// ---------------------- API ROUTES ----------------------

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AKSHU IoT AI Cloud Gateway',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// GET /api/devices
app.get('/api/devices', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || 'guest-user';
  const userDevices = Array.from(devicesDb.values()).filter(d => d.userId === userId || d.userId === 'guest-user');
  res.json(userDevices);
});

// POST /api/devices (Register Device)
app.post('/api/devices', (req: Request, res: Response) => {
  const userId = (req.headers['x-user-id'] as string) || 'guest-user';
  const { name, type, capabilities } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Device name and type are required' });
  }

  const deviceId = 'dev_' + crypto.randomBytes(6).toString('hex');
  const deviceKey = 'akshu_key_' + crypto.randomBytes(16).toString('hex');

  const defaultCaps = Array.isArray(capabilities) && capabilities.length > 0
    ? capabilities
    : ['temperature', 'humidity', 'relay'];

  const sensors = [];
  if (defaultCaps.includes('temperature')) {
    sensors.push({
      id: `${deviceId}_temp`,
      deviceId,
      name: 'Ambient Temperature',
      type: 'temperature',
      unit: '°C',
      currentValue: 24.5,
      minRange: -40,
      maxRange: 80,
      todayMin: 21.0,
      todayMax: 26.5,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    });
  }
  if (defaultCaps.includes('humidity')) {
    sensors.push({
      id: `${deviceId}_hum`,
      deviceId,
      name: 'Relative Humidity',
      type: 'humidity',
      unit: '%',
      currentValue: 55,
      minRange: 0,
      maxRange: 100,
      todayMin: 48,
      todayMax: 65,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    });
  }
  if (defaultCaps.includes('air_quality') || defaultCaps.includes('airQuality')) {
    sensors.push({
      id: `${deviceId}_aqi`,
      deviceId,
      name: 'Air Quality (AQI)',
      type: 'air_quality',
      unit: 'AQI',
      currentValue: 42,
      minRange: 0,
      maxRange: 500,
      todayMin: 35,
      todayMax: 60,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    });
  }

  const newDevice: StoredDevice = {
    id: deviceId,
    userId,
    name,
    type,
    status: 'offline', // Genuine: not connected until first heartbeat / telemetry
    deviceKey,
    capabilities: defaultCaps,
    battery: 100,
    firmwareVersion: '1.0.0-akshu',
    sensors,
    createdAt: new Date().toISOString(),
    isDemo: false,
  };

  devicesDb.set(deviceId, newDevice);
  commandsDb.set(deviceId, []);

  res.status(201).json(newDevice);
});

// DELETE /api/devices/:deviceId
app.delete('/api/devices/:deviceId', (req: Request, res: Response) => {
  const { deviceId } = req.params;
  if (!devicesDb.has(deviceId)) {
    return res.status(404).json({ error: 'Device not found' });
  }
  devicesDb.delete(deviceId);
  commandsDb.delete(deviceId);
  res.json({ success: true, message: `Device ${deviceId} removed` });
});

// POST /api/devices/:deviceId/heartbeat (ESP32 Heartbeat)
app.post('/api/devices/:deviceId/heartbeat', (req: Request, res: Response) => {
  const { deviceId } = req.params;
  const device = devicesDb.get(deviceId);
  const authKey = req.headers['x-device-key'] as string;

  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }
  if (device.deviceKey && authKey && device.deviceKey !== authKey) {
    return res.status(401).json({ error: 'Invalid device credentials' });
  }

  const { ip, firmware, rssi, battery } = req.body;
  device.status = 'online';
  device.lastSeen = new Date().toISOString();
  if (ip) device.ipAddress = ip;
  if (firmware) device.firmwareVersion = firmware;
  if (typeof rssi === 'number') device.wifiRssi = rssi;
  if (typeof battery === 'number') device.battery = battery;

  devicesDb.set(deviceId, device);

  const pending = commandsDb.get(deviceId)?.filter(c => c.status === 'pending') || [];
  res.json({
    status: 'acknowledged',
    serverTime: new Date().toISOString(),
    pendingCommandsCount: pending.length,
  });
});

// POST /api/devices/:deviceId/telemetry (ESP32 Telemetry Ingestion)
app.post('/api/devices/:deviceId/telemetry', (req: Request, res: Response) => {
  const { deviceId } = req.params;
  const device = devicesDb.get(deviceId);
  const authKey = req.headers['x-device-key'] as string;

  if (!device) {
    return res.status(404).json({ error: `Device ${deviceId} not registered` });
  }
  if (device.deviceKey && authKey && device.deviceKey !== authKey) {
    return res.status(401).json({ error: 'Unauthorized device key' });
  }

  const { temperature, humidity, airQuality, battery, light, pressure, motion, raw } = req.body;

  const now = new Date().toISOString();
  device.status = 'online';
  device.lastSeen = now;
  if (typeof battery === 'number') device.battery = battery;

  // Update sensor readings on device
  device.sensors.forEach(sensor => {
    let val: number | undefined;
    if (sensor.type === 'temperature' && typeof temperature === 'number') val = temperature;
    else if (sensor.type === 'humidity' && typeof humidity === 'number') val = humidity;
    else if (sensor.type === 'air_quality' && typeof airQuality === 'number') val = airQuality;
    else if (sensor.type === 'light' && typeof light === 'number') val = light;
    else if (sensor.type === 'pressure' && typeof pressure === 'number') val = pressure;

    if (val !== undefined) {
      sensor.previousValue = sensor.currentValue;
      sensor.currentValue = Number(val.toFixed(2));
      sensor.lastUpdated = now;
      if (sensor.todayMin === undefined || sensor.currentValue < sensor.todayMin) sensor.todayMin = sensor.currentValue;
      if (sensor.todayMax === undefined || sensor.currentValue > sensor.todayMax) sensor.todayMax = sensor.currentValue;
    }
  });

  devicesDb.set(deviceId, device);

  // Store telemetry
  const point: StoredTelemetry = {
    id: 'tel_' + crypto.randomBytes(6).toString('hex'),
    deviceId,
    userId: device.userId,
    timestamp: now,
    temperature: typeof temperature === 'number' ? temperature : undefined,
    humidity: typeof humidity === 'number' ? humidity : undefined,
    airQuality: typeof airQuality === 'number' ? airQuality : undefined,
    battery: typeof battery === 'number' ? battery : undefined,
    light: typeof light === 'number' ? light : undefined,
    pressure: typeof pressure === 'number' ? pressure : undefined,
    motion: typeof motion === 'boolean' ? motion : undefined,
    raw,
  };

  telemetryDb.push(point);
  // Keep last 2000 telemetry points
  if (telemetryDb.length > 2000) telemetryDb.shift();

  res.status(200).json({
    success: true,
    storedAt: now,
    sensorsUpdated: device.sensors.length,
  });
});

// GET /api/telemetry (Query Telemetry History)
app.get('/api/telemetry', (req: Request, res: Response) => {
  const { deviceId, limit } = req.query;
  let points = telemetryDb;
  if (deviceId) {
    points = points.filter(p => p.deviceId === deviceId);
  }
  const maxLimit = limit ? Math.min(Number(limit), 500) : 100;
  res.json(points.slice(-maxLimit));
});

// GET /api/devices/:deviceId/telemetry (Device Telemetry History)
app.get('/api/devices/:deviceId/telemetry', (req: Request, res: Response) => {
  const { deviceId } = req.params;
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 500) : 100;
  const points = telemetryDb.filter(p => p.deviceId === deviceId);
  res.json(points.slice(-limit));
});

// POST /api/devices/:deviceId/commands (Send command to device)
app.post('/api/devices/:deviceId/commands', (req: Request, res: Response) => {
  const { deviceId } = req.params;
  const device = devicesDb.get(deviceId);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  const { type, pin, value } = req.body;
  if (!type) {
    return res.status(400).json({ error: 'Command type is required' });
  }

  // Capability validation: check if device advertises this actuator/command
  const capabilityMap: Record<string, string[]> = {
    relay_toggle: ['relay', 'switch'],
    fan_control: ['fan', 'relay', 'pwm'],
    light_control: ['light', 'relay', 'pwm'],
    buzzer: ['buzzer', 'audio'],
    servo_angle: ['servo', 'pwm'],
    digital_write: ['gpio', 'digital'],
    pwm: ['pwm'],
    restart: ['system', 'reboot'],
  };

  const requiredCaps = capabilityMap[type] || [];
  const hasCapability = requiredCaps.length === 0 || requiredCaps.some(cap => device.capabilities.includes(cap));

  if (!hasCapability) {
    return res.status(400).json({
      error: `Device does not support capability '${type}'. Supported: ${device.capabilities.join(', ')}`,
    });
  }

  const commandId = 'cmd_' + crypto.randomBytes(6).toString('hex');
  const command: StoredCommand = {
    id: commandId,
    deviceId,
    type,
    pin: typeof pin === 'number' ? pin : undefined,
    value,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const list = commandsDb.get(deviceId) || [];
  list.push(command);
  commandsDb.set(deviceId, list);

  res.status(201).json({
    success: true,
    commandId,
    message: `Command queued for ${device.name}`,
    command,
  });
});

// GET /api/devices/:deviceId/commands/pending (ESP32 Polling)
app.get('/api/devices/:deviceId/commands/pending', (req: Request, res: Response) => {
  const { deviceId } = req.params;
  const list = commandsDb.get(deviceId) || [];
  const pending = list.filter(c => c.status === 'pending');
  res.json({ commands: pending });
});

// POST /api/devices/:deviceId/commands/:commandId/ack (ESP32 Acknowledge)
app.post('/api/devices/:deviceId/commands/:commandId/ack', (req: Request, res: Response) => {
  const { deviceId, commandId } = req.params;
  const list = commandsDb.get(deviceId) || [];
  const cmd = list.find(c => c.id === commandId);
  if (!cmd) {
    return res.status(404).json({ error: 'Command not found' });
  }
  cmd.status = 'executed';
  cmd.executedAt = new Date().toISOString();
  res.json({ success: true, command: cmd });
});

// GET /api/export/csv (Generate Actual CSV File)
app.get('/api/export/csv', (req: Request, res: Response) => {
  const { deviceId } = req.query;
  let points = telemetryDb;
  if (deviceId) {
    points = points.filter(p => p.deviceId === deviceId);
  }

  const headers = ['Timestamp', 'Device ID', 'Temperature (°C)', 'Humidity (%)', 'Air Quality (AQI)', 'Battery (%)', 'Light (lux)', 'Pressure (hPa)'];
  const rows = points.map(p => [
    p.timestamp,
    p.deviceId,
    p.temperature ?? '',
    p.humidity ?? '',
    p.airQuality ?? '',
    p.battery ?? '',
    p.light ?? '',
    p.pressure ?? '',
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="akshu-iot-telemetry-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csvContent);
});

// ---------------------- GEMINI AI INTEGRATION ----------------------

// POST /api/ai/chat (Conversational IoT Assistant)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured. Please ensure GEMINI_API_KEY is configured in Settings > Secrets.',
        content: 'I cannot analyze your IoT telemetry right now because GEMINI_API_KEY is not configured on the server. Please check the Settings panel.',
      });
    }

    const systemPrompt = `You are AKSHU IoT AI, an expert real-world IoT engineering and environmental intelligence assistant.
Your tagline is "Connect. Monitor. Understand. Control."

CRITICAL RULES:
1. Always base your conclusions strictly on the provided real-world or demo sensor data.
2. NEVER invent or hallucinate sensor readings, timestamps, or hardware states.
3. Clearly distinguish:
   - Measured data (actual numbers reported by devices)
   - Calculated statistics (averages, min, max, trends)
   - AI interpretation (logical deduction from the readings)
   - Experimental predictions
4. If there is no device or sensor data provided, clearly state that no device telemetry is available yet.
5. For high temperature (>35°C), high humidity (>80%), or dangerous air quality (>150 AQI), provide actionable precautions, but clarify that emergency situations must be confirmed with certified real-world instruments.
6. Keep responses well-structured, concise, and formatted with clear markdown headings and bullet points.`;

    const contextSummary = context ? `CURRENT IOT SYSTEM STATE CONTEXT:
- Devices: ${JSON.stringify(context.devices || [])}
- Active Sensor Readings: ${JSON.stringify(context.currentReadings || [])}
- Alerts Status: ${JSON.stringify(context.alerts || [])}
- Mode: ${context.demoMode ? 'DEMO MODE (Simulated for testing)' : 'REAL DEVICE MODE (Hardware telemetry)'}` : 'No active context available.';

    const contents = [
      {
        role: 'user',
        parts: [
          { text: `${systemPrompt}\n\n${contextSummary}\n\nUser Question: ${message}` }
        ]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents as any,
    });

    res.json({
      content: response.text || 'No response generated from AI.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Gemini AI Chat error:', err);
    res.status(500).json({
      error: 'Failed to process AI chat query',
      details: err.message,
    });
  }
});

// POST /api/ai/analyze (Analyze My System)
app.post('/api/ai/analyze', async (req: Request, res: Response) => {
  try {
    const { context } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured.',
      });
    }

    const prompt = `Perform a comprehensive technical health and environmental analysis of the following IoT system state:
${JSON.stringify(context, null, 2)}

You MUST return your analysis strictly adhering to these 5 distinct sections:
1. Current Status: (Overview of connected devices, active sensors, and environmental stability)
2. Important Changes: (Trends in temperature, humidity, air quality, or battery levels)
3. Possible Issues: (Any anomalies, threshold violations, or offline devices)
4. Recommendations: (3-5 concrete actionable suggestions for optimal energy, comfort, and device longevity)
5. Confidence / Data Quality: (Assessment of sample rate, telemetry completeness, and confidence level)

Note: If data is scarce or devices are offline, state that clearly under Confidence / Data Quality. Never present medical or safety-critical conclusions as absolute facts.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      analysis: response.text,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Gemini AI Analyze error:', err);
    res.status(500).json({ error: 'System analysis failed', details: err.message });
  }
});

// POST /api/ai/predict (Experimental Sensor Predictions)
app.post('/api/ai/predict', async (req: Request, res: Response) => {
  try {
    const { historicalPoints, metric } = req.body;

    if (!Array.isArray(historicalPoints) || historicalPoints.length < 5) {
      return res.json({
        available: false,
        statusMessage: 'Prediction unavailable — collect more data. At least 5 historical data points are required.',
        forecast: [],
      });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key not configured.' });
    }

    const prompt = `Based on the following actual historical readings for ${metric || 'temperature'}:
${JSON.stringify(historicalPoints.slice(-25))}

Provide a 6-hour forecast with short-term trend projection.
Return JSON with this structure:
{
  "summary": "Brief explanation of projected trend",
  "forecast": [
    { "time": "+1h", "predictedValue": 25.4, "confidenceMin": 24.8, "confidenceMax": 26.0 },
    { "time": "+2h", "predictedValue": 25.8, "confidenceMin": 25.1, "confidenceMax": 26.5 },
    { "time": "+3h", "predictedValue": 26.2, "confidenceMin": 25.3, "confidenceMax": 27.1 },
    { "time": "+4h", "predictedValue": 26.0, "confidenceMin": 25.0, "confidenceMax": 27.0 },
    { "time": "+5h", "predictedValue": 25.5, "confidenceMin": 24.5, "confidenceMax": 26.5 },
    { "time": "+6h", "predictedValue": 24.9, "confidenceMin": 23.9, "confidenceMax": 25.9 }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      available: true,
      summary: parsed.summary || 'Trend generated based on historical data.',
      forecast: parsed.forecast || [],
      metric: metric || 'temperature',
    });
  } catch (err: any) {
    console.error('Gemini AI Predict error:', err);
    res.status(500).json({ error: 'Prediction generation failed', details: err.message });
  }
});

// ---------------------- VITE MIDDLEWARE / STATIC SERVING ----------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AKSHU IoT AI Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
