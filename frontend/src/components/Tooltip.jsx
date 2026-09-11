import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

export const Tooltip = ({
  content,
  children,
  position = 'top',
  icon = false,
  iconSize = 13,
  maxWidth = 240
}) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return children || null;

  // Position offsets
  const positionStyles = {
    top: {
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    bottom: {
      top: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    left: {
      right: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    right: {
      left: 'calc(100% + 8px)',
      top: '50%',
      transform: 'translateY(-50%)',
    }
  };

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
        cursor: 'help'
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => {
        // Toggle on mobile touch
        e.stopPropagation();
        setIsVisible(!isVisible);
      }}
    >
      {children ? (
        children
      ) : icon ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${iconSize + 5}px`,
            height: `${iconSize + 5}px`,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.07)',
            color: 'var(--text-muted)',
            transition: 'all 0.2s ease',
            marginLeft: '4px'
          }}
          className="tooltip-icon-trigger"
        >
          <HelpCircle size={iconSize} />
        </span>
      ) : null}

      {isVisible && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            zIndex: 9999,
            backgroundColor: 'rgba(10, 15, 29, 0.96)',
            color: '#f8fafc',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 12px rgba(6, 182, 212, 0.15)',
            padding: '7px 11px',
            borderRadius: '6px',
            fontSize: '0.74rem',
            lineHeight: 1.35,
            fontWeight: 400,
            whiteSpace: 'normal',
            width: 'max-content',
            maxWidth: `${maxWidth}px`,
            pointerEvents: 'none',
            textAlign: 'left',
            ...positionStyles[position],
            animation: 'fadeInTooltip 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
};
