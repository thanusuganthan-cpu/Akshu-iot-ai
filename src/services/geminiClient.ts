import { store } from './store';
import { AIChatMessage, AIAnalysisReport, AIPrediction } from '../types';

export async function sendAIChatMessage(
  message: string,
  history: AIChatMessage[]
): Promise<{ content: string; error?: string }> {
  try {
    const devices = store.getDevices();
    const telemetry = store.getTelemetry();
    const alerts = store.getAlerts();
    const user = store.getUser();

    const currentReadings = devices.map(d => ({
      name: d.name,
      type: d.type,
      status: d.status,
      sensors: d.sensors.map(s => ({
        name: s.name,
        type: s.type,
        value: s.currentValue,
        unit: s.unit,
        status: s.status,
      })),
    }));

    const context = {
      demoMode: user.demoMode,
      devicesCount: devices.length,
      devices: currentReadings,
      currentReadings,
      alerts: alerts.map(a => ({ name: a.name, enabled: a.enabled, triggers: a.triggerCount })),
      recentTelemetryPointsCount: telemetry.length,
    };

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: history.slice(-6).map(h => ({ role: h.role, content: h.content })),
        context,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        content: data.content || data.error || 'Unable to connect to AI engine.',
        error: data.error,
      };
    }
    return { content: data.content };
  } catch (err: any) {
    return {
      content: 'Could not contact the AKSHU AI server. Please verify your connection or GEMINI_API_KEY.',
      error: err.message,
    };
  }
}

export async function requestSystemAnalysis(): Promise<{ report?: string; error?: string }> {
  try {
    const devices = store.getDevices();
    const telemetry = store.getTelemetry();
    const alerts = store.getAlerts();
    const automations = store.getAutomations();
    const user = store.getUser();

    const context = {
      demoMode: user.demoMode,
      devices: devices.map(d => ({
        name: d.name,
        status: d.status,
        battery: d.battery,
        rssi: d.wifiRssi,
        sensors: d.sensors.map(s => ({
          name: s.name,
          current: s.currentValue,
          unit: s.unit,
          todayMin: s.todayMin,
          todayMax: s.todayMax,
        })),
      })),
      telemetrySummary: {
        pointsRecorded: telemetry.length,
        last24hSampleCount: telemetry.slice(-24).length,
      },
      alertsCount: alerts.length,
      activeAutomations: automations.filter(a => a.enabled).length,
    };

    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Analysis failed' };
    }
    return { report: data.analysis };
  } catch (err: any) {
    return { error: err.message || 'System analysis unavailable' };
  }
}

export async function requestMetricPrediction(metric: 'temperature' | 'humidity' | 'air_quality'): Promise<AIPrediction> {
  try {
    const telemetry = store.getTelemetry();
    const points = telemetry.map(t => ({
      timestamp: t.timestamp,
      val: metric === 'temperature' ? t.temperature : metric === 'humidity' ? t.humidity : t.airQuality,
    })).filter(p => p.val !== undefined);

    const res = await fetch('/api/ai/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric,
        historicalPoints: points,
      }),
    });

    const data = await res.json();
    return {
      metric,
      forecast: data.forecast || [],
      summary: data.summary || 'Forecast based on available history.',
      available: !!data.available,
      statusMessage: data.statusMessage,
    };
  } catch (err: any) {
    return {
      metric,
      forecast: [],
      summary: 'Prediction service unavailable.',
      available: false,
      statusMessage: 'Failed to contact prediction server: ' + err.message,
    };
  }
}
