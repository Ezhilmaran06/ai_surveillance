import React, { useState } from 'react';
import {
  HelpCircle,
  Play,
  Sparkles,
  Users,
  Compass,
  BarChart3,
  Flame,
  Layers,
  AlertTriangle,
  FileText,
  Video,
  Eye,
  ShieldCheck,
  Building2,
  ShoppingBag,
  GraduationCap,
  Train,
  Trophy,
  Factory,
  Car,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Laptop,
  Cpu,
  Lock,
  Compass as CompassIcon,
  Tv,
  Camera
} from 'lucide-react';
import { QuickStartModal } from '../components/QuickStartModal.jsx';
import { Tooltip } from '../components/Tooltip.jsx';

export const HelpPage = ({ onNavigateToTab }) => {
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTechDetailsOpen, setIsTechDetailsOpen] = useState(false);

  const handleNav = (tabId) => {
    if (onNavigateToTab) {
      onNavigateToTab(tabId);
    }
  };

  const capabilities = [
    {
      icon: Users,
      title: 'Count People',
      color: 'var(--accent-cyan)',
      desc: 'See how many people are currently visible in the video or camera feed in real time.'
    },
    {
      icon: Compass,
      title: 'Track Movement',
      color: 'var(--accent-blue)',
      desc: "Follow people's movement through the monitored area without identifying who they are."
    },
    {
      icon: BarChart3,
      title: 'Analyze Crowds',
      color: 'var(--status-green)',
      desc: 'Understand whether an area is empty, normal, busy, or overcrowded.'
    },
    {
      icon: Flame,
      title: 'View Activity Areas',
      color: '#f59e0b',
      desc: 'See where people spend more time using visual activity and thermal heatmap information.'
    },
    {
      icon: Layers,
      title: 'Monitor Restricted Areas',
      color: '#8b5cf6',
      desc: 'Create zones where people should not enter and receive an alert when someone enters.'
    },
    {
      icon: AlertTriangle,
      title: 'Security Alerts',
      color: 'var(--status-red)',
      desc: 'Get notified when an important event happens, such as unusual crowding or restricted-zone entry.'
    },
    {
      icon: FileText,
      title: 'Generate Reports',
      color: '#06b6d4',
      desc: 'Review previous monitoring sessions and export useful analytics in PDF or CSV formats.'
    }
  ];

  const steps = [
    {
      num: '1',
      title: 'Start with a Video or Camera',
      targetTab: 'sessions',
      buttonLabel: 'Go to Video Sessions →',
      desc: 'Upload a recorded video or connect to a supported live camera source.',
      example: 'Example: CCTV footage from a shop, office, campus, parking area, or public space.',
      details: 'Supported formats include MP4, AVI, MOV, or your connected USB/laptop webcam.'
    },
    {
      num: '2',
      title: 'Open Live Monitor',
      targetTab: 'monitor',
      buttonLabel: 'Open Live Monitor →',
      desc: 'Go to Live Monitor to see the video and AI detection results.',
      expectList: [
        'People detected with bounding boxes',
        'Live people count & peak tally',
        'Movement tracking trajectories',
        'Current activity level & density indicator',
        'Instant alerts overlay and chime'
      ]
    },
    {
      num: '3',
      title: 'Check the Crowd',
      targetTab: 'analytics',
      buttonLabel: 'Open Crowd Analytics →',
      desc: 'Open Crowd Analytics to understand how busy the area is.',
      expectList: [
        'Current people count vs historical peaks',
        'Maximum & average occupancy trends',
        'Crowd level (Optimal, Moderate, Congested)',
        'Density per square meter',
        'Directional pedestrian flow (In vs Out lines)'
      ]
    },
    {
      num: '4',
      title: 'Create Monitoring Zones',
      targetTab: 'zones',
      buttonLabel: 'Open Perimeter Zones →',
      desc: 'Use Perimeter Zones when you want the AI to watch a specific area.',
      example: 'Examples: Entrance, Exit, Restricted room, Parking area, Security boundary.',
      subText: 'Draw or configure an area and tell the system what should happen when someone enters it.'
    },
    {
      num: '5',
      title: 'Watch Security Alerts',
      targetTab: 'alerts',
      buttonLabel: 'Open Security Alerts →',
      desc: 'Open Security Alerts to see important events detected by the system.',
      alertExamples: [
        { dot: '🔴', title: 'Restricted-zone entry', text: 'Someone crossed into an unauthorized area' },
        { dot: '🟠', title: 'Crowd too large', text: 'Occupancy exceeded maximum safety capacity' },
        { dot: '🟡', title: 'Unusual activity', text: 'Prolonged dwell time or loitering near boundary' },
        { dot: '🔵', title: 'Monitoring events', text: 'Virtual tripwire crossings and operational updates' }
      ]
    },
    {
      num: '6',
      title: 'Review Video Sessions',
      targetTab: 'sessions',
      buttonLabel: 'Open Video Sessions →',
      desc: 'Video Sessions lets you see previous monitoring sessions.',
      details: 'Review session name, recorded date, playback duration, people detected, peak crowd level, and total alerts triggered.'
    },
    {
      num: '7',
      title: 'Generate Reports',
      targetTab: 'reports',
      buttonLabel: 'Open Reports & Export →',
      desc: 'Use Reports & Export when you want to save or share the results.',
      example: 'Examples: Daily monitoring report, Crowd density report, Security incident report, Session summary PDF/CSV.'
    }
  ];

  const useCases = [
    {
      icon: Building2,
      name: 'Offices',
      text: 'Monitor entrances, common areas, reception desks, and restricted server rooms.',
      color: '#38bdf8'
    },
    {
      icon: ShoppingBag,
      name: 'Shopping Malls & Stores',
      text: 'Understand customer crowd levels, checkout queues, and popular shopping aisles.',
      color: '#f59e0b'
    },
    {
      icon: GraduationCap,
      name: 'Colleges & Schools',
      text: 'Monitor campus gates, corridors, auditoriums, and playground crowd movement.',
      color: '#10b981'
    },
    {
      icon: Train,
      name: 'Transport Areas',
      text: 'Analyze crowd levels in train stations, bus terminals, ticket counters, and waiting areas.',
      color: '#06b6d4'
    },
    {
      icon: Trophy,
      name: 'Events & Stadiums',
      text: 'Monitor crowd size, gate congestion, and pedestrian flow during live public events.',
      color: '#ec4899'
    },
    {
      icon: Factory,
      name: 'Factories & Industrial Areas',
      text: 'Monitor hazardous operational zones, machinery perimeters, and emergency fire exits.',
      color: '#f97316'
    },
    {
      icon: Car,
      name: 'Parking Areas',
      text: 'Monitor pedestrian walkways, garage entrance portals, and movement patterns.',
      color: '#8b5cf6'
    },
    {
      icon: Stethoscope,
      name: 'Hospitals',
      text: 'Monitor patient waiting lobbies, emergency entrances, and restricted clinic wings.',
      color: '#14b8a6'
    }
  ];

  const sidebarDirectory = [
    {
      tab: 'dashboard',
      name: 'Overview Dashboard',
      summary: 'See the most important information in one place at a glance.',
      icon: BarChart3
    },
    {
      tab: 'monitor',
      name: 'Live Monitor',
      summary: 'Watch the current video feed and AI detection activity in real time.',
      icon: Eye
    },
    {
      tab: 'analytics',
      name: 'Crowd Analytics',
      summary: 'Understand crowd size, walking paths, dwell times, and thermal heatmaps.',
      icon: Users
    },
    {
      tab: 'zones',
      name: 'Perimeter Zones',
      summary: 'Define virtual boundaries and areas that need active security monitoring.',
      icon: Layers
    },
    {
      tab: 'alerts',
      name: 'Security Alerts',
      summary: 'See important detected events, warnings, and unauthorized entries.',
      icon: AlertTriangle
    },
    {
      tab: 'sessions',
      name: 'Video Sessions',
      summary: 'Upload videos, connect webcams, or review previous monitoring records.',
      icon: Video
    },
    {
      tab: 'reports',
      name: 'Reports & Export',
      summary: 'Create and export professional PDF summaries and CSV telemetry data.',
      icon: FileText
    },
    {
      tab: 'settings',
      name: 'System Settings',
      summary: 'Configure audio notifications, system thresholds, and preferences.',
      icon: ShieldCheck
    },
    {
      tab: 'help',
      name: 'Help & How to Use',
      summary: 'Learn how everything works with simple guides and quick start tutorials.',
      icon: HelpCircle
    }
  ];

  const faqs = [
    {
      q: 'Do I need any AI or coding knowledge to use this portal?',
      a: 'No! SentinelVision AI is completely automated. Once you upload a video or click your camera, the AI handles detection, tracking, counting, and alerts automatically.'
    },
    {
      q: 'Does SentinelVision AI identify individual faces or names?',
      a: 'No. SentinelVision AI uses privacy-by-design spatial tracking. It detects people as physical shapes to count occupancy and detect movement without facial recognition or personal identity capture.'
    },
    {
      q: 'Can I draw custom shapes for perimeter zones?',
      a: 'Yes! Go to the Perimeter Zones page. You can draw custom rectangular or polygonal zones directly over the camera frame, choose whether they are Restricted or Warning areas, and customize alerts.'
    },
    {
      q: 'What video formats can I upload?',
      a: 'You can upload standard video recordings in MP4, AVI, or MOV formats. You can also connect live webcams or use the built-in sample concourse video.'
    },
    {
      q: 'How do I export data for management or security records?',
      a: 'Go to Reports & Export or Crowd Analytics. You can download an executive PDF report or export raw CSV records with a single click.'
    }
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Interactive Quick Start Modal Walkthrough */}
      <QuickStartModal
        isOpen={isQuickStartOpen}
        onClose={() => setIsQuickStartOpen(false)}
        onNavigateToTab={onNavigateToTab}
      />

      {/* TOP HERO BANNER */}
      <div
        className="hud-panel"
        style={{
          padding: '28px 32px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(13, 19, 35, 0.95) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(99, 102, 241, 0.08) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(6, 182, 212, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: 'var(--accent-cyan)',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              <HelpCircle size={14} />
              <span>Beginner-Friendly Knowledge & Walkthrough</span>
            </div>

            <h1 style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              Help & How to Use
            </h1>

            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              lineHeight: 1.5,
              margin: 0
            }}>
              Welcome to SentinelVision AI! Learn what the system does, how to use each feature step-by-step, and how it protects your premises with automated crowd and security analytics.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsQuickStartOpen(true)}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={18} />
              <span>Quick Start Guide</span>
            </button>

            <button
              onClick={() => handleNav('monitor')}
              className="btn-secondary"
              style={{
                padding: '10px 18px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Start Monitoring</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* SECTION 3: TOP SECTION — WHAT IS THIS PORTAL? */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '0 0 6px 0' }}>
              What is SentinelVision AI?
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#ffffff', lineHeight: 1.5, margin: '0 0 6px 0' }}>
              <strong>SentinelVision AI uses computer vision to understand what is happening in a video or live camera feed.</strong>
            </p>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              It can detect people, count them, track their movement, measure crowd levels, monitor specific areas, and alert you when something needs attention.
            </p>
          </div>

          {/* Simple Visual Flow Diagram */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            backgroundColor: 'rgba(6, 182, 212, 0.05)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '10px',
            padding: '14px 18px',
            flexWrap: 'wrap'
          }}>
            {[
              { label: 'Video / Camera', icon: Video, color: '#38bdf8' },
              { label: 'AI Detection', icon: Eye, color: '#06b6d4' },
              { label: 'Analysis', icon: BarChart3, color: '#10b981' },
              { label: 'Alerts', icon: AlertTriangle, color: '#f59e0b' },
              { label: 'Dashboard', icon: Laptop, color: '#8b5cf6' }
            ].map((item, idx, arr) => {
              const ItemIcon = item.icon;
              return (
                <React.Fragment key={item.label}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <ItemIcon size={18} color={item.color} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                      {item.label}
                    </span>
                  </div>
                  {idx < arr.length - 1 && (
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '1rem' }}>
                      ➔
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 11: WHAT SHOULD I DO FIRST? (NEW HERE?) */}
      <div
        className="hud-panel"
        style={{
          padding: '24px 28px',
          borderLeft: '4px solid var(--status-green)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🚀</span>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                New here? Recommended First Steps
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Follow this simple 7-step path to start getting value right away:
              </p>
            </div>
          </div>

          <button
            onClick={() => handleNav('sessions')}
            className="btn-primary"
            style={{ fontSize: '0.84rem', padding: '8px 16px' }}
          >
            Start Monitoring →
          </button>
        </div>

        {/* 7-Step Workflow Progression */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px'
        }}>
          {[
            { step: '1', title: 'Upload a video', tab: 'sessions' },
            { step: '2', title: 'Open Live Monitor', tab: 'monitor' },
            { step: '3', title: 'Check people count', tab: 'monitor' },
            { step: '4', title: 'Explore Crowd Analytics', tab: 'analytics' },
            { step: '5', title: 'Create a Zone if needed', tab: 'zones' },
            { step: '6', title: 'Check Alerts', tab: 'alerts' },
            { step: '7', title: 'Generate a Report', tab: 'reports' }
          ].map((item, idx) => (
            <div
              key={item.step}
              onClick={() => handleNav(item.tab)}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px 10px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--status-green)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title={`Click to go to ${item.title}`}
            >
              <span style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--status-green)',
                fontSize: '0.74rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.step}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: WHAT CAN SENTINELVISION AI DO? */}
      <div>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
            What can SentinelVision AI do?
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
            Automated capabilities designed to make surveillance effortless and intelligent:
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px'
        }}>
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="hud-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${cap.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={22} color={cap.color} />
                </div>

                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', margin: '0 0 6px 0' }}>
                    {cap.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                    {cap.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: HOW TO USE THE PORTAL (STEP-BY-STEP TUTORIAL) */}
      <div
        className="hud-panel"
        style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        <div>
          <div style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--accent-cyan)',
            letterSpacing: '0.06em',
            marginBottom: '4px'
          }}>
            Step-by-Step Tutorial
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
            How to Use the Portal
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
            Master the complete workflow from raw video to actionable safety analytics in 7 simple steps:
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {steps.map((s) => (
            <div
              key={s.num}
              style={{
                display: 'flex',
                gap: '20px',
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)',
                alignItems: 'flex-start',
                flexWrap: 'wrap'
              }}
            >
              {/* Step number badge */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid var(--accent-cyan)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: 800,
                flexShrink: 0
              }}>
                {s.num}
              </div>

              {/* Step content */}
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Step {s.num} — {s.title}
                  </h3>
                  <button
                    onClick={() => handleNav(s.targetTab)}
                    className="btn-secondary"
                    style={{
                      fontSize: '0.78rem',
                      padding: '5px 12px',
                      color: 'var(--accent-cyan)',
                      borderColor: 'rgba(6, 182, 212, 0.3)'
                    }}
                  >
                    {s.buttonLabel}
                  </button>
                </div>

                <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.45, margin: '0 0 8px 0' }}>
                  {s.desc}
                </p>

                {s.example && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', fontStyle: 'italic', marginBottom: '8px' }}>
                    {s.example}
                  </div>
                )}

                {s.details && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {s.details}
                  </div>
                )}

                {s.subText && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {s.subText}
                  </div>
                )}

                {s.expectList && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '6px',
                    marginTop: '8px'
                  }}>
                    {s.expectList.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={13} color="var(--accent-cyan)" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {s.alertExamples && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '8px',
                    marginTop: '8px'
                  }}>
                    {s.alertExamples.map((alt, i) => (
                      <div key={i} style={{
                        padding: '8px 12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.76rem'
                      }}>
                        <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                          {alt.dot} {alt.title}
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>
                          {alt.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 6: WHERE CAN SENTINELVISION AI BE USED? */}
      <div>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
            Where can SentinelVision AI be used?
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
            The system is built for <strong>safety, monitoring, crowd management, and operational awareness</strong> across a wide variety of environments:
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.name}
                className="hud-panel"
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: `${uc.color}18`,
                    border: `1px solid ${uc.color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={18} color={uc.color} />
                  </div>
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {uc.name}
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                  {uc.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 7 & 8: WHAT INPUT CAN I USE? & WHAT DOES THE AI DETECT? */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* SECTION 7: WHAT INPUT CAN I USE? */}
        <div className="hud-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Camera size={20} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                What can I give to the system?
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Easily connect recorded footage or real-time camera streams:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              padding: '14px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem', color: '#ffffff' }}>
                  <span>🎥</span>
                  <span>Recorded Video</span>
                </div>
                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-green)', fontWeight: 700 }}>
                  SUPPORTED
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                Upload recorded video files containing people or crowd activity.
              </p>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                Formats: .mp4, .avi, .mov, .mkv
              </div>
            </div>

            <div style={{
              padding: '14px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem', color: '#ffffff' }}>
                  <span>📹</span>
                  <span>Live Webcam</span>
                </div>
                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-green)', fontWeight: 700 }}>
                  SUPPORTED
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Use a supported USB webcam or built-in camera stream for real-time monitoring.
              </p>
            </div>

            <div style={{
              padding: '14px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem', color: '#ffffff' }}>
                  <span>🌐</span>
                  <span>RTSP IP Camera Streams</span>
                </div>
                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)', fontWeight: 700 }}>
                  CONFIGURABLE
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Connect standard RTSP CCTV network camera streams via IP URL stream configurations.
              </p>
            </div>

            <div style={{
              padding: '12px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
              border: '1px dashed var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Multi-Camera Cloud NVR Sync
              </span>
              <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '9999px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--status-amber)', fontWeight: 700 }}>
                COMING SOON
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 8: WHAT DOES THE AI DETECT? */}
        <div className="hud-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Eye size={20} color="var(--accent-blue)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                What does the AI detect?
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              The AI analyzes the video frames to detect and track people and understand movement patterns:
            </p>
          </div>

          {/* Flow */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: 'var(--accent-cyan)',
            flexWrap: 'wrap',
            gap: '4px'
          }}>
            <span>Person</span>
            <span>➔</span>
            <span>Detection</span>
            <span>➔</span>
            <span>Tracking</span>
            <span>➔</span>
            <span>Counting</span>
            <span>➔</span>
            <span>Analytics</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Calculated Metrics Include:
            </span>

            {[
              { label: 'Number of people', desc: 'Current visible occupancy in the video' },
              { label: 'Crowd density', desc: 'People per square meter and area congestion status' },
              { label: 'Movement & Trajectories', desc: 'Walking paths and directional vector trails' },
              { label: 'Entry & Exit counts', desc: 'Cumulative crossings over virtual boundary lines' },
              { label: 'Time spent in an area (Dwell Time)', desc: 'How long individuals remain in specific zones' },
              { label: 'Perimeter Zone breaches', desc: 'Instant alerts if someone steps into restricted spaces' }
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>•</span>
                <div>
                  <strong style={{ color: '#ffffff' }}>{m.label}:</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{m.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 9: PRIVACY CARD */}
      <div
        className="hud-panel"
        style={{
          padding: '24px 28px',
          borderRadius: '14px',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(10, 15, 29, 0.95) 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid var(--status-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Lock size={26} color="var(--status-green)" />
        </div>

        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              🔒 Privacy & Non-Biometric Architecture
            </h2>
            <span style={{
              fontSize: '0.68rem',
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              color: 'var(--status-green)',
              fontWeight: 700
            }}>
              PRIVACY-FIRST
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#ffffff', lineHeight: 1.5, margin: '0 0 6px 0' }}>
            <strong>SentinelVision AI focuses on detecting and analyzing people in the scene. It does not need facial recognition to perform crowd counting and movement analytics.</strong>
          </p>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
            People are tracked as anonymous spatial objects using temporary token IDs during the active video session. No facial databases or biometric profiles are stored.
          </p>
        </div>
      </div>

      {/* SECTION 10: UNDERSTAND THE SIDEBAR */}
      <div
        className="hud-panel"
        style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
            Understand the Sidebar Navigation
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0 }}>
            Click on any page below to jump directly to it:
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px'
        }}>
          {sidebarDirectory.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.tab}
                onClick={() => handleNav(item.tab)}
                style={{
                  padding: '16px 18px',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      {item.name}
                    </span>
                  </div>
                  <ExternalLink size={14} color="var(--text-muted)" />
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {item.summary}
                </p>

                <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '4px' }}>
                  Open {item.name} →
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS & SEARCH */}
      <div
        className="hud-panel"
        style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
              Common Questions & Quick Answers
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Search or browse frequently asked questions:
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '6px 12px',
            width: '260px'
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '0.8rem',
                width: '100%'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredFaqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px 18px',
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px'
              }}
            >
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                Q: {faq.q}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OPTIONAL COLLAPSIBLE: TECHNICAL DETAILS */}
      <div
        className="hud-panel"
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <button
          onClick={() => setIsTechDetailsOpen(!isTechDetailsOpen)}
          style={{
            width: '100%',
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 600,
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} color="var(--accent-cyan)" />
            <span>Technical Details & Architecture (Optional for advanced users)</span>
          </div>
          {isTechDetailsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isTechDetailsOpen && (
          <div style={{
            padding: '18px 22px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55
          }}>
            <p style={{ margin: 0 }}>
              Under the hood, SentinelVision AI runs on a high-throughput computer vision pipeline:
            </p>
            <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>
                <strong style={{ color: '#ffffff' }}>Object Detection Model:</strong> Ultralytics YOLOv8n (Nano) fine-tuned for real-time person detection (COCO class 0).
              </li>
              <li>
                <strong style={{ color: '#ffffff' }}>Multi-Object Tracking (MOT):</strong> ByteTrack association engine using Kalman filters and Hungarian algorithm for persistent trajectory maintenance across occlusions.
              </li>
              <li>
                <strong style={{ color: '#ffffff' }}>Spatial Geometry & Zone Logic:</strong> Ray-casting point-in-polygon (PIP) calculations for perimeter intrusion detection.
              </li>
              <li>
                <strong style={{ color: '#ffffff' }}>Backend Architecture:</strong> Python FastAPI asynchronous server with OpenCV frame ingestion, SQLite session telemetry storage, and WebSocket streaming at up to 30 FPS.
              </li>
              <li>
                <strong style={{ color: '#ffffff' }}>Frontend Stack:</strong> React 18 with Vite, Canvas 2D thermal Gaussian footprint rendering, and Recharts HUD gauges.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER CALL TO ACTION */}
      <div style={{
        textAlign: 'center',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
          Ready to begin monitoring?
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => setIsQuickStartOpen(true)}
            className="btn-primary"
            style={{ fontSize: '0.86rem', padding: '10px 20px' }}
          >
            Launch Quick Start Walkthrough
          </button>
          <button
            onClick={() => handleNav('monitor')}
            className="btn-secondary"
            style={{ fontSize: '0.86rem', padding: '10px 18px' }}
          >
            Open Live Monitor →
          </button>
        </div>
      </div>
    </div>
  );
};
