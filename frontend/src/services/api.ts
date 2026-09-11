import { Session, Zone, Alert, AnalyticsRecord, HeatmapPoint } from '../types';

const API_BASE = '/api';

export const api = {
  // Health
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Sessions
  getSessions: async (): Promise<Session[]> => {
    const res = await fetch(`${API_BASE}/sessions`);
    return res.json();
  },

  uploadVideo: async (file: File): Promise<Session> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/sessions/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  createWebcamSession: async (): Promise<Session> => {
    const res = await fetch(`${API_BASE}/sessions/webcam`, { method: 'POST' });
    return res.json();
  },

  createSampleSession: async (): Promise<Session> => {
    const res = await fetch(`${API_BASE}/sessions/sample`, { method: 'POST' });
    return res.json();
  },

  startSession: async (sessionId: number) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/start`, { method: 'POST' });
    return res.json();
  },

  pauseSession: async (sessionId: number) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/pause`, { method: 'POST' });
    return res.json();
  },

  stopSession: async (sessionId: number) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/stop`, { method: 'POST' });
    return res.json();
  },

  deleteSession: async (sessionId: number) => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`, { method: 'DELETE' });
    return res.json();
  },

  // Zones
  getZones: async (): Promise<Zone[]> => {
    const res = await fetch(`${API_BASE}/zones`);
    return res.json();
  },

  createZone: async (zone: Partial<Zone>): Promise<Zone> => {
    const res = await fetch(`${API_BASE}/zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zone),
    });
    return res.json();
  },

  updateZone: async (id: number, zone: Partial<Zone>): Promise<Zone> => {
    const res = await fetch(`${API_BASE}/zones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zone),
    });
    return res.json();
  },

  deleteZone: async (id: number) => {
    const res = await fetch(`${API_BASE}/zones/${id}`, { method: 'DELETE' });
    return res.json();
  },

  createDefaultZones: async () => {
    const res = await fetch(`${API_BASE}/zones/defaults`, { method: 'POST' });
    return res.json();
  },

  // Alerts
  getAlerts: async (sessionId?: number, limit = 100): Promise<Alert[]> => {
    const url = sessionId
      ? `${API_BASE}/alerts?session_id=${sessionId}&limit=${limit}`
      : `${API_BASE}/alerts?limit=${limit}`;
    const res = await fetch(url);
    return res.json();
  },

  acknowledgeAlert: async (alertId: number): Promise<Alert> => {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, { method: 'POST' });
    return res.json();
  },

  acknowledgeAllAlerts: async () => {
    const res = await fetch(`${API_BASE}/alerts/acknowledge-all`, { method: 'POST' });
    return res.json();
  },

  clearAlerts: async () => {
    const res = await fetch(`${API_BASE}/alerts/clear`, { method: 'DELETE' });
    return res.json();
  },

  // Analytics
  getAnalyticsHistory: async (sessionId?: number): Promise<AnalyticsRecord[]> => {
    const url = sessionId
      ? `${API_BASE}/analytics/history?session_id=${sessionId}`
      : `${API_BASE}/analytics/history`;
    const res = await fetch(url);
    return res.json();
  },

  getHeatmapPoints: async (): Promise<HeatmapPoint[]> => {
    const res = await fetch(`${API_BASE}/analytics/heatmap`);
    return res.json();
  },

  // Settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  updateSettings: async (settings: Record<string, any>) => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },
};
