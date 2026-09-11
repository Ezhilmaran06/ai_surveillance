import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Video,
  Eye,
  BarChart3,
  Layers,
  AlertTriangle,
  FileText,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const QuickStartModal = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Start with a Video or Camera',
      icon: Video,
      color: 'var(--accent-cyan)',
      targetTab: 'sessions',
      actionLabel: 'Go to Video Sessions',
      shortDesc: 'Choose how you want to feed video into SentinelVision AI.',
      summary: 'You can upload recorded video files (MP4, AVI, MOV), connect a live USB webcam, or launch the synthesized CCTV concourse demo with one click.',
      points: [
        'Upload your own CCTV security recordings.',
        'Connect any webcam or supported live camera stream.',
        'Use the built-in sample session to immediately test without setup.'
      ],
      example: 'Example: CCTV footage from an office entrance, store aisle, campus gate, or parking lot.'
    },
    {
      step: 2,
      title: 'Watch AI Detection & Live Monitor',
      icon: Eye,
      color: 'var(--accent-blue)',
      targetTab: 'monitor',
      actionLabel: 'Open Live Monitor',
      shortDesc: 'See real-time detection, tracking lines, and active counts.',
      summary: 'Go to Live Monitor to watch the live video feed with computer vision overlays. SentinelVision detects every person, draws boundary boxes, tracks movement paths, and displays live crowd counts.',
      points: [
        'Live people count & peak occupancy.',
        'Movement trajectories showing where people are walking.',
        'Instant audio chime and visual alerts when an incident occurs.'
      ],
      example: 'Tip: You can toggle trajectory lines, zone boundaries, or thermal heatmap overlays at any time.'
    },
    {
      step: 3,
      title: 'Check Crowd Analytics',
      icon: BarChart3,
      color: '#10b981',
      targetTab: 'analytics',
      actionLabel: 'Open Crowd Analytics',
      shortDesc: 'Understand crowd levels, congestion, and activity trends.',
      summary: 'Crowd Analytics calculates whether an area is normal, busy, or overcrowded. It also tracks dwell time (how long people linger) and generates a 2D spatial heatmap of congregational hotspots.',
      points: [
        'Occupancy timeline showing quiet and peak hours.',
        'Directional pedestrian flow (Virtual Line In vs Out).',
        'Thermal heatmaps showing high-traffic zones.'
      ],
      example: 'Understand customer footfall in retail stores or spot bottlenecks in hallways.'
    },
    {
      step: 4,
      title: 'Create Monitoring Zones',
      icon: Layers,
      color: '#8b5cf6',
      targetTab: 'zones',
      actionLabel: 'Open Perimeter Zones',
      shortDesc: 'Draw virtual boundaries to safeguard specific areas.',
      summary: 'Perimeter Zones allow you to draw boxes or custom shapes directly over the video frame. Tell the AI what should happen when someone crosses into that area.',
      points: [
        'Restricted Zones: Get an immediate critical alert if anyone steps inside.',
        'Warning / Loitering Zones: Alert if someone stays longer than permitted.',
        'Directional counting: Measure entries and exits through doorways.'
      ],
      example: 'Examples: Server room doors, staff-only inventory areas, emergency exits, or cash desks.'
    },
    {
      step: 5,
      title: 'Watch Security Alerts',
      icon: AlertTriangle,
      color: 'var(--status-amber)',
      targetTab: 'alerts',
      actionLabel: 'Open Security Alerts',
      shortDesc: 'Review detected incidents and take action.',
      summary: 'Whenever someone enters a restricted area or crowd density exceeds safe levels, SentinelVision AI triggers an alert with an exact timestamp, location snapshot, and severity rating.',
      points: [
        '🔴 Red / Critical: Unauthorized perimeter zone entry.',
        '🟠 Amber / High: Overcrowding or density hazard.',
        'Acknowledge alerts with one click to keep your team aligned.'
      ],
      example: 'Never miss an intruder or an overcrowded exit doorway.'
    },
    {
      step: 6,
      title: 'Review Sessions & Generate Reports',
      icon: FileText,
      color: '#06b6d4',
      targetTab: 'reports',
      actionLabel: 'Open Reports & Export',
      shortDesc: 'Save and share insights with supervisors or clients.',
      summary: 'Export clean PDF summary reports or download raw CSV data for audits, management presentations, or historical safety reviews.',
      points: [
        'Download executive PDF summaries formatted for printing.',
        'Export CSV telemetry logs for external spreadsheet analysis.',
        'Review past video session records and compare traffic patterns.'
      ],
      example: 'Generate daily or weekly footfall and safety compliance reports.'
    }
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleJumpToTab = (tabId) => {
    if (onNavigateToTab) {
      onNavigateToTab(tabId);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="hud-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: 'var(--bg-panel)',
          borderRadius: '16px',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 182, 212, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff' }}>
                Quick Start Walkthrough
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Step {currentStep + 1} of {steps.length} — SentinelVision AI Portal
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px', borderRadius: '6px' }}
            title="Close Walkthrough"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Navigation Dots & Progress Bar */}
        <div style={{ padding: '12px 24px 0 24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {steps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(idx)}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: idx <= currentStep ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
                title={`Step ${s.step}: ${s.title}`}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <span>Step {currentStep + 1}: {current.title}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
        </div>

        {/* Step Body Content */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${current.color}`,
              boxShadow: `0 0 20px ${current.color}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Icon size={28} color={current.color} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                display: 'inline-block',
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: current.color,
                marginBottom: '4px'
              }}>
                Step {currentStep + 1}
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                {current.title}
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                {current.shortDesc}
              </p>
            </div>
          </div>

          {/* Detailed Summary Box */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            padding: '16px 18px',
            fontSize: '0.84rem',
            lineHeight: 1.55,
            color: 'var(--text-primary)'
          }}>
            {current.summary}
          </div>

          {/* Key Bullet Points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Key Highlights
            </span>
            {current.points.map((pt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} color="var(--status-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{pt}</span>
              </div>
            ))}
          </div>

          {/* Example / Practical Context */}
          <div style={{
            backgroundColor: 'rgba(6, 182, 212, 0.06)',
            borderLeft: '3px solid var(--accent-cyan)',
            borderRadius: '0 8px 8px 0',
            padding: '10px 14px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            fontStyle: 'italic'
          }}>
            {current.example}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Direct page jump button */}
          <button
            onClick={() => handleJumpToTab(current.targetTab)}
            className="btn-secondary"
            style={{
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-cyan)'
            }}
          >
            <span>{current.actionLabel}</span>
            <ExternalLink size={13} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="btn-secondary"
              style={{
                fontSize: '0.82rem',
                opacity: currentStep === 0 ? 0.4 : 1,
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <button
              onClick={handleNext}
              className="btn-primary"
              style={{ fontSize: '0.82rem' }}
            >
              {currentStep === steps.length - 1 ? (
                <>Finish Walkthrough</>
              ) : (
                <>
                  Next
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
