/*
 * API INTEGRATION GUIDE:
 * 
 * To integrate with your backend API, replace the mock data in the `fetchApiLogs` function:
 * 
 * 1. Update the API endpoint:
 *    const response = await fetch('/your-api-endpoint');
 *    const apiData = await response.json();
 * 
 * 2. Ensure your API returns data in this format:
 *    {
 *      logs: [
 *        {
 *          id: string,
 *          timestamp: string (ISO format),
 *          ip: string,
 *          method: string,
 *          endpoint: string,
 *          status: number,
 *          latency: number,
 *          proxyLatency: number,
 *          success: boolean,
 *          userAgent: string,
 *          size: number,
 *          location: string
 *        }
 *      ]
 *    }
 * 
 * 3. All metrics and graph data will be automatically calculated from the logs
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import { 
  Play, Pause, Download, Search, Filter, RefreshCw, X, ChevronDown, ChevronRight,
  Activity, Users, Clock, AlertTriangle, TrendingUp, TrendingDown,
  Globe, Server, Zap, Eye, MoreHorizontal, Settings, Bell, Home,
  FileText, Database, Shield, Box, GitBranch, BarChart3,
  Moon, Sun, Calendar, ChevronLeft, ChevronUp, Wifi, ExternalLink,
  Plus, Menu, User
} from 'lucide-react';

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Default to dark theme to match the HTML design
  
  const toggleTheme = () => setIsDark(prev => !prev);
  
  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      // Dark theme colors matching the HTML design
      background: '#111827',
      surface: '#1F2937',
      surfaceHover: '#374151',
      border: '#374151',
      text: '#E5E7EB',
      textSecondary: '#D1D5DB',
      textMuted: '#9CA3AF',
      primary: '#F97316', // Orange color from HTML
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      cardBg: '#374151',
      headerBg: '#1F2937',
      sidebarBg: '#111827'
    } : {
      // Light theme colors
      background: '#F9FAFB',
      surface: '#FFFFFF',
      surfaceHover: '#F3F4F6',
      border: '#E5E7EB',
      text: '#111827',
      textSecondary: '#374151',
      textMuted: '#6B7280',
      primary: '#F97316',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      cardBg: '#FFFFFF',
      headerBg: '#FFFFFF',
      sidebarBg: '#FFFFFF'
    }
  };
  
  return (
    <ThemeContext.Provider value={theme}>
      <div style={{ 
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        minHeight: '100vh',
        transition: 'all 0.3s ease'
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

// Compact Sidebar Component (inspired by HTML design)
const CompactSidebar = ({ onToggleRealTime, isRealTime }) => {
  const { colors, toggleTheme, isDark } = useTheme();
  
  const sidebarItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: FileText, label: 'Logs', active: false },
    { icon: BarChart3, label: 'Analytics', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <aside 
      style={{ backgroundColor: colors.sidebarBg }}
      className="w-16 flex flex-col items-center py-4 space-y-6 border-r"
    >
      {/* Logo */}
      <div className="p-2 rounded-md">
        <div 
          style={{ color: colors.primary }}
          className="w-8 h-8 flex items-center justify-center text-2xl font-bold"
        >
          🚀
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col items-center space-y-4">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.label}
              style={{
                backgroundColor: item.active ? colors.surfaceHover : 'transparent',
                color: item.active ? colors.text : colors.textMuted
              }}
              className="p-2 rounded-md hover:bg-opacity-80 transition-all"
              title={item.label}
            >
              <IconComponent className="w-7 h-7" />
            </button>
          );
        })}
        
        {/* Real-time toggle */}
        <button
          onClick={onToggleRealTime}
          style={{
            backgroundColor: isRealTime ? colors.primary : colors.surfaceHover,
            color: isRealTime ? 'white' : colors.textMuted
          }}
          className="p-2 rounded-md transition-all"
          title={isRealTime ? 'Pause Live' : 'Start Live'}
        >
          {isRealTime ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
        </button>
      </div>

      {/* Bottom Items */}
      <div className="mt-auto flex flex-col items-center space-y-4">
        <button
          onClick={toggleTheme}
          style={{ color: colors.textMuted }}
          className="p-2 rounded-md hover:bg-opacity-80 transition-all"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-7 h-7" /> : <Moon className="w-7 h-7" />}
        </button>
        
        <div 
          style={{ backgroundColor: colors.primary }}
          className="w-10 h-10 rounded-full flex items-center justify-center"
        >
          <User className="w-6 h-6 text-white" />
        </div>
      </div>
    </aside>
  );
};

// Header Component (inspired by HTML design)
const DashboardHeader = ({ onRefresh, onExport }) => {
  const { colors } = useTheme();
  
  return (
    <header 
      style={{ 
        backgroundColor: colors.headerBg,
        borderColor: colors.border 
      }}
      className="h-16 flex items-center justify-between px-6 border-b"
    >
      <div className="w-full max-w-lg">
        <div className="relative">
          <Search 
            style={{ color: colors.textMuted }}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
          />
          <input
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Search logs, endpoints, or IPs..."
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={onRefresh}
          style={{ color: colors.textMuted }}
          className="hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        
        <button 
          onClick={onExport}
          style={{ color: colors.textMuted }}
          className="hover:text-white transition-colors"
          title="Export Data"
        >
          <Download className="w-5 h-5" />
        </button>
        
        <button 
          style={{ color: colors.textMuted }}
          className="hover:text-white transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="flex items-center">
          <span style={{ color: colors.text }} className="ml-2 text-sm font-semibold">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
};

// API Metrics Burst Component (inspired by Event Burst from HTML)
const APIMetricsBurst = ({ metrics }) => {
  const { colors } = useTheme();
  
  return (
    <div style={{ backgroundColor: colors.cardBg }} className="rounded-lg p-6">
      <h3 style={{ color: colors.text }} className="font-semibold text-lg mb-1">
        API Metrics Burst
      </h3>
      <p style={{ color: colors.textMuted }} className="text-sm mb-4">
        Real-time overview of your API performance
      </p>
      
      <div className="relative">
        <input
          style={{
            backgroundColor: colors.surfaceHover,
            borderColor: colors.border,
            color: colors.text
          }}
          className="w-full border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
          placeholder="Search metrics..."
          type="text"
        />
        <Search 
          style={{ color: colors.textMuted }}
          className="absolute left-3 top-2.5 w-4 h-4" 
        />
      </div>
      
      {/* Circular Metrics Display */}
      <div className="relative w-full aspect-square max-w-xs mx-auto">
        <div 
          style={{ 
            background: `conic-gradient(from 0deg, ${colors.success} 0deg ${(metrics.successRate / 100) * 360}deg, ${colors.error} ${(metrics.successRate / 100) * 360}deg 360deg)`
          }}
          className="w-full h-full rounded-full flex items-center justify-center"
        >
          <div 
            style={{ backgroundColor: colors.cardBg }}
            className="w-3/4 h-3/4 rounded-full flex flex-col items-center justify-center"
          >
            <span style={{ color: colors.text }} className="text-2xl font-bold">
              {metrics.successRate.toFixed(1)}%
            </span>
            <span style={{ color: colors.textMuted }} className="text-xs">
              Success Rate
            </span>
          </div>
        </div>
      </div>
      
      <p style={{ color: colors.textMuted }} className="text-xs mt-2 text-center">
        API &gt; Requests &gt; Success &gt; {metrics.totalRequests.toLocaleString()} total
      </p>
    </div>
  );
};

// Status Counts Component (inspired by Event Counts by Severity)
const StatusCounts = ({ logs }) => {
  const { colors } = useTheme();
  
  const statusCounts = {
    success: logs.filter(log => log.status >= 200 && log.status < 300).length,
    warnings: logs.filter(log => log.status >= 300 && log.status < 400).length,
    errors: logs.filter(log => log.status >= 400).length
  };
  
  return (
    <div style={{ backgroundColor: colors.cardBg }} className="rounded-lg p-6">
      <h3 style={{ color: colors.text }} className="font-semibold text-lg mb-2">
        Response Status Breakdown
      </h3>
      <p style={{ color: colors.textMuted }} className="text-sm mb-4">
        Categorized by HTTP status codes
      </p>
      
      <div className="flex justify-between text-center">
        <div>
          <p style={{ color: colors.success }} className="text-4xl font-bold">
            {statusCounts.success}
          </p>
          <p style={{ color: colors.textMuted }} className="text-xs">
            Success (2xx)
          </p>
        </div>
        <div>
          <p style={{ color: colors.warning }} className="text-4xl font-bold">
            {statusCounts.warnings}
          </p>
          <p style={{ color: colors.textMuted }} className="text-xs">
            Redirects (3xx)
          </p>
        </div>
        <div>
          <p style={{ color: colors.error }} className="text-4xl font-bold">
            {statusCounts.errors}
          </p>
          <p style={{ color: colors.textMuted }} className="text-xs">
            Errors (4xx-5xx)
          </p>
        </div>
      </div>
    </div>
  );
};

// Traffic Flow Component (inspired by Event Flow)
const TrafficFlow = ({ graphData }) => {
  const { colors } = useTheme();
  
  return (
    <div style={{ backgroundColor: colors.cardBg }} className="rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 style={{ color: colors.text }} className="font-semibold text-lg">
            API Traffic Flow
          </h3>
          <p style={{ color: colors.textMuted }} className="text-sm">
            Request patterns over time
          </p>
        </div>
        <button style={{ color: colors.textMuted }} className="text-sm hover:text-white">
          Expand View
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={graphData.slice(-8)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
          <XAxis 
            dataKey="time" 
            stroke={colors.textMuted}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              color: colors.text
            }}
          />
          <Bar 
            dataKey="requests" 
            fill={colors.primary}
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="success" 
            fill={colors.success}
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="errors" 
            fill={colors.error}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// KPIs Component 
const KPIMetrics = ({ metrics }) => {
  const { colors } = useTheme();
  
  const kpis = [
    {
      label: 'Avg Response Time',
      value: `${metrics.avgLatency}ms`,
      trend: -5.2,
      color: colors.success
    },
    {
      label: 'Peak Latency',
      value: `${metrics.peakLatency}ms`,
      trend: 2.1,
      color: colors.warning
    },
    {
      label: 'Unique IPs',
      value: metrics.uniqueIPs.toLocaleString(),
      trend: 12.5,
      color: colors.primary
    },
    {
      label: 'Error Rate',
      value: `${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(1)}%`,
      trend: -2.1,
      color: metrics.failedRequests > 0 ? colors.error : colors.success
    }
  ];
  
  return (
    <div style={{ backgroundColor: colors.cardBg }} className="rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 style={{ color: colors.text }} className="font-semibold text-lg">
          KPIs
        </h3>
        <div 
          style={{ 
            backgroundColor: colors.surfaceHover,
            color: colors.text 
          }}
          className="text-sm px-2 py-1 rounded-full"
        >
          {kpis.length}
        </div>
      </div>
      <p style={{ color: colors.textMuted }} className="text-sm mb-4">
        Track your most vital API metrics
      </p>
      
      <div className="space-y-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="flex items-center justify-between">
            <p style={{ color: colors.text }}>{kpi.label}</p>
            <div className="flex items-center space-x-4">
              {/* Simple trend line visualization */}
              <svg className="w-20 h-6" viewBox="0 0 80 24">
                <path
                  d={`M0 ${12 + (kpi.trend > 0 ? -6 : 6)} L20 ${12 + Math.random() * 4 - 2} L40 ${12 + Math.random() * 4 - 2} L60 ${12 + Math.random() * 4 - 2} L80 ${12 + (kpi.trend > 0 ? 6 : -6)}`}
                  stroke={kpi.color}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              <span 
                style={{ 
                  backgroundColor: kpi.color + '20',
                  color: kpi.color 
                }}
                className="font-semibold px-2 py-1 rounded-md text-sm"
              >
                {kpi.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// API Log Listing Component
const APILogListing = ({ logs, onLogSelect, isRealTime }) => {
  const { colors } = useTheme();
  
  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return colors.success;
    if (status >= 300 && status < 400) return colors.primary;
    if (status >= 400 && status < 500) return colors.warning;
    return colors.error;
  };
  
  const getMethodColor = (method) => {
    const methodColors = {
      GET: colors.primary,
      POST: colors.success,
      PUT: colors.warning,
      DELETE: colors.error,
      PATCH: '#8b5cf6'
    };
    return methodColors[method] || colors.textMuted;
  };

  return (
    <div style={{ backgroundColor: colors.cardBg }} className="rounded-lg p-6">
      <h3 style={{ color: colors.text }} className="font-semibold text-lg mb-1">
        Recent API Requests
      </h3>
      <p style={{ color: colors.textMuted }} className="text-sm mb-4">
        Filter and analyze your API traffic patterns
      </p>
      
      <div className="space-y-4">
        {logs.slice(0, 5).map((log, index) => (
          <div 
            key={log.id}
            style={{ 
              backgroundColor: colors.surfaceHover,
              borderColor: index === 0 && isRealTime ? colors.primary : 'transparent'
            }}
            className="p-4 rounded-lg border-2 transition-all cursor-pointer hover:opacity-80"
            onClick={() => onLogSelect(log)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  style={{ 
                    backgroundColor: getMethodColor(log.method) + '20',
                    color: getMethodColor(log.method)
                  }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                >
                  {log.method}
                </div>
                <div>
                  <p style={{ color: colors.text }} className="font-semibold">
                    {log.endpoint}
                  </p>
                  <p style={{ color: colors.textMuted }} className="text-sm">
                    {log.ip} • {log.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <span 
                    style={{ 
                      backgroundColor: getStatusColor(log.status) + '20',
                      color: getStatusColor(log.status)
                    }}
                    className="px-2 py-1 text-xs font-medium rounded-md mr-2"
                  >
                    {log.status}
                  </span>
                  <span style={{ color: colors.textMuted }} className="text-sm">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <button style={{ color: colors.textMuted }} className="hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Additional details */}
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <p style={{ color: colors.textMuted }}>Latency</p>
                <p style={{ color: colors.text }}>{log.latency}ms</p>
              </div>
              <div>
                <p style={{ color: colors.textMuted }}>Size</p>
                <p style={{ color: colors.text }}>{(log.size / 1024).toFixed(1)}KB</p>
              </div>
              <div>
                <p style={{ color: colors.textMuted }}>User Agent</p>
                <p style={{ color: colors.text }} className="truncate">
                  {log.userAgent.split(' ')[0]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        {[1, 2, 3, 4, 5, 6].map((page) => (
          <button
            key={page}
            style={{
              backgroundColor: page === 2 ? colors.primary : colors.surfaceHover,
              color: page === 2 ? 'white' : colors.textMuted
            }}
            className="w-8 h-8 rounded-md flex items-center justify-center text-sm transition-all hover:opacity-80"
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

// Log Inspector Modal (simplified)
const LogInspector = ({ log, onClose }) => {
  const { colors } = useTheme();
  
  if (!log) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        style={{ backgroundColor: colors.cardBg }}
        className="w-full max-w-2xl mx-4 rounded-lg overflow-hidden"
      >
        <div 
          style={{ borderColor: colors.border }}
          className="flex items-center justify-between p-4 border-b"
        >
          <h3 style={{ color: colors.text }} className="text-lg font-semibold">
            Log Details
          </h3>
          <button
            onClick={onClose}
            style={{ color: colors.textMuted }}
            className="hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(log).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span style={{ color: colors.textMuted }} className="font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1')}:
              </span>
              <span style={{ color: colors.text }} className="font-mono text-sm">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const APILogsDashboard = () => {
  const { colors } = useTheme();
  const [isRealTime, setIsRealTime] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRequests: 12847,
    failedRequests: 342,
    avgLatency: 145,
    uniqueIPs: 1205,
    successRate: 97.3,
    peakLatency: 2840
  });

  // Single API call to fetch all data
  const fetchApiLogs = useCallback(async () => {
    try {
      // For now, using mock data - replace this with your API call
      const apiData = {
        logs: Array.from({ length: 50 }, (_, i) => {
          const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
          const endpoints = ['/api/users', '/api/auth/login', '/api/data', '/api/upload', '/api/payments', '/api/search'];
          const statuses = [200, 201, 400, 401, 403, 404, 500, 503];
          const ips = ['192.168.1.10', '10.0.0.15', '172.16.0.5', '203.0.113.42', '198.51.100.17'];
          
          const method = methods[Math.floor(Math.random() * methods.length)];
          const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const ip = ips[Math.floor(Math.random() * ips.length)];
          
          const now = new Date();
          const timestamp = new Date(now.getTime() - (i * 30 * 60 * 1000));
          
          return {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: timestamp.toISOString(),
            ip,
            method,
            endpoint,
            status,
            latency: Math.floor(Math.random() * 2000) + 50,
            proxyLatency: Math.floor(Math.random() * 100) + 10,
            success: status < 400,
            userAgent: 'Mozilla/5.0 (compatible; API Client)',
            size: Math.floor(Math.random() * 50000) + 1000,
            location: ['US-West', 'EU-Central', 'AP-Southeast'][Math.floor(Math.random() * 3)]
          };
        })
      };
      
      return apiData;
    } catch (error) {
      console.error('Error fetching API logs:', error);
      return { logs: [] };
    }
  }, []);

  // Calculate metrics from logs
  const calculateMetrics = useCallback((logs) => {
    const totalRequests = logs.length;
    const failedRequests = logs.filter(log => log.status >= 400).length;
    const latencies = logs.map(log => log.latency);
    const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    const uniqueIPs = new Set(logs.map(log => log.ip)).size;
    const successRate = totalRequests > 0 ? ((totalRequests - failedRequests) / totalRequests) * 100 : 0;
    const peakLatency = latencies.length > 0 ? Math.max(...latencies) : 0;

    return {
      totalRequests,
      failedRequests,
      avgLatency,
      uniqueIPs,
      successRate,
      peakLatency
    };
  }, []);

  // Generate graph data from logs
  const generateGraphData = useCallback((logs) => {
    const hourlyData = {};
    
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      const timeKey = `${String(hour).padStart(2, '0')}:00`;
      
      if (!hourlyData[timeKey]) {
        hourlyData[timeKey] = { requests: 0, errors: 0, success: 0 };
      }
      
      hourlyData[timeKey].requests++;
      if (log.status >= 400) {
        hourlyData[timeKey].errors++;
      } else {
        hourlyData[timeKey].success++;
      }
    });

    const graphData = [];
    for (let i = 0; i < 24; i++) {
      const timeKey = `${String(i).padStart(2, '0')}:00`;
      graphData.push({
        time: timeKey,
        requests: hourlyData[timeKey]?.requests || 0,
        errors: hourlyData[timeKey]?.errors || 0,
        success: hourlyData[timeKey]?.success || 0
      });
    }
    
    return graphData;
  }, []);

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchApiLogs();
      const sortedLogs = data.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setLogs(sortedLogs);
      setMetrics(calculateMetrics(sortedLogs));
      setGraphData(generateGraphData(sortedLogs));
    };

    loadData();
  }, [fetchApiLogs, calculateMetrics, generateGraphData]);

  // Real-time updates
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(async () => {
      const data = await fetchApiLogs();
      const sortedLogs = data.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setLogs(sortedLogs);
      setMetrics(calculateMetrics(sortedLogs));
      setGraphData(generateGraphData(sortedLogs));
    }, 5000);

    return () => clearInterval(interval);
  }, [isRealTime, fetchApiLogs, calculateMetrics, generateGraphData]);

  const handleRefresh = async () => {
    const data = await fetchApiLogs();
    const sortedLogs = data.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setLogs(sortedLogs);
    setMetrics(calculateMetrics(sortedLogs));
    setGraphData(generateGraphData(sortedLogs));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'api-logs.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div style={{ backgroundColor: colors.background }} className="flex min-h-screen">
      <CompactSidebar 
        onToggleRealTime={() => setIsRealTime(!isRealTime)}
        isRealTime={isRealTime}
      />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader onRefresh={handleRefresh} onExport={handleExport} />
        
        <main 
          style={{ backgroundColor: colors.background }}
          className="flex-1 p-6 overflow-y-auto"
        >
          {/* Welcome Message */}
          <div 
            style={{ backgroundColor: colors.surface }}
            className="mb-6 p-4 rounded-lg flex items-start space-x-4"
          >
            <div 
              style={{ backgroundColor: colors.primary }}
              className="w-12 h-12 rounded-full flex items-center justify-center"
            >
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p style={{ color: colors.text }} className="font-semibold">
                Welcome to API Analytics! 
                <span className="font-normal ml-2">
                  Monitor your API performance in real-time. Track requests, analyze patterns, and troubleshoot issues quickly. 📊
                </span>
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <button 
                style={{ 
                  backgroundColor: colors.surfaceHover,
                  color: colors.text 
                }}
                className="font-bold py-2 px-4 rounded-lg inline-flex items-center hover:opacity-80 transition-opacity"
              >
                <Filter className="w-4 h-4 mr-2" />
                Add filter
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div 
                style={{ backgroundColor: colors.surfaceHover }}
                className="rounded-lg p-1 flex items-center"
              >
                <button 
                  style={{ backgroundColor: colors.surface }}
                  className="px-3 py-1 text-sm rounded-md"
                >
                  6 hours
                </button>
              </div>
              <button style={{ color: colors.textMuted }} className="hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              <APIMetricsBurst metrics={metrics} />
              <StatusCounts logs={logs} />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              <TrafficFlow graphData={graphData} />
              <KPIMetrics metrics={metrics} />
              <APILogListing 
                logs={logs} 
                onLogSelect={setSelectedLog}
                isRealTime={isRealTime}
              />
            </div>
          </div>
        </main>
      </div>
      
      {/* Log Inspector Modal */}
      <LogInspector 
        log={selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />
    </div>
  );
};

// App wrapper with Theme Provider
const App = () => {
  return (
    <ThemeProvider>
      <APILogsDashboard />
    </ThemeProvider>
  );
};

export default App;