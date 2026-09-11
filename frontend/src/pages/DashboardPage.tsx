import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  Gauge,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Maximize2,
  Video,
  Layers,
  ShieldAlert,
  Clock,
  Zap,
  Activity,
  ArrowRightLeft,
  BarChart3,
  Play
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { TelemetryFrame, Session, Zone, Alert } from '../types';

interface DashboardPageProps {
  telemetry: TelemetryFrame | null;
  activeSession: Session | null;
  zones: Zone[];
  alerts: Alert[];
  onNavigateToMonitor: () => void;
  onNavigateToZones: () => void;
  onNavigateToAlerts: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  telemetry,
  activeSession,
  zones,
  alerts,
  onNavigateToMonitor,
  onNavigateToZones,
  onNavigateToAlerts
}) => {
  const currentCount = telemetry?.people_count ?? 0;
  const peakCount = telemetry?.peak_count ?? 0;
  const entries = telemetry?.entries ?? 0;
  const exits = telemetry?.exits ?? 0;
  const activeAlertsCount = alerts.filter(a => !a.acknowledged).length;

  // Custom Glassmorphic Recharts Tooltip
  const GlassTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(10, 15, 29, 0.94)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '8px',
          padding: '8px 12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          fontSize: '0.78rem'
        }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>{label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: entry.color || '#ffffff' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: entry.color }} />
              <span style={{ fontWeight: 600 }}>{entry.name}:</span>
              <span className="font-mono" style={{ fontWeight: 700 }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Real-time chart data points from telemetry or historical buffer
  const [timelineData, setTimelineData] = useState<Array<{ time: string; count: number; density: number }>>([]);

  React.useEffect(() => {
    if (!telemetry) return;
    const nowStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTimelineData(prev => {
      const next = [...prev, { time: nowStr, count: telemetry.people_count ?? 0, density: Math.round((telemetry.density_index ?? 0) * 100) }];
      return next.slice(-25); // keep latest 25 points
    });
  }, [telemetry?.frame_number]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top KPI row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '14px'
      }}>
        <StatCard
          title="CURRENT OCCUPANCY"
          value={currentCount}
          subValue={`Status: ${currentCount > 15 ? 'HIGH CONGESTION' : currentCount > 8 ? 'MODERATE FLOW' : 'OPTIMAL DENSITY'}`}
          icon={Users}
          color="var(--accent-cyan)"
        />
        <StatCard
          title="PEAK CROWD"
          value={peakCount}
          subValue="Session Max Seen"
          icon={TrendingUp}
          color="var(--accent-blue)"
        />
        <StatCard
          title="CROWD DENSITY"
          value={`${(currentCount / 50.0).toFixed(2)} /m²`}
          subValue="Estimated Spatial Area"
          icon={Gauge}
          color="var(--accent-indigo)"
        />
        <StatCard
          title="ACTIVE ALERTS"
          value={activeAlertsCount}
          subValue="Unacknowledged events"
          icon={AlertTriangle}
          color={activeAlertsCount > 0 ? "var(--status-red)" : "var(--status-green)"}
        />
        <StatCard
          title="ENTRIES"
          value={entries}
          subValue="Directional IN trips"
          icon={ArrowDownRight}
          color="var(--status-green)"
        />
        <StatCard
          title="EXITS"
          value={exits}
          subValue="Directional OUT trips"
          icon={ArrowUpRight}
          color="var(--accent-blue)"
        />
      </div>

      {/* Main Grid: Video Stream Panel + Live Incident Ticker */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
      }}>
        {/* Live Surveillance Preview */}
        <div className="hud-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Optical Sensor Feed & Spatial Overlays</h3>
              <span className="live-dot active-green" style={{ marginLeft: '4px' }} />
            </div>
            <button
              onClick={onNavigateToMonitor}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '5px 12px' }}
            >
              <Maximize2 size={13} />
              <span>Full Screen Monitor</span>
            </button>
          </div>

          <div style={{
            position: 'relative',
            backgroundColor: '#030712',
            borderRadius: '10px',
            overflow: 'hidden',
            aspectRatio: '16/9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)'
          }}>
            {/* HUD Corner Brackets */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', width: '14px', height: '14px', borderTop: '2px solid var(--accent-cyan)', borderLeft: '2px solid var(--accent-cyan)', zIndex: 5, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '14px', height: '14px', borderTop: '2px solid var(--accent-cyan)', borderRight: '2px solid var(--accent-cyan)', zIndex: 5, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '14px', height: '14px', borderBottom: '2px solid var(--accent-cyan)', borderLeft: '2px solid var(--accent-cyan)', zIndex: 5, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '14px', height: '14px', borderBottom: '2px solid var(--accent-cyan)', borderRight: '2px solid var(--accent-cyan)', zIndex: 5, pointerEvents: 'none' }} />

            {activeSession ? (
              <img
                src={`/api/sessions/${activeSession.id}/stream?t=${Date.now()}`}
                alt="Live AI Surveillance Feed"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                <Video size={36} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                <p>No active surveillance stream selected</p>
              </div>
            )}

            {/* Quick HUD badge inside video */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'rgba(6, 9, 19, 0.82)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 6
            }}>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>OCCUPANCY:</span>
              <span className="font-mono" style={{ fontWeight: 800 }}>{currentCount}</span>
              <span style={{ color: 'var(--border-subtle)', margin: '0 2px' }}>|</span>
              <span style={{ color: 'var(--text-muted)' }}>FPS:</span>
              <span className="font-mono" style={{ color: 'var(--status-green)', fontWeight: 700 }}>
                {telemetry?.fps ? telemetry.fps.toFixed(1) : '30.0'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Alerts & Incident Log */}
        <div className="hud-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="var(--status-amber)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Security Alerts Ticker</h3>
            </div>
            <button
              onClick={onNavigateToAlerts}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              View All ({alerts.length})
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflowY: 'auto',
            maxHeight: '380px'
          }}>
            {alerts.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0', fontSize: '0.85rem' }}>
                No alerts detected. Perimeter clear.
              </div>
            ) : (
              alerts.slice(0, 8).map((alert) => {
                const isCrit = alert.severity === 'critical';
                return (
                  <div
                    key={alert.id}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: isCrit ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-main)',
                      border: `1px solid ${isCrit ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`,
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={isCrit ? 'badge-critical' : 'badge-warning'}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {alert.alert_type}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {alert.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Analytics Charts & Zone Capacities Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
      }}>
        {/* Real-Time People Timeline Chart */}
        <div className="hud-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Real-Time Occupancy Flow Curve
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest telemetry buffer</span>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData.length > 0 ? timelineData : [{ time: '00:00', count: 0, density: 0 }]}>
                <defs>
                  <linearGradient id="countGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.65}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<GlassTooltip />} />
                <Area type="monotone" dataKey="count" name="People Count" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#countGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Capacities & Health */}
        <div className="hud-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>Perimeter Zones</h3>
            </div>
            <button
              onClick={onNavigateToZones}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              Studio
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '220px' }}>
            {zones.filter(z => z.zone_type === 'polygon').length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>
                No polygon zones created yet.
              </div>
            ) : (
              zones.filter(z => z.zone_type === 'polygon').map((z) => {
                const occ = telemetry?.zone_occupancies?.[z.name] ?? 0;
                const pct = Math.min(100, Math.round((occ / Math.max(1, z.max_capacity)) * 100));
                const isOver = occ >= z.max_capacity;
                return (
                  <div key={z.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{z.name}</span>
                      <span className="font-mono" style={{ color: isOver ? 'var(--status-red)' : 'var(--text-secondary)' }}>
                        {occ} / {z.max_capacity} ({pct}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: isOver ? 'var(--status-red)' : pct > 70 ? 'var(--status-amber)' : 'var(--accent-cyan)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Directional Crossings & Alert Distribution Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        {/* Directional Crossings Chart */}
        <div className="hud-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowRightLeft size={16} color="var(--accent-indigo)" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Perimeter Line Crossings (Entries vs Exits)
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Occupancy: {entries - exits}</span>
          </div>

          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { category: 'Tripwire Inflow', count: entries, fill: '#10b981' },
                  { category: 'Tripwire Outflow', count: exits, fill: '#38bdf8' },
                  { category: 'Net Presence', count: Math.max(0, entries - exits), fill: '#06b6d4' }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<GlassTooltip />} />
                <Bar dataKey="count" name="Persons" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Severity Distribution */}
        <div className="hud-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} color="var(--status-red)" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Security Incident Severity Distribution
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total: {alerts.length}</span>
          </div>

          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { severity: 'CRITICAL', count: alerts.filter(a => a.severity === 'critical').length, fill: '#ef4444' },
                  { severity: 'WARNING', count: alerts.filter(a => a.severity === 'warning').length, fill: '#f59e0b' },
                  { severity: 'INFO', count: alerts.filter(a => a.severity === 'info').length, fill: '#06b6d4' }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="severity" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<GlassTooltip />} />
                <Bar dataKey="count" name="Incidents" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
