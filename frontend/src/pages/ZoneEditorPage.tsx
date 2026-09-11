import React, { useState, useEffect, useRef } from 'react';
import { Layers, Plus, Trash2, Edit2, Check, RefreshCw } from 'lucide-react';
import { Zone, Session } from '../types';
import { api } from '../services/api';

interface ZoneEditorPageProps {
  zones: Zone[];
  onZonesChanged: () => void;
  activeSession: Session | null;
}

export const ZoneEditorPage: React.FC<ZoneEditorPageProps> = ({
  zones,
  onZonesChanged,
  activeSession
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawingMode, setDrawingMode] = useState<'polygon' | 'line' | null>(null);
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZoneColor, setNewZoneColor] = useState<string>('#06b6d4');
  const [newCapacity, setNewCapacity] = useState<number>(4);
  const [newDwellLimit, setNewDwellLimit] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Redraw canvas with zones
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#050812';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines for reference
    ctx.strokeStyle = '#162032';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw existing saved zones
    zones.forEach((z) => {
      try {
        const pts: [number, number][] = JSON.parse(z.coordinates_json);
        if (pts.length < 2) return;

        ctx.strokeStyle = z.color || '#06b6d4';
        ctx.lineWidth = 2;

        if (z.zone_type === 'polygon') {
          ctx.fillStyle = `${z.color}33`; // 20% alpha
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i][0], pts[i][1]);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Label
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Plus Jakarta Sans';
          ctx.fillText(`${z.name} (Max: ${z.max_capacity})`, pts[0][0] + 6, pts[0][1] + 16);
        } else if (z.zone_type === 'line') {
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          ctx.lineTo(pts[1][0], pts[1][1]);
          ctx.stroke();

          // Label
          ctx.fillStyle = z.color;
          ctx.font = '12px Plus Jakarta Sans';
          ctx.fillText(`Tripwire: ${z.name}`, pts[0][0] + 6, pts[0][1] - 8);
        }
      } catch (e) {
        console.error(e);
      }
    });

    // Draw active drawing in progress
    if (currentPoints.length > 0) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentPoints[0][0], currentPoints[0][1]);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i][0], currentPoints[i][1]);
      }
      ctx.stroke();

      // Point dots
      ctx.fillStyle = '#06b6d4';
      currentPoints.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [zones, currentPoints]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const updated = [...currentPoints, [x, y] as [number, number]];
    setCurrentPoints(updated);

    // Auto complete if target points reached
    if (drawingMode === 'line' && updated.length === 2) {
      finalizeZone(updated, 'line');
    } else if (drawingMode === 'polygon' && updated.length === 4) {
      finalizeZone(updated, 'polygon');
    }
  };

  const finalizeZone = async (pts: [number, number][], type: 'polygon' | 'line') => {
    if (pts.length < 2) return;
    setIsSubmitting(true);
    try {
      const name = newZoneName || (type === 'polygon' ? `Security Zone ${zones.length + 1}` : `Tripwire ${zones.length + 1}`);
      await api.createZone({
        name,
        zone_type: type,
        coordinates_json: JSON.stringify(pts),
        color: newZoneColor,
        max_capacity: newCapacity,
        dwell_threshold_seconds: newDwellLimit,
        is_active: true
      });
      setCurrentPoints([]);
      setDrawingMode(null);
      setNewZoneName('');
      onZonesChanged();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteZone(id);
      onZonesChanged();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadDefaults = async () => {
    try {
      await api.createDefaultZones();
      onZonesChanged();
    } catch (e) {
      console.error(e);
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
            Spatial Zones & Virtual Tripwires Studio
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Configure polygon perimeter security zones, crowd capacity thresholds, and directional tripwires.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handleLoadDefaults} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
            <RefreshCw size={14} />
            Load Sample Default Zones
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Config Sidebars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '16px',
        alignItems: 'start'
      }}>
        {/* Canvas Workspace */}
        <div className="hud-panel" style={{ padding: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              ZONE DRAWING CANVAS (800 × 450)
            </div>
            {drawingMode && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                Click on canvas to add points ({currentPoints.length} / {drawingMode === 'line' ? '2' : '4'})
              </span>
            )}
          </div>

          <div style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            backgroundColor: '#000000',
            cursor: drawingMode ? 'crosshair' : 'default'
          }}>
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              onClick={handleCanvasClick}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          {/* Quick Drawing Tools */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '14px'
          }}>
            <button
              onClick={() => {
                setCurrentPoints([]);
                setDrawingMode(drawingMode === 'polygon' ? null : 'polygon');
              }}
              className={drawingMode === 'polygon' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.8rem' }}
            >
              <Plus size={14} />
              {drawingMode === 'polygon' ? 'Cancel Drawing' : 'Draw Polygon Zone (4 Clicks)'}
            </button>

            <button
              onClick={() => {
                setCurrentPoints([]);
                setDrawingMode(drawingMode === 'line' ? null : 'line');
              }}
              className={drawingMode === 'line' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.8rem' }}
            >
              <Plus size={14} />
              {drawingMode === 'line' ? 'Cancel Tripwire' : 'Draw Tripwire Line (2 Clicks)'}
            </button>
          </div>
        </div>

        {/* Right Column: Zone List & Threshold Config */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* New Zone Form */}
          <div className="hud-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
              ZONE ATTRIBUTES
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.78rem' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Zone / Line Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lobby Concourse"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.8rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Dwell Alert (sec)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="120"
                    value={newDwellLimit}
                    onChange={(e) => setNewDwellLimit(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Zone Color
                </label>
                <input
                  type="color"
                  value={newZoneColor}
                  onChange={(e) => setNewZoneColor(e.target.value)}
                  style={{
                    width: '100%',
                    height: '34px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Existing Zones List */}
          <div className="hud-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
              CONFIGURED ZONES ({zones.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {zones.length > 0 ? (
                zones.map((z) => (
                  <div
                    key={z.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(8, 12, 20, 0.5)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        backgroundColor: z.color || '#06b6d4'
                      }} />
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
                          {z.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {z.zone_type.toUpperCase()} • Cap: {z.max_capacity} • Dwell: {z.dwell_threshold_seconds}s
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(z.id)}
                      className="btn-danger"
                      style={{ padding: '4px 8px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                  No zones configured. Click above to draw or load defaults.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
