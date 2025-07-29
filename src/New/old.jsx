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
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { 
  Play, Pause, Download, Search, Filter, RefreshCw, X, ChevronDown, ChevronRight,
  Activity, Users, Clock, AlertTriangle, TrendingUp, TrendingDown,
  Globe, Server, Zap, Eye, MoreHorizontal, Settings, Bell, Home,
  FileText, Database, Shield, Box, GitBranch, BarChart3,
  Moon, Sun, Calendar, ChevronLeft, ChevronUp, Wifi, ExternalLink,
  Plus, Menu, User, Layers, Code, Monitor, HelpCircle
} from 'lucide-react';

// Theme Context with Professional Colors
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  
  const toggleTheme = () => setIsDark(prev => !prev);
  
  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      // Professional Dark Theme
      background: '#0F172A',      // Slate-900
      surface: '#1E293B',         // Slate-800  
      surfaceHover: '#334155',    // Slate-700
      border: '#475569',          // Slate-600
      text: '#F8FAFC',           // Slate-50
      textSecondary: '#E2E8F0',   // Slate-200
      textMuted: '#94A3B8',       // Slate-400
      primary: '#3B82F6',         // Blue-500
      primaryHover: '#2563EB',    // Blue-600
      success: '#10B981',         // Emerald-500
      warning: '#F59E0B',         // Amber-500
      error: '#EF4444',           // Red-500
      cardBg: '#1E293B',          // Slate-800
      headerBg: '#1E293B',        // Slate-800
      sidebarBg: '#111827',       // Gray-900
      accent: '#6366F1',          // Indigo-500
      info: '#06B6D4'             // Cyan-500
    } : {
      // Professional Light Theme
      background: '#F8FAFC',      // Slate-50
      surface: '#FFFFFF',         // White
      surfaceHover: '#F1F5F9',    // Slate-100
      border: '#E2E8F0',          // Slate-200
      text: '#0F172A',           // Slate-900
      textSecondary: '#334155',   // Slate-700
      textMuted: '#64748B',       // Slate-500
      primary: '#3B82F6',         // Blue-500
      primaryHover: '#2563EB',    // Blue-600
      success: '#10B981',         // Emerald-500
      warning: '#F59E0B',         // Amber-500
      error: '#EF4444',           // Red-500
      cardBg: '#FFFFFF',          // White
      headerBg: '#FFFFFF',        // White
      sidebarBg: '#1E293B',       // Slate-800 (keep dark for contrast)
      accent: '#6366F1',          // Indigo-500
      info: '#06B6D4'             // Cyan-500
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

// Professional Sidebar Component (from original design)
const Sidebar = ({ isRealTime, onToggleRealTime }) => {
  const { colors } = useTheme();
  
  const sidebarItems = [
    { icon: Home, label: 'Dashboard', active: false },
    { icon: BarChart3, label: 'Analytics', active: true },
    { icon: FileText, label: 'Logs', active: false },
    { icon: Server, label: 'API Manager', active: false },
    { icon: Database, label: 'Gateway', active: false },
    { icon: Shield, label: 'Security', active: false },
    { icon: Box, label: 'Cache', active: false },
    { icon: Bell, label: 'Alerts', active: false },
    { icon: GitBranch, label: 'Versions', active: false },
    { icon: Users, label: 'Access', active: false },
    { icon: Settings, label: 'Settings', active: false },
    { icon: Globe, label: 'Global', active: false }
  ];

  return (
    <div style={{ backgroundColor: colors.sidebarBg }} className="w-64 text-white min-h-screen border-r border-gray-800">
      <div className="p-6">
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">API Console</h1>
            <p className="text-xs text-gray-400">Management Portal</p>
          </div>
        </div>
        
        {/* Real-time Status */}
        <div className="mb-6">
          <button
            onClick={onToggleRealTime}
            style={{
              backgroundColor: isRealTime ? colors.success : colors.surfaceHover,
              borderColor: isRealTime ? colors.success : colors.border
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all hover:opacity-90"
          >
            {isRealTime ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white font-medium">Live Monitoring</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="text-gray-300">Start Monitoring</span>
              </>
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${
                  item.active
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Bottom Section */}
        <div className="mt-auto pt-8">
          <div 
            style={{ backgroundColor: colors.surfaceHover }}
            className="p-4 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Admin User</p>
                <p className="text-gray-400 text-xs">admin@company.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Professional Header Component
const DashboardHeader = ({ onRefresh, onExport, onToggleTheme, isDark }) => {
  const { colors } = useTheme();
  
  return (
    <header 
      style={{ 
        backgroundColor: colors.headerBg,
        borderColor: colors.border 
      }}
      className="border-b px-6 py-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 style={{ color: colors.text }} className="text-2xl font-bold">
              API Analytics Dashboard
            </h1>
            <p style={{ color: colors.textMuted }} className="text-sm">
              Real-time monitoring and performance insights
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
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
              className="w-80 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search logs, endpoints, or IPs..."
              type="text"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text 
              }}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            <button
              onClick={onExport}
              style={{ 
                backgroundColor: colors.primary,
                color: 'white' 
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              title="Export Data"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            
            <button
              onClick={onToggleTheme}
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text 
              }}
              className="p-2 border rounded-lg hover:opacity-80 transition-opacity"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button 
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text 
              }}
              className="p-2 border rounded-lg hover:opacity-80 transition-opacity"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Metrics Overview Cards
const MetricsOverview = ({ metrics, isRealTime }) => {
  const { colors } = useTheme();
  
  const metricCards = [
    {
      id: 'requests',
      title: 'Total Requests',
      value: metrics.totalRequests.toLocaleString(),
      icon: Activity,
      color: colors.primary,
      trend: '+12.5%',
      trendUp: true,
      description: 'All API calls'
    },
    {
      id: 'success',
      title: 'Success Rate',
      value: `${metrics.successRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: colors.success,
      trend: '+0.8%',
      trendUp: true,
      description: '2xx-3xx responses'
    },
    {
      id: 'latency',
      title: 'Avg Latency',
      value: `${metrics.avgLatency}ms`,
      icon: Clock,
      color: colors.info,
      trend: '-5.2%',
      trendUp: false,
      description: 'Response time'
    },
    {
      id: 'errors',
      title: 'Error Rate',
      value: `${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(1)}%`,
      icon: AlertTriangle,
      color: colors.error,
      trend: '-2.1%',
      trendUp: false,
      description: '4xx-5xx responses'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((card) => {
        const IconComponent = card.icon;
        
        return (
          <div
            key={card.id}
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border
            }}
            className="relative p-6 rounded-xl border shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                style={{ 
                  backgroundColor: card.color + '15',
                  color: card.color 
                }}
                className="p-3 rounded-lg"
              >
                <IconComponent className="w-6 h-6" />
              </div>
              {isRealTime && (
                <div className="flex items-center gap-1">
                  <div 
                    style={{ backgroundColor: colors.success }}
                    className="w-2 h-2 rounded-full animate-pulse" 
                  />
                  <span style={{ color: colors.success }} className="text-xs font-medium">
                    LIVE
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <p style={{ color: colors.text }} className="text-3xl font-bold">
                {card.value}
              </p>
              <p style={{ color: colors.textMuted }} className="text-sm font-medium">
                {card.title}
              </p>
              <p style={{ color: colors.textMuted }} className="text-xs">
                {card.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span 
                style={{ 
                  color: card.trendUp ? colors.success : colors.error,
                  backgroundColor: (card.trendUp ? colors.success : colors.error) + '15'
                }}
                className="text-xs font-semibold px-2 py-1 rounded-full"
              >
                {card.trend}
              </span>
              <span style={{ color: colors.textMuted }} className="text-xs">
                vs last period
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Enhanced Traffic Flow Chart
const TrafficFlowChart = ({ graphData }) => {
  const { colors } = useTheme();
  const [viewType, setViewType] = useState('area');
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          style={{ 
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text
          }}
          className="border rounded-lg p-4 shadow-lg"
        >
          <p className="font-semibold mb-2">{`Time: ${label}`}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span style={{ color: colors.textMuted }} className="text-sm capitalize">
                    {entry.dataKey}
                  </span>
                </div>
                <span style={{ color: colors.text }} className="font-semibold">
                  {entry.value?.toLocaleString()}
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
    <div 
      style={{ 
        backgroundColor: colors.cardBg,
        borderColor: colors.border 
      }}
      className="rounded-xl border p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 style={{ color: colors.text }} className="text-xl font-bold mb-2">
            API Traffic Flow
          </h3>
          <p style={{ color: colors.textMuted }} className="text-sm">
            Request patterns and response distribution over time
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div 
            style={{ backgroundColor: colors.surfaceHover }}
            className="flex items-center rounded-lg p-1"
          >
            <button
              onClick={() => setViewType('area')}
              style={{ 
                backgroundColor: viewType === 'area' ? colors.primary : 'transparent',
                color: viewType === 'area' ? 'white' : colors.textMuted
              }}
              className="px-3 py-1 text-sm rounded-md transition-all font-medium"
            >
              Area
            </button>
            <button
              onClick={() => setViewType('line')}
              style={{ 
                backgroundColor: viewType === 'line' ? colors.primary : 'transparent',
                color: viewType === 'line' ? 'white' : colors.textMuted
              }}
              className="px-3 py-1 text-sm rounded-md transition-all font-medium"
            >
              Line
            </button>
            <button
              onClick={() => setViewType('bar')}
              style={{ 
                backgroundColor: viewType === 'bar' ? colors.primary : 'transparent',
                color: viewType === 'bar' ? 'white' : colors.textMuted
              }}
              className="px-3 py-1 text-sm rounded-md transition-all font-medium"
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        {viewType === 'area' ? (
          <AreaChart data={graphData}>
            <defs>
              <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.success} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors.success} stopOpacity={0}/>
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
            <YAxis 
              stroke={colors.textMuted}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="requests" 
              stroke={colors.primary} 
              fill="url(#requestsGradient)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="success" 
              stroke={colors.success} 
              fill="url(#successGradient)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="errors" 
              stroke={colors.error} 
              fill="url(#errorsGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        ) : viewType === 'line' ? (
          <LineChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis 
              dataKey="time" 
              stroke={colors.textMuted}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke={colors.textMuted}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="requests" 
              stroke={colors.primary} 
              strokeWidth={3}
              dot={{ fill: colors.primary, r: 4 }}
              activeDot={{ r: 6, fill: colors.primary }}
            />
            <Line 
              type="monotone" 
              dataKey="success" 
              stroke={colors.success} 
              strokeWidth={3}
              dot={{ fill: colors.success, r: 4 }}
              activeDot={{ r: 6, fill: colors.success }}
            />
            <Line 
              type="monotone" 
              dataKey="errors" 
              stroke={colors.error} 
              strokeWidth={3}
              dot={{ fill: colors.error, r: 4 }}
              activeDot={{ r: 6, fill: colors.error }}
            />
          </LineChart>
        ) : (
          <BarChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis 
              dataKey="time" 
              stroke={colors.textMuted}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke={colors.textMuted}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="requests" fill={colors.primary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="success" fill={colors.success} radius={[4, 4, 0, 0]} />
            <Bar dataKey="errors" fill={colors.error} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// Recent API Logs Component
const RecentAPILogs = ({ logs, onLogSelect, isRealTime }) => {
  const { colors } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;
  
  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return colors.success;
    if (status >= 300 && status < 400) return colors.info;
    if (status >= 400 && status < 500) return colors.warning;
    return colors.error;
  };
  
  const getMethodColor = (method) => {
    const methodColors = {
      GET: colors.primary,
      POST: colors.success,
      PUT: colors.warning,
      DELETE: colors.error,
      PATCH: colors.accent
    };
    return methodColors[method] || colors.textMuted;
  };

  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const currentLogs = logs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  return (
    <div 
      style={{ 
        backgroundColor: colors.cardBg,
        borderColor: colors.border 
      }}
      className="rounded-xl border shadow-sm overflow-hidden"
    >
      <div 
        style={{ borderColor: colors.border }}
        className="p-6 border-b"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 style={{ color: colors.text }} className="text-xl font-bold mb-2">
              Recent API Requests
            </h3>
            <p style={{ color: colors.textMuted }} className="text-sm">
              {logs.length.toLocaleString()} total requests • Showing {currentLogs.length} on this page
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isRealTime && (
              <div 
                style={{ 
                  backgroundColor: colors.success + '15',
                  color: colors.success 
                }}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
              >
                <div 
                  style={{ backgroundColor: colors.success }}
                  className="w-2 h-2 rounded-full animate-pulse" 
                />
                Live Updates
              </div>
            )}
            <button 
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text 
              }}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: colors.surfaceHover }}>
            <tr>
              <th 
                style={{ color: colors.textMuted }}
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
              >
                Timestamp
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
              >
                Method
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
              >
                Endpoint
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
              >
                Status
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
              >
                Latency
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
              >
                Client IP
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ borderColor: colors.border }} className="divide-y">
            {currentLogs.map((log, index) => {
              const statusColor = getStatusColor(log.status);
              const methodColor = getMethodColor(log.method);
              
              return (
                <tr 
                  key={log.id}
                  style={{ 
                    backgroundColor: index === 0 && isRealTime ? colors.primary + '08' : 'transparent'
                  }}
                  className="hover:bg-opacity-50 transition-colors cursor-pointer"
                  onClick={() => onLogSelect(log)}
                >
                  <td 
                    style={{ color: colors.text }} 
                    className="px-6 py-4 whitespace-nowrap text-sm font-mono"
                  >
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      style={{ 
                        backgroundColor: methodColor + '20',
                        color: methodColor 
                      }}
                      className="px-3 py-1 text-xs font-bold rounded-full"
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span style={{ color: colors.text }} className="text-sm font-mono">
                      {log.endpoint}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      style={{ 
                        backgroundColor: statusColor + '20',
                        color: statusColor 
                      }}
                      className="px-3 py-1 text-xs font-bold rounded-full"
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span 
                      style={{ 
                        color: log.latency > 1000 ? colors.error : 
                               log.latency > 500 ? colors.warning : colors.success
                      }}
                      className="font-semibold"
                    >
                      {log.latency}ms
                    </span>
                  </td>
                  <td style={{ color: colors.textMuted }} className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLogSelect(log);
                      }}
                      style={{ color: colors.primary }}
                      className="hover:opacity-80 transition-opacity"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div 
          style={{ borderColor: colors.border }}
          className="px-6 py-4 border-t flex items-center justify-between"
        >
          <p style={{ color: colors.textMuted }} className="text-sm">
            Showing {startIndex + 1} to {Math.min(endIndex, logs.length)} of {logs.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: currentPage === 1 ? colors.textMuted : colors.text
              }}
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    backgroundColor: page === currentPage ? colors.primary : colors.surface,
                    borderColor: colors.border,
                    color: page === currentPage ? 'white' : colors.text
                  }}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: currentPage === totalPages ? colors.textMuted : colors.text
              }}
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Log Inspector Modal
const LogInspector = ({ log, onClose }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('details');
  
  if (!log) return null;

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'headers', label: 'Headers', icon: Code },
    { id: 'response', label: 'Response', icon: Monitor }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        style={{ backgroundColor: colors.cardBg }}
        className="w-full max-w-4xl mx-4 rounded-xl overflow-hidden shadow-2xl"
      >
        <div 
          style={{ borderColor: colors.border }}
          className="flex items-center justify-between p-6 border-b"
        >
          <div>
            <h3 style={{ color: colors.text }} className="text-xl font-bold">
              API Request Details
            </h3>
            <p style={{ color: colors.textMuted }} className="text-sm mt-1">
              {log.method} {log.endpoint} • {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ color: colors.textMuted }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Tabs */}
        <div 
          style={{ borderColor: colors.border }}
          className="flex border-b"
        >
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ 
                  borderColor: activeTab === tab.id ? colors.primary : 'transparent',
                  color: activeTab === tab.id ? colors.primary : colors.textMuted
                }}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors hover:opacity-80"
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 style={{ color: colors.text }} className="font-semibold text-lg mb-4">
                  Request Information
                </h4>
                {[
                  { label: 'Request ID', value: log.id },
                  { label: 'Method', value: log.method },
                  { label: 'Endpoint', value: log.endpoint },
                  { label: 'Status Code', value: log.status },
                  { label: 'Client IP', value: log.ip },
                  { label: 'User Agent', value: log.userAgent },
                  { label: 'Location', value: log.location }
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start">
                    <span style={{ color: colors.textMuted }} className="font-medium text-sm">
                      {label}:
                    </span>
                    <span style={{ color: colors.text }} className="font-mono text-sm text-right max-w-xs break-all">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <h4 style={{ color: colors.text }} className="font-semibold text-lg mb-4">
                  Performance Metrics
                </h4>
                {[
                  { label: 'Response Time', value: `${log.latency}ms` },
                  { label: 'Proxy Latency', value: `${log.proxyLatency}ms` },
                  { label: 'Response Size', value: `${(log.size / 1024).toFixed(1)} KB` },
                  { label: 'Success', value: log.success ? 'Yes' : 'No' },
                  { label: 'Timestamp', value: new Date(log.timestamp).toLocaleString() }
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start">
                    <span style={{ color: colors.textMuted }} className="font-medium text-sm">
                      {label}:
                    </span>
                    <span style={{ color: colors.text }} className="font-mono text-sm">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'headers' && (
            <div>
              <h4 style={{ color: colors.text }} className="font-semibold text-lg mb-4">
                Request Headers
              </h4>
              <div 
                style={{ 
                  backgroundColor: colors.surfaceHover,
                  color: colors.text 
                }}
                className="p-4 rounded-lg font-mono text-sm"
              >
                <pre className="whitespace-pre-wrap">
{`Accept: application/json
Authorization: Bearer token
Content-Type: application/json
User-Agent: ${log.userAgent}
X-Forwarded-For: ${log.ip}
X-Request-ID: ${log.id}`}
                </pre>
              </div>
            </div>
          )}
          
          {activeTab === 'response' && (
            <div>
              <h4 style={{ color: colors.text }} className="font-semibold text-lg mb-4">
                Response Data
              </h4>
              <div 
                style={{ 
                  backgroundColor: colors.surfaceHover,
                  color: colors.text 
                }}
                className="p-4 rounded-lg font-mono text-sm"
              >
                <pre className="whitespace-pre-wrap">
{JSON.stringify({
  status: log.status,
  timestamp: log.timestamp,
  data: "Response payload would appear here",
  metadata: {
    size: log.size,
    latency: log.latency,
    success: log.success
  }
}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const APILogsDashboard = () => {
  const { colors, isDark, toggleTheme } = useTheme();
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
        logs: Array.from({ length: 100 }, (_, i) => {
          const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
          const endpoints = ['/api/users', '/api/auth/login', '/api/data', '/api/upload', '/api/payments', '/api/search', '/api/orders', '/api/products'];
          const statuses = [200, 201, 400, 401, 403, 404, 500, 503];
          const ips = ['192.168.1.10', '10.0.0.15', '172.16.0.5', '203.0.113.42', '198.51.100.17'];
          
          const method = methods[Math.floor(Math.random() * methods.length)];
          const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const ip = ips[Math.floor(Math.random() * ips.length)];
          
          const now = new Date();
          const timestamp = new Date(now.getTime() - (i * 5 * 60 * 1000)); // 5 min intervals
          
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
            userAgent: 'Mozilla/5.0 (compatible; API Client/1.0)',
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
      <Sidebar 
        isRealTime={isRealTime}
        onToggleRealTime={() => setIsRealTime(!isRealTime)}
      />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          onRefresh={handleRefresh} 
          onExport={handleExport}
          onToggleTheme={toggleTheme}
          isDark={isDark}
        />
        
        <main 
          style={{ backgroundColor: colors.background }}
          className="flex-1 p-8 overflow-y-auto"
        >
          <MetricsOverview metrics={metrics} isRealTime={isRealTime} />
          
          <div className="space-y-8">
            <TrafficFlowChart graphData={graphData} />
            <RecentAPILogs 
              logs={logs} 
              onLogSelect={setSelectedLog}
              isRealTime={isRealTime}
            />
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