import React, { useState, useEffect, useRef } from 'react';
import { Layers, Plus, Trash2, Edit2, Check, RefreshCw, ShieldAlert, Eye, EyeOff, X, Save, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Tooltip } from '../components/Tooltip.jsx';

export const ZoneEditorPage = ({
  zones = [],
  onZonesChanged,
  activeSession
}) => {
  const canvasRef = useRef(null);
  const [drawingMode, setDrawingMode] = useState(null);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneColor, setNewZoneColor] = useState('#06b6d4');
  const [newCapacity, setNewCapacity] = useState(4);
  const [newDwellLimit, setNewDwellLimit] = useState(10);
  const [isRestricted, setIsRestricted] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const pts = JSON.parse(z.coordinates_json);
        if (pts.length < 2) return;

        const isInactive = !z.is_active;
        const isRestr = z.is_restricted;
        const color = isInactive ? '#64748b' : isRestr ? '#ef4444' : (z.color || '#06b6d4');

        ctx.strokeStyle = color;
        ctx.lineWidth = isRestr ? 2.5 : 2;
        if (isInactive) {
          ctx.setLineDash([6, 4]);
        } else {
          ctx.setLineDash([]);
        }

        if (z.zone_type === 'polygon') {
          ctx.fillStyle = isInactive ? 'rgba(100, 116, 139, 0.1)' : isRestr ? 'rgba(239, 68, 68, 0.25)' : `${z.color}33`;
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i][0], pts[i][1]);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Label
          ctx.fillStyle = isRestr ? '#fca5a5' : '#ffffff';
          ctx.font = 'bold 11px Plus Jakarta Sans';
          const badge = isRestr ? '🚨 RESTRICTED: ' : isInactive ? '[DISABLED] ' : '';
          ctx.fillText(`${badge}${z.name} (Max: ${z.max_capacity})`, pts[0][0] + 6, pts[0][1] + 16);
        } else if (z.zone_type === 'line') {
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          ctx.lineTo(pts[1][0], pts[1][1]);
          ctx.stroke();

          // Label
          ctx.fillStyle = color;
          ctx.font = 'bold 11px Plus Jakarta Sans';
          ctx.fillText(`Tripwire: ${z.name}`, pts[0][0] + 6, pts[0][1] - 8);
        }
        ctx.setLineDash([]);
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

  const handleCanvasClick = (e) => {
    if (!drawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    const updated = [...currentPoints, [x, y]];
    setCurrentPoints(updated);

    // Auto complete if target points reached
    if (drawingMode === 'line' && updated.length === 2) {
      finalizeZone(updated, 'line');
    } else if (drawingMode === 'polygon' && updated.length === 4) {
      finalizeZone(updated, 'polygon');
    }
  };

  const finalizeZone = async (pts, type) => {
    if (pts.length < 2) return;
    setIsSubmitting(true);
    try {
      const name = newZoneName || (type === 'polygon' ? (isRestricted ? `Restricted Zone ${zones.length + 1}` : `Security Zone ${zones.length + 1}`) : `Tripwire ${zones.length + 1}`);
      await api.createZone({
        name,
        zone_type: type,
        coordinates_json: JSON.stringify(pts),
        color: isRestricted ? '#ef4444' : newZoneColor,
        max_capacity: newCapacity,
        dwell_threshold_seconds: newDwellLimit,
        is_active: true,
        is_restricted: isRestricted
      });
      setCurrentPoints([]);
      setDrawingMode(null);
      setNewZoneName('');
      setIsRestricted(false);
      onZonesChanged();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (z) => {
    try {
      await api.updateZone(z.id, { is_active: !z.is_active });
      onZonesChanged();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingZone) return;
    try {
      await api.updateZone(editingZone.id, {
        name: editingZone.name,
        max_capacity: editingZone.max_capacity,
        dwell_threshold_seconds: editingZone.dwell_threshold_seconds,
        color: editingZone.color,
        is_restricted: editingZone.is_restricted,
        is_active: editingZone.is_active
      });
      setEditingZone(null);
      onZonesChanged();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
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
                  value={isRestricted ? '#ef4444' : newZoneColor}
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

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '4px',
                backgroundColor: isRestricted ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-main)',
                border: `1px solid ${isRestricted ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                color: isRestricted ? '#fca5a5' : 'var(--text-primary)',
                fontWeight: isRestricted ? 700 : 500
              }}>
                <input
                  type="checkbox"
                  checked={isRestricted}
                  onChange={(e) => setIsRestricted(e.target.checked)}
                />
                <ShieldAlert size={15} color={isRestricted ? "var(--status-red)" : "var(--text-muted)"} />
                <span>Restricted Area (Critical Intrusion Alert)</span>
                <Tooltip content="An area where you want to monitor entry and receive immediate security alerts." icon={true} />
              </label>
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
                      backgroundColor: z.is_restricted ? 'rgba(239, 68, 68, 0.06)' : 'rgba(8, 12, 20, 0.5)',
                      border: `1px solid ${z.is_restricted ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`,
                      opacity: z.is_active ? 1 : 0.6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        backgroundColor: z.is_restricted ? '#ef4444' : (z.color || '#06b6d4')
                      }} />
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{z.name}</span>
                          {z.is_restricted && (
                            <span style={{ fontSize: '0.62rem', padding: '1px 4px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '3px', fontWeight: 700 }}>
                              RESTRICTED
                            </span>
                          )}
                          {!z.is_active && (
                            <span style={{ fontSize: '0.62rem', padding: '1px 4px', backgroundColor: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8', borderRadius: '3px', fontWeight: 600 }}>
                              OFF
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {z.zone_type.toUpperCase()} • Cap: {z.max_capacity} • Dwell: {z.dwell_threshold_seconds}s
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => handleToggleActive(z)}
                        className="btn-secondary"
                        style={{ padding: '4px 6px' }}
                        title={z.is_active ? "Disable Zone" : "Enable Zone"}
                      >
                        {z.is_active ? <Eye size={13} color="var(--status-green)" /> : <EyeOff size={13} color="var(--text-muted)" />}
                      </button>
                      <button
                        onClick={() => setEditingZone({ ...z })}
                        className="btn-secondary"
                        style={{ padding: '4px 6px' }}
                        title="Edit Zone Properties"
                      >
                        <Edit2 size={13} color="var(--accent-cyan)" />
                      </button>
                      <button
                        onClick={() => handleDelete(z.id)}
                        className="btn-danger"
                        style={{ padding: '4px 6px' }}
                        title="Delete Zone"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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

      {/* Edit Zone Modal */}
      {editingZone && (
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
        }}>
          <div className="hud-panel glow-cyan" style={{ width: '100%', maxWidth: '440px', padding: '20px', borderRadius: '8px', border: '1px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Edit Zone: {editingZone.name}
              </h3>
              <button onClick={() => setEditingZone(null)} className="btn-secondary" style={{ padding: '4px' }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.78rem' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Zone Name</label>
                <input
                  type="text"
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#ffffff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingZone.max_capacity}
                    onChange={(e) => setEditingZone({ ...editingZone, max_capacity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#ffffff' }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Dwell Limit (sec)</label>
                  <input
                    type="number"
                    min="2"
                    max="120"
                    value={editingZone.dwell_threshold_seconds}
                    onChange={(e) => setEditingZone({ ...editingZone, dwell_threshold_seconds: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: '#ffffff' }}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={editingZone.is_restricted || false}
                  onChange={(e) => setEditingZone({ ...editingZone, is_restricted: e.target.checked })}
                />
                <ShieldAlert size={14} color="var(--status-red)" />
                <span style={{ color: '#ffffff' }}>Designate as Restricted Security Area</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => setEditingZone(null)} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className="btn-primary" style={{ fontSize: '0.8rem' }}>
                  <Save size={13} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
