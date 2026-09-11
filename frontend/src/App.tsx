import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { ZoneEditorPage } from './pages/ZoneEditorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { SessionsPage } from './pages/SessionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useSurveillanceWebSocket } from './hooks/useSurveillanceWebSocket';
import { Session, Zone, Alert } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [toastAlert, setToastAlert] = useState<Alert | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sentinel_audio') !== 'false';
  });

  const prevAlertCountRef = useRef<number>(0);

  const { telemetry, isConnected } = useSurveillanceWebSocket();

  // Synthesize soft audio chime for new security alerts using Web Audio API
  const playAlertChime = () => {
    if (!isAudioEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch (e) {
      // Audio autoplay restrictions or headless environment
    }
  };

  const handleToggleAudio = () => {
    setIsAudioEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('sentinel_audio', String(next));
      return next;
    });
  };

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
      if (data.length > 0 && !activeSession) {
        setActiveSession(data[0]);
      } else if (data.length === 0) {
        // Create initial default sample session and default zones for immediate out-of-the-box experience
        const sampleSess = await api.createSampleSession();
        setSessions([sampleSess]);
        setActiveSession(sampleSess);
        await api.createDefaultZones();
        await loadZones();
        await api.startSession(sampleSess.id);
      }
    } catch (e) {
      console.error('Failed loading sessions:', e);
    }
  };

  const loadZones = async () => {
    try {
      const data = await api.getZones();
      setZones(data);
    } catch (e) {
      console.error('Failed loading zones:', e);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts();
      if (data.length > prevAlertCountRef.current && prevAlertCountRef.current > 0) {
        playAlertChime();
        // Trigger toast for newest alert
        if (data.length > 0) {
          setToastAlert(data[0]);
          setTimeout(() => {
            setToastAlert((curr) => (curr?.id === data[0].id ? null : curr));
          }, 6000);
        }
      }
      prevAlertCountRef.current = data.length;
      setAlerts(data);
    } catch (e) {
      console.error('Failed loading alerts:', e);
    }
  };

  useEffect(() => {
    loadSessions();
    loadZones();
    loadAlerts();
    const interval = setInterval(loadAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledgeAll = async () => {
    try {
      await api.acknowledgeAllAlerts();
      loadAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const unackCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Header
        isConnected={isConnected}
        telemetry={telemetry}
        activeSessionName={activeSession?.name}
        onAcknowledgeAll={unackCount > 0 ? handleAcknowledgeAll : undefined}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={handleToggleAudio}
      />

      {/* Floating Alert Toast Notification */}
      {toastAlert && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          maxWidth: '420px',
          backgroundColor: toastAlert.severity === 'critical' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(245, 158, 11, 0.95)',
          color: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem' }}>
              <span>⚠️</span>
              <span style={{ textTransform: 'uppercase' }}>{toastAlert.severity} SECURITY ALERT</span>
            </div>
            <button
              onClick={() => setToastAlert(null)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>
            {toastAlert.message}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={() => {
                setActiveTab('alerts');
                setToastAlert(null);
              }}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Inspect Alert
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unacknowledgedAlertsCount={unackCount}
        />

        <main style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && (
            <DashboardPage
              telemetry={telemetry}
              activeSession={activeSession}
              zones={zones}
              alerts={alerts}
              onNavigateToMonitor={() => setActiveTab('monitor')}
              onNavigateToZones={() => setActiveTab('zones')}
              onNavigateToAlerts={() => setActiveTab('alerts')}
            />
          )}

          {activeTab === 'monitor' && (
            <LiveMonitorPage
              telemetry={telemetry}
              activeSession={activeSession}
              sessions={sessions}
              onSelectSession={setActiveSession}
              onRefreshSessions={loadSessions}
            />
          )}

          {activeTab === 'zones' && (
            <ZoneEditorPage
              zones={zones}
              onZonesChanged={loadZones}
              activeSession={activeSession}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage activeSession={activeSession} />
          )}

          {activeTab === 'alerts' && <AlertsPage />}

          {activeTab === 'sessions' && (
            <SessionsPage
              sessions={sessions}
              activeSession={activeSession}
              onSelectSession={setActiveSession}
              onRefreshSessions={loadSessions}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage activeSession={activeSession} alerts={alerts} />
          )}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};
