import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  color = 'var(--accent-cyan)'
}) => {
  return (
    <div className="hud-panel" style={{
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '3px',
        backgroundColor: color
      }} />

      <div>
        <div style={{
          fontSize: '0.74rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted)',
          marginBottom: '4px'
        }}>
          {title}
        </div>
        <div className="font-mono" style={{
          fontSize: '1.65rem',
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.1
        }}>
          {value}
        </div>
        {subValue && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {subValue}
          </div>
        )}
      </div>

      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={22} color={color} />
      </div>
    </div>
  );
};
