import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Play, Pause, Download, Search, Filter, RefreshCw, 
  Activity, Users, Clock, AlertTriangle, X, ChevronDown, ChevronRight,
  Globe, Server, Zap, Eye, ExternalLink, MoreHorizontal, TrendingUp,
  Shield, Wifi, Database, Settings, BarChart3, FileText, Bell,
  Home, GitBranch, Box
} from 'lucide-react';

const APILogsDashboard = () => {
  const [isRealTime, setIsRealTime] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [activeFilters, setActiveFilters] = useState({
    logType: 'all',
    status: 'all',
    method: 'all',
    search: '',
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
  const [tickerItems, setTickerItems] = useState([]);

  // Generate mock log data
  const generateMockLog = useCallback(() => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const endpoints = ['/api/users', '/api/auth/login', '/api/data', '/api/upload', '/api/payments', '/api/search'];
    const statuses = [200, 201, 400, 401, 403, 404, 500, 503];
    const ips = ['192.168.1.10', '10.0.0.15', '172.16.0.5', '203.0.113.42', '198.51.100.17'];
    
    const method = methods[Math.floor(Math.random() * methods.length)];
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const ip = ips[Math.floor(Math.random() * ips.length)];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ip,
      method,
      endpoint,
      status,
      latency: Math.floor(Math.random() * 2000) + 50,
      proxyLatency: Math.floor(Math.random() * 100) + 10,
      success: status < 400,
      userAgent: 'Mozilla/5.0 (compatible)',
      size: Math.floor(Math.random() * 50000) + 1000,
      tags: status >= 500 ? ['Critical'] : status >= 400 ? ['Warning'] : [],
      location: ['US-West', 'EU-Central', 'AP-Southeast'][Math.floor(Math.random() * 3)]
    };
  }, []);

  // Initialize data
  useEffect(() => {
    const initialLogs = Array.from({ length: 20 }, generateMockLog);
    setLogs(initialLogs);
    
    const initialGraphData = Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      requests: Math.floor(Math.random() * 500) + 100,
      errors: Math.floor(Math.random() * 50) + 10,
      success: Math.floor(Math.random() * 450) + 50
    }));
    setGraphData(initialGraphData);

    const initialTicker = Array.from({ length: 5 }, () => {
      const log = generateMockLog();
      return `${log.method} ${log.endpoint} → ${log.status}${log.status >= 400 ? ' ⚠️' : ' ✅'}`;
    });
    setTickerItems(initialTicker);
  }, [generateMockLog]);

  // Real-time updates
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      const newLog = generateMockLog();
      
      setLogs(prev => [newLog, ...prev.slice(0, 49)]);
      setMetrics(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        failedRequests: prev.failedRequests + (newLog.status >= 400 ? 1 : 0),
        avgLatency: Math.floor((prev.avgLatency * 0.95) + (newLog.latency * 0.05)),
        uniqueIPs: prev.uniqueIPs + (Math.random() > 0.8 ? 1 : 0),
        successRate: ((prev.totalRequests - prev.failedRequests) / (prev.totalRequests + 1)) * 100
      }));

      setTickerItems(prev => [
        `${newLog.method} ${newLog.endpoint} → ${newLog.status}${newLog.status >= 400 ? ' ⚠️' : ' ✅'}`,
        ...prev.slice(0, 4)
      ]);

      if (Math.random() > 0.7) {
        setGraphData(prev => {
          const newData = [...prev];
          const lastIndex = newData.length - 1;
          newData[lastIndex] = {
            ...newData[lastIndex],
            requests: newData[lastIndex].requests + Math.floor(Math.random() * 10) + 1,
            errors: newData[lastIndex].errors + (newLog.status >= 400 ? 1 : 0),
            success: newData[lastIndex].success + (newLog.status < 400 ? 1 : 0)
          };
          return newData;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isRealTime, generateMockLog]);

  const getStatusBadge = (status) => {
    if (status >= 200 && status < 300) return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    if (status >= 300 && status < 400) return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (status >= 400 && status < 500) return 'bg-amber-100 text-amber-800 border border-amber-200';
    if (status >= 500) return 'bg-red-100 text-red-800 border border-red-200';
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getMethodBadge = (method) => {
    const colorMap = {
      GET: 'bg-blue-50 text-blue-700 border border-blue-200',
      POST: 'bg-green-50 text-green-700 border border-green-200',
      PUT: 'bg-orange-50 text-orange-700 border border-orange-200',
      DELETE: 'bg-red-50 text-red-700 border border-red-200',
      PATCH: 'bg-purple-50 text-purple-700 border border-purple-200'
    };
    return colorMap[method] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

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

  // Handle row click to show inspector
  const handleRowClick = (log, event) => {
    event.stopPropagation();
    console.log('Row clicked:', log); // Debug log
    setSelectedLog(log);
  };

  // Handle action button click
  const handleActionClick = (log, event) => {
    event.stopPropagation();
    console.log('Action clicked:', log); // Debug log
    setSelectedLog(log);
  };

  const filteredLogs = logs.filter(log => {
    if (activeFilters.search && !log.endpoint.toLowerCase().includes(activeFilters.search.toLowerCase())) {
      return false;
    }
    if (activeFilters.method !== 'all' && log.method !== activeFilters.method) {
      return false;
    }
    if (activeFilters.status !== 'all') {
      if (activeFilters.status === 'success' && log.status >= 400) return false;
      if (activeFilters.status === 'error' && log.status < 400) return false;
    }
    return true;
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xl">
          <p className="font-semibold text-gray-900 mb-2">{`Time: ${label}`}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Success</span>
              </div>
              <span className="font-semibold text-emerald-600">
                {payload.find(p => p.dataKey === 'success')?.value || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Errors</span>
              </div>
              <span className="font-semibold text-red-600">
                {payload.find(p => p.dataKey === 'errors')?.value || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Total</span>
              </div>
              <span className="font-semibold text-blue-600">
                {payload.find(p => p.dataKey === 'requests')?.value || 0}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const sidebarItems = [
    { icon: Home, label: 'Analytics', active: true },
    { icon: FileText, label: 'Logs', active: false, submenu: [
      { label: 'API Access Logs', active: true },
      { label: 'Connector Logs', active: false },
      { label: 'Workflow Execution Logs', active: false },
      { label: 'Scheduled Job Execution Logs', active: false },
      { label: 'Trace Box', active: false },
      { label: 'Alert Box', active: false }
    ]},
    { icon: Server, label: 'API Manager', active: false },
    { icon: Database, label: 'API Gateway', active: false },
    { icon: Shield, label: 'API Policies', active: false },
    { icon: Box, label: 'Vault', active: false },
    { icon: Bell, label: 'Alert Engine', active: false },
    { icon: GitBranch, label: 'API Products', active: false },
    { icon: Users, label: 'Access Management', active: false },
    { icon: Settings, label: 'Masters', active: false },
    { icon: Globe, label: 'Global Settings', active: false },
    { icon: BarChart3, label: 'Feedbacks', active: false },
    { icon: Search, label: 'Queries', active: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs lg:text-sm">A</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900 text-sm lg:text-base">Applied Cloud Computing</span>
              <div className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600 font-medium">
                Super Admin
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 lg:space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
            </button>
            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs lg:text-sm">U</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 lg:w-64 bg-gray-900 text-white min-h-screen">
          <div className="p-4 lg:p-6">
            <nav className="space-y-2">
              {sidebarItems.map((item, i) => (
                <div key={item.label}>
                  <button className={`w-full text-left px-3 py-2 lg:py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
                    item.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}>
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.submenu && (
                      <ChevronDown className="w-3 h-3 lg:w-4 lg:h-4 opacity-60" />
                    )}
                  </button>
                  {item.submenu && item.active && (
                    <div className="mt-2 ml-6 lg:ml-8 space-y-1">
                      {item.submenu.map((subitem, j) => (
                        <button
                          key={subitem.label}
                          className={`w-full text-left px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm transition-colors truncate ${
                            subitem.active ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          {subitem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 lg:py-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div>
                <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3 mb-2">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">API Access Logs</h1>
                  {isRealTime && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full w-fit">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">Live</span>
                    </div>
                  )}
                </div>
                <p className="text-sm lg:text-base text-gray-600">Monitor and analyze your API traffic in real-time</p>
              </div>
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-3">
                <div className="flex items-center space-x-2 px-3 lg:px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm lg:text-base">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Last 60 years</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex space-x-2 lg:space-x-3">
                  <button
                    onClick={() => setIsRealTime(!isRealTime)}
                    className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg border font-medium transition-all duration-200 text-sm lg:text-base ${
                      isRealTime 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isRealTime ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isRealTime ? 'Pause' : 'Start'} Real-time</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 lg:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm lg:text-base">
                    <Download className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Ticker Strip */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap py-2 lg:py-3 px-4 lg:px-8">
              <span className="text-xs lg:text-sm font-mono text-gray-700">
                {tickerItems.map((item, i) => (
                  <span key={i} className="mx-6 lg:mx-8 inline-flex items-center">
                    <Activity className="w-3 h-3 mr-2 text-blue-500" />
                    {item}
                  </span>
                ))}
              </span>
            </div>
          </div>

          <div className="p-4 lg:p-8">
            {/* Search and Filters */}
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 mb-4 lg:mb-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
                  <div className="relative w-full lg:w-auto">
                    <Search className="w-4 h-4 lg:w-5 lg:h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search using KQL Ex: api_version_id.xxx"
                      value={activeFilters.search}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10 pr-4 py-2.5 lg:py-3 w-full lg:w-80 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-sm lg:text-base"
                    />
                  </div>
                  <div className="flex space-x-3 w-full lg:w-auto">
                    <select
                      value={activeFilters.method}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, method: e.target.value }))}
                      className="px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm flex-1 lg:flex-none text-sm lg:text-base"
                    >
                      <option value="all">All Methods</option>
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                    <select
                      value={activeFilters.status}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm flex-1 lg:flex-none text-sm lg:text-base"
                    >
                      <option value="all">All Status</option>
                      <option value="success">Success (2xx-3xx)</option>
                      <option value="error">Error (4xx-5xx)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-6 mb-6 lg:mb-8">
              <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div className="p-1.5 lg:p-2 bg-blue-100 rounded-lg lg:rounded-xl">
                      <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                    </div>
                    {isRealTime && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                  </div>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900 mb-1">{metrics.totalRequests.toLocaleString()}</p>
                  <p className="text-xs lg:text-sm text-gray-600 font-medium">Total Requests</p>
                </div>
              </div>

              <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div className="p-1.5 lg:p-2 bg-red-100 rounded-lg lg:rounded-xl">
                      <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
                    </div>
                    {isRealTime && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                  </div>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900 mb-1">{metrics.failedRequests}</p>
                  <p className="text-xs lg:text-sm text-gray-600 font-medium">Failed Requests</p>
                </div>
              </div>

              <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div className="p-1.5 lg:p-2 bg-emerald-100 rounded-lg lg:rounded-xl">
                      <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600" />
                    </div>
                    {isRealTime && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                  </div>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900 mb-1">{metrics.avgLatency}ms</p>
                  <p className="text-xs lg:text-sm text-gray-600 font-medium">Avg Latency</p>
                </div>
              </div>

              <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div className="p-1.5 lg:p-2 bg-purple-100 rounded-lg lg:rounded-xl">
                      <Users className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                    </div>
                    {isRealTime && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                  </div>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900 mb-1">{metrics.uniqueIPs.toLocaleString()}</p>
                  <p className="text-xs lg:text-sm text-gray-600 font-medium">Unique IPs</p>
                </div>
              </div>

              <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div className="p-1.5 lg:p-2 bg-green-100 rounded-lg lg:rounded-xl">
                      <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                    </div>
                    {isRealTime && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                  </div>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900 mb-1">{metrics.successRate.toFixed(1)}%</p>
                  <p className="text-xs lg:text-sm text-gray-600 font-medium">Success Rate</p>
                </div>
              </div>

              <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <div className="p-1.5 lg:p-2 bg-orange-100 rounded-lg lg:rounded-xl">
                      <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600" />
                    </div>
                    {isRealTime && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                  </div>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900 mb-1">{metrics.peakLatency}ms</p>
                  <p className="text-xs lg:text-sm text-gray-600 font-medium">Peak Latency</p>
                </div>
              </div>
            </div>

            {/* Graph */}
            <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-200 shadow-sm p-4 lg:p-8 mb-6 lg:mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 mb-4 lg:mb-6">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900">API Traffic Overview</h3>
                <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs lg:text-sm text-gray-600">Total Requests</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs lg:text-sm text-gray-600">Success</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs lg:text-sm text-gray-600">Errors</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={graphData}>
                  <defs>
                    <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="errorsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={11}
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
              </ResponsiveContainer>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">API Access Logs</h3>
                    <p className="text-xs lg:text-sm text-gray-600 mt-1">
                      Showing {filteredLogs.length} of {logs.length} recent requests
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 text-xs lg:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Filter className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
                      Filter
                    </button>
                    <button className="px-3 py-1.5 text-xs lg:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">@timestamp</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">IP Address</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Method</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Endpoint</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Latency</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Proxy Latency</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status Code</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Success</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.map((log, index) => (
                      <React.Fragment key={log.id}>
                        <tr 
                          className={`hover:bg-gray-50 transition-all duration-200 cursor-pointer ${
                            index === 0 && isRealTime ? 'animate-slide-down bg-blue-50 border-l-4 border-blue-400' : ''
                          }`}
                          onClick={(e) => handleRowClick(log, e)}
                        >
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-mono text-gray-600">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-mono text-gray-900">{log.ip}</td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            <span className={`px-2 lg:px-2.5 py-1 rounded-lg text-xs font-semibold ${getMethodBadge(log.method)}`}>
                              {log.method}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-mono text-gray-900">{log.endpoint}</td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm">
                            <span className={`font-medium ${
                              log.latency > 1000 ? 'text-red-600' : 
                              log.latency > 500 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {(log.latency / 1000).toFixed(2)} Secs
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm">
                            <span className={`font-medium ${
                              log.proxyLatency > 100 ? 'text-red-600' : 
                              log.proxyLatency > 50 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {(log.proxyLatency / 1000).toFixed(2)} Secs
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            <span className={`px-2 lg:px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {log.success ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                            <button
                              onClick={(e) => handleActionClick(log, e)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4 lg:w-5 lg:h-5" />
                            </button>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-gray-50 px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                  <p className="text-xs lg:text-sm text-gray-600">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredLogs.length}</span> of{' '}
                    <span className="font-medium">{logs.length}</span> results
                  </p>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 text-xs lg:text-sm border border-gray-300 rounded-md hover:bg-white transition-colors disabled:opacity-50">
                      Previous
                    </button>
                    <span className="px-3 py-1.5 text-xs lg:text-sm bg-blue-600 text-white rounded-md">1</span>
                    <button className="px-3 py-1.5 text-xs lg:text-sm border border-gray-300 rounded-md hover:bg-white transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inspector Panel - Slide-in Sheet */}
        {selectedLog && (
          <>
            {/* Dark Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
              onClick={() => setSelectedLog(null)}
            />
            
            {/* Slide-in Panel */}
            <div className="fixed inset-y-0 right-0 w-80 lg:w-96 bg-white shadow-2xl z-50 animate-slide-in-right overflow-y-auto">
              <div className="p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">Request Details</h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-2 hover:bg-white hover:bg-opacity-70 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Request</label>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-lg text-xs lg:text-sm font-semibold ${getMethodBadge(selectedLog.method)}`}>
                        {selectedLog.method}
                      </span>
                      <span className="font-mono text-xs lg:text-sm text-gray-900 break-all">{selectedLog.endpoint}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Response</label>
                    <span className={`inline-block px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-lg text-xs lg:text-sm font-semibold ${getStatusBadge(selectedLog.status)}`}>
                      {selectedLog.status}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Client Information</label>
                    <div className="space-y-2 lg:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs lg:text-sm text-gray-600">IP Address</span>
                        <span className="font-mono text-xs lg:text-sm text-gray-900">{selectedLog.ip}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs lg:text-sm text-gray-600">Location</span>
                        <span className="text-xs lg:text-sm text-gray-900">{selectedLog.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs lg:text-sm text-gray-600">User Agent</span>
                        <span className="text-xs lg:text-sm text-gray-900 truncate">{selectedLog.userAgent}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Performance</label>
                    <div className="space-y-2 lg:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs lg:text-sm text-gray-600">Request Latency</span>
                        <span className={`font-medium text-xs lg:text-sm ${
                          selectedLog.latency > 1000 ? 'text-red-600' : 
                          selectedLog.latency > 500 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {(selectedLog.latency / 1000).toFixed(2)} Secs
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs lg:text-sm text-gray-600">Proxy Latency</span>
                        <span className="font-medium text-xs lg:text-sm text-gray-900">
                          {(selectedLog.proxyLatency / 1000).toFixed(2)} Secs
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs lg:text-sm text-gray-600">Response Size</span>
                        <span className="font-mono text-xs lg:text-sm text-gray-900">{(selectedLog.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs lg:text-sm text-gray-600">Success</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedLog.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedLog.success ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Request Headers</label>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Content-Type</span>
                        <span className="text-xs font-mono text-gray-900">application/json</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Accept</span>
                        <span className="text-xs font-mono text-gray-900">application/json</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Authorization</span>
                        <span className="text-xs font-mono text-gray-900">Bearer ***</span>
                      </div>
                    </div>
                  </div>

                  {selectedLog.tags.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Smart Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedLog.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Timeline</label>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900">Request Received</p>
                          <p className="text-xs text-gray-600">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900">Response Sent</p>
                          <p className="text-xs text-gray-600">
                            {new Date(new Date(selectedLog.timestamp).getTime() + selectedLog.latency).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 lg:pt-6 border-t border-gray-200 space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 lg:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25 text-sm lg:text-base">
                    <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="font-medium">View Full Request</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm lg:text-base">
                    <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="font-medium">Export Request</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        
        @keyframes marquee {
          0% {
            transform: translate3d(100%, 0, 0);
          }
          100% {
            transform: translate3d(-100%, 0, 0);
          }
        }
        
        .animate-slide-down {
          animation: slideDown 0.6s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.4s ease-out;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default APILogsDashboard;