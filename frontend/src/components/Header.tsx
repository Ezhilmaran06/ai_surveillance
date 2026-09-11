import React from 'react';
import { Shield, Radio, Bell, AlertTriangle } from 'lucide-react';
import { TelemetryFrame } from '../types';

interface HeaderProps {
  isConnected: boolean;
  telemetry: TelemetryFrame | null;
  activeSessionName?: string;
  onAcknowledgeAll?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  telemetry,
  activeSessionName,
  onAcknowledgeAll
}) => {
  const fps = telemetry?.fps ?? 0;
  const latency = telemetry?.inference_ms ?? 0;
  const recentAlertsCount = telemetry?.recent_alerts?.length ?? 0;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      backgroundColor: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand & Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)'
        }}>
          <Shield size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.04em', color: '#ffffff' }}>
              AEGISVISION <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
            </h1>
            <span style={{
              fontSize: '0.65rem',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              fontWeight: 700,
              letterSpacing: '0.06em'
            }}>COMMAND CENTER</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Privacy-First Anonymous Crowd & Perimeter Analytics
          </p>
        </div>
      </div>

      {/* Center status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Source feed info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span className={`live-dot ${isConnected ? 'active-green' : ''}`} />
          <span style={{ fontWeight: 600, color: isConnected ? 'var(--status-green)' : 'var(--text-muted)' }}>
            {isConnected ? 'LIVE FEED ACTIVE' : 'DISCONNECTED'}
          </span>
          {activeSessionName && (
            <span style={{ color: 'var(--text-muted)' }}>• {activeSessionName}</span>
          )}
        </div>

        {/* HUD Performance Gauges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(8, 12, 20, 0.6)',
          padding: '6px 14px',
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
            <span style={{ color: 'var(--text-muted)' }}>INFERENCE: </span>
            <span className="font-mono" style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
              {latency > 0 ? `${latency.toFixed(1)}ms` : '0.0ms'}
            </span>
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {recentAlertsCount > 0 && onAcknowledgeAll && (
          <button
            onClick={onAcknowledgeAll}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            <Bell size={14} color="var(--status-amber)" />
            Acknowledge Alerts ({recentAlertsCount})
          </button>
        )}
        <div style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          borderLeft: '1px solid var(--border-subtle)',
          paddingLeft: '12px',
          textAlign: 'right'
        }}>
          <div>ANONYMOUS ID: <span style={{ color: 'var(--status-green)' }}>ACTIVE</span></div>
          <div>BIOMETRICS: <span style={{ color: 'var(--status-amber)' }}>DISABLED</span></div>
        </div>
      </div>
    </header>
  );
};
