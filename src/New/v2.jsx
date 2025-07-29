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

// Theme Context with SaaS-inspired colors
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  
  const toggleTheme = () => setIsDark(prev => !prev);
  
  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      // Dark theme - inspired by Linear, Vercel, and modern SaaS apps
      background: '#0a0a0a',           // Deep black background
      surface: '#111111',              // Card backgrounds
      surfaceHover: '#1a1a1a',         // Hover states
      surfaceSecondary: '#171717',     // Secondary surfaces
      border: '#262626',               // Subtle borders
      borderLight: '#1a1a1a',          // Lighter borders
      text: '#fafafa',                 // Primary text
      textSecondary: '#d4d4d8',        // Secondary text
      textMuted: '#a1a1aa',            // Muted text
      textSubtle: '#71717a',           // Subtle text
      primary: '#3b82f6',              // Blue primary (Stripe-inspired)
      primaryHover: '#2563eb',         // Primary hover
      primaryLight: '#dbeafe',         // Primary light
      success: '#10b981',              // Green success
      successLight: '#d1fae5',         // Success light
      warning: '#f59e0b',              // Amber warning
      warningLight: '#fef3c7',         // Warning light
      error: '#ef4444',                // Red error
      errorLight: '#fee2e2',           // Error light
      purple: '#8b5cf6',               // Purple accent
      purpleLight: '#ede9fe',          // Purple light
      cardBg: '#111111',
      headerBg: '#0a0a0a',
      sidebarBg: '#0a0a0a',
      accent: '#6366f1',               // Indigo accent
      accentLight: '#e0e7ff'           // Accent light
    } : {
      // Light theme - inspired by Notion, Linear light mode
      background: '#fafafa',           // Warm white background
      surface: '#ffffff',              // Pure white cards
      surfaceHover: '#f8fafc',         // Subtle hover
      surfaceSecondary: '#f1f5f9',     // Secondary surfaces
      border: '#e2e8f0',               // Clean borders
      borderLight: '#f1f5f9',          // Lighter borders
      text: '#0f172a',                 // Dark text
      textSecondary: '#334155',        // Secondary text
      textMuted: '#64748b',            // Muted text
      textSubtle: '#94a3b8',           // Subtle text
      primary: '#3b82f6',              // Blue primary
      primaryHover: '#2563eb',         // Primary hover
      primaryLight: '#dbeafe',         // Primary light
      success: '#059669',              // Green success
      successLight: '#d1fae5',         // Success light
      warning: '#d97706',              // Amber warning
      warningLight: '#fef3c7',         // Warning light
      error: '#dc2626',                // Red error
      errorLight: '#fee2e2',           // Error light
      purple: '#7c3aed',               // Purple accent
      purpleLight: '#ede9fe',          // Purple light
      cardBg: '#ffffff',
      headerBg: '#ffffff',
      sidebarBg: '#fafafa',
      accent: '#6366f1',               // Indigo accent
      accentLight: '#e0e7ff'           // Accent light
    }
  };
  
  return (
    <ThemeContext.Provider value={theme}>
      <div style={{ 
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        minHeight: '100vh',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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

// Compact Sidebar Component
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
      style={{ 
        backgroundColor: colors.sidebarBg,
        borderColor: colors.border
      }}
      className="w-16 flex flex-col items-center py-4 space-y-6 border-r"
    >
      {/* Logo */}
      <div className="p-2 rounded-xl">
        <div 
          style={{ 
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            color: 'white'
          }}
          className="w-8 h-8 flex items-center justify-center text-lg font-bold rounded-lg shadow-lg"
        >
          L
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col items-center space-y-3">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.label}
              style={{
                backgroundColor: item.active ? colors.surfaceHover : 'transparent',
                color: item.active ? colors.text : colors.textMuted,
                borderColor: item.active ? colors.border : 'transparent'
              }}
              className="p-2.5 rounded-xl hover:bg-opacity-80 transition-all duration-200 border relative group"
              title={item.label}
            >
              <IconComponent className="w-5 h-5" />
              {item.active && (
                <div 
                  style={{ backgroundColor: colors.primary }}
                  className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-0.5 h-4 rounded-full"
                />
              )}
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
          className="p-2.5 rounded-xl transition-all duration-200 relative overflow-hidden"
          title={isRealTime ? 'Pause Live' : 'Start Live'}
        >
          {isRealTime ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isRealTime && (
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse rounded-xl" />
          )}
        </button>
      </div>

      {/* Bottom Items */}
      <div className="mt-auto flex flex-col items-center space-y-3">
        <button
          onClick={toggleTheme}
          style={{ 
            color: colors.textMuted,
            backgroundColor: colors.surfaceHover
          }}
          className="p-2.5 rounded-xl hover:bg-opacity-80 transition-all duration-200"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <div 
          style={{ 
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            color: 'white'
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
        >
          <User className="w-4 h-4" />
        </div>
      </div>
    </aside>
  );
};

// Header Component
const DashboardHeader = ({ onRefresh, onExport }) => {
  const { colors } = useTheme();
  
  return (
    <header 
      style={{ 
        backgroundColor: colors.headerBg,
        borderColor: colors.border 
      }}
      className="h-16 flex items-center justify-between px-6 border-b backdrop-blur-sm"
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
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Search logs, endpoints, or IPs..."
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button 
          onClick={onRefresh}
          style={{ 
            color: colors.textMuted,
            backgroundColor: colors.surfaceHover
          }}
          className="p-2 rounded-lg hover:bg-opacity-80 transition-all duration-200"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        
        <button 
          onClick={onExport}
          style={{ 
            color: colors.textMuted,
            backgroundColor: colors.surfaceHover
          }}
          className="p-2 rounded-lg hover:bg-opacity-80 transition-all duration-200"
          title="Export Data"
        >
          <Download className="w-4 h-4" />
        </button>
        
        <button 
          style={{ 
            color: colors.textMuted,
            backgroundColor: colors.surfaceHover
          }}
          className="p-2 rounded-lg hover:bg-opacity-80 transition-all duration-200 relative"
        >
          <Bell className="w-4 h-4" />
          <div 
            style={{ backgroundColor: colors.error }}
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
          />
        </button>
        
        <div className="flex items-center pl-2 ml-2 border-l" style={{ borderColor: colors.border }}>
          <span style={{ color: colors.text }} className="ml-2 text-sm font-medium">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
};

// API Metrics Burst Component
const APIMetricsBurst = ({ metrics }) => {
  const { colors } = useTheme();
  
  return (
    <div 
      style={{ 
        backgroundColor: colors.cardBg,
        borderColor: colors.border
      }} 
      className="rounded-2xl p-6 border shadow-sm"
    >
      <h3 style={{ color: colors.text }} className="font-semibold text-lg mb-1">
        API Health
      </h3>
      <p style={{ color: colors.textMuted }} className="text-sm mb-6">
        Real-time overview of your API performance
      </p>
      
      <div className="relative">
        <input
          style={{
            backgroundColor: colors.surfaceHover,
            borderColor: colors.borderLight,
            color: colors.text
          }}
          className="w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6 transition-all duration-200"
          placeholder="Search metrics..."
          type="text"
        />
        <Search 
          style={{ color: colors.textMuted }}
          className="absolute left-3 top-3 w-4 h-4" 
        />
      </div>
      
      {/* Circular Metrics Display */}
      <div className="relative w-full aspect-square max-w-xs mx-auto">
        <div 
          style={{ 
            background: `conic-gradient(from 0deg, ${colors.success} 0deg ${(metrics.successRate / 100) * 360}deg, ${colors.surfaceSecondary} ${(metrics.successRate / 100) * 360}deg 360deg)`
          }}
          className="w-full h-full rounded-full flex items-center justify-center shadow-inner"
        >
          <div 
            style={{ backgroundColor: colors.cardBg }}
            className="w-3/4 h-3/4 rounded-full flex flex-col items-center justify-center shadow-lg"
          >
            <span style={{ color: colors.text }} className="text-3xl font-bold">
              {metrics.successRate.toFixed(1)}%
            </span>
            <span style={{ color: colors.textMuted }} className="text-xs font-medium">
              Success Rate
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p style={{ color: colors.textMuted }} className="text-xs">
          API → Requests → Success → {metrics.totalRequests.toLocaleString()} total
        </p>
        <div 
          style={{ backgroundColor: colors.successLight }}
          className="inline-flex items-center px-2 py-1 rounded-full mt-2"
        >
          <TrendingUp style={{ color: colors.success }} className="w-3 h-3 mr-1" />
          <span style={{ color: colors.success }} className="text-xs font-medium">
            +2.3% from yesterday
          </span>
        </div>
      </div>
    </div>
  );
};

// Status Counts Component
const StatusCounts = ({ logs }) => {
  const { colors } = useTheme();
  
  const statusCounts = {
    success: logs.filter(log => log.status >= 200 && log.status < 300).length,
    warnings: logs.filter(log => log.status >= 300 && log.status < 400).length,
    errors: logs.filter(log => log.status >= 400).length
  };
  
  return (
    <div 
      style={{ 
        backgroundColor: colors.cardBg,
        borderColor: colors.border
      }} 
      className="rounded-2xl p-6 border shadow-sm"
    >
      <h3 style={{ color: colors.text }} className="font-semibold text-lg mb-1">
        Status Distribution
      </h3>
      <p style={{ color: colors.textMuted }} className="text-sm mb-6">
        Categorized by HTTP status codes
      </p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              style={{ backgroundColor: colors.successLight }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
            >
              <span style={{ color: colors.success }} className="text-sm font-bold">2xx</span>
            </div>
            <div>
              <p style={{ color: colors.text }} className="font-semibold">
                {statusCounts.success}
              </p>
              <p style={{ color: colors.textMuted }} className="text-xs">
                Success
              </p>
            </div>
          </div>
          <div 
            style={{ 
              backgroundColor: colors.success,
              width: `${(statusCounts.success / logs.length) * 100}%`,
              minWidth: '4px'
            }}
            className="h-2 rounded-full"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              style={{ backgroundColor: colors.warningLight }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
            >
              <span style={{ color: colors.warning }} className="text-sm font-bold">3xx</span>
            </div>
            <div>
              <p style={{ color: colors.text }} className="font-semibold">
                {statusCounts.warnings}
              </p>
              <p style={{ color: colors.textMuted }} className="text-xs">
                Redirects
              </p>
            </div>
          </div>
          <div 
            style={{ 
              backgroundColor: colors.warning,
              width: `${(statusCounts.warnings / logs.length) * 100}%`,
              minWidth: '4px'
            }}
            className="h-2 rounded-full"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              style={{ backgroundColor: colors.errorLight }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
            >
              <span style={{ color: colors.error }} className="text-sm font-bold">4xx</span>
            </div>
            <div>
              <p style={{ color: colors.text }} className="font-semibold">
                {statusCounts.errors}
              </p>
              <p style={{ color: colors.textMuted }} className="text-xs">
                Errors
              </p>
            </div>
          </div>
          <div 
            style={{ 
              backgroundColor: colors.error,
              width: `${(statusCounts.errors / logs.length) * 100}%`,
              minWidth: '4px'
            }}
            className="h-2 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

// Traffic Flow Component
const TrafficFlow = ({ graphData }) => {
  const { colors } = useTheme();
  
  return (
    <div 
      style={{ 
        backgroundColor: colors.cardBg,
        borderColor: colors.border
      }} 
      className="rounded-2xl p-6 border shadow-sm"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 style={{ color: colors.text }} className="font-semibold text-lg mb-1">
            Traffic Flow
          </h3>
          <p style={{ color: colors.textMuted }} className="text-sm">
            Request patterns over time
          </p>
        </div>
        <button 
          style={{ 
            color: colors.textMuted,
            backgroundColor: colors.surfaceHover
          }}
          className="text-sm px-3 py-1.5 rounded-lg hover:bg-opacity-80 transition-all duration-200"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={graphData.slice(-12)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="errorsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.error} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={colors.error} stopOpacity={0}/>
            </linearGradient>
          </defs>
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
              borderRadius: '12px',
              color: colors.text,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
          <Area
            type="monotone"
            dataKey="requests"
            stroke={colors.primary}
            fillOpacity={1}
            fill="url(#requestsGradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="errors"
            stroke={colors.error}
            fillOpacity={1}
            fill="url(#errorsGradient)"
            strokeWidth={2}
          />
        </AreaChart>
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
      color: colors.success,
      icon: Clock
    },
    {
      label: 'Peak Latency',
      value: `${metrics.peakLatency}ms`,
      trend: 2.1,
      color: colors.warning,
      icon: TrendingUp
    },
    {
      label: 'Unique IPs',
      value: metrics.uniqueIPs.toLocaleString(),
      trend: 12.5,
      color: colors.primary,
      icon: Globe
    },
    {
      label: 'Error Rate',
      value: `${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(1)}%`,
      trend: -2.1,
      color: metrics.failedRequests > 0 ? colors.error : colors.success,
      icon: AlertTriangle
    }
  ];
  
  return (
    <div 
      style={{ 
        backgroundColor: colors.cardBg,
        borderColor: colors.border
      }} 
      className="rounded-2xl p-6 border shadow-sm"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 style={{ color: colors.text }} className="font-semibold text-lg">
          Key Performance Indicators
        </h3>
        <div 
          style={{ 
            backgroundColor: colors.surfaceHover,
            color: colors.text 
          }}
          className="text-sm px-2 py-1 rounded-lg font-medium"
        >
          {kpis.length} metrics
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {kpis.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <div 
              key={index}
              style={{ 
                backgroundColor: colors.surfaceHover,
                borderColor: colors.borderLight
              }}
              className="p-4 rounded-xl border"
            >
              <div className="flex items-center justify-between mb-2">
                <div 
                  style={{ 
                    backgroundColor: kpi.color + '20',
                    color: kpi.color
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <span 
                  style={{ 
                    color: kpi.trend > 0 ? colors.success : colors.error
                  }}
                  className="text-xs font-medium flex items-center"
                >
                  {kpi.trend > 0 ? '↗' : '↘'} {Math.abs(kpi.trend)}%
                </span>
              </div>
              <p style={{ color: colors.textMuted }} className="text-sm mb-1">
                {kpi.label}
              </p>
              <p style={{ color: colors.text }} className="text-xl font-bold">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// API Log Listing Component
const APILogListing = ({ logs, onLogSelect, isRealTime }) => {
  const { colors } = useTheme();
  
  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return colors.success;
    if (status >= 300 && status < 400) return colors.warning;
    if (status >= 400 && status < 500) return colors.error;
    return colors.error;
  };
  
  const getMethodColor = (method) => {
    const methodColors = {
      GET: colors.primary,
      POST: colors.success,
      PUT: colors.warning,
      DELETE: colors.error,
      PATCH: colors.purple
    };
    return methodColors[method] || colors.textMuted;
  };

  return (
    <div 
      style={{ 
        backgroundColor: colors.cardBg,
        borderColor: colors.border
      }} 
      className="rounded-2xl p-6 border shadow-sm"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 style={{ color: colors.text }} className="font-semibold text-lg mb-1">
            Recent Requests
          </h3>
          <p style={{ color: colors.textMuted }} className="text-sm">
            Monitor your latest API activity
          </p>
        </div>
        {isRealTime && (
          <div className="flex items-center space-x-2">
            <div 
              style={{ backgroundColor: colors.success }}
              className="w-2 h-2 rounded-full animate-pulse"
            />
            <span style={{ color: colors.success }} className="text-sm font-medium">
              Live
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {logs.slice(0, 6).map((log, index) => (
          <div 
            key={log.id}
            style={{ 
              backgroundColor: colors.surfaceHover,
              borderColor: index === 0 && isRealTime ? colors.primary : colors.borderLight
            }}
            className="p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md group"
            onClick={() => onLogSelect(log)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  style={{ 
                    backgroundColor: getMethodColor(log.method) + '20',
                    color: getMethodColor(log.method),
                    borderColor: getMethodColor(log.method) + '40'
                  }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold border"
                >
                  {log.method}
                </div>
                <div className="min-w-0 flex-1">
                  <p style={{ color: colors.text }} className="font-semibold truncate">
                    {log.endpoint}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span style={{ color: colors.textMuted }} className="text-sm">
                      {log.ip}
                    </span>
                    <span style={{ color: colors.textSubtle }} className="text-xs">•</span>
                    <span style={{ color: colors.textMuted }} className="text-sm">
                      {log.location}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div 
                    style={{ 
                      backgroundColor: getStatusColor(log.status) + '20',
                      color: getStatusColor(log.status)
                    }}
                    className="px-3 py-1 text-sm font-semibold rounded-lg mb-1"
                  >
                    {log.status}
                  </div>
                  <p style={{ color: colors.textMuted }} className="text-xs">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <button 
                  style={{ color: colors.textMuted }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Performance metrics */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t" style={{ borderColor: colors.borderLight }}>
              <div>
                <p style={{ color: colors.textSubtle }} className="text-xs">Latency</p>
                <p style={{ color: colors.text }} className="text-sm font-medium">
                  {log.latency}ms
                </p>
              </div>
              <div>
                <p style={{ color: colors.textSubtle }} className="text-xs">Size</p>
                <p style={{ color: colors.text }} className="text-sm font-medium">
                  {(log.size / 1024).toFixed(1)}KB
                </p>
              </div>
              <div>
                <p style={{ color: colors.textSubtle }} className="text-xs">Client</p>
                <p style={{ color: colors.text }} className="text-sm font-medium truncate">
                  {log.userAgent.split(' ')[0]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Enhanced Pagination */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t" style={{ borderColor: colors.border }}>
        <div className="flex items-center space-x-2">
          <button
            style={{
              backgroundColor: colors.surfaceHover,
              color: colors.textMuted
            }}
            className="px-3 py-1.5 rounded-lg text-sm transition-all duration-200 hover:bg-opacity-80"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              style={{
                backgroundColor: page === 2 ? colors.primary : colors.surfaceHover,
                color: page === 2 ? 'white' : colors.textMuted
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-200 hover:opacity-80"
            >
              {page}
            </button>
          ))}
          <button
            style={{
              backgroundColor: colors.surfaceHover,
              color: colors.textMuted
            }}
            className="px-3 py-1.5 rounded-lg text-sm transition-all duration-200 hover:bg-opacity-80"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-sm" style={{ color: colors.textMuted }}>
          Showing 1-6 of {logs.length} requests
        </div>
      </div>
    </div>
  );
};

// Enhanced Log Inspector Modal
const LogInspector = ({ log, onClose }) => {
  const { colors } = useTheme();
  
  if (!log) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        style={{ backgroundColor: colors.cardBg }}
        className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl"
      >
        <div 
          style={{ 
            borderColor: colors.border,
            backgroundColor: colors.surface
          }}
          className="flex items-center justify-between p-6 border-b"
        >
          <div>
            <h3 style={{ color: colors.text }} className="text-xl font-semibold">
              Request Details
            </h3>
            <p style={{ color: colors.textMuted }} className="text-sm mt-1">
              {log.endpoint} • {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ 
              color: colors.textMuted,
              backgroundColor: colors.surfaceHover
            }}
            className="p-2 rounded-lg hover:bg-opacity-80 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
          {Object.entries(log).map(([key, value]) => (
            <div key={key} className="flex justify-between items-start">
              <span style={{ color: colors.textMuted }} className="font-medium capitalize text-sm">
                {key.replace(/([A-Z])/g, ' $1')}:
              </span>
              <span 
                style={{ 
                  color: colors.text,
                  backgroundColor: colors.surfaceHover
                }} 
                className="font-mono text-sm ml-4 px-2 py-1 rounded-lg max-w-xs break-all"
              >
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
        
        <div 
          style={{ 
            borderColor: colors.border,
            backgroundColor: colors.surface
          }}
          className="flex justify-end space-x-3 p-6 border-t"
        >
          <button
            onClick={onClose}
            style={{ 
              backgroundColor: colors.surfaceHover,
              color: colors.text
            }}
            className="px-4 py-2 rounded-lg transition-all duration-200 hover:bg-opacity-80"
          >
            Close
          </button>
          <button
            style={{ 
              backgroundColor: colors.primary,
              color: 'white'
            }}
            className="px-4 py-2 rounded-lg transition-all duration-200 hover:bg-opacity-90"
          >
            Export Log
          </button>
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
            style={{ 
              backgroundColor: colors.surface,
              borderColor: colors.border
            }}
            className="mb-6 p-6 rounded-2xl border flex items-start space-x-4 shadow-sm"
          >
            <div 
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`
              }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 style={{ color: colors.text }} className="text-xl font-bold mb-2">
                Welcome to API Analytics Dashboard
              </h2>
              <p style={{ color: colors.textMuted }} className="leading-relaxed">
                Monitor your API performance in real-time. Track requests, analyze patterns, and troubleshoot issues with comprehensive insights and beautiful visualizations. 📊✨
              </p>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button 
                style={{ 
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border
                }}
                className="font-medium py-2.5 px-4 rounded-xl border inline-flex items-center hover:shadow-md transition-all duration-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                Add filter
              </button>
              <button 
                style={{ 
                  backgroundColor: colors.primaryLight,
                  color: colors.primary
                }}
                className="font-medium py-2.5 px-4 rounded-xl inline-flex items-center hover:shadow-md transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create alert
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div 
                style={{ 
                  backgroundColor: colors.surface,
                  borderColor: colors.border
                }}
                className="rounded-xl border p-1 flex items-center"
              >
                <button 
                  style={{ 
                    backgroundColor: colors.primary,
                    color: 'white'
                  }}
                  className="px-4 py-2 text-sm rounded-lg font-medium"
                >
                  6 hours
                </button>
                <button 
                  style={{ color: colors.textMuted }}
                  className="px-4 py-2 text-sm rounded-lg"
                >
                  24 hours
                </button>
                <button 
                  style={{ color: colors.textMuted }}
                  className="px-4 py-2 text-sm rounded-lg"
                >
                  7 days
                </button>
              </div>
              <button 
                style={{ 
                  color: colors.textMuted,
                  backgroundColor: colors.surfaceHover
                }}
                className="p-2 rounded-lg hover:bg-opacity-80 transition-all duration-200"
              >
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