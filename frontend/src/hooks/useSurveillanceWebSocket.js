import { useState, useEffect, useRef } from 'react';

export function useSurveillanceWebSocket() {
  const [telemetry, setTelemetry] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    let unmounted = false;

    function connect() {
      if (unmounted) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/live`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (unmounted) {
            safeClose(ws);
            return;
          }
          setIsConnected(true);
          console.log('[Surveillance WS] Connected to live stream');
        };

        ws.onmessage = (event) => {
          if (unmounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'frame_update' || data.type === 'connection_established') {
              setTelemetry(data);
            }
          } catch (e) {
            // Ignore parse errors
          }
        };

        ws.onclose = (event) => {
          if (unmounted) return;
          setIsConnected(false);
          // Auto reconnect after delay if not a clean intentional close
          if (event.code !== 1000) {
            reconnectTimeoutRef.current = window.setTimeout(connect, 2000);
          }
        };

        ws.onerror = () => {
          // If unmounted or reconnecting, silently suppress error event
          if (unmounted) return;
          try {
            ws.close();
          } catch (e) {
            // ignore
          }
        };
      } catch (e) {
        if (!unmounted) {
          reconnectTimeoutRef.current = window.setTimeout(connect, 2000);
        }
      }
    }

    function safeClose(socket) {
      if (!socket) return;
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'Cleanup');
      } else if (socket.readyState === WebSocket.CONNECTING) {
        socket.onopen = () => {
          try {
            socket.close(1000, 'Cleanup');
          } catch (e) {}
        };
      }
    }

    connect();

    return () => {
      unmounted = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      safeClose(wsRef.current);
      wsRef.current = null;
    };
  }, []);

  const sendCommand = (action, payload = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action, ...payload }));
    }
  };

  return { telemetry, isConnected, sendCommand };
}
