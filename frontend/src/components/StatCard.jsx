import React from 'react';

export const StatCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  color = 'var(--accent-cyan)'
}) => {
  return (
    <div className="hud-panel" style={{
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'default'
    }}>
      {/* Top accent glow line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
        opacity: 0.85
      }} />

      {/* Ambient corner aura */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        background: color,
        opacity: 0.08,
        filter: 'blur(20px)',
        pointerEvents: 'none'
      }} />

      <div style={{ zIndex: 1 }}>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{
            display: 'inline-block',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: color
          }} />
          {title}
        </div>
        <div className="font-mono" style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em'
        }}>
          {value}
        </div>
        {subValue && (
          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            marginTop: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {subValue}
          </div>
        )}
      </div>

      <div style={{
        width: '46px',
        height: '46px',
        borderRadius: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 12px -2px rgba(0, 0, 0, 0.4)`,
        zIndex: 1,
        transition: 'all 0.2s ease'
      }}>
        <Icon size={22} color={color} />
      </div>
    </div>
  );
};
