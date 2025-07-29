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
  AreaChart, Area
} from 'recharts';
import { 
  Play, Pause, Download, Search, Filter, RefreshCw, X, ChevronDown, ChevronRight,
  Activity, Users, Clock, AlertTriangle, TrendingUp, TrendingDown,
  Globe, Server, Zap, Eye, MoreHorizontal, Settings, Bell, Home,
  FileText, Database, Shield, Box, GitBranch, BarChart3,
  Moon, Sun, Calendar, ChevronLeft, ChevronUp, Wifi, ExternalLink
} from 'lucide-react';

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  
  const toggleTheme = () => setIsDark(prev => !prev);
  
  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      // Dark theme colors
      background: '#111827',
      surface: '#1f2937',
      surfaceHover: '#374151',
      border: '#374151',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      textMuted: '#9ca3af',
      primary: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      cardBg: '#1f2937',
      headerBg: '#1f2937'
    } : {
      // Light theme colors
      background: '#f9fafb',
      surface: '#ffffff',
      surfaceHover: '#f3f4f6',
      border: '#e5e7eb',
      text: '#111827',
      textSecondary: '#374151',
      textMuted: '#6b7280',
      primary: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      cardBg: '#ffffff',
      headerBg: '#ffffff'
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

// Summary Cards Component
const SummaryCards = ({ metrics, isRealTime }) => {
  const { colors } = useTheme();
  
  const cards = [
    {
      id: 'requests',
      title: 'Total Requests',
      value: metrics.totalRequests.toLocaleString(),
      icon: Activity,
      color: colors.primary,
      trend: '+12.5%',
      trendUp: true
    },
    {
      id: 'errors',
      title: 'Error Rate',
      value: `${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(1)}%`,
      icon: AlertTriangle,
      color: colors.error,
      trend: '-2.1%',
      trendUp: false
    },
    {
      id: 'latency',
      title: 'Avg Latency',
      value: `${metrics.avgLatency}ms`,
      icon: Clock,
      color: colors.success,
      trend: '-5.2%',
      trendUp: false
    },
    {
      id: 'success',
      title: 'Success Rate',
      value: `${metrics.successRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: colors.success,
      trend: '+0.8%',
      trendUp: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        
        return (
          <div
            key={card.id}
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
              transition: 'all 0.2s ease'
            }}
            className="relative p-4 rounded-lg border hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    style={{ 
                      backgroundColor: card.color + '20',
                      color: card.color 
                    }}
                    className="p-2 rounded-lg"
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  {isRealTime && (
                    <div 
                      style={{ backgroundColor: colors.success }}
                      className="w-2 h-2 rounded-full animate-pulse" 
                    />
                  )}
                </div>
                
                <div className="space-y-1">
                  <p style={{ color: colors.text }} className="text-2xl font-bold">
                    {card.value}
                  </p>
                  <p style={{ color: colors.textMuted }} className="text-sm">
                    {card.title}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <span 
                  style={{ 
                    color: card.trendUp ? colors.success : colors.error 
                  }}
                  className="text-xs font-medium"
                >
                  {card.trend}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Filter Bar Component
const FilterBar = ({ filters, onFiltersChange, onReset }) => {
  const { colors } = useTheme();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFiltersChange({ ...filters, search: value });
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const removeFilter = (key) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => key !== 'search' && value !== 'all' && value
  );

  const inputStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Search and Main Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search 
            style={{ color: colors.textMuted }}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
          />
          <input
            type="text"
            placeholder="Search endpoints, IPs, or methods..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={inputStyle}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filters.method || 'all'}
            onChange={(e) => handleFilterChange('method', e.target.value)}
            style={inputStyle}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={inputStyle}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success (2xx-3xx)</option>
            <option value="error">Error (4xx-5xx)</option>
          </select>
          
          <select
            value={filters.timeRange || '1h'}
            onChange={(e) => handleFilterChange('timeRange', e.target.value)}
            style={inputStyle}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span style={{ color: colors.textMuted }} className="text-sm">Active filters:</span>
          {activeFilters.map(([key, value]) => (
            <span
              key={key}
              style={{ 
                backgroundColor: colors.primary + '20',
                color: colors.primary 
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md"
            >
              {key}: {value}
              <button
                onClick={() => removeFilter(key)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={onReset}
            style={{ color: colors.error }}
            className="text-xs hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

// Chart Section Component
const ChartSection = ({ graphData }) => {
  const { colors } = useTheme();
  const [chartType, setChartType] = useState('area');
  
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
                    {entry.dataKey}
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
    <div 
      style={{ 
        backgroundColor: colors.cardBg,
        borderColor: colors.border 
      }}
      className="rounded-lg border p-6 mb-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 style={{ color: colors.text }} className="text-lg font-semibold">
          API Traffic Overview
        </h3>
        
        <div className="flex items-center gap-4">
          {/* Chart Type Toggle */}
          <div 
            style={{ backgroundColor: colors.surfaceHover }}
            className="flex items-center rounded-lg p-1"
          >
            <button
              onClick={() => setChartType('area')}
              style={{ 
                backgroundColor: chartType === 'area' ? colors.surface : 'transparent',
                color: chartType === 'area' ? colors.text : colors.textMuted
              }}
              className="px-3 py-1 text-sm rounded-md transition-all"
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              style={{ 
                backgroundColor: chartType === 'line' ? colors.surface : 'transparent',
                color: chartType === 'line' ? colors.text : colors.textMuted
              }}
              className="px-3 py-1 text-sm rounded-md transition-all"
            >
              Line
            </button>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span style={{ color: colors.textMuted }}>Requests</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span style={{ color: colors.textMuted }}>Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span style={{ color: colors.textMuted }}>Errors</span>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'area' ? (
          <AreaChart data={graphData}>
            <defs>
              <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="errorsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
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
              stroke="#3B82F6" 
              fillOpacity={1}
              fill="url(#requestsGradient)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="success" 
              stroke="#10B981" 
              fillOpacity={1}
              fill="url(#successGradient)"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="errors" 
              stroke="#EF4444" 
              fillOpacity={1}
              fill="url(#errorsGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        ) : (
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
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6, fill: '#3B82F6' }}
            />
            <Line 
              type="monotone" 
              dataKey="success" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6, fill: '#10B981' }}
            />
            <Line 
              type="monotone" 
              dataKey="errors" 
              stroke="#EF4444" 
              strokeWidth={3}
              dot={{ fill: '#EF4444', r: 4 }}
              activeDot={{ r: 6, fill: '#EF4444' }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// Log Table Component
const LogTable = ({ logs, onLogSelect, isRealTime, onRefresh }) => {
  const { colors } = useTheme();
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (logId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getStatusColors = (status) => {
    if (status >= 200 && status < 300) return { bg: colors.success + '20', text: colors.success };
    if (status >= 300 && status < 400) return { bg: colors.primary + '20', text: colors.primary };
    if (status >= 400 && status < 500) return { bg: colors.warning + '20', text: colors.warning };
    if (status >= 500) return { bg: colors.error + '20', text: colors.error };
    return { bg: colors.textMuted + '20', text: colors.textMuted };
  };

  const getMethodColors = (method) => {
    const colorMap = {
      GET: { bg: colors.primary + '20', text: colors.primary },
      POST: { bg: colors.success + '20', text: colors.success },
      PUT: { bg: colors.warning + '20', text: colors.warning },
      DELETE: { bg: colors.error + '20', text: colors.error },
      PATCH: { bg: '#8b5cf6' + '20', text: '#8b5cf6' }
    };
    return colorMap[method] || { bg: colors.textMuted + '20', text: colors.textMuted };
  };

  return (
    <div 
      style={{ 
        backgroundColor: colors.cardBg,
        borderColor: colors.border 
      }}
      className="rounded-lg border overflow-hidden"
    >
      <div 
        style={{ borderColor: colors.border }}
        className="p-4 border-b"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 style={{ color: colors.text }} className="text-lg font-semibold">
              Recent API Logs
            </h3>
            <p style={{ color: colors.textMuted }} className="text-sm mt-1">
              {logs.length} requests in the last hour
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onRefresh}
              style={{ color: colors.textMuted }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              style={{ color: colors.textMuted }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
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
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timestamp
                </div>
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Method
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Endpoint
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Status
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Latency
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                IP
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ borderColor: colors.border }} className="divide-y">
            {logs.map((log, index) => {
              const statusColors = getStatusColors(log.status);
              const methodColors = getMethodColors(log.method);
              
              return (
                <React.Fragment key={log.id}>
                  <tr 
                    style={{ 
                      backgroundColor: index === 0 && isRealTime ? colors.primary + '10' : 'transparent'
                    }}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onLogSelect(log)}
                  >
                    <td 
                      style={{ color: colors.text }} 
                      className="px-4 py-3 whitespace-nowrap text-sm font-mono cursor-pointer hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLogSelect(log);
                      }}
                    >
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span 
                        style={{ 
                          backgroundColor: methodColors.bg,
                          color: methodColors.text 
                        }}
                        className="px-2 py-1 text-xs font-medium rounded-md"
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span style={{ color: colors.text }} className="text-sm font-mono">
                        {log.endpoint}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span 
                        style={{ 
                          backgroundColor: statusColors.bg,
                          color: statusColors.text 
                        }}
                        className="px-2 py-1 text-xs font-medium rounded-md"
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span 
                        style={{ 
                          color: log.latency > 1000 ? colors.error : 
                                 log.latency > 500 ? colors.warning : colors.success
                        }}
                        className="font-medium"
                      >
                        {log.latency}ms
                      </span>
                    </td>
                    <td style={{ color: colors.textMuted }} className="px-4 py-3 whitespace-nowrap text-sm font-mono">
                      {log.ip}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(log.id);
                          }}
                          style={{ color: colors.textMuted }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {expandedRows.has(log.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLogSelect(log);
                          }}
                          style={{ color: colors.textMuted }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="View detailed log"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Row */}
                  {expandedRows.has(log.id) && (
                    <tr style={{ backgroundColor: colors.surfaceHover }}>
                      <td colSpan="7" className="px-4 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span style={{ color: colors.text }} className="font-medium">User Agent:</span>
                            <p style={{ color: colors.textMuted }} className="font-mono text-xs mt-1">
                              {log.userAgent}
                            </p>
                          </div>
                          <div>
                            <span style={{ color: colors.text }} className="font-medium">Response Size:</span>
                            <p style={{ color: colors.textMuted }} className="mt-1">
                              {(log.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <div>
                            <span style={{ color: colors.text }} className="font-medium">Location:</span>
                            <p style={{ color: colors.textMuted }} className="mt-1">
                              {log.location}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Inspector Panel Component
// Inspector Panel Component
const InspectorPanel = ({ log, onClose }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('formatted');
  
  if (!log) return null;

  // Generate comprehensive log details similar to the screenshot
  const logDetails = {
    // Core identifiers
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
    environment: 'Other',
    region: 'Other',
    cached: false,
    retryCount: 0,
    threadCount: 0,
    policyName: 'ANALYTICS_POLICY',
    endpoint: log.endpoint,
    fullUrl: `/send/sms/otp/api?msg=Dear%20Meeting%20ID%20Thanks%20for%20your%20Interest%20in%20availing%20loan%20from%20Vistaer%20Finance.%20426`,
    timestamp: log.timestamp,
    executionId: '62a7b933-4a7c-4f74-bf56-b82afd0b5282',
    duration: log.latency,
    visibility: 'PUBLIC',
    service: 'apiaccesslogs',
    method: log.method,
    clientIp: log.ip,
    requestSize: '5af12861-620e-4elc-a306-16701c6a6865',
    responseSize: null,
    userAgent: log.userAgent,
    sessionId: 'f80eb970-77fe-4db5-99be-78f03f01013',
    responseBody: null,
    location: log.location,
    validated: true,
    token: 'UopRtJcB6UkRRT1SaAVh',
    reference: '3fdfe3d0-32cc-469c-ad59-cd13f28a2de2',
    priority: 952,
    dedbc869: 'eb78-475d-961d-4b4539f9faf'
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
    <div className="space-y-1">
      {Object.entries(logDetails).map(([key, value]) => (
        <div 
          key={key}
          style={{ backgroundColor: colors.surfaceHover }}
          className="px-3 py-2 text-sm"
        >
          <div className="font-mono">
            {formatValue(value)}
          </div>
        </div>
      ))}
    </div>
  );

  const renderJsonView = () => (
    <div 
      style={{ 
        backgroundColor: colors.surfaceHover,
        color: colors.text 
      }}
      className="p-4 rounded-lg"
    >
      <pre className="text-sm font-mono whitespace-pre-wrap overflow-auto">
        {JSON.stringify(logDetails, null, 2)}
      </pre>
    </div>
  );

  return (
    <div 
      style={{ 
        backgroundColor: colors.cardBg,
        borderColor: colors.border 
      }}
      className="w-96 border-l overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div 
        style={{ borderColor: colors.border }}
        className="flex items-center justify-between p-4 border-b"
      >
        <h3 style={{ color: '#dc2626' }} className="text-lg font-semibold">
          Log Details
        </h3>
        <div className="flex items-center gap-2">
          <button 
            style={{ color: colors.textMuted }}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            style={{ color: colors.textMuted }}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Copy"
          >
            📋
          </button>
          <button 
            style={{ color: colors.textMuted }}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Next"
          >
            ⬇ Next
          </button>
          <button
            onClick={onClose}
            style={{ color: colors.textMuted }}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div 
        style={{ borderColor: colors.border }}
        className="flex border-b"
      >
        <button
          onClick={() => setActiveTab('formatted')}
          style={{ 
            borderColor: activeTab === 'formatted' ? '#dc2626' : 'transparent',
            color: activeTab === 'formatted' ? '#dc2626' : colors.textMuted
          }}
          className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
        >
          Formatted
        </button>
        <button
          onClick={() => setActiveTab('json')}
          style={{ 
            borderColor: activeTab === 'json' ? '#dc2626' : 'transparent',
            color: activeTab === 'json' ? '#dc2626' : colors.textMuted
          }}
          className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
        >
          JSON
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div 
          style={{ backgroundColor: colors.surfaceHover }}
          className="px-4 py-2"
        >
          <span style={{ color: colors.textMuted }} className="text-sm font-medium">
            Value
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'formatted' ? renderFormattedView() : renderJsonView()}
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
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

// Main Dashboard Component
const APILogsDashboard = () => {
  const { isDark, toggleTheme, colors } = useTheme();
  const [isRealTime, setIsRealTime] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    method: 'all',
    status: 'all',
    timeRange: '1h'
  });

  // Mock data states
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
      // TODO: Replace with your actual API endpoint
      // const response = await fetch('/api/logs');
      // const apiData = await response.json();
      
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
          
          // Generate timestamps for the last 24 hours
          const now = new Date();
          const timestamp = new Date(now.getTime() - (i * 30 * 60 * 1000)); // 30 min intervals
          
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
    
    // Group logs by hour
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

    // Create array for last 24 hours
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
      // Fetch fresh data from API
      const data = await fetchApiLogs();
      const sortedLogs = data.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Update all data derived from the single API call
      setLogs(sortedLogs);
      setMetrics(calculateMetrics(sortedLogs));
      setGraphData(generateGraphData(sortedLogs));
    }, 5000); // Refresh every 5 seconds when real-time is enabled

    return () => clearInterval(interval);
  }, [isRealTime, fetchApiLogs, calculateMetrics, generateGraphData]);

  const filteredLogs = logs.filter(log => {
    if (filters.search && !log.endpoint.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.method !== 'all' && log.method !== filters.method) {
      return false;
    }
    if (filters.status !== 'all') {
      if (filters.status === 'success' && log.status >= 400) return false;
      if (filters.status === 'error' && log.status < 400) return false;
    }
    return true;
  });

  const resetFilters = () => {
    setFilters({
      search: '',
      method: 'all',
      status: 'all',
      timeRange: '1h'
    });
  };

  // Manual refresh function
  const handleRefresh = async () => {
    const data = await fetchApiLogs();
    const sortedLogs = data.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setLogs(sortedLogs);
    setMetrics(calculateMetrics(sortedLogs));
    setGraphData(generateGraphData(sortedLogs));
  };

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      {/* Header */}
      <div 
        style={{ 
          backgroundColor: colors.headerBg,
          borderColor: colors.border 
        }}
        className="border-b px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 style={{ color: colors.text }} className="text-xl font-semibold">
              API Access Logs
            </h1>
            {isRealTime && (
              <div 
                style={{ 
                  backgroundColor: colors.success + '20',
                  color: colors.success 
                }}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
              >
                <div 
                  style={{ backgroundColor: colors.success }}
                  className="w-2 h-2 rounded-full animate-pulse" 
                />
                Live
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRealTime(!isRealTime)}
              style={{ 
                backgroundColor: isRealTime ? colors.primary : colors.surfaceHover,
                color: isRealTime ? 'white' : colors.text
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
            >
              {isRealTime ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRealTime ? 'Pause' : 'Start'} Live
            </button>
            
            <button
              onClick={toggleTheme}
              style={{ 
                backgroundColor: colors.surfaceHover,
                color: colors.text 
              }}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button 
              style={{ 
                backgroundColor: colors.surfaceHover,
                color: colors.text 
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="p-6 space-y-6">
            <SummaryCards metrics={metrics} isRealTime={isRealTime} />
            
            <FilterBar 
              filters={filters}
              onFiltersChange={setFilters}
              onReset={resetFilters}
            />
            
            <ChartSection graphData={graphData} />
            
            <LogTable 
              logs={filteredLogs}
              onLogSelect={setSelectedLog}
              isRealTime={isRealTime}
              onRefresh={handleRefresh}
            />
          </div>
        </div>

        <InspectorPanel 
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      </div>
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