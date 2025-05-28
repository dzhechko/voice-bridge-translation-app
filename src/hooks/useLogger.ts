
import { useState, useCallback } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

interface LoggerHook {
  logs: LogEntry[];
  log: (level: LogEntry['level'], message: string, data?: any) => void;
  clearLogs: () => void;
}

export const useLogger = (): LoggerHook => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const log = useCallback((level: LogEntry['level'], message: string, data?: any) => {
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    setLogs(prev => [...prev, logEntry]);
    
    // Also log to console for debugging
    console[level](message, data);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    log,
    clearLogs,
  };
};
