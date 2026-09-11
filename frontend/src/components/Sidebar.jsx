import React from 'react';
import {
  LayoutDashboard,
  Video,
  Layers,
  BarChart3,
  AlertTriangle,
  FileVideo,
  FileText,
  Settings,
  ShieldCheck,
  HelpCircle,
  X
} from 'lucide-react';

export const Sidebar = ({
  activeTab,
  onTabChange,
  unacknowledgedAlertsCount = 0,
  isOpen = false,
  onClose
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'monitor', label: 'Live Monitor', icon: Video },
    { id: 'analytics', label: 'Crowd Analytics', icon: BarChart3 },
    { id: 'zones', label: 'Perimeter Zones', icon: Layers },
    { id: 'alerts', label: 'Security Alerts', icon: AlertTriangle, badge: unacknowledgedAlertsCount },
    { id: 'sessions', label: 'Video Sessions', icon: FileVideo },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'help', label: 'Help & How to Use', icon: HelpCircle },
  ];

  const handleSelect = (id) => {
    onTabChange(id);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside
        className={`sidebar-container ${isOpen ? 'open' : ''}`}
        style={{
          width: '240px',
          backgroundColor: 'var(--bg-panel)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 58px)',
          padding: '16px 10px',
          gap: '4px'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 12px',
          marginBottom: '4px'
        }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)'
          }}>
            Command Center
          </span>

          <button
            onClick={onClose}
            className="mobile-toggle-btn btn-secondary"
            style={{ padding: '3px 6px', fontSize: '0.7rem' }}
            title="Close navigation"
          >
            <X size={14} />
          </button>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: isActive ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid transparent',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.16) 0%, rgba(6, 182, 212, 0.04) 100%)'
                  : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? '0 0 16px rgba(6, 182, 212, 0.15)' : 'none',
                textAlign: 'left',
                position: 'relative'
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: '-10px',
                  top: '6px',
                  bottom: '6px',
                  width: '3px',
                  backgroundColor: 'var(--accent-cyan)',
                  borderRadius: '0 3px 3px 0',
                  boxShadow: '0 0 8px var(--accent-cyan)'
                }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={18} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                <span style={{ color: isActive ? 'var(--text-primary)' : 'inherit' }}>{item.label}</span>
              </div>

              {Boolean(item.badge && item.badge > 0) && (
                <span style={{
                  backgroundColor: 'var(--status-red)',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div style={{ marginTop: 'auto', padding: '14px 6px 4px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-green)', fontWeight: 700 }}>
                <span className="live-dot active-green" style={{ width: '6px', height: '6px' }} />
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>EDGE PRIVACY</span>
              </div>
              <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>YOLOv8n</span>
            </div>
            <div style={{ fontSize: '0.71rem', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
              Zero biometric capture. Ephemeral tokenization only.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
