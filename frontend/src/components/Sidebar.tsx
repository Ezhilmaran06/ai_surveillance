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
  Flame,
  ShieldCheck
} from 'lucide-react';

export type TabType = 'dashboard' | 'monitor' | 'zones' | 'analytics' | 'alerts' | 'sessions' | 'reports' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unacknowledgedAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  unacknowledgedAlertsCount = 0
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'monitor' as TabType, label: 'Live Monitor', icon: Video },
    { id: 'analytics' as TabType, label: 'Crowd Analytics', icon: BarChart3 },
    { id: 'zones' as TabType, label: 'Perimeter Zones', icon: Layers },
    { id: 'alerts' as TabType, label: 'Security Alerts', icon: AlertTriangle, badge: unacknowledgedAlertsCount },
    { id: 'sessions' as TabType, label: 'Video Sessions', icon: FileVideo },
    { id: 'reports' as TabType, label: 'Reports & Export', icon: FileText },
    { id: 'settings' as TabType, label: 'System Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--bg-panel)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 58px)',
      padding: '16px 10px',
      gap: '4px'
    }}>
      <div style={{
        fontSize: '0.68rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
        padding: '6px 12px',
        marginBottom: '4px'
      }}>
        Command Center
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              background: isActive ? 'rgba(6, 182, 212, 0.14)' : 'transparent',
              color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon size={18} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </div>

            {Boolean(item.badge && item.badge > 0) && (
              <span style={{
                backgroundColor: 'var(--status-red)',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', padding: '14px 10px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{
          backgroundColor: 'var(--bg-main)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-green)', fontWeight: 600, marginBottom: '6px' }}>
            <ShieldCheck size={15} />
            <span>Zero Biometrics</span>
          </div>
          <div style={{ fontSize: '0.72rem', lineHeight: '1.4' }}>
            Local edge processing only. Strict ephemeral anonymous person tracking.
          </div>
        </div>
      </div>
    </aside>
  );
};
