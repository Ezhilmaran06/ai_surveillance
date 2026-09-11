import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Cpu, Sliders, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>({
    yolo_model: 'yolov8n.pt',
    confidence: 0.35,
    iou: 0.45,
    max_crowd_capacity: 15,
    max_dwell_seconds: 10,
    alert_cooldown_seconds: 5,
    privacy_mode: 'Anonymous Trackers Only',
    hardware_acceleration: 'Auto (CUDA if present, else CPU)'
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    api.getSettings().then((data) => {
      if (data) setSettings(data);
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await api.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
            Vision Pipeline & Operational Settings
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Tune neural inference parameters, confidence boundaries, crowd congestion limits, and privacy protocols.
          </p>
        </div>

        <button onClick={handleSave} disabled={isSaving} className="btn-primary" style={{ fontSize: '0.8rem' }}>
          {savedSuccess ? <CheckCircle size={14} color="#ffffff" /> : <Save size={14} />}
          <span>{savedSuccess ? 'Settings Saved!' : isSaving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Left Column: AI Detection & Inference Tuning */}
        <div className="hud-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.88rem' }}>
            <Sliders size={18} />
            <span>AI INFERENCE & DETECTION PARAMS</span>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              YOLO Vision Model
            </label>
            <input
              type="text"
              value={settings.yolo_model || 'yolov8n.pt'}
              readOnly
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--accent-cyan)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem'
              }}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Lightweight Ultralytics model optimized for laptop CPU & CUDA edge execution.
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Detection Confidence Threshold
              </label>
              <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                {settings.confidence}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={settings.confidence || 0.35}
              onChange={(e) => setSettings({ ...settings, confidence: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                IoU (Intersection Over Union) Threshold
              </label>
              <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                {settings.iou}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={settings.iou || 0.45}
              onChange={(e) => setSettings({ ...settings, iou: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Right Column: Alert Thresholds & Privacy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="hud-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-amber)', fontWeight: 700, fontSize: '0.88rem' }}>
              <Cpu size={18} />
              <span>CROWD CAPACITY & ALERT RULES</span>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Global Crowd Capacity Alert Trigger
              </label>
              <input
                type="number"
                min="3"
                max="100"
                value={settings.max_crowd_capacity || 15}
                onChange={(e) => setSettings({ ...settings, max_crowd_capacity: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.82rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Loitering Dwell Time Limit (seconds)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.max_dwell_seconds || 10}
                onChange={(e) => setSettings({ ...settings, max_dwell_seconds: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.82rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Alert Cooldown Period (seconds)
              </label>
              <input
                type="number"
                min="2"
                max="30"
                value={settings.alert_cooldown_seconds || 5}
                onChange={(e) => setSettings({ ...settings, alert_cooldown_seconds: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.82rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Movement Anomaly Threshold (px/sec)
              </label>
              <input
                type="number"
                min="50"
                max="500"
                step="10"
                value={settings.movement_threshold || 180}
                onChange={(e) => setSettings({ ...settings, movement_threshold: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.82rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Inference Processing Target FPS
              </label>
              <select
                value={settings.target_fps || 30}
                onChange={(e) => setSettings({ ...settings, target_fps: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.82rem'
                }}
              >
                <option value={15}>15 FPS (Power Saver / Edge CPU)</option>
                <option value={24}>24 FPS (Cinematic / Standard)</option>
                <option value={30}>30 FPS (Full Real-time Stream)</option>
              </select>
            </div>
          </div>

          <div className="hud-panel" style={{ padding: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-green)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '6px' }}>
              <ShieldCheck size={16} />
              <span>ETHICAL PRIVACY DISCLOSURE</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              This platform adheres to strict anonymous crowd analytics principles. Biometric identification, facial feature vector extraction, and facial database storage are strictly excluded by design.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
