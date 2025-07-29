/*
 * TERMINAL-STYLE API MONITORING COMMAND CENTER - UPDATED
 * 
 * Changes Applied:
 * 1. Added Sidebar from original file
 * 2. Added Log Detail Panel with click functionality
 * 3. Removed System Status Window
 * 4. Removed Quick Actions (START/EXPORT/FILTER buttons)
 * 5. Updated layout to accommodate sidebar + detail panel
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Play, Pause, Download, Search, Filter, RefreshCw, X, ChevronDown, ChevronRight,
  Activity, Users, Clock, AlertTriangle, TrendingUp, TrendingDown,
  Globe, Server, Zap, Eye, MoreHorizontal, Settings, Bell, Home,
  FileText, Database, Shield, Box, GitBranch, BarChart3,
  Moon, Sun, Calendar, ChevronLeft, ChevronUp, Wifi, ExternalLink,
  ArrowUp, ArrowDown, Minimize2, Maximize2, Grid3X3, List, PauseCircle,
  PlayCircle, Radio, Layers, Hash, Target, Gauge, Terminal, Command,
  Square, Minus, Plus, Move, RotateCcw, Cpu, HardDrive, Network,
  Circle, Dot
} from 'lucide-react';

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Default to dark for terminal feel
  
  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);
  
  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      background: '#0d1117',
      surface: '#161b22',
      surfaceHover: '#21262d',
      border: '#30363d',
      text: '#f0f6fc',
      textSecondary: '#c9d1d9',
      textMuted: '#8b949e',
      primary: '#58a6ff',
      success: '#3fb950',
      warning: '#d29922',
      error: '#f85149',
      cardBg: '#161b22',
      headerBg: '#0d1117',
      terminal: '#0d1117',
      terminalText: '#7c3aed'
    } : {
      background: '#ffffff',
      surface: '#ffffff',
      surfaceHover: '#f6f8fa',
      border: '#d0d7de',
      text: '#24292f',
      textSecondary: '#656d76',
      textMuted: '#656d76',
      primary: '#0969da',
      success: '#1a7f37',
      warning: '#bf8700',
      error: '#cf222e',
      cardBg: '#ffffff',
      headerBg: '#f6f8fa',
      terminal: '#f6f8fa',
      terminalText: '#24292f'
    }
  };
  
  return (
    <ThemeContext.Provider value={theme}>
      <div style={{ 
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        minHeight: '100vh',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Sidebar Component (from original file)
const Sidebar = () => {
  const sidebarItems = [
    { icon: Home, label: 'Analytics', active: true },
    { icon: FileText, label: 'Logs', active: false },
    { icon: Server, label: 'API Manager', active: false },
    { icon: Database, label: 'API Gateway', active: false },
    { icon: Shield, label: 'API Policies', active: false },
    { icon: Box, label: 'Vault', active: false },
    { icon: Bell, label: 'Alert Engine', active: false },
    { icon: GitBranch, label: 'API Products', active: false },
    { icon: Users, label: 'Access Management', active: false },
    { icon: Settings, label: 'Masters', active: false },
    { icon: Globe, label: 'Global Settings', active: false },
    { icon: BarChart3, label: 'Feedbacks', active: false }
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold">API Console</span>
        </div>
        
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  item.active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

// Command Bar Component
const CommandBar = ({ onCommand, isRealTime, onToggleRealTime, toggleTheme, isDark }) => {
  const { colors } = useTheme();
  const [command, setCommand] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const commands = [
    'logs show --live',
    'logs filter --method=GET',
    'logs filter --status=error',
    'logs search endpoint',
    'metrics show',
    'stats realtime',
    'clear filters',
    'help'
  ];

  const handleCommandChange = (e) => {
    const value = e.target.value;
    setCommand(value);
    
    if (value.startsWith('/')) {
      const filtered = commands.filter(cmd => 
        cmd.toLowerCase().includes(value.slice(1).toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const executeCommand = (cmd = command) => {
    if (cmd.includes('live')) onToggleRealTime();
    if (cmd.includes('theme')) toggleTheme();
    onCommand(cmd);
    setCommand('');
    setSuggestions([]);
  };

  return (
    <div 
      style={{ 
        backgroundColor: colors.headerBg,
        borderColor: colors.border 
      }}
      className="border-b p-4"
    >
      <div className="flex items-center gap-4">
        {/* Terminal Prompt */}
        <div className="flex items-center gap-2">
          <Terminal 
            style={{ color: colors.primary }}
            className="w-5 h-5" 
          />
          <span style={{ 
            color: colors.primary,
            fontFamily: 'Monaco, "Cascadia Code", "Fira Code", "JetBrains Mono", monospace'
          }} className="font-bold">
            api-console:~$
          </span>
        </div>

        {/* Command Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={command}
            onChange={handleCommandChange}
            onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
            placeholder="Type / for commands or search logs..."
            style={{ 
              backgroundColor: colors.terminal,
              borderColor: colors.border,
              color: colors.terminalText,
              fontFamily: 'Monaco, "Cascadia Code", "Fira Code", "JetBrains Mono", monospace'
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Command Suggestions */}
          {suggestions.length > 0 && (
            <div 
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border 
              }}
              className="absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => executeCommand('/' + suggestion)}
                  style={{ color: colors.text }}
                  className="w-full px-4 py-2 text-left text-sm transition-colors"
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.surfaceHover}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  
                >
                  <span style={{ 
                    color: colors.primary,
                    fontFamily: 'Monaco, "Cascadia Code", "Fira Code", "JetBrains Mono", monospace'
                  }}>$</span> 
                  <span style={{ 
                    fontFamily: 'Monaco, "Cascadia Code", "Fira Code", "JetBrains Mono", monospace'
                  }}>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Circle 
              style={{ 
                color: isRealTime ? colors.success : colors.textMuted,
                fill: isRealTime ? colors.success : 'transparent'
              }}
              className="w-3 h-3"
            />
            <span style={{ color: colors.textMuted }} className="text-sm">
              {isRealTime ? 'LIVE' : 'PAUSED'}
            </span>
          </div>
          
          <button
            onClick={toggleTheme}
            style={{ 
              color: colors.textMuted,
              backgroundColor: colors.surfaceHover
            }}
            className="p-2 hover:opacity-80 rounded transition-all"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// Window Component (for modular panes)
const Window = ({ title, children, icon: Icon, onMinimize, onMaximize, onClose, isMinimized, className = "" }) => {
  const { colors } = useTheme();

  return (
    <div 
      style={{ 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }}
      className={`border rounded-lg overflow-hidden ${className}`}
    >
      {/* Window Header */}
      <div 
        style={{ 
          backgroundColor: colors.headerBg,
          borderColor: colors.border 
        }}
        className="flex items-center justify-between p-3 border-b cursor-move"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon 
              style={{ color: colors.primary }}
              className="w-4 h-4" 
            />
          )}
          <span style={{ color: colors.text }} className="font-semibold text-sm">
            {title}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            style={{ color: colors.warning }}
            className="w-3 h-3 rounded-full hover:bg-yellow-500 transition-colors"
          >
            <Minus className="w-2 h-2" />
          </button>
          <button
            onClick={onMaximize}
            style={{ color: colors.success }}
            className="w-3 h-3 rounded-full hover:bg-green-500 transition-colors"
          >
            <Square className="w-2 h-2" />
          </button>
          <button
            onClick={onClose}
            style={{ color: colors.error }}
            className="w-3 h-3 rounded-full hover:bg-red-500 transition-colors"
          >
            <X className="w-2 h-2" />
          </button>
        </div>
      </div>
      
      {/* Window Content */}
      {!isMinimized && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Log Stream Terminal Window (with click functionality and headers)
const LogStreamWindow = ({ logs, isRealTime, onLogClick }) => {
  const { colors } = useTheme();

  const getStatusSymbol = (status) => {
    if (status >= 200 && status < 300) return { symbol: '✓', color: colors.success };
    if (status >= 300 && status < 400) return { symbol: '→', color: colors.primary };
    if (status >= 400 && status < 500) return { symbol: '⚠', color: colors.warning };
    if (status >= 500) return { symbol: '✗', color: colors.error };
    return { symbol: '?', color: colors.textMuted };
  };

  const getMethodColor = (method) => {
    const colorMap = {
      GET: colors.primary,
      POST: colors.success,
      PUT: colors.warning,
      DELETE: colors.error,
      PATCH: '#8b5cf6'
    };
    return colorMap[method] || colors.textMuted;
  };

  return (
    <div 
      style={{ 
        backgroundColor: colors.terminal,
        color: colors.terminalText,
        fontFamily: 'Monaco, "Cascadia Code", "Fira Code", "JetBrains Mono", monospace'
      }}
      className="h-96 overflow-y-auto text-sm rounded-lg"
    >
      {/* Header Row */}
      <div 
        style={{ 
          backgroundColor: colors.surfaceHover,
          borderColor: colors.border
        }}
        className="sticky top-0 px-4 py-2 border-b text-xs uppercase tracking-wider font-bold"
      >
        <div className="grid grid-cols-12 gap-2">
          <div style={{ color: colors.textMuted }} className="col-span-2">TIMESTAMP</div>
          <div style={{ color: colors.textMuted }} className="col-span-1">STATUS</div>
          <div style={{ color: colors.textMuted }} className="col-span-1">METHOD</div>
          <div style={{ color: colors.textMuted }} className="col-span-1">LATENCY</div>
          <div style={{ color: colors.textMuted }} className="col-span-4">ENDPOINT</div>
          <div style={{ color: colors.textMuted }} className="col-span-3">IP ADDRESS</div>
        </div>
      </div>

      {/* Log Entries */}
      <div className="p-4 space-y-1">
        {logs.slice(0, 50).map((log, index) => {
          const statusInfo = getStatusSymbol(log.status);
          const methodColor = getMethodColor(log.method);
          
          return (
            <div 
              key={log.id}
              onClick={() => onLogClick(log)}
              style={{ 
                backgroundColor: index === 0 && isRealTime ? colors.primary + '20' : 'transparent'
              }}
              className="py-1 transition-colors border-l-2 border-transparent pl-2 cursor-pointer hover:bg-opacity-50"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.surfaceHover;
                e.currentTarget.style.borderLeftColor = colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = index === 0 && isRealTime ? colors.primary + '20' : 'transparent';
                e.currentTarget.style.borderLeftColor = 'transparent';
              }}
            >
              <div className="grid grid-cols-12 gap-2 items-center">
                {/* Timestamp */}
                <div style={{ color: colors.textMuted }} className="col-span-2">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </div>
                
                {/* Status with Symbol */}
                <div className="col-span-1 flex items-center gap-1">
                  <span style={{ color: statusInfo.color }}>
                    {statusInfo.symbol}
                  </span>
                  <span style={{ color: colors.text }}>
                    {log.status}
                  </span>
                </div>
                
                {/* Method */}
                <div style={{ color: methodColor }} className="col-span-1 font-bold">
                  {log.method}
                </div>
                
                {/* Latency */}
                <div 
                  style={{ 
                    color: log.latency > 1000 ? colors.error : 
                           log.latency > 500 ? colors.warning : colors.success
                  }}
                  className="col-span-1"
                >
                  {log.latency}ms
                </div>
                
                {/* Endpoint */}
                <div style={{ color: colors.textSecondary }} className="col-span-4 truncate">
                  {log.endpoint}
                </div>
                
                {/* IP Address */}
                <div style={{ color: colors.textMuted }} className="col-span-3">
                  {log.ip}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Metrics Display Window
const MetricsWindow = ({ metrics, logsPerSecond }) => {
  const { colors } = useTheme();

  const metricItems = [
    { label: 'TOTAL_LOGS', value: metrics.totalRequests.toLocaleString(), color: colors.primary },
    { label: 'LOGS_PER_SEC', value: logsPerSecond.toFixed(2), color: colors.success },
    { label: 'SUCCESS_RATE', value: `${metrics.successRate.toFixed(1)}%`, color: colors.success },
    { label: 'ERROR_RATE', value: `${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(1)}%`, color: colors.error },
    { label: 'AVG_LATENCY', value: `${metrics.avgLatency}ms`, color: colors.warning },
    { label: 'UNIQUE_IPS', value: metrics.uniqueIPs.toString(), color: colors.primary },
    { label: 'PEAK_LATENCY', value: `${metrics.peakLatency}ms`, color: colors.error },
    { label: 'FAILED_REQS', value: metrics.failedRequests.toString(), color: colors.error }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metricItems.map((metric, index) => (
        <div key={index} className="space-y-1">
          <div style={{ color: colors.textMuted }} className="text-xs uppercase tracking-wider">
            {metric.label}
          </div>
          <div 
            style={{ 
              color: metric.color,
              fontFamily: 'Monaco, "Cascadia Code", "Fira Code", "JetBrains Mono", monospace'
            }}
            className="text-xl font-bold"
          >
            {metric.value}
          </div>
        </div>
      ))}
    </div>
  );
};

// Chart Window with Live Appearance
const ChartWindow = ({ graphData, isRealTime }) => {
  const { colors } = useTheme();
  const [animationKey, setAnimationKey] = useState(0);

  // Add live animation effect
  useEffect(() => {
    if (!isRealTime) return;
    
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [isRealTime]);

  // Fallback data if graphData is empty
  const chartData = graphData && graphData.length > 0 ? graphData : [
    { time: '00:00', requests: 45, errors: 3 },
    { time: '01:00', requests: 52, errors: 2 },
    { time: '02:00', requests: 38, errors: 4 },
    { time: '03:00', requests: 61, errors: 1 },
    { time: '04:00', requests: 73, errors: 5 },
    { time: '05:00', requests: 89, errors: 3 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          style={{ 
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text
          }}
          className="border rounded-lg p-3 shadow-lg"
        >
          <p className="font-medium mb-2">{`Time: ${label}`}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span style={{ color: colors.textMuted }} className="text-sm">
                    {entry.dataKey === 'requests' ? 'Requests' : 'Errors'}
                  </span>
                </div>
                <span style={{ color: colors.text }} className="font-medium">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative">
      {/* Live Indicator */}
      {isRealTime && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          <div 
            style={{ backgroundColor: colors.success }}
            className="w-2 h-2 rounded-full animate-pulse"
          />
          <span style={{ color: colors.success }} className="text-xs font-medium">
            LIVE
          </span>
        </div>
      )}

      {/* Chart Legend */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }} />
          <span style={{ color: colors.textMuted }}>Requests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.error }} />
          <span style={{ color: colors.textMuted }}>Errors</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} key={animationKey} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="errorsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.error} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={colors.error} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} strokeOpacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke={colors.textMuted}
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke={colors.textMuted}
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Requests Area */}
          <Area
            type="monotone"
            dataKey="requests"
            stackId="1"
            stroke={colors.primary}
            strokeWidth={3}
            fill="url(#requestsGradient)"
            fillOpacity={1}
            dot={false}
            activeDot={{ 
              r: 5, 
              fill: colors.primary,
              stroke: colors.background,
              strokeWidth: 2
            }}
          />
          
          {/* Errors Area */}
          <Area
            type="monotone"
            dataKey="errors"
            stackId="2"
            stroke={colors.error}
            strokeWidth={2}
            fill="url(#errorsGradient)"
            fillOpacity={1}
            dot={false}
            activeDot={{ 
              r: 4, 
              fill: colors.error,
              stroke: colors.background,
              strokeWidth: 2
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Log Detail Panel Component
const LogDetailPanel = ({ log, onClose }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('formatted');
  
  if (!log) return null;

  // Generate comprehensive log details
  const logDetails = {
    requestId: log.id || 'bcac97fe-f557-42ab-ac3e-6c28a9755223',
    traceId: '023f76a2-e5e7-40bb-9a59-055d42a0a401',
    statusCode: log.status,
    spanId: '81e64cd6-9d72-44c2-9a12-15e8540644e1',
    source: 'AWS',
    success: log.success,
    correlationId: '42eab7bc-ae61-4010-a73e-78b3a3f20522',
    workflowType: 'WORKFLOW',
    isCompleted: true,
    runtime: 'bruno-runtime/1.38.1',
    environment: 'Production',
    region: 'us-east-1',
    cached: false,
    retryCount: 0,
    threadCount: 1,
    policyName: 'ANALYTICS_POLICY',
    endpoint: log.endpoint,
    fullUrl: `${log.endpoint}?trace=${log.id}`,
    timestamp: log.timestamp,
    executionId: '62a7b933-4a7c-4f74-bf56-b82afd0b5282',
    duration: log.latency,
    visibility: 'PUBLIC',
    service: 'api-gateway',
    method: log.method,
    clientIp: log.ip,
    requestSize: Math.floor(log.size / 2),
    responseSize: log.size,
    userAgent: log.userAgent,
    sessionId: 'f80eb970-77fe-4db5-99be-78f03f01013',
    location: log.location,
    validated: true,
    token: 'UopRtJcB6UkRRT1SaAVh',
    reference: '3fdfe3d0-32cc-469c-ad59-cd13f28a2de2',
    priority: 952
  };

  const formatValue = (value) => {
    if (typeof value === 'boolean') {
      return (
        <span style={{ 
          color: value ? colors.success : colors.error,
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {value ? 'TRUE' : 'FALSE'}
        </span>
      );
    }
    if (value === null) {
      return <span style={{ color: colors.textMuted, fontStyle: 'italic' }}>NULL</span>;
    }
    if (typeof value === 'string' && value.includes('http')) {
      return <span style={{ color: colors.primary }} className="break-all">{value}</span>;
    }
    return <span style={{ color: colors.text }} className="break-all">{value}</span>;
  };

  const renderFormattedView = () => (
    <div className="space-y-1 p-2">
      {Object.entries(logDetails).map(([key, value]) => (
        <div 
          key={key}
          style={{ backgroundColor: colors.surfaceHover }}
          className="px-3 py-2 text-sm border-l-2 border-transparent hover:border-blue-500 transition-colors rounded"
        >
          <div className="flex justify-between items-start">
            <span style={{ color: colors.textMuted }} className="uppercase text-xs mr-4">
              {key.replace(/([A-Z])/g, '_$1').toUpperCase()}
            </span>
            <div className="text-right flex-1" style={{ fontFamily: 'Monaco, "Cascadia Code", "Fira Code", "JetBrains Mono", monospace' }}>
              {formatValue(value)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderJsonView = () => (
    <div 
      style={{ 
        backgroundColor: colors.terminal,
        color: colors.terminalText,
        fontFamily: 'Monaco, "Cascadia Code", "Fira Code", "JetBrains Mono", monospace'
      }}
      className="p-4 rounded-lg m-2 max-h-full overflow-auto"
    >
      <pre className="text-sm whitespace-pre-wrap">
        {JSON.stringify(logDetails, null, 2)}
      </pre>
    </div>
  );

  return (
    <div 
      style={{ 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }}
      className="w-96 border-l overflow-hidden flex flex-col fixed right-0 top-0 h-full z-50"
    >
      {/* Header */}
      <div 
        style={{ borderColor: colors.border }}
        className="flex items-center justify-between p-4 border-b flex-shrink-0"
      >
        <h3 style={{ color: colors.error }} className="text-lg font-semibold">
          LOG_DETAILS
        </h3>
        <div className="flex items-center gap-2">
          <button 
            style={{ 
              color: colors.textMuted,
              backgroundColor: 'transparent'
            }}
            className="p-2 rounded transition-colors hover:opacity-80"
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.surfaceHover}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            style={{ 
              color: colors.textMuted,
              backgroundColor: 'transparent'
            }}
            className="p-2 rounded transition-colors hover:opacity-80"
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.surfaceHover}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div 
        style={{ borderColor: colors.border }}
        className="flex border-b flex-shrink-0"
      >
        <button
          onClick={() => setActiveTab('formatted')}
          style={{ 
            borderColor: activeTab === 'formatted' ? colors.primary : 'transparent',
            color: activeTab === 'formatted' ? colors.primary : colors.textMuted
          }}
          className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
        >
          FORMATTED
        </button>
        <button
          onClick={() => setActiveTab('json')}
          style={{ 
            borderColor: activeTab === 'json' ? colors.primary : 'transparent',
            color: activeTab === 'json' ? colors.primary : colors.textMuted
          }}
          className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
        >
          JSON
        </button>
      </div>

      {/* Content Header */}
      <div 
        style={{ backgroundColor: colors.surfaceHover }}
        className="px-4 py-2 flex-shrink-0"
      >
        <span style={{ color: colors.textMuted }} className="text-sm font-medium">
          REQUEST_ID: <span style={{ fontFamily: 'Monaco, "Cascadia Code", "Fira Code", "JetBrains Mono", monospace' }}>{log.id}</span>
        </span>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'formatted' ? renderFormattedView() : renderJsonView()}
      </div>
    </div>
  );
};

// Main Dashboard Component
const TerminalAPILogsDashboard = () => {
  const { isDark, toggleTheme, colors } = useTheme();
  const [isRealTime, setIsRealTime] = useState(false);
  const [logsPerSecond, setLogsPerSecond] = useState(3.2);
  const [selectedLog, setSelectedLog] = useState(null);
  const [windows, setWindows] = useState({
    logs: { minimized: false },
    metrics: { minimized: false },
    chart: { minimized: false }
  });

  // Mock data states
  const [logs, setLogs] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRequests: 847293,
    failedRequests: 12847,
    avgLatency: 178,
    uniqueIPs: 2847,
    successRate: 98.5,
    peakLatency: 3245
  });

  // Generate mock data
  const generateMockData = useCallback(() => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const endpoints = ['/api/users', '/api/auth/login', '/api/data', '/api/upload', '/api/payments', '/api/search'];
    const statuses = [200, 201, 400, 401, 403, 404, 500, 503];
    const ips = ['192.168.1.10', '10.0.0.15', '172.16.0.5', '203.0.113.42', '198.51.100.17'];
    
    return Array.from({ length: 200 }, (_, i) => {
      const method = methods[Math.floor(Math.random() * methods.length)];
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const ip = ips[Math.floor(Math.random() * ips.length)];
      
      const now = new Date();
      const timestamp = new Date(now.getTime() - (i * 5 * 1000)); // 5 second intervals
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: timestamp.toISOString(),
        ip,
        method,
        endpoint,
        status,
        latency: Math.floor(Math.random() * 2000) + 50,
        success: status < 400,
        userAgent: 'Mozilla/5.0 (compatible; API Client)',
        size: Math.floor(Math.random() * 50000) + 1000,
        location: ['US-West', 'EU-Central', 'AP-Southeast'][Math.floor(Math.random() * 3)]
      };
    });
  }, []);

  // Generate graph data
  const generateGraphData = useCallback(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      requests: Math.floor(Math.random() * 100) + 50,
      errors: Math.floor(Math.random() * 10) + 1
    }));
  }, []);

  // Initialize data
  useEffect(() => {
    const mockLogs = generateMockData();
    const chartData = generateGraphData();
    
    setLogs(mockLogs);
    setGraphData(chartData);
    
    // Debug: Log chart data to console
    console.log('Chart Data Generated:', chartData);
  }, [generateMockData, generateGraphData]);

  // Real-time simulation
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      const newLog = generateMockData()[0];
      newLog.timestamp = new Date().toISOString();
      
      setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 199)]);
      setMetrics(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 5) + 1
      }));
      setLogsPerSecond(prev => Math.max(0.5, prev + (Math.random() - 0.5) * 1));
    }, 1500);

    return () => clearInterval(interval);
  }, [isRealTime, generateMockData]);

  const handleCommand = (command) => {
    console.log('Command executed:', command);
    // Handle different commands here
  };

  const toggleWindow = (windowName) => {
    setWindows(prev => ({
      ...prev,
      [windowName]: {
        ...prev[windowName],
        minimized: !prev[windowName].minimized
      }
    }));
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
  };

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        <div className="flex-1">
          {/* Command Bar */}
          <CommandBar
            onCommand={handleCommand}
            isRealTime={isRealTime}
            onToggleRealTime={() => setIsRealTime(!isRealTime)}
            toggleTheme={toggleTheme}
            isDark={isDark}
          />

          {/* Main Content - Updated Grid Layout */}
          <div className="p-4 h-screen grid grid-cols-12 grid-rows-3 gap-4">
            {/* Traffic Analysis Chart - Full Width Top */}
            <Window
              title="LIVE TRAFFIC ANALYSIS"
              icon={TrendingUp}
              className="col-span-12 row-span-1"
              onMinimize={() => toggleWindow('chart')}
              isMinimized={windows.chart.minimized}
            >
              <ChartWindow graphData={graphData} isRealTime={isRealTime} />
            </Window>

            {/* Log Stream - Left Side */}
            <Window
              title={`LOG STREAM [${logs.length.toLocaleString()} ENTRIES]`}
              icon={Terminal}
              className="col-span-8 row-span-2"
              onMinimize={() => toggleWindow('logs')}
              isMinimized={windows.logs.minimized}
            >
              <LogStreamWindow 
                logs={logs} 
                isRealTime={isRealTime} 
                onLogClick={handleLogClick}
              />
            </Window>

            {/* Metrics Window - Right Side */}
            <Window
              title="SYSTEM METRICS"
              icon={BarChart3}
              className="col-span-4 row-span-2"
              onMinimize={() => toggleWindow('metrics')}
              isMinimized={windows.metrics.minimized}
            >
              <MetricsWindow metrics={metrics} logsPerSecond={logsPerSecond} />
            </Window>
          </div>
        </div>

        {/* Log Detail Panel */}
        {selectedLog && (
          <LogDetailPanel 
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </div>
    </div>
  );
};

// App wrapper with Theme Provider
const App = () => {
  return (
    <ThemeProvider>
      <TerminalAPILogsDashboard />
    </ThemeProvider>
  );
};

export default App;