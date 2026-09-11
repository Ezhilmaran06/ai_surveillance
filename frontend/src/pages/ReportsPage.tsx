import React from 'react';
import { FileText, Download, Printer, ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import { Session, Alert } from '../types';

interface ReportsPageProps {
  activeSession: Session | null;
  alerts: Alert[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ activeSession, alerts }) => {
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;

  const handlePrint = () => {
    window.print();
  };

  const pdfUrl = `/api/analytics/export/pdf${activeSession ? `?session_id=${activeSession.id}` : ''}`;

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
        border: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Executive Surveillance & Compliance Audit Report
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
            Official perimeter telemetry summaries, crowd threshold compliance, and privacy verification audits.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handlePrint} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
            <Printer size={14} />
            Print View
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ fontSize: '0.8rem', textDecoration: 'none' }}
          >
            <ExternalLink size={14} />
            Generate PDF Report
          </a>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* Left Column: Report Document */}
        <div className="hud-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                  SURVEILLANCE COMPLIANCE & SAFETY AUDIT
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  SentinelVision AI Surveillance Engine • Automated Security Protocol
                </p>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '4px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--status-green)',
                fontWeight: 700,
                fontSize: '0.75rem'
              }}>
                AUDIT STATUS: VERIFIED
              </span>
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '16px 0' }} />
          </div>

          {/* Session Overview Section */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
              1. ACTIVE SESSION METRICS
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              fontSize: '0.78rem',
              backgroundColor: 'var(--bg-main)',
              padding: '14px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>Session Name: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeSession?.name || 'N/A'}</span></div>
              <div>Source Type: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeSession?.source_type || 'N/A'}</span></div>
              <div>Framerate / Res: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeSession?.fps || 25} FPS ({activeSession?.resolution || 'AUTO'})</span></div>
              <div>Processed Frames: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeSession?.processed_frames || 0}</span></div>
            </div>
          </div>

          {/* Incident Summary */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
              2. SECURITY & PERIMETER INCIDENT SUMMARY
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>CRITICAL BREACHES</div>
                <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--status-red)' }}>
                  {criticalCount}
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <div style={{ fontSize: '0.7rem', color: '#fde68a' }}>LOITERING WARNINGS</div>
                <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--status-amber)' }}>
                  {warningCount}
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'rgba(6, 182, 212, 0.1)', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                <div style={{ fontSize: '0.7rem', color: '#a5f3fc' }}>TRIPWIRE CROSSINGS</div>
                <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {infoCount}
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Protection Statement */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
              3. PRIVACY & ETHICAL COMPLIANCE CERTIFICATION
            </div>
            <div style={{
              padding: '14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.76rem',
              lineHeight: 1.5,
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-green)', fontWeight: 600, marginBottom: '6px' }}>
                <ShieldCheck size={16} />
                <span>Zero-Biometric Surveillance Guarantee</span>
              </div>
              All persons in frame are mapped strictly to ephemeral integer labels (e.g. <code>Person #12</code>).
              This software explicitly excludes facial recognition, iris scanning, emotional estimation, and biometric indexing.
              No persistent identity records or personally identifiable biometric vectors are collected or stored.
            </div>
          </div>
        </div>

        {/* Right Column: Download Formats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="hud-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              DOWNLOAD AUDIT ARTIFACTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ justifyContent: 'space-between', textDecoration: 'none', fontSize: '0.8rem' }}
              >
                <span>Executive Report (.PDF / HTML)</span>
                <FileText size={14} />
              </a>

              <a
                href={`/api/analytics/export/csv${activeSession ? `?session_id=${activeSession.id}` : ''}`}
                download
                className="btn-secondary"
                style={{ justifyContent: 'space-between', textDecoration: 'none', fontSize: '0.8rem' }}
              >
                <span>Analytics Summary (.CSV)</span>
                <Download size={14} />
              </a>

              <a
                href={`/api/analytics/export/json${activeSession ? `?session_id=${activeSession.id}` : ''}`}
                download
                className="btn-secondary"
                style={{ justifyContent: 'space-between', textDecoration: 'none', fontSize: '0.8rem' }}
              >
                <span>Raw Frame Telemetry (.JSON)</span>
                <Download size={14} />
              </a>
            </div>
          </div>

          <div className="hud-panel" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.82rem', marginBottom: '8px' }}>
              <Lock size={15} />
              <span>Tamper Resistance</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Telemetry summaries are stamped into SQLite database with microsecond precision UTC timestamps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
