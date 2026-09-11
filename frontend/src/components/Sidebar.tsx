import React from 'react';
import {
  Video,
  Layers,
  BarChart3,
  AlertTriangle,
  FileVideo,
  FileText,
  Settings,
  Flame
} from 'lucide-react';

export type TabType = 'monitor' | 'zones' | 'analytics' | 'alerts' | 'sessions' | 'reports' | 'settings';

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
    { id: 'monitor' as TabType, label: 'Live Monitor', icon: Video },
    { id: 'zones' as TabType, label: 'Zones & Lines', icon: Layers },
    { id: 'analytics' as TabType, label: 'Crowd Analytics', icon: BarChart3 },
    { id: 'alerts' as TabType, label: 'Security Alerts', icon: AlertTriangle, badge: unacknowledgedAlertsCount },
    { id: 'sessions' as TabType, label: 'Video Sessions', icon: FileVideo },
    { id: 'reports' as TabType, label: 'Reports & Audit', icon: FileText },
    { id: 'settings' as TabType, label: 'System Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--bg-panel)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 63px)',
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
        Command Navigation
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
              background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
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
          backgroundColor: 'rgba(8, 12, 20, 0.7)',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '4px' }}>
            <Flame size={14} />
            <span>AI Inference Engine</span>
          </div>
          <div>YOLOv8 Person Filter</div>
          <div>ByteTrack Persistent IDs</div>
          <div>Raycast Polygon Engine</div>
        </div>
      </div>
    </aside>
  );
};
