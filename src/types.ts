export type DeviceType = 'ESP32' | 'ESP32-CAM' | 'ESP32-S3' | 'ESP8266' | 'CUSTOM';

export type DeviceStatus = 'online' | 'offline' | 'connecting' | 'error';

export type SensorType = 
  | 'temperature' 
  | 'humidity' 
  | 'air_quality' 
  | 'gas' 
  | 'light' 
  | 'uv' 
  | 'motion' 
  | 'vibration' 
  | 'soil_moisture' 
  | 'pressure' 
  | 'battery' 
  | 'custom';

export type SensorStatus = 'active' | 'warning' | 'critical' | 'offline';

export interface SensorData {
  id: string;
  deviceId: string;
  name: string;
  type: SensorType;
  unit: string;
  currentValue: number;
  previousValue?: number;
  minRange: number;
  maxRange: number;
  todayMin?: number;
  todayMax?: number;
  calibrationOffset?: number;
  status: SensorStatus;
  lastUpdated: string;
}

export interface DeviceCommand {
  id: string;
  deviceId: string;
  type: 'digital_write' | 'pwm' | 'relay_toggle' | 'fan_control' | 'light_control' | 'buzzer' | 'servo_angle' | 'restart' | 'custom';
  pin?: number;
  value: boolean | number | string;
  status: 'pending' | 'sent' | 'executed' | 'failed';
  createdAt: string;
  executedAt?: string;
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  deviceKey: string;
  ipAddress?: string;
  firmwareVersion?: string;
  wifiRssi?: number;
  battery?: number;
  capabilities: string[];
  isDemo?: boolean;
  lastSeen?: string;
  createdAt: string;
  sensors: SensorData[];
}

export interface TelemetryPoint {
  id: string;
  deviceId: string;
  timestamp: string;
  temperature?: number;
  humidity?: number;
  airQuality?: number;
  battery?: number;
  light?: number;
  pressure?: number;
  motion?: boolean;
  raw?: Record<string, any>;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertRule {
  id: string;
  userId: string;
  name: string;
  deviceId: string;
  sensorType: SensorType;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold: number;
  severity: AlertSeverity;
  message?: string;
  channels?: string[];
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount?: number;
}

export interface AutomationRule {
  id: string;
  userId: string;
  name: string;
  conditionDeviceId: string;
  conditionSensorType: SensorType;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold: number;
  targetDeviceId: string;
  actionType: 'digital_write' | 'pwm' | 'relay_toggle' | 'fan_control' | 'light_control' | 'buzzer';
  actionPin?: number;
  actionValue: number | boolean;
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
  executionCount: number;
}

export interface AutomationLog {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: string;
  triggerValue: number;
  actionTaken: string;
  status: 'success' | 'failed';
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  read: boolean;
  timestamp: string;
  deviceId?: string;
  link?: string;
}

export type AppNotification = NotificationItem;

export interface CameraConfig {
  id: string;
  userId: string;
  deviceId?: string;
  name: string;
  streamUrl: string;
  snapshotUrl?: string;
  status: 'online' | 'offline' | 'unconfigured';
  resolution?: string;
  lastSeen?: string;
  requiresAuth?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role?: string;
  tempUnit: 'celsius' | 'fahrenheit';
  systemUnits: 'metric' | 'imperial';
  theme: 'dark' | 'light' | 'system';
  demoMode: boolean;
  browserNotifications: boolean;
  offlineNotifications: boolean;
  refreshInterval?: number;
  soundAlerts?: boolean;
  createdAt: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  isAnalysis?: boolean;
}

export interface AIAnalysisReport {
  currentStatus: string;
  importantChanges: string;
  possibleIssues: string;
  recommendations: string[];
  confidence: 'High' | 'Medium' | 'Low' | 'Insufficient Data';
  evaluatedAt: string;
}

export interface AIPrediction {
  metric: string;
  forecast: { time: string; predictedValue: number; confidenceMin: number; confidenceMax: number }[];
  summary: string;
  available: boolean;
  statusMessage?: string;
}
