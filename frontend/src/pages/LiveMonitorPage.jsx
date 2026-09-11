import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  Users,
  Eye,
  Activity,
  ArrowRightLeft,
  Clock,
  Video,
  ShieldAlert,
  Maximize2,
  Minimize2,
  Camera,
  Flame
} from 'lucide-react';
import { StatCard } from '../components/StatCard.jsx';
import { api } from '../services/api.js';

export const LiveMonitorPage = ({
  telemetry,
  activeSession,
  sessions,
  onSelectSession,
  onRefreshSessions
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showTrajectories, setShowTrajectories] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.65);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoContainerRef = useRef(null);
  const streamImgRef = useRef(null);
  const heatmapCanvasRef = useRef(null);

  const handleSnapshot = () => {
    if (!streamImgRef.current) return;
    try {
      const img = streamImgRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 450;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.download = `SentinelVision_Snapshot_${Date.now()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (e) {
      console.error('Snapshot failed:', e);
    }
  };

  const handleToggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const peopleCount = telemetry?.people_count ?? 0;
  const peakCount = telemetry?.peak_count ?? 0;
  const densityPercent = Math.round((telemetry?.density_index ?? 0) * 100);
  const entries = telemetry?.entries ?? 0;
  const exits = telemetry?.exits ?? 0;
  const avgDwell = telemetry?.average_dwell_time ?? 0;
  const tracks = telemetry?.active_tracks ?? [];
  const occupancies = telemetry?.zone_occupancies ?? {};
  const recentAlerts = telemetry?.recent_alerts ?? [];

  const handleStartSession = async (sess) => {
    try {
      await api.startSession(sess.id);
      setIsPlaying(true);
      onSelectSession(sess);
      onRefreshSessions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePause = async () => {
    if (!activeSession) return;
    try {
      await api.pauseSession(activeSession.id);
      setIsPlaying(!isPlaying);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStop = async () => {
    if (!activeSession) return;
    try {
      await api.stopSession(activeSession.id);
      setIsPlaying(false);
      onRefreshSessions();
    } catch (e) {
      console.error(e);
    }
  };

  const streamUrl = activeSession
    ? `/api/sessions/${activeSession.id}/stream?t=${Date.now()}`
    : '';

  useEffect(() => {
    if (!showHeatmap) return;
    const canvas = heatmapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    tracks.forEach((trk) => {
      const [fx, fy] = trk.foot_point || [trk.centroid[0], trk.centroid[1]];
      const radius = 48;
      const grad = ctx.createRadialGradient(fx, fy, 2, fx, fy, radius);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
      grad.addColorStop(0.35, 'rgba(245, 158, 11, 0.6)');
      grad.addColorStop(0.7, 'rgba(6, 182, 212, 0.3)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [telemetry?.frame_number, showHeatmap, tracks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top HUD Telemetry Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        <StatCard
          title="Current People"
          value={peopleCount}
          subValue="Anonymous Subjects"
          icon={Users}
          color="var(--accent-cyan)"
        />
        <StatCard
          title="Peak Occupancy"
          value={peakCount}
          subValue="Session Max Count"
          icon={Activity}
          color="var(--accent-blue)"
        />
        <StatCard
          title="Crowd Density"
          value={`${densityPercent}%`}
          subValue={densityPercent > 70 ? 'CRITICAL CONGESTION' : densityPercent > 40 ? 'MODERATE FLOW' : 'LOW DENSITY'}
          icon={Eye}
          color={densityPercent > 70 ? 'var(--status-red)' : densityPercent > 40 ? 'var(--status-amber)' : 'var(--status-green)'}
        />
        <StatCard
          title="Line Crossings"
          value={`${entries} In / ${exits} Out`}
          subValue="Virtual Tripwires"
          icon={ArrowRightLeft}
          color="var(--accent-indigo)"
        />
        <StatCard
          title="Avg Dwell Time"
          value={`${avgDwell.toFixed(1)}s`}
          subValue="Active Duration"
          icon={Clock}
          color="var(--status-amber)"
        />
      </div>

      {/* Main Grid: Live Video Stream & Active Monitoring Panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '16px',
        alignItems: 'start'
      }}>
        {/* Left Column: Video Feed & Controller */}
        <div className="hud-panel" style={{ overflow: 'hidden' }}>
          {/* Stream Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(17, 24, 39, 0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="live-dot active-green" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em' }}>
                PRIMARY SURVEILLANCE FEED
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                [{activeSession ? activeSession.name : 'No Active Session'}]
              </span>
            </div>

            {/* Quick Session Switcher Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={activeSession?.id || ''}
                onChange={(e) => {
                  const s = sessions.find((item) => item.id === Number(e.target.value));
                  if (s) handleStartSession(s);
                }}
                style={{
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  outline: 'none'
                }}
              >
                <option value="" disabled>Select Surveillance Session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.id} - {s.name} ({s.source_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Video Container */}
          <div
            ref={videoContainerRef}
            style={{
              position: 'relative',
              backgroundColor: '#05080f',
              minHeight: '440px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {activeSession ? (
              <>
                <img
                  ref={streamImgRef}
                  src={streamUrl}
                  alt="Live AI Surveillance Stream"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '560px',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.target.style.opacity = '0.7';
                  }}
                />
                {showHeatmap && (
                  <canvas
                    ref={heatmapCanvasRef}
                    width={800}
                    height={450}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      opacity: heatmapOpacity,
                      mixBlendMode: 'screen'
                    }}
                  />
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <Video size={48} color="var(--border-subtle)" style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  No Active Video Stream Selected
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                  Select an existing session above or launch the Sample CCTV Feed from Video Sessions
                </div>
              </div>
            )}

            {/* HUD Corner Brackets */}
            <div style={{ position: 'absolute', top: '12px', left: '12px', width: '16px', height: '16px', borderTop: '2px solid var(--accent-cyan)', borderLeft: '2px solid var(--accent-cyan)', zIndex: 10, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '12px', right: '12px', width: '16px', height: '16px', borderTop: '2px solid var(--accent-cyan)', borderRight: '2px solid var(--accent-cyan)', zIndex: 10, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '16px', height: '16px', borderBottom: '2px solid var(--accent-cyan)', borderLeft: '2px solid var(--accent-cyan)', zIndex: 10, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '16px', height: '16px', borderBottom: '2px solid var(--accent-cyan)', borderRight: '2px solid var(--accent-cyan)', zIndex: 10, pointerEvents: 'none' }} />

            {/* Corner HUD Overlay */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '32px',
              background: 'rgba(6, 9, 19, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
              fontSize: '0.72rem',
              display: 'flex',
              gap: '12px',
              pointerEvents: 'none'
            }}>
              <div>RES: <span className="font-mono" style={{ color: '#ffffff' }}>{activeSession?.resolution || 'AUTO'}</span></div>
              <div>YOLO: <span style={{ color: 'var(--status-green)' }}>ACTIVE</span></div>
              <div>ANONYMOUS: <span style={{ color: 'var(--accent-cyan)' }}>ENFORCED</span></div>
              {showHeatmap && <div>HEATMAP: <span style={{ color: 'var(--status-amber)' }}>{Math.round(heatmapOpacity * 100)}%</span></div>}
            </div>
          </div>

          {/* Playback Controls & Toggles Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(17, 24, 39, 0.4)',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={handleTogglePause}
                disabled={!activeSession}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause Feed' : 'Resume Feed'}</span>
              </button>
              <button
                onClick={handleStop}
                disabled={!activeSession}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                <Square size={14} color="var(--status-red)" />
                <span>Stop</span>
              </button>
              <button
                onClick={handleSnapshot}
                disabled={!activeSession}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                title="Capture forensic frame snapshot"
              >
                <Camera size={14} color="var(--accent-cyan)" />
                <span>Snapshot</span>
              </button>
              <button
                onClick={handleToggleFullscreen}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                title="Toggle fullscreen command view"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <span>{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              {/* Heatmap Overlay Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: showHeatmap ? 'var(--status-amber)' : 'inherit', fontWeight: showHeatmap ? 600 : 400 }}>
                  <input
                    type="checkbox"
                    checked={showHeatmap}
                    onChange={(e) => setShowHeatmap(e.target.checked)}
                  />
                  <Flame size={13} color={showHeatmap ? 'var(--status-amber)' : 'var(--text-muted)'} />
                  Heatmap Overlay
                </label>
                {showHeatmap && (
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={heatmapOpacity}
                    onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                    style={{ width: '56px', accentColor: 'var(--status-amber)', cursor: 'pointer' }}
                    title={`Heatmap Opacity: ${Math.round(heatmapOpacity * 100)}%`}
                  />
                )}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showZones}
                  onChange={(e) => setShowZones(e.target.checked)}
                />
                Show Security Zones
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showTrajectories}
                  onChange={(e) => setShowTrajectories(e.target.checked)}
                />
                Show Trajectories
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Track Radar & Zone Occupancy Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Zones Occupancy Panel */}
          <div className="hud-panel" style={{ padding: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em' }}>
                SECURITY ZONES STATUS
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {Object.keys(occupancies).length} Active Zones
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.keys(occupancies).length > 0 ? (
                Object.entries(occupancies).map(([zoneName, count]) => {
                  const isOvercrowded = count >= 4;
                  return (
                    <div
                      key={zoneName}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(8, 12, 20, 0.6)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {zoneName}
                        </span>
                        <span className="font-mono" style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: isOvercrowded ? 'var(--status-red)' : 'var(--accent-cyan)'
                        }}>
                          {count} Occupants
                        </span>
                      </div>
                      {/* Bar indicator */}
                      <div style={{
                        height: '4px',
                        width: '100%',
                        backgroundColor: 'var(--border-subtle)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, (count / 5) * 100)}%`,
                          backgroundColor: isOvercrowded ? 'var(--status-red)' : 'var(--accent-cyan)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                  No active polygon zones configured.
                </div>
              )}
            </div>
          </div>

          {/* Active Anonymous Trackers List */}
          <div className="hud-panel" style={{ padding: '16px', maxHeight: '280px', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em' }}>
                ACTIVE SUBJECT TRACKERS
              </span>
              <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--status-green)' }}>
                {tracks.length} LIVE
              </span>
            </div>

            <div style={{
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              paddingRight: '4px'
            }}>
              {tracks.length > 0 ? (
                tracks.map((t) => (
                  <div
                    key={t.track_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      backgroundColor: 'rgba(8, 12, 20, 0.5)',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.76rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: t.dwell_time > 15 ? 'var(--status-red)' : t.dwell_time > 8 ? 'var(--status-amber)' : 'var(--accent-cyan)'
                      }} />
                      <span style={{ fontWeight: 600, color: '#ffffff' }}>{t.label}</span>
                      {t.zones.length > 0 && (
                        <span style={{
                          fontSize: '0.66rem',
                          backgroundColor: 'rgba(6, 182, 212, 0.15)',
                          color: 'var(--accent-cyan)',
                          padding: '1px 5px',
                          borderRadius: '3px'
                        }}>
                          {t.zones[0]}
                        </span>
                      )}
                    </div>
                    <div className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {t.dwell_time.toFixed(1)}s
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                  No active persons detected in camera frame.
                </div>
              )}
            </div>
          </div>

          {/* Live Alerts Stream Feed */}
          {recentAlerts.length > 0 && (
            <div className="hud-panel glow-red" style={{ padding: '14px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
                <ShieldAlert size={16} />
                <span>REAL-TIME SECURITY INCIDENT</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#fecaca', lineHeight: 1.4 }}>
                {recentAlerts[0].message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
