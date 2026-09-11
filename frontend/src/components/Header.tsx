import React, { useState, useEffect } from 'react';
import { Radio, Bell, Sun, Moon, Volume2, VolumeX, Cpu, Zap } from 'lucide-react';
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

  const fps = telemetry?.fps ?? 0;
  const latency = telemetry?.inference_ms ?? 0;
  const recentAlertsCount = telemetry?.recent_alerts?.length ?? 0;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 24px',
      backgroundColor: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      gap: '16px'
    }}>
      {/* Brand & Identity */}
      <Logo size={36} showText={true} />

      {/* Center status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Source feed info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span className={`live-dot ${isConnected ? 'active-green' : ''}`} />
          <span style={{ fontWeight: 600, color: isConnected ? 'var(--status-green)' : 'var(--text-muted)' }}>
            {isConnected ? 'LIVE FEED ACTIVE' : 'RECONNECTING...'}
          </span>
          {activeSessionName && (
            <span style={{ color: 'var(--text-muted)' }}>• {activeSessionName}</span>
          )}
        </div>

        {/* AI Engine & Device Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--accent-cyan)'
        }}>
          <Zap size={13} />
          <span>AI ENGINE: ONLINE</span>
        </div>

        {/* HUD Performance Gauges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-main)',
          padding: '5px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>FPS: </span>
            <span className="font-mono" style={{ color: fps >= 15 ? 'var(--status-green)' : 'var(--status-amber)', fontWeight: 700 }}>
              {fps.toFixed(1)}
            </span>
          </div>
          <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />
          <div>
            <span style={{ color: 'var(--text-muted)' }}>LATENCY: </span>
            <span className="font-mono" style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
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
    </header>
  );
};
