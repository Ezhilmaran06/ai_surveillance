import React, { useState, useRef } from 'react';
import { Upload, Camera, Play, Trash2, Video, Film, CheckCircle2, AlertCircle, BarChart2, FileText, Eye, ExternalLink } from 'lucide-react';
import { Session } from '../types';
import { api } from '../services/api';

interface SessionsPageProps {
  sessions: Session[];
  activeSession: Session | null;
  onSelectSession: (session: Session) => void;
  onRefreshSessions: () => void;
  onNavigateToTab?: (tab: 'monitor' | 'analytics' | 'reports') => void;
}

export const SessionsPage: React.FC<SessionsPageProps> = ({
  sessions,
  activeSession,
  onSelectSession,
  onRefreshSessions,
  onNavigateToTab
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const newSession = await api.uploadVideo(file);
      onRefreshSessions();
      onSelectSession(newSession);
    } catch (err: any) {
      setUploadError(err.message || 'Video upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateSample = async () => {
    setIsUploading(true);
    try {
      const sess = await api.createSampleSession();
      onRefreshSessions();
      onSelectSession(sess);
    } catch (e: any) {
      setUploadError(e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateWebcam = async () => {
    setIsUploading(true);
    try {
      const sess = await api.createWebcamSession();
      onRefreshSessions();
      onSelectSession(sess);
    } catch (e: any) {
      setUploadError(e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this surveillance session?')) {
      try {
        await api.deleteSession(id);
        onRefreshSessions();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleStart = async (sess: Session) => {
    try {
      await api.startSession(sess.id);
      onSelectSession(sess);
      onRefreshSessions();
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
            Surveillance Feeds & Video Session Manager
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Upload recorded surveillance footage, connect local webcams, or launch the synthesized CCTV concourse demo.
          </p>
        </div>
      </div>

      {uploadError && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '6px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid var(--status-red)',
          color: '#fca5a5',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Input Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {/* Upload Card */}
        <div className="hud-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(6, 182, 212, 0.15)' }}>
              <Upload size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>Upload Video File</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>.mp4, .avi, .mov, .mkv</div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Process any prerecorded surveillance or CCTV footage through the AI pipeline.
          </p>
          <input
            type="file"
            accept="video/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-primary"
            style={{ marginTop: 'auto', justifyContent: 'center' }}
          >
            <Upload size={14} />
            <span>{isUploading ? 'Uploading...' : 'Choose Video File'}</span>
          </button>
        </div>

        {/* Sample CCTV Card */}
        <div className="hud-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.15)' }}>
              <Film size={20} color="var(--accent-blue)" />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>Synthesized CCTV Feed</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Instant Offline Testing</div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Autogenerates a surveillance concourse with walking people, loitering actors, and line crossing.
          </p>
          <button
            onClick={handleCreateSample}
            disabled={isUploading}
            className="btn-secondary"
            style={{ marginTop: 'auto', justifyContent: 'center' }}
          >
            <Play size={14} color="var(--accent-cyan)" />
            <span>Generate & Launch Sample CCTV</span>
          </button>
        </div>

        {/* Webcam Card */}
        <div className="hud-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
              <Camera size={20} color="var(--status-green)" />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>Local Webcam Feed</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Device / Integrated Camera</div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Stream live video directly from your laptop or connected USB webcam in real time.
          </p>
          <button
            onClick={handleCreateWebcam}
            disabled={isUploading}
            className="btn-secondary"
            style={{ marginTop: 'auto', justifyContent: 'center' }}
          >
            <Camera size={14} color="var(--status-green)" />
            <span>Connect Live Webcam</span>
          </button>
        </div>
      </div>

      {/* Sessions History Table */}
      <div className="hud-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
            REGISTERED SURVEILLANCE SESSIONS ({sessions.length})
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{
              backgroundColor: 'rgba(17, 24, 39, 0.7)',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              textTransform: 'uppercase'
            }}>
              <th style={{ padding: '12px 16px' }}>Session Details</th>
              <th style={{ padding: '12px 16px' }}>Source / Status</th>
              <th style={{ padding: '12px 16px' }}>Duration</th>
              <th style={{ padding: '12px 16px' }}>Crowd Occupancy</th>
              <th style={{ padding: '12px 16px' }}>Line Crossings</th>
              <th style={{ padding: '12px 16px' }}>Security Alerts</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length > 0 ? (
              sessions.map((s) => {
                const isSelected = activeSession?.id === s.id;
                return (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: '1px solid rgba(30, 41, 59, 0.5)',
                      backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{s.name}</div>
                      <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Session #{s.id} • {new Date(s.created_at).toLocaleString()}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.68rem',
                          textTransform: 'uppercase',
                          width: 'fit-content'
                        }}>
                          {s.source_type}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          color: s.status === 'processing' ? 'var(--status-green)' : s.status === 'completed' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                          fontWeight: 600
                        }}>
                          ● {s.status.toUpperCase()}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }} className="font-mono">
                      {s.duration_seconds > 0 ? `${s.duration_seconds}s` : 'Live Stream'}
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {s.resolution || 'AUTO'} @ {s.fps ? s.fps.toFixed(0) : 25} FPS
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                        Peak: {s.peak_count || 0}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Avg: {s.avg_count || 0}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: 'var(--status-green)', fontWeight: 600 }}>
                        {s.total_entries || 0} In
                      </span>
                      <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
                      <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                        {s.total_exits || 0} Out
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: (s.total_alerts || 0) > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                        color: (s.total_alerts || 0) > 0 ? 'var(--status-red)' : 'var(--status-green)',
                        fontWeight: 700,
                        fontSize: '0.72rem'
                      }}>
                        {s.total_alerts || 0} Incidents
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => {
                            handleStart(s);
                            onNavigateToTab?.('monitor');
                          }}
                          className="btn-primary"
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          title="View Live Stream"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => {
                            onSelectSession(s);
                            onNavigateToTab?.('analytics');
                          }}
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          title="View Session Analytics"
                        >
                          <BarChart2 size={12} color="var(--accent-cyan)" />
                          <span>Analytics</span>
                        </button>

                        <a
                          href={`/api/analytics/export/pdf?session_id=${s.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="Generate Executive PDF Report"
                        >
                          <FileText size={12} color="var(--accent-blue)" />
                          <span>Report</span>
                        </a>

                        <button
                          onClick={() => handleDelete(s.id)}
                          className="btn-danger"
                          style={{ padding: '4px 6px' }}
                          title="Delete Session"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No sessions registered yet. Choose an option above to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
