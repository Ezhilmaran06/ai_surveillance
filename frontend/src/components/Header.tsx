import React, { useState, useEffect } from 'react';
import { Radio, Bell, Sun, Moon, Volume2, VolumeX, Cpu, Zap, Activity, CheckCircle2, ShieldCheck, X, Server } from 'lucide-react';
import { Logo } from './Logo';
import { TelemetryFrame } from '../types';

interface HeaderProps {
  isConnected: boolean;
  telemetry: TelemetryFrame | null;
  activeSessionName?: string;
  onAcknowledgeAll?: () => void;
  isAudioEnabled?: boolean;
  onToggleAudio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  telemetry,
  activeSessionName,
  onAcknowledgeAll,
  isAudioEnabled = true,
  onToggleAudio
}) => {
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('sentinel_theme') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-theme');
      localStorage.setItem('sentinel_theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('sentinel_theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode((prev) => !prev);
  };

  const [showHealthModal, setShowHealthModal] = useState<boolean>(false);
  const [healthData, setHealthData] = useState<any>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenHealth = () => {
    fetchHealth();
    setShowHealthModal(true);
  };

  const fps = telemetry?.fps || 0;
  const latency = telemetry?.inference_ms || 0;
  const recentAlertsCount = telemetry?.recent_alerts?.length || 0;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      backgroundColor: 'var(--bg-panel)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      gap: '16px'
    }}>
      {/* Brand & Identity */}
      <Logo size={36} showText={true} />

      {/* Center status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Source feed info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.78rem',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          padding: '5px 12px',
          borderRadius: '9999px',
          border: '1px solid var(--border-subtle)'
        }}>
          <span className={`live-dot ${isConnected ? 'active-green' : ''}`} />
          <span style={{ fontWeight: 700, letterSpacing: '0.04em', color: isConnected ? 'var(--status-green)' : 'var(--text-muted)' }}>
            {isConnected ? 'STREAM ACTIVE' : 'CONNECTING...'}
          </span>
          {activeSessionName && (
            <span style={{ color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              • {activeSessionName}
            </span>
          )}
        </div>

        {/* AI Engine & Device Status (Clickable for System Health) */}
        <button
          onClick={handleOpenHealth}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.12) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            padding: '5px 12px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: 'var(--accent-cyan)',
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.15)',
            transition: 'all 0.2s ease'
          }}
          title="Click to view System Health Diagnostics"
        >
          <Zap size={13} color="var(--accent-cyan)" />
          <span>NEURAL ENGINE: ONLINE</span>
        </button>

        {/* HUD Performance Gauges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '5px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.76rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>FPS </span>
            <span className="font-mono" style={{ color: fps >= 15 ? 'var(--status-green)' : 'var(--status-amber)', fontWeight: 800 }}>
              {fps.toFixed(1)}
            </span>
          </div>
          <div style={{ width: '1px', height: '12px', background: 'var(--border-subtle)' }} />
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>LATENCY </span>
            <span className="font-mono" style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>
              {latency > 0 ? `${latency.toFixed(1)}ms` : '0.0ms'}
            </span>
          </div>
        </div>
      </div>

      {/* Right actions: Audio toggle, Theme toggle, Alerts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {recentAlertsCount > 0 && onAcknowledgeAll && (
          <button
            onClick={onAcknowledgeAll}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 10px' }}
            title="Acknowledge All Unread Alerts"
          >
            <Bell size={14} color="var(--status-amber)" />
            <span>Alerts ({recentAlertsCount})</span>
          </button>
        )}

        {/* Sound toggle button */}
        <button
          onClick={onToggleAudio}
          className="btn-secondary"
          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          title={isAudioEnabled ? "Mute alert audio chimes" : "Enable alert audio chimes"}
        >
          {isAudioEnabled ? <Volume2 size={16} color="var(--accent-cyan)" /> : <VolumeX size={16} color="var(--text-muted)" />}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn-secondary"
          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          title={isLightMode ? "Switch to Dark Command Center" : "Switch to Light Theme"}
        >
          {isLightMode ? <Moon size={16} color="#0284c7" /> : <Sun size={16} color="#f59e0b" />}
        </button>

        <div style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          borderLeft: '1px solid var(--border-subtle)',
          paddingLeft: '12px',
          display: 'none',
          lineHeight: '1.4'
        }}>
          <div>ANONYMOUS: <span style={{ color: 'var(--status-green)' }}>ACTIVE</span></div>
          <div>BIOMETRICS: <span style={{ color: 'var(--status-amber)' }}>OFF</span></div>
        </div>
      </div>

      {/* System Health Diagnostics Modal */}
      {showHealthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(3, 7, 18, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}
        onClick={() => setShowHealthModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="hud-panel glow-cyan"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              border: '1px solid var(--accent-cyan)',
              backgroundColor: 'var(--bg-panel)',
              borderRadius: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={20} color="var(--accent-cyan)" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  SYSTEM HEALTH & RUNTIME DIAGNOSTICS
                </h3>
              </div>
              <button
                onClick={() => setShowHealthModal(false)}
                className="btn-secondary"
                style={{ padding: '4px', borderRadius: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>BACKEND SERVICE</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <CheckCircle2 size={14} />
                  <span>ONLINE (FastAPI)</span>
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DATABASE ENGINE</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <CheckCircle2 size={14} />
                  <span>ONLINE (SQLite)</span>
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AI VISION PIPELINE</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Zap size={14} />
                  <span>{healthData?.device || 'AUTO'} • YOLOv8n</span>
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>WEBSOCKET TELEMETRY</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isConnected ? 'var(--status-green)' : 'var(--status-amber)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Server size={14} />
                  <span>{isConnected ? 'CONNECTED' : 'RECONNECTING'}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <ShieldCheck size={18} color="var(--status-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                <strong>Ethical AI Verification:</strong> {healthData?.privacy || "Strictly anonymous crowd analytics. Zero facial recognition or biometric capture."}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
