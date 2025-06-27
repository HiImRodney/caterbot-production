import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Clock,
  DollarSign,
  Wrench,
  MessageSquare,
  Calendar
} from 'lucide-react'

interface DashboardStats {
  totalEquipment: number
  activeIssues: number
  resolvedToday: number
  avgResponseTime: string
  totalCostSaved: number
  staffActive: number
}

interface RecentActivity {
  id: string
  type: 'chat' | 'maintenance' | 'alert'
  equipment: string
  user: string
  timestamp: string
  status: 'active' | 'resolved' | 'escalated'
  message: string
}

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate()
  
  const [stats, setStats] = useState<DashboardStats>({
    totalEquipment: 22,
    activeIssues: 3,
    resolvedToday: 8,
    avgResponseTime: '2.3 min',
    totalCostSaved: 2450,
    staffActive: 4
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'chat',
      equipment: 'Convection Oven Main',
      user: 'Sarah M.',
      timestamp: '10 min ago',
      status: 'active',
      message: 'Temperature not reaching set point'
    },
    {
      id: '2',
      type: 'maintenance',
      equipment: 'Ice Machine',
      user: 'Mike T.',
      timestamp: '25 min ago',
      status: 'resolved',
      message: 'Cleaned ice maker filters - resolved'
    },
    {
      id: '3',
      type: 'alert',
      equipment: 'Walk-in Cooler',
      user: 'System',
      timestamp: '1 hour ago',
      status: 'escalated',
      message: 'Temperature alarm triggered'
    },
    {
      id: '4',
      type: 'chat',
      equipment: 'Deep Fryer Station',
      user: 'Alex K.',
      timestamp: '1.5 hours ago',
      status: 'resolved',
      message: 'Oil quality check completed'
    }
  ])

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeIssues: Math.max(0, prev.activeIssues + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0))
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: React.ElementType,
    trend?: string,
    trendUp?: boolean,
    color: string = 'blue'
  ) => {
    const Icon = icon
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600'
    }

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${
                trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp size={16} className={`mr-1 ${!trendUp ? 'rotate-180' : ''}`} />
                {trend}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon size={24} />
          </div>
        </div>
      </div>
    )
  }

  const renderActivityItem = (activity: RecentActivity) => {
    const typeIcons = {
      chat: MessageSquare,
      maintenance: Wrench,
      alert: AlertTriangle
    }

    const statusColors = {
      active: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      escalated: 'bg-red-100 text-red-800'
    }

    const Icon = typeIcons[activity.type]

    return (
      <div key={activity.id} className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Icon size={16} className="text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900">{activity.equipment}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusColors[activity.status]
                }`}>
                  {activity.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{activity.message}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{activity.user}</span>
                <span>{activity.timestamp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                <p className="text-sm text-gray-600">TOCA Test Kitchen • Real-time overview</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Live data
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {renderStatCard(
            'Total Equipment',
            stats.totalEquipment,
            Wrench,
            undefined,
            undefined,
            'blue'
          )}
          {renderStatCard(
            'Active Issues',
            stats.activeIssues,
            AlertTriangle,
            stats.activeIssues > 5 ? '+12%' : '-8%',
            stats.activeIssues <= 5,
            stats.activeIssues > 5 ? 'red' : 'green'
          )}
          {renderStatCard(
            'Resolved Today',
            stats.resolvedToday,
            BarChart3,
            '+15%',
            true,
            'green'
          )}
          {renderStatCard(
            'Avg Response Time',
            stats.avgResponseTime,
            Clock,
            '-0.5 min',
            true,
            'purple'
          )}
          {renderStatCard(
            'Cost Saved',
            `£${stats.totalCostSaved}`,
            DollarSign,
            '+£340',
            true,
            'green'
          )}
          {renderStatCard(
            'Staff Active',
            stats.staffActive,
            Users,
            undefined,
            undefined,
            'blue'
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700">View all</button>
            </div>
            <div className="space-y-3">
              {recentActivity.map(renderActivityItem)}
            </div>
          </div>

          {/* Equipment Status Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipment Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="font-medium text-gray-900">Operational</span>
                </div>
                <span className="text-lg font-bold text-green-600">18</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  <span className="font-medium text-gray-900">Maintenance</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">3</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="font-medium text-gray-900">Broken</span>
                </div>
                <span className="text-lg font-bold text-red-600">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <MessageSquare className="mx-auto mb-2 text-gray-600" size={24} />
              <span className="text-sm font-medium text-gray-700">View All Chats</span>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <Calendar className="mx-auto mb-2 text-gray-600" size={24} />
              <span className="text-sm font-medium text-gray-700">Schedule Maintenance</span>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <BarChart3 className="mx-auto mb-2 text-gray-600" size={24} />
              <span className="text-sm font-medium text-gray-700">Cost Analysis</span>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <Users className="mx-auto mb-2 text-gray-600" size={24} />
              <span className="text-sm font-medium text-gray-700">Staff Training</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard