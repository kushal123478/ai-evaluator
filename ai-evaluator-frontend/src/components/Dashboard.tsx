import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FileText, CheckCircle, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';

interface DashboardStats {
  overview: {
    totalDocuments: number;
    totalFeedbacks: number;
    accuracyRate: number;
    avgConfidenceScore: number;
  };
  fieldAccuracy: Array<{
    fieldPath: string;
    fieldName: string;
    total: number;
    correct: number;
    accuracy: number;
  }>;
  recentActivity: Array<{
    id: string;
    fieldName: string;
    isCorrect: boolean;
    createdAt: string;
    document: {
      originalName: string;
    };
  }>;
}

interface AccuracyTrend {
  date: string;
  accuracy: number;
  total: number;
}

interface FieldPerformance {
  fieldName: string;
  total: number;
  correct: number;
  accuracy: number;
  avgConfidence: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [accuracyTrend, setAccuracyTrend] = useState<AccuracyTrend[]>([]);
  const [fieldPerformance, setFieldPerformance] = useState<FieldPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, trendRes, performanceRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/accuracy-trend?days=30'),
        fetch('/api/dashboard/field-performance')
      ]);

      const [statsData, trendData, performanceData] = await Promise.all([
        statsRes.json(),
        trendRes.json(),
        performanceRes.json()
      ]);

      setStats(statsData);
      setAccuracyTrend(trendData);
      setFieldPerformance(performanceData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <div className="text-gray-600">Failed to load dashboard data</div>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const accuracyDistribution = [
    { name: 'Correct', value: stats.overview.totalFeedbacks * (stats.overview.accuracyRate / 100) },
    { name: 'Incorrect', value: stats.overview.totalFeedbacks * (1 - stats.overview.accuracyRate / 100) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center mr-4 shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              AI Accuracy Dashboard
            </h1>
            <p className="text-gray-600">Real-time analytics and performance metrics</p>
          </div>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 p-6 overflow-hidden transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50"></div>
            <div className="relative flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className="text-3xl font-bold text-gray-900">{stats.overview.totalDocuments}</div>
                <div className="text-sm font-medium text-gray-600">Total Documents</div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 p-6 overflow-hidden transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 opacity-50"></div>
            <div className="relative flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className="text-3xl font-bold text-gray-900">{stats.overview.totalFeedbacks}</div>
                <div className="text-sm font-medium text-gray-600">Total Feedbacks</div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 p-6 overflow-hidden transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 opacity-50"></div>
            <div className="relative flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className="text-3xl font-bold text-gray-900">{stats.overview.accuracyRate}%</div>
                <div className="text-sm font-medium text-gray-600">Accuracy Rate</div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 p-6 overflow-hidden transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-50"></div>
            <div className="relative flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className="text-3xl font-bold text-gray-900">{stats.overview.avgConfidenceScore}</div>
                <div className="text-sm font-medium text-gray-600">Avg Confidence</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Accuracy Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Accuracy Trend (30 Days)</h2>
            <LineChart width={500} height={300} data={accuracyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </div>

          {/* Accuracy Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Accuracy Distribution</h2>
            <PieChart width={500} height={300}>
              <Pie
                data={accuracyDistribution}
                cx={250}
                cy={150}
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {accuracyDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Field Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Field Performance</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {fieldPerformance.slice(0, 10).map((field, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{field.fieldName}</div>
                    <div className="text-sm text-gray-600">
                      {field.correct}/{field.total} correct
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${field.accuracy >= 80 ? 'text-green-600' : field.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {field.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Conf: {field.avgConfidence.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  {activity.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {activity.fieldName}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {activity.document.originalName}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};