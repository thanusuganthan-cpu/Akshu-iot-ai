import { 
  Device, 
  SensorData, 
  TelemetryPoint, 
  AlertRule, 
  AutomationRule, 
  AutomationLog, 
  NotificationItem, 
  CameraConfig, 
  UserProfile 
} from '../types';

const STORAGE_KEYS = {
  USER: 'akshu_user_profile',
  DEVICES: 'akshu_devices_v2',
  TELEMETRY: 'akshu_telemetry_v2',
  ALERTS: 'akshu_alerts_v2',
  AUTOMATIONS: 'akshu_automations_v2',
  AUTO_LOGS: 'akshu_auto_logs_v2',
  NOTIFICATIONS: 'akshu_notifications_v2',
  CAMERAS: 'akshu_cameras_v2',
};

// Initial default user profile
const defaultProfile: UserProfile = {
  uid: 'operator_01',
  email: 'admin@akshuiot.io',
  displayName: 'Lead Engineer',
  role: 'Lead IoT Engineer',
  tempUnit: 'celsius',
  systemUnits: 'metric',
  theme: 'dark',
  demoMode: true, // Default to true so first-time users can immediately explore all UI modules with labeled DEMO DATA
  browserNotifications: false,
  offlineNotifications: true,
  refreshInterval: 4000,
  soundAlerts: true,
  createdAt: new Date().toISOString(),
};

// Initial Demo devices
const demoDevices: Device[] = [
  {
    id: 'demo_esp32_01',
    userId: 'operator_01',
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
        todayMin: 21.4,
        todayMax: 26.8,
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
      {
        id: 's_light_01',
        deviceId: 'demo_esp32_01',
        name: 'Ambient Light',
        type: 'light',
        unit: 'lux',
        currentValue: 480,
        previousValue: 475,
        minRange: 0,
        maxRange: 2000,
        todayMin: 0,
        todayMax: 850,
        status: 'active',
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'demo_esp32_cam',
    userId: 'operator_01',
    name: 'ESP32-CAM Laboratory Hub',
    type: 'ESP32-CAM',
    status: 'online',
    deviceKey: 'akshu_key_demo_cam_hub',
    ipAddress: '192.168.1.188',
    firmwareVersion: 'v1.8.0-cam',
    wifiRssi: -64,
    battery: 85,
    capabilities: ['camera', 'flash_led', 'motion'],
    isDemo: true,
    lastSeen: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    sensors: [
      {
        id: 's_motion_01',
        deviceId: 'demo_esp32_cam',
        name: 'PIR Motion Detector',
        type: 'motion',
        unit: 'state',
        currentValue: 0,
        previousValue: 0,
        minRange: 0,
        maxRange: 1,
        status: 'active',
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
];

// Initial alert rules
const defaultAlerts: AlertRule[] = [
  {
    id: 'alert_temp_high',
    userId: 'operator_01',
    name: 'High Temperature Threshold',
    deviceId: 'demo_esp32_01',
    sensorType: 'temperature',
    operator: '>',
    threshold: 30.0,
    severity: 'warning',
    message: 'Ambient temperature exceeded safe operating threshold (30°C).',
    enabled: true,
    createdAt: new Date().toISOString(),
    triggerCount: 0,
  },
  {
    id: 'alert_aqi_critical',
    userId: 'operator_01',
    name: 'Unhealthy Air Quality Warning',
    deviceId: 'demo_esp32_01',
    sensorType: 'air_quality',
    operator: '>',
    threshold: 100,
    severity: 'critical',
    message: 'AQI particulate levels elevated above safe indoor baseline.',
    enabled: true,
    createdAt: new Date().toISOString(),
    triggerCount: 0,
  },
];

// Initial Automations
const defaultAutomations: AutomationRule[] = [
  {
    id: 'auto_cooling_fan',
    userId: 'operator_01',
    name: 'Auto Cooling Fan Trigger',
    conditionDeviceId: 'demo_esp32_01',
    conditionSensorType: 'temperature',
    operator: '>',
    threshold: 28.0,
    targetDeviceId: 'demo_esp32_01',
    actionType: 'fan_control',
    actionValue: 1,
    enabled: true,
    createdAt: new Date().toISOString(),
    executionCount: 2,
  },
  {
    id: 'auto_exhaust_aqi',
    userId: 'operator_01',
    name: 'Exhaust Ventilation on AQI',
    conditionDeviceId: 'demo_esp32_01',
    conditionSensorType: 'air_quality',
    operator: '>',
    threshold: 80,
    targetDeviceId: 'demo_esp32_01',
    actionType: 'relay_toggle',
    actionValue: 1,
    enabled: true,
    createdAt: new Date().toISOString(),
    executionCount: 0,
  },
];

// Seed Historical Telemetry (past 24 hours)
function generateSeedTelemetry(): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const now = Date.now();
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now - i * 3600 * 1000).toISOString();
    // Diurnal temperature curve (cooler at night, warmer in afternoon)
    const hour = (new Date(now - i * 3600 * 1000)).getHours();
    const tempBase = 22.0 + Math.sin(((hour - 8) / 24) * Math.PI * 2) * 3.5;
    const tempNoise = (Math.random() - 0.5) * 0.6;
    const humBase = 58 - (tempBase - 22) * 1.8 + (Math.random() - 0.5) * 2;
    const aqiBase = 32 + Math.floor(Math.sin((hour / 24) * Math.PI) * 15 + Math.random() * 8);

    points.push({
      id: 'seed_tel_' + i,
      deviceId: 'demo_esp32_01',
      timestamp: time,
      temperature: Number((tempBase + tempNoise).toFixed(1)),
      humidity: Number(humBase.toFixed(1)),
      airQuality: Math.max(10, Math.min(200, aqiBase)),
      battery: Math.max(80, 95 - Math.floor(i * 0.4)),
      light: hour >= 7 && hour <= 19 ? 350 + Math.floor(Math.random() * 400) : 10,
    });
  }
  return points;
}

export class AppStore {
  private user: UserProfile;
  private devices: Device[];
  private telemetry: TelemetryPoint[];
  private alerts: AlertRule[];
  private automations: AutomationRule[];
  private autoLogs: AutomationLog[];
  private notifications: NotificationItem[];
  private cameras: CameraConfig[];
  private listeners: Set<() => void> = new Set();
  private simulationInterval: any = null;

  constructor() {
    this.user = this.load(STORAGE_KEYS.USER, defaultProfile);
    this.devices = this.load(STORAGE_KEYS.DEVICES, demoDevices);
    this.telemetry = this.load(STORAGE_KEYS.TELEMETRY, generateSeedTelemetry());
    this.alerts = this.load(STORAGE_KEYS.ALERTS, defaultAlerts);
    this.automations = this.load(STORAGE_KEYS.AUTOMATIONS, defaultAutomations);
    this.autoLogs = this.load(STORAGE_KEYS.AUTO_LOGS, [
      {
        id: 'log_01',
        ruleId: 'auto_cooling_fan',
        ruleName: 'Auto Cooling Fan Trigger',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        triggerValue: 28.3,
        actionTaken: 'Set Fan to High (PWM 255)',
        status: 'success',
      },
    ]);
    this.notifications = this.load(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif_welcome',
        userId: this.user.uid,
        title: 'AKSHU IoT Gateway Ready',
        message: 'System connected and initialized. Monitoring 2 connected device nodes.',
        severity: 'info',
        read: false,
        timestamp: new Date().toISOString(),
      },
    ]);
    this.cameras = this.load(STORAGE_KEYS.CAMERAS, [
      {
        id: 'cam_01',
        userId: this.user.uid,
        deviceId: 'demo_esp32_cam',
        name: 'Laboratory Camera Alpha',
        streamUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        status: 'online',
        resolution: 'SVGA (800x600)',
        lastSeen: new Date().toISOString(),
      },
    ]);

    this.startSimulation();
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  private save(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- GETTERS ---
  public getUser(): UserProfile {
    return this.user;
  }

  public getDevices(): Device[] {
    return this.devices;
  }

  public getDeviceById(id: string): Device | undefined {
    return this.devices.find((d) => d.id === id);
  }

  public getTelemetry(deviceId?: string): TelemetryPoint[] {
    if (!deviceId) return this.telemetry;
    return this.telemetry.filter((t) => t.deviceId === deviceId);
  }

  public getAlerts(): AlertRule[] {
    return this.alerts;
  }

  public getAutomations(): AutomationRule[] {
    return this.automations;
  }

  public getAutomationLogs(): AutomationLog[] {
    return this.autoLogs;
  }

  public getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  public getUnreadNotificationCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  public getCameras(): CameraConfig[] {
    return this.cameras;
  }

  // --- ACTIONS ---
  public updateUserProfile(updates: Partial<UserProfile>) {
    this.user = { ...this.user, ...updates };
    this.save(STORAGE_KEYS.USER, this.user);
    if (updates.demoMode !== undefined) {
      if (updates.demoMode) {
        this.startSimulation();
      } else {
        this.stopSimulation();
      }
    }
    this.notify();
  }

  public toggleDemoMode() {
    this.updateUserProfile({ demoMode: !this.user.demoMode });
  }

  public addDevice(device: Device) {
    this.devices = [device, ...this.devices];
    this.save(STORAGE_KEYS.DEVICES, this.devices);
    this.addNotification({
      title: 'New Device Registered',
      message: `Device "${device.name}" (${device.type}) was registered. Ready for pairing.`,
      severity: 'info',
      deviceId: device.id,
    });
    this.notify();
  }

  public updateDevice(id: string, updates: Partial<Device>) {
    this.devices = this.devices.map((d) => (d.id === id ? { ...d, ...updates } : d));
    this.save(STORAGE_KEYS.DEVICES, this.devices);
    this.notify();
  }

  public deleteDevice(id: string) {
    const dev = this.devices.find((d) => d.id === id);
    this.devices = this.devices.filter((d) => d.id !== id);
    this.telemetry = this.telemetry.filter((t) => t.deviceId !== id);
    this.save(STORAGE_KEYS.DEVICES, this.devices);
    this.save(STORAGE_KEYS.TELEMETRY, this.telemetry);
    if (dev) {
      this.addNotification({
        title: 'Device Removed',
        message: `Device "${dev.name}" has been unlinked from your account.`,
        severity: 'warning',
      });
    }
    this.notify();
  }

  public async sendDeviceCommand(
    deviceId: string,
    type: Device['capabilities'][number],
    value: any,
    pin?: number
  ): Promise<{ success: boolean; message: string }> {
    const dev = this.devices.find((d) => d.id === deviceId);
    if (!dev) return { success: false, message: 'Device not found' };

    try {
      // Send to server API
      const res = await fetch(`/api/devices/${deviceId}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch command');
      }

      this.addNotification({
        title: 'Command Sent',
        message: `Executed ${type.toUpperCase()} (${value}) on ${dev.name}`,
        severity: 'info',
        deviceId,
      });

      return { success: true, message: data.message || 'Command queued successfully' };
    } catch (err: any) {
      // In demo mode or offline, simulate immediate actuator response
      if (dev.isDemo || this.user.demoMode) {
        this.addNotification({
          title: 'Actuator Triggered (Demo)',
          message: `Simulated ${type.toUpperCase()} command executed on demo hardware.`,
          severity: 'info',
          deviceId,
        });
        return { success: true, message: `Command applied to demo node ${dev.name}` };
      }
      return { success: false, message: err.message || 'Command dispatch failed' };
    }
  }

  public addTelemetryPoint(point: TelemetryPoint) {
    this.telemetry = [...this.telemetry, point];
    if (this.telemetry.length > 500) {
      this.telemetry.shift();
    }
    this.save(STORAGE_KEYS.TELEMETRY, this.telemetry);

    // Update device sensor values
    const dev = this.devices.find((d) => d.id === point.deviceId);
    if (dev) {
      dev.status = 'online';
      dev.lastSeen = point.timestamp;
      dev.sensors.forEach((s) => {
        let val: number | undefined;
        if (s.type === 'temperature') val = point.temperature;
        else if (s.type === 'humidity') val = point.humidity;
        else if (s.type === 'air_quality') val = point.airQuality;
        else if (s.type === 'light') val = point.light;

        if (val !== undefined) {
          s.previousValue = s.currentValue;
          s.currentValue = val;
          s.lastUpdated = point.timestamp;
          if (s.todayMin === undefined || val < s.todayMin) s.todayMin = val;
          if (s.todayMax === undefined || val > s.todayMax) s.todayMax = val;
        }
      });
      this.save(STORAGE_KEYS.DEVICES, this.devices);
    }

    // Evaluate rules
    this.evaluateAlertsAndAutomations(point);
    this.notify();
  }

  private evaluateAlertsAndAutomations(point: TelemetryPoint) {
    // Check Alerts
    this.alerts.forEach((alert) => {
      if (!alert.enabled || alert.deviceId !== point.deviceId) return;
      let val: number | undefined;
      if (alert.sensorType === 'temperature') val = point.temperature;
      else if (alert.sensorType === 'humidity') val = point.humidity;
      else if (alert.sensorType === 'air_quality') val = point.airQuality;

      if (val === undefined) return;

      let triggered = false;
      switch (alert.operator) {
        case '>':
          triggered = val > alert.threshold;
          break;
        case '<':
          triggered = val < alert.threshold;
          break;
        case '>=':
          triggered = val >= alert.threshold;
          break;
        case '<=':
          triggered = val <= alert.threshold;
          break;
        case '==':
          triggered = val === alert.threshold;
          break;
        case '!=':
          triggered = val !== alert.threshold;
          break;
      }

      if (triggered) {
        alert.triggerCount += 1;
        alert.lastTriggered = new Date().toISOString();
        this.addNotification({
          title: `Alert: ${alert.name}`,
          message: `${alert.message} (Current value: ${val})`,
          severity: alert.severity,
          deviceId: alert.deviceId,
        });
      }
    });

    // Check Automations
    this.automations.forEach((auto) => {
      if (!auto.enabled || auto.conditionDeviceId !== point.deviceId) return;
      let val: number | undefined;
      if (auto.conditionSensorType === 'temperature') val = point.temperature;
      else if (auto.conditionSensorType === 'humidity') val = point.humidity;
      else if (auto.conditionSensorType === 'air_quality') val = point.airQuality;

      if (val === undefined) return;

      let triggered = false;
      switch (auto.operator) {
        case '>':
          triggered = val > auto.threshold;
          break;
        case '<':
          triggered = val < auto.threshold;
          break;
        case '>=':
          triggered = val >= auto.threshold;
          break;
        case '<=':
          triggered = val <= auto.threshold;
          break;
        case '==':
          triggered = val === auto.threshold;
          break;
      }

      if (triggered) {
        auto.executionCount += 1;
        auto.lastTriggered = new Date().toISOString();
        const log: AutomationLog = {
          id: 'log_' + Date.now(),
          ruleId: auto.id,
          ruleName: auto.name,
          timestamp: new Date().toISOString(),
          triggerValue: val,
          actionTaken: `Executed ${auto.actionType} (${auto.actionValue}) on ${auto.targetDeviceId}`,
          status: 'success',
        };
        this.autoLogs = [log, ...this.autoLogs.slice(0, 50)];
        this.save(STORAGE_KEYS.AUTO_LOGS, this.autoLogs);
        this.sendDeviceCommand(auto.targetDeviceId, auto.actionType as any, auto.actionValue, auto.actionPin);
      }
    });

    this.save(STORAGE_KEYS.ALERTS, this.alerts);
    this.save(STORAGE_KEYS.AUTOMATIONS, this.automations);
  }

  public addAlertRule(rule: AlertRule) {
    this.alerts = [rule, ...this.alerts];
    this.save(STORAGE_KEYS.ALERTS, this.alerts);
    this.notify();
  }

  public updateAlertRule(id: string, updates: Partial<AlertRule>) {
    this.alerts = this.alerts.map((a) => (a.id === id ? { ...a, ...updates } : a));
    this.save(STORAGE_KEYS.ALERTS, this.alerts);
    this.notify();
  }

  public deleteAlertRule(id: string) {
    this.alerts = this.alerts.filter((a) => a.id !== id);
    this.save(STORAGE_KEYS.ALERTS, this.alerts);
    this.notify();
  }

  public addAutomation(rule: AutomationRule) {
    this.automations = [rule, ...this.automations];
    this.save(STORAGE_KEYS.AUTOMATIONS, this.automations);
    this.notify();
  }

  public updateAutomation(id: string, updates: Partial<AutomationRule>) {
    this.automations = this.automations.map((a) => (a.id === id ? { ...a, ...updates } : a));
    this.save(STORAGE_KEYS.AUTOMATIONS, this.automations);
    this.notify();
  }

  public deleteAutomation(id: string) {
    this.automations = this.automations.filter((a) => a.id !== id);
    this.save(STORAGE_KEYS.AUTOMATIONS, this.automations);
    this.notify();
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'userId' | 'timestamp' | 'read'>) {
    const notif: NotificationItem = {
      ...item,
      id: 'notif_' + Date.now() + Math.random().toString(36).substr(2, 4),
      userId: this.user.uid,
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.notifications = [notif, ...this.notifications.slice(0, 99)];
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    // Trigger browser notification if allowed
    if (this.user.browserNotifications && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(notif.title, { body: notif.message, icon: '/icon.svg' });
        } catch {
          // ignore
        }
      }
    }
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markNotificationRead(id: string) {
    this.markNotificationAsRead(id);
  }

  public markAllNotificationsAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markAllNotificationsRead() {
    this.markAllNotificationsAsRead();
  }

  public clearAllNotifications() {
    this.notifications = [];
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public clearNotifications() {
    this.clearAllNotifications();
  }

  public updateUser(updates: Partial<UserProfile>) {
    this.updateUserProfile(updates);
  }

  public addAlert(rule: AlertRule) {
    this.addAlertRule(rule);
  }

  public updateAlert(id: string, updates: Partial<AlertRule>) {
    this.updateAlertRule(id, updates);
  }

  public deleteAlert(id: string) {
    this.deleteAlertRule(id);
  }

  public exportTelemetryCSV() {
    const headers = ['Timestamp', 'DeviceId', 'Temperature_C', 'Humidity_Pct', 'AirQuality_AQI', 'Light_Lux', 'Battery_Pct'];
    const rows = this.telemetry.map(t => [
      t.timestamp,
      t.deviceId,
      t.temperature ?? '',
      t.humidity ?? '',
      t.airQuality ?? '',
      t.light ?? '',
      t.battery ?? '',
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `akshu_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public updateCamera(id: string, updates: Partial<CameraConfig>) {
    this.cameras = this.cameras.map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.save(STORAGE_KEYS.CAMERAS, this.cameras);
    this.notify();
  }

  public addCamera(camera: CameraConfig) {
    this.cameras = [...this.cameras, camera];
    this.save(STORAGE_KEYS.CAMERAS, this.cameras);
    this.notify();
  }

  // --- SIMULATION (DEMO MODE ONLY) ---
  private startSimulation() {
    if (this.simulationInterval) return;
    this.simulationInterval = setInterval(() => {
      if (!this.user.demoMode) return;
      const demoDev = this.devices.find((d) => d.id === 'demo_esp32_01' && d.isDemo);
      if (!demoDev) return;

      const currentTemp = demoDev.sensors.find((s) => s.type === 'temperature')?.currentValue || 24.5;
      const currentHum = demoDev.sensors.find((s) => s.type === 'humidity')?.currentValue || 52;
      const currentAqi = demoDev.sensors.find((s) => s.type === 'air_quality')?.currentValue || 38;

      // Subtle realistic micro-fluctuations
      const newTemp = Number((currentTemp + (Math.random() - 0.49) * 0.15).toFixed(1));
      const newHum = Number((currentHum + (Math.random() - 0.49) * 0.3).toFixed(1));
      const newAqi = Math.max(15, Math.min(180, Math.round(currentAqi + (Math.random() - 0.49) * 1.5)));

      const point: TelemetryPoint = {
        id: 'sim_tel_' + Date.now(),
        deviceId: 'demo_esp32_01',
        timestamp: new Date().toISOString(),
        temperature: newTemp,
        humidity: newHum,
        airQuality: newAqi,
        battery: demoDev.battery || 90,
        light: 450 + Math.floor(Math.random() * 50),
      };

      this.addTelemetryPoint(point);
    }, 4000);
  }

  private stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  // Unit conversion helper
  public formatTemp(celsius: number): string {
    if (this.user.tempUnit === 'fahrenheit') {
      const f = (celsius * 9) / 5 + 32;
      return `${f.toFixed(1)}°F`;
    }
    return `${celsius.toFixed(1)}°C`;
  }
}

export const store = new AppStore();
