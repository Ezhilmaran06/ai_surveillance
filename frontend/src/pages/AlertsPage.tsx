import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, CheckCheck, Trash2, Search, Filter, ShieldAlert } from 'lucide-react';
import { Alert } from '../types';
import { api } from '../services/api';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterUnackOnly, setFilterUnackOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id: number) => {
    try {
      await api.acknowledgeAlert(id);
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcknowledgeAll = async () => {
    try {
      await api.acknowledgeAllAlerts();
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await api.deleteAlert(id);
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAlerts = async () => {
    if (confirm('Clear all historical alerts?')) {
      try {
        await api.clearAlerts();
        fetchAlerts();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterUnackOnly && a.acknowledged) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.message.toLowerCase().includes(q) ||
        (a.zone_name && a.zone_name.toLowerCase().includes(q)) ||
        a.alert_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={22} color="var(--status-red)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Security Incidents & Perimeter Alerts Log
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time audit log of crowd capacity breaches, loitering dwell alerts, and perimeter crossings.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handleAcknowledgeAll} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
            <CheckCheck size={14} color="var(--status-green)" />
            Acknowledge All
          </button>
          <button onClick={handleClearAlerts} className="btn-danger" style={{ fontSize: '0.8rem' }}>
            <Trash2 size={14} />
            Clear Log
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="hud-panel" style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search alerts by zone, person ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem' }}>
          {/* Severity selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                outline: 'none'
              }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filterUnackOnly}
              onChange={(e) => setFilterUnackOnly(e.target.checked)}
            />
            Unacknowledged Only
          </label>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="hud-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{
              backgroundColor: 'rgba(17, 24, 39, 0.7)',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <th style={{ padding: '12px 16px' }}>ID / Timestamp</th>
              <th style={{ padding: '12px 16px' }}>Severity</th>
              <th style={{ padding: '12px 16px' }}>Zone / Subject</th>
              <th style={{ padding: '12px 16px' }}>Incident Message</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  style={{
                    borderBottom: '1px solid rgba(30, 41, 59, 0.5)',
                    backgroundColor: alert.acknowledged ? 'transparent' : 'rgba(239, 68, 68, 0.04)',
                    transition: 'background-color 0.15s'
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>#{alert.id}</div>
                    <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span className={
                      alert.severity === 'critical'
                        ? 'badge-critical'
                        : alert.severity === 'warning'
                        ? 'badge-warning'
                        : 'badge-info'
                    }>
                      {alert.severity}
                    </span>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      {alert.zone_name || 'Global Area'}
                    </div>
                    {alert.track_id && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Person #{alert.track_id}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)', maxWidth: '400px' }}>
                    {alert.message}
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {!alert.acknowledged ? (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          <Check size={13} color="var(--status-green)" />
                          Acknowledge
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          ✓ Acknowledged
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="btn-danger"
                        style={{ padding: '4px 8px' }}
                        title="Delete Alert Record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No security alerts matching current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
