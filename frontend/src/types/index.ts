export interface Session {
  id: number;
  name: string;
  source_type: 'upload' | 'webcam' | 'sample';
  source_path?: string;
  status: 'idle' | 'processing' | 'completed' | 'failed' | 'stopped';
  fps: number;
  total_frames: number;
  processed_frames: number;
  duration_seconds: number;
  resolution: string;
  created_at: string;
  ended_at?: string;
}

export interface Zone {
  id: number;
  name: string;
  zone_type: 'polygon' | 'line';
  coordinates_json: string;
  color: string;
  max_capacity: number;
  dwell_threshold_seconds: number;
  is_active: boolean;
  created_at: string;
}

export interface Alert {
  id: number;
  session_id?: number;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  zone_name?: string;
  track_id?: number;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface TrackData {
  track_id: number;
  label: string;
  bbox: [number, number, number, number];
  conf: number;
  foot_point: [number, number];
  centroid: [number, number];
  dwell_time: number;
  zones: string[];
  trajectory: [number, number][];
}

export interface TelemetryFrame {
  type: 'frame_update' | 'connection_established';
  session_id?: number;
  frame_number?: number;
  total_frames?: number;
  timestamp?: number;
  fps?: number;
  inference_ms?: number;
  people_count?: number;
  peak_count?: number;
  density_index?: number;
  average_dwell_time?: number;
  entries?: number;
  exits?: number;
  active_tracks?: TrackData[];
  zone_occupancies?: Record<string, number>;
  recent_alerts?: Alert[];
  zones_meta?: Array<{
    name: string;
    type: string;
    coordinates: [number, number][];
    color: string;
    max_capacity: number;
  }>;
}

export interface AnalyticsRecord {
  id: number;
  session_id: number;
  timestamp: string;
  frame_number: number;
  current_count: number;
  peak_count: number;
  average_dwell_time: number;
  density_score: number;
  entries_count: number;
  exits_count: number;
  zone_occupancy_json: string;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  weight: number;
}
