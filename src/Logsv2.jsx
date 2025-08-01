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
 *          location: string,
 *          applicationName: string,
 *          applicationId: string,
 *          userName: string,
 *          userId: string,
 *          apiName: string
 *        }
 *      ]
 *    }
 * 
 * 3. All metrics and graph data will be automatically calculated from the logs
 */

import React, { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush
} from 'recharts';
import { 
  Play, Pause, Download, Search, Filter, RefreshCw, X, ChevronDown, ChevronRight,
  Activity, Users, Clock, AlertTriangle, TrendingUp, TrendingDown,
  Globe, Server, Zap, Eye, MoreHorizontal, Settings, Bell, Home,
  FileText, Database, Shield, Box, GitBranch, BarChart3,
  Moon, Sun, Calendar, ChevronLeft, ChevronUp, Wifi, ExternalLink,
  User, Code
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
const FilterBar = ({ filters, onFiltersChange, onReset, selectedTimeRange }) => {
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
            placeholder="Search endpoints, IPs, users, or applications..."
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
      {(activeFilters.length > 0 || selectedTimeRange) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span style={{ color: colors.textMuted }} className="text-sm">Active filters:</span>
          
          {/* Time Range Filter Chip */}
          {selectedTimeRange && (
            <span
              style={{ 
                backgroundColor: colors.primary + '20',
                color: colors.primary 
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md"
            >
              Time: {selectedTimeRange.startTime} - {selectedTimeRange.endTime}
            </span>
          )}
          
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

// Chart Section Component with Interactive Histogram
const ChartSection = ({ graphData, onTimeRangeSelect }) => {
  const { colors } = useTheme();
  const [brushStartIndex, setBrushStartIndex] = useState(null);
  const [brushEndIndex, setBrushEndIndex] = useState(null);
  
  // Handle brush change for time range selection
  const handleBrushChange = (brushData) => {
    if (brushData && typeof brushData.startIndex === 'number' && typeof brushData.endIndex === 'number') {
      setBrushStartIndex(brushData.startIndex);
      setBrushEndIndex(brushData.endIndex);
      
      // Get the time range from the selected indices
      const startTime = graphData[brushData.startIndex]?.time;
      const endTime = graphData[brushData.endIndex]?.time;
      
      if (startTime && endTime && onTimeRangeSelect) {
        onTimeRangeSelect(startTime, endTime);
      }
    }
  };

  // Reset brush selection
  const resetBrush = () => {
    setBrushStartIndex(null);
    setBrushEndIndex(null);
    if (onTimeRangeSelect) {
      onTimeRangeSelect(null, null); // Clear filter
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      
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
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span style={{ color: colors.textMuted }} className="text-sm">
                  Total Requests
                </span>
              </div>
              <span style={{ color: colors.text }} className="font-medium">
                {total}
              </span>
            </div>
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span style={{ color: colors.textMuted }} className="text-sm">
                    {entry.dataKey === 'success' ? 'Success' : 
                     entry.dataKey === 'errors' ? 'Errors' : entry.dataKey}
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
          API Traffic Histogram
        </h3>
        
        <div className="flex items-center gap-4">
          {/* Brush Controls */}
          {(brushStartIndex !== null && brushEndIndex !== null) && (
            <div className="flex items-center gap-2">
              <span style={{ color: colors.textMuted }} className="text-sm">
                Selected: {graphData[brushStartIndex]?.time} - {graphData[brushEndIndex]?.time}
              </span>
              <button
                onClick={resetBrush}
                style={{ 
                  backgroundColor: colors.error + '20',
                  color: colors.error 
                }}
                className="px-2 py-1 text-xs rounded-md hover:opacity-80 transition-opacity"
              >
                Clear Selection
              </button>
            </div>
          )}
          
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
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

      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={graphData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={colors.border} 
            vertical={false}
          />
          <XAxis 
            dataKey="time" 
            stroke={colors.textMuted}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis 
            stroke={colors.textMuted}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ 
              value: 'Request Count', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: colors.textMuted }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Stacked bars for success and errors */}
          <Bar 
            dataKey="success" 
            stackId="requests"
            fill="#10B981"
            radius={[0, 0, 0, 0]}
            name="Success"
          />
          <Bar 
            dataKey="errors" 
            stackId="requests"
            fill="#EF4444"
            radius={[4, 4, 0, 0]}
            name="Errors"
          />
          
          {/* Brush for time range selection */}
          <Brush
            dataKey="time"
            height={30}
            stroke={colors.primary}
            fill={colors.primary + '20'}
            onChange={handleBrushChange}
            startIndex={brushStartIndex}
            endIndex={brushEndIndex}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Instructions */}
      <div className="mt-4 text-center">
        <p style={{ color: colors.textMuted }} className="text-sm">
          Drag the brush below the chart to select a time range and filter logs
        </p>
      </div>
    </div>
  );
};

// Log Table Component with simplified styling
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

  const truncateText = (text, maxLength = 15) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
              {logs.length} requests filtered
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
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timestamp
                </div>
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Application
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User
                </div>
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  API Name
                </div>
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Method
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Endpoint
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Status
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                Latency
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
              >
                IP
              </th>
              <th 
                style={{ color: colors.textMuted }}
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider"
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
                    data-application-id={log.applicationId}
                    data-user-id={log.userId}
                  >
                    {/* Timestamp */}
                    <td 
                      style={{ color: colors.text }} 
                      className="px-3 py-3 whitespace-nowrap text-sm font-mono cursor-pointer hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLogSelect(log);
                      }}
                    >
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    
                    {/* Application Name only - no colors, no ID visible */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span 
                        style={{ color: colors.text }} 
                        className="text-sm"
                        title={`${log.applicationName} (${log.applicationId})`}
                      >
                        {truncateText(log.applicationName, 15)}
                      </span>
                    </td>
                    
                    {/* User Name only - no ID visible */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span 
                        style={{ color: colors.text }} 
                        className="text-sm"
                        title={`${log.userName} (${log.userId})`}
                      >
                        {truncateText(log.userName, 15)}
                      </span>
                    </td>
                    
                    {/* API Name */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span 
                        style={{ color: colors.text }} 
                        className="text-sm"
                        title={log.apiName}
                      >
                        {truncateText(log.apiName, 20)}
                      </span>
                    </td>
                    
                    {/* Method */}
                    <td className="px-3 py-3 whitespace-nowrap">
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
                    
                    {/* Endpoint - show full endpoint */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span 
                        style={{ color: colors.text }} 
                        className="text-sm font-mono"
                        title={log.endpoint}
                      >
                        {log.endpoint}
                      </span>
                    </td>
                    
                    {/* Status */}
                    <td className="px-3 py-3 whitespace-nowrap">
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
                    
                    {/* Latency */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
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
                    
                    {/* IP */}
                    <td style={{ color: colors.textMuted }} className="px-3 py-3 whitespace-nowrap text-sm font-mono">
                      {log.ip}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
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
                  
                  {/* Expanded Row - show full details */}
                  {expandedRows.has(log.id) && (
                    <tr style={{ backgroundColor: colors.surfaceHover }}>
                      <td colSpan="10" className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 text-sm">
                          <div className="space-y-3">
                            <div>
                              <span style={{ color: colors.text }} className="font-medium block">Application Details:</span>
                              <p style={{ color: colors.textMuted }} className="mt-1">
                                <span className="font-semibold">{log.applicationName}</span>
                              </p>
                              <p style={{ color: colors.textMuted }} className="text-xs font-mono">
                                ID: {log.applicationId}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <span style={{ color: colors.text }} className="font-medium block">User Details:</span>
                              <p style={{ color: colors.textMuted }} className="mt-1">
                                <span className="font-semibold">{log.userName}</span>
                              </p>
                              <p style={{ color: colors.textMuted }} className="text-xs font-mono">
                                ID: {log.userId}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <span style={{ color: colors.text }} className="font-medium block">Request Details:</span>
                              <p style={{ color: colors.textMuted }} className="mt-1">
                                <span className="font-semibold">{log.apiName}</span>
                              </p>
                              <p style={{ color: colors.textMuted }} className="text-xs font-mono break-all">
                                {log.endpoint}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <span style={{ color: colors.text }} className="font-medium block">Additional Info:</span>
                              <div className="space-y-1 mt-1">
                                <p style={{ color: colors.textMuted }} className="text-xs">
                                  <span className="font-medium">Size:</span> {(log.size / 1024).toFixed(1)} KB
                                </p>
                                <p style={{ color: colors.textMuted }} className="text-xs">
                                  <span className="font-medium">Location:</span> {log.location}
                                </p>
                                <p style={{ color: colors.textMuted }} className="text-xs break-all">
                                  <span className="font-medium">User Agent:</span> {log.userAgent}
                                </p>
                              </div>
                            </div>
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

// Enhanced Inspector Panel as Right Sheet Overlay Component
const InspectorPanel = ({ log, onClose }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('formatted');
  const [jsonSearchTerm, setJsonSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  // Trigger animation when component mounts
  useEffect(() => {
    if (log) {
      setIsVisible(true);
    }
  }, [log]);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!log) return null;

  // Generate comprehensive log details including new fields
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
    environment: 'Other',
    region: 'Other',
    cached: false,
    retryCount: 0,
    threadCount: 0,
    policyName: 'ANALYTICS_POLICY',
    // New fields
    applicationName: log.applicationName,
    applicationId: log.applicationId,
    userName: log.userName,
    userId: log.userId,
    apiName: log.apiName,
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
    responseSize: log.size,
    userAgent: log.userAgent,
    sessionId: 'f80eb970-77fe-4db5-99be-78f03f01013',
    responseBody: null,
    location: log.location,
    validated: true,
    token: 'UopRtJcB6UkRRT1SaAVh',
    reference: '3fdfe3d0-32cc-469c-ad59-cd13f28a2de2',
    priority: 952,
    dedbc869: 'eb78-475d-961d-4b4539f9faf',
    currentDateTime: '2025-07-29 12:35:15',
    currentUser: 'rohannaam221b'
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

  // Enhanced JSON view with search and highlighting
  const jsonString = JSON.stringify(logDetails, null, 2);
  
  const filteredJsonEntries = useMemo(() => {
    if (!jsonSearchTerm) return Object.entries(logDetails);
    
    const searchLower = jsonSearchTerm.toLowerCase();
    return Object.entries(logDetails).filter(([key, value]) => {
      const keyMatch = key.toLowerCase().includes(searchLower);
      const valueMatch = String(value).toLowerCase().includes(searchLower);
      return keyMatch || valueMatch;
    });
  }, [logDetails, jsonSearchTerm]);

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: colors.warning + '40', color: colors.text, fontWeight: 'bold' }}>
          {part}
        </span>
      ) : part
    );
  };

  const renderFormattedView = () => (
    <div className="space-y-1">
      {filteredJsonEntries.map(([key, value]) => (
        <div 
          key={key}
          style={{ backgroundColor: colors.surfaceHover }}
          className="px-3 py-2 text-sm"
        >
          <div className="font-mono">
            <span style={{ color: colors.primary, fontWeight: 'bold' }}>
              {highlightText(key, jsonSearchTerm)}:
            </span>{' '}
            {typeof value === 'string' ? (
              highlightText(String(value), jsonSearchTerm)
            ) : (
              formatValue(value)
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderJsonView = () => {
    let displayJson = jsonString;
    
    // If search term exists, filter and highlight
    if (jsonSearchTerm) {
      const filteredObject = Object.fromEntries(filteredJsonEntries);
      displayJson = JSON.stringify(filteredObject, null, 2);
    }
    
    return (
      <div 
        style={{ 
          backgroundColor: colors.surfaceHover,
          color: colors.text 
        }}
        className="p-4 rounded-lg"
      >
        <pre className="text-sm font-mono whitespace-pre-wrap overflow-auto">
          {jsonSearchTerm ? (
            <div dangerouslySetInnerHTML={{
              __html: displayJson.replace(
                new RegExp(`(${jsonSearchTerm})`, 'gi'),
                `<span style="background-color: ${colors.warning}40; font-weight: bold;">$1</span>`
              )
            }} />
          ) : (
            displayJson
          )}
        </pre>
      </div>
    );
  };

  return (
    <>
      {/* Overlay Background */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        onClick={handleClose}
      />
      
      {/* Right Sheet Panel */}
      <div 
        className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          width: '500px',
          maxWidth: '90vw'
        }}
      >
        <div 
          style={{ 
            backgroundColor: colors.cardBg,
            borderColor: colors.border 
          }}
          className="w-full h-full border-l shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div 
            style={{ borderColor: colors.border }}
            className="flex items-center justify-between p-4 border-b shrink-0"
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
                onClick={handleClose}
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
            className="flex border-b shrink-0"
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

          {/* Search Bar for JSON tab */}
          {activeTab === 'json' && (
            <div 
              style={{ borderColor: colors.border }}
              className="p-3 border-b shrink-0"
            >
              <div className="relative">
                <Search 
                  style={{ color: colors.textMuted }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                />
                <input
                  type="text"
                  placeholder="Search in JSON..."
                  value={jsonSearchTerm}
                  onChange={(e) => setJsonSearchTerm(e.target.value)}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text
                  }}
                  className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
                {jsonSearchTerm && (
                  <button
                    onClick={() => setJsonSearchTerm('')}
                    style={{ color: colors.textMuted }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {jsonSearchTerm && (
                <p style={{ color: colors.textMuted }} className="text-xs mt-2">
                  Found {filteredJsonEntries.length} matching field(s)
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div 
              style={{ backgroundColor: colors.surfaceHover }}
              className="px-4 py-2 shrink-0"
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
      </div>
    </>
  );
};

// Sidebar Component
const Sidebar = () => {
  const { colors } = useTheme();
  
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
const Logsv2 = () => {
  const { isDark, toggleTheme, colors } = useTheme();
  const [isRealTime, setIsRealTime] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);
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

  // Time range selection callback
  const handleTimeRangeSelect = (startTime, endTime) => {
    if (startTime && endTime) {
      setSelectedTimeRange({ startTime, endTime });
      console.log('Selected time range:', startTime, 'to', endTime);
    } else {
      setSelectedTimeRange(null);
      console.log('Time range selection cleared');
    }
  };

  // Handle escape key to close overlay
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && selectedLog) {
        setSelectedLog(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedLog]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (selectedLog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedLog]);

  // Updated API call to fetch all data with new fields
  const fetchApiLogs = useCallback(async () => {
    try {
      // TODO: Replace with your actual API endpoint
      // const response = await fetch('/api/logs');
      // const apiData = await response.json();
      
      // Updated mock data with new fields
      const apiData = {
        logs: Array.from({ length: 50 }, (_, i) => {
          const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
          const endpoints = ['/api/users', '/api/auth/login', '/api/data', '/api/upload', '/api/payments', '/api/search'];
          const statuses = [200, 201, 400, 401, 403, 404, 500, 503];
          const ips = ['192.168.1.10', '10.0.0.15', '172.16.0.5', '203.0.113.42', '198.51.100.17'];
          
          // New mock data arrays
          const applications = [
            { name: 'Mobile App', id: 'mobile-app-001' },
            { name: 'Web Portal', id: 'web-portal-002' },
            { name: 'Admin Dashboard', id: 'admin-dash-003' },
            { name: 'Payment Gateway', id: 'payment-gw-004' },
            { name: 'Analytics Service', id: 'analytics-svc-005' },
            { name: 'API Gateway', id: 'api-gateway-006' }
          ];
          
          const users = [
            { name: 'John Doe', id: 'user_12345' },
            { name: 'Jane Smith', id: 'user_67890' },
            { name: 'Admin User', id: 'admin_001' },
            { name: 'Service Account', id: 'svc_12345' },
            { name: 'Bob Johnson', id: 'user_54321' },
            { name: 'Alice Brown', id: 'user_98765' },
            { name: 'System User', id: 'sys_001' }
          ];
          
          const apiNames = [
            'User Management API',
            'Authentication Service',
            'Data Retrieval API',
            'File Upload Service',
            'Payment Processing API',
            'Search & Analytics API',
            'Notification Service',
            'Reporting API'
          ];
          
          const method = methods[Math.floor(Math.random() * methods.length)];
          const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const ip = ips[Math.floor(Math.random() * ips.length)];
          const app = applications[Math.floor(Math.random() * applications.length)];
          const user = users[Math.floor(Math.random() * users.length)];
          const apiName = apiNames[Math.floor(Math.random() * apiNames.length)];
          
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
            location: ['US-West', 'EU-Central', 'AP-Southeast'][Math.floor(Math.random() * 3)],
            // New fields
            applicationName: app.name,
            applicationId: app.id,
            userName: user.name,
            userId: user.id,
            apiName: apiName
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

  // Enhanced filter logic to include new fields
  const filteredLogs = logs.filter(log => {
    // Enhanced search filter to include new fields
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      if (
        !log.endpoint.toLowerCase().includes(searchTerm) &&
        !log.applicationName.toLowerCase().includes(searchTerm) &&
        !log.userName.toLowerCase().includes(searchTerm) &&
        !log.apiName.toLowerCase().includes(searchTerm) &&
        !log.ip.toLowerCase().includes(searchTerm)
      ) {
        return false;
      }
    }
    
    // Method filter
    if (filters.method !== 'all' && log.method !== filters.method) {
      return false;
    }
    
    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'success' && log.status >= 400) return false;
      if (filters.status === 'error' && log.status < 400) return false;
    }
    
    // Time range filter from histogram brush selection
    if (selectedTimeRange) {
      const logHour = new Date(log.timestamp).getHours();
      const logTimeKey = `${String(logHour).padStart(2, '0')}:00`;
      
            // Convert time strings to numbers for comparison
            const startHour = parseInt(selectedTimeRange.startTime.split(':')[0]);
            const endHour = parseInt(selectedTimeRange.endTime.split(':')[0]);
            const currentHour = parseInt(logTimeKey.split(':')[0]);
            
            if (currentHour < startHour || currentHour > endHour) {
              return false;
            }
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
          setSelectedTimeRange(null);
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
                    selectedTimeRange={selectedTimeRange}
                  />
                  
                  <ChartSection 
                    graphData={graphData} 
                    onTimeRangeSelect={handleTimeRangeSelect}
                  />
                  
                  <LogTable 
                    logs={filteredLogs}
                    onLogSelect={setSelectedLog}
                    isRealTime={isRealTime}
                    onRefresh={handleRefresh}
                  />
                </div>
              </div>
            </div>
      
            {/* Right Sheet Overlay Inspector Panel */}
            {selectedLog && (
              <InspectorPanel 
                log={selectedLog}
                onClose={() => setSelectedLog(null)}
              />
            )}
          </div>
        );
      };
      
      // App wrapper with Theme Provider
      const App = () => {
        return (
          <ThemeProvider>
            <Logsv2 />
          </ThemeProvider>
        );
      };
      
      export default App;