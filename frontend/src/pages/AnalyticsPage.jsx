import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Flame,
  Download,
  RefreshCw,
  TrendingUp,
  Clock,
  ArrowRightLeft,
  Sparkles,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { api } from '../services/api.js';
import { Tooltip as InfoTooltip } from '../components/Tooltip.jsx';

export const AnalyticsPage = ({ activeSession }) => {
  const [history, setHistory] = useState([]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [insights, setInsights] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const heatmapCanvasRef = useRef(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await api.getAnalyticsHistory(activeSession?.id);
      setHistory(records.reverse()); // Chronological order

      const points = await api.getHeatmapPoints();
      setHeatmapPoints(points);

      const insData = await api.getInsights(activeSession?.id);
      if (insData?.insights) {
        setInsights(insData.insights);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [activeSession]);

  // Render 2D Heatmap on Canvas
  useEffect(() => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw floor grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Render thermal density glow spots
    heatmapPoints.forEach((pt) => {
      const px = pt.x * canvas.width;
      const py = pt.y * canvas.height;
      const radius = 24 + pt.weight * 22;

      const grad = ctx.createRadialGradient(px, py, 2, px, py, radius);
      if (pt.weight > 0.7) {
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.75)'); // Red critical
        grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.45)'); // Amber
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      } else if (pt.weight > 0.4) {
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.65)');
        grad.addColorStop(0.6, 'rgba(6, 182, 212, 0.35)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      } else {
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.55)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [heatmapPoints]);

  // Filter history records based on time filter
  const filteredHistory = useMemo(() => {
    if (timeFilter === '5m') return history.slice(-20);
    if (timeFilter === '15m') return history.slice(-60);
    if (timeFilter === '30m') return history.slice(-120);
    return history;
  }, [history, timeFilter]);

  // Chart data formatted
  const chartData = filteredHistory.map((h) => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    count: h.current_count,
    peak: h.peak_count,
    dwell: Math.round(h.average_dwell_time),
    density: Math.round(h.density_score * 100),
    entries: h.entries_count,
    exits: h.exits_count,
  }));

  const latest = history[history.length - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Export Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Behavioral Crowd Analytics & Spatial Density
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
            Real-time occupancy trends, directional pedestrian flow, dwell distributions, and 2D congregational heatmaps.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Time range filters */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-main)',
            borderRadius: '6px',
            padding: '3px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem'
          }}>
            {['all', '30m', '15m', '5m'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                style={{
                  background: timeFilter === tf ? 'var(--accent-cyan)' : 'transparent',
                  color: timeFilter === tf ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          <button onClick={loadData} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <a
            href={`/api/analytics/export/csv${activeSession ? `?session_id=${activeSession.id}` : ''}`}
            download
            className="btn-primary"
            style={{ fontSize: '0.8rem', textDecoration: 'none', padding: '6px 14px' }}
          >
            <Download size={14} />
            Export CSV
          </a>
          <a
            href={`/api/analytics/export/pdf${activeSession ? `?session_id=${activeSession.id}` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ fontSize: '0.8rem', textDecoration: 'none', padding: '6px 14px' }}
          >
            <FileText size={14} color="var(--accent-blue)" />
            PDF Report
          </a>
        </div>
      </div>

      {/* Automated Real Insights Card */}
      <div className="hud-panel" style={{ padding: '16px 20px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Sparkles size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Automated Operational Insights (Session Telemetry Engine)
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {insights.length > 0 ? (
            insights.map((ins, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-main)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>•</span>
                <span>{ins}</span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Ingesting frame telemetry to synthesize behavioral insights...
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Occupancy Timeline Chart */}
        <div className="hud-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Occupancy Count & Peak Volume
              </h3>
            </div>
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
              MAX: {latest?.peak_count ?? 0}
            </span>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : [{ time: '00:00', count: 0, peak: 0, dwell: 0, density: 0, entries: 0, exits: 0 }]}>
                <defs>
                  <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '6px', fontSize: '0.8rem' }}
                />
                <Area type="monotone" dataKey="count" name="Occupancy" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#areaColor)" />
                <Line type="stepAfter" dataKey="peak" name="Peak Seen" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Directional Flow: Entries vs Exits */}
        <div className="hud-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowRightLeft size={18} color="var(--status-green)" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Cumulative Virtual Line Flow (In vs Out)
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Net: {(latest?.entries_count ?? 0) - (latest?.exits_count ?? 0)}
            </span>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.length > 0 ? chartData.slice(-15) : [{ time: '00:00', count: 0, peak: 0, dwell: 0, density: 0, entries: 0, exits: 0 }]}>
                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '6px', fontSize: '0.8rem' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '6px' }} />
                <Bar dataKey="entries" name="Entries (IN)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exits" name="Exits (OUT)" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2D Heatmap & Spatial Density Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="hud-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                2D Spatial Congregational Thermal Heatmap
              </h3>
              <InfoTooltip content="Shows areas with more detected activity." icon={true} />
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Gaussian Footpoint Accumulator
            </span>
          </div>

          <div style={{
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)'
          }}>
            <canvas
              ref={heatmapCanvasRef}
              width={640}
              height={320}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            fontSize: '0.72rem',
            color: 'var(--text-muted)'
          }}>
            <span>Sparse Traffic (0.0)</span>
            <div style={{
              height: '8px',
              width: '180px',
              borderRadius: '4px',
              background: 'linear-gradient(to right, #06b6d4, #f59e0b, #ef4444)'
            }} />
            <span>Dense Hotspot (1.0)</span>
          </div>
        </div>

        {/* Spatial Stats Summary */}
        <div className="hud-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Dwell & Spatial Summary
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Avg Dwell Residency</span>
                <InfoTooltip content="The approximate amount of time people remain in an area." icon={true} />
              </div>
              <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {latest?.average_dwell_time ? `${latest.average_dwell_time.toFixed(1)}s` : '0.0s'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Inside defined security zones
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Estimated Density</span>
                <InfoTooltip content="Shows how crowded the monitored area is." icon={true} />
              </div>
              <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-amber)' }}>
                {((latest?.current_count ?? 0) / 50.0).toFixed(2)} /m²
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Monitored area: 50.0 m²
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Crowd Condition</div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: (latest?.current_count ?? 0) > 15 ? 'var(--status-red)' : (latest?.current_count ?? 0) > 8 ? 'var(--status-amber)' : 'var(--status-green)',
                marginTop: '4px'
              }}>
                {(latest?.current_count ?? 0) > 15 ? 'HIGH CONGESTION' : (latest?.current_count ?? 0) > 8 ? 'MODERATE ACTIVITY' : 'NORMAL / NOMINAL'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
