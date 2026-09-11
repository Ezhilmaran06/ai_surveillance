import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, Flame, Download, RefreshCw, Users, Clock, ArrowRightLeft } from 'lucide-react';
import { AnalyticsRecord, HeatmapPoint, Session } from '../types';
import { api } from '../services/api';

interface AnalyticsPageProps {
  activeSession: Session | null;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ activeSession }) => {
  const [history, setHistory] = useState<AnalyticsRecord[]>([]);
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await api.getAnalyticsHistory(activeSession?.id);
      setHistory(records.reverse()); // Chronological

      const points = await api.getHeatmapPoints();
      setHeatmapPoints(points);
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

    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw floor grid
    ctx.strokeStyle = '#111928';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Render thermal density glow spots
    heatmapPoints.forEach((pt) => {
      const px = pt.x * canvas.width;
      const py = pt.y * canvas.height;
      const radius = 24 + pt.weight * 20;

      const grad = ctx.createRadialGradient(px, py, 2, px, py, radius);
      if (pt.weight > 0.7) {
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.7)'); // Red high
        grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)'); // Amber
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      } else if (pt.weight > 0.4) {
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
        grad.addColorStop(0.6, 'rgba(6, 182, 212, 0.3)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      } else {
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [heatmapPoints]);

  const latest = history[history.length - 1];
  const maxCount = Math.max(1, ...history.map((h) => h.current_count));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner & Export Actions */}
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
            Behavioral Crowd Analytics & Spatial Density
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Real-time telemetry, historical occupancy trends, dwell distributions, and 2D congregational heatmaps.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={loadData} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
            <RefreshCw size={14} />
            Refresh
          </button>
          <a
            href={`/api/analytics/export/csv${activeSession ? `?session_id=${activeSession.id}` : ''}`}
            download
            className="btn-primary"
            style={{ fontSize: '0.8rem', textDecoration: 'none' }}
          >
            <Download size={14} />
            Export CSV Report
          </a>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        alignItems: 'start'
      }}>
        {/* Left Column: Historical Occupancy Chart */}
        <div className="hud-panel" style={{ padding: '18px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                CROWD OCCUPANCY TIMELINE
              </span>
            </div>
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-blue)' }}>
              PEAK: {latest?.peak_count ?? 0} PERSONS
            </span>
          </div>

          {/* SVG Chart Area */}
          <div style={{
            height: '240px',
            backgroundColor: 'rgba(8, 12, 20, 0.7)',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            padding: '12px 14px',
            position: 'relative'
          }}>
            {history.length > 1 ? (
              <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Line & Area */}
                <polygon
                  fill="url(#areaGrad)"
                  points={`0,200 ${history.map((h, i) => {
                    const x = (i / (history.length - 1)) * 500;
                    const y = 200 - (h.current_count / maxCount) * 180;
                    return `${x},${y}`;
                  }).join(' ')} 500,200`}
                />
                <polyline
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  points={history.map((h, i) => {
                    const x = (i / (history.length - 1)) * 500;
                    const y = 200 - (h.current_count / maxCount) * 180;
                    return `${x},${y}`;
                  }).join(' ')}
                />
              </svg>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Accumulating session telemetry data...
              </div>
            )}
          </div>

          {/* Metric Summary Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
            marginTop: '16px'
          }}>
            <div style={{ padding: '10px', backgroundColor: 'rgba(8, 12, 20, 0.5)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CURRENT COUNT</div>
              <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {latest?.current_count ?? 0}
              </div>
            </div>
            <div style={{ padding: '10px', backgroundColor: 'rgba(8, 12, 20, 0.5)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>AVG DWELL</div>
              <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--status-amber)' }}>
                {latest?.average_dwell_time ? `${latest.average_dwell_time.toFixed(1)}s` : '0.0s'}
              </div>
            </div>
            <div style={{ padding: '10px', backgroundColor: 'rgba(8, 12, 20, 0.5)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>TOTAL ENTRIES</div>
              <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--status-green)' }}>
                {latest?.entries_count ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 2D Congregational Heatmap */}
        <div className="hud-panel" style={{ padding: '18px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#f59e0b" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                2D SPATIAL DENSITY HEATMAP
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Cumulative Congregational Footprints
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
              height={360}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          {/* Thermal legend */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            fontSize: '0.72rem',
            color: 'var(--text-muted)'
          }}>
            <span>Sparse (0)</span>
            <div style={{
              height: '8px',
              width: '180px',
              borderRadius: '4px',
              background: 'linear-gradient(to right, #06b6d4, #f59e0b, #ef4444)'
            }} />
            <span>High Congestion (1.0)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
