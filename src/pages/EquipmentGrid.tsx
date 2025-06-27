import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Filter, Wrench, AlertCircle, CheckCircle } from 'lucide-react'
import { useEquipment } from '../contexts/EquipmentContext'
import { getSiteEquipment } from '../lib/supabase'

interface Equipment {
  id: string
  qr_code: string
  custom_name: string
  location: string
  make: string
  model: string
  status: 'operational' | 'maintenance' | 'broken'
  equipment_catalog?: {
    equipment_type: string
    category: string
  }
}

const EquipmentGrid: React.FC = () => {
  const navigate = useNavigate()
  const { startTroubleshooting, setIsLoading } = useEquipment()
  
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const data = await getSiteEquipment()
      setEquipment(data || [])
    } catch (error) {
      console.error('Error fetching equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter equipment based on search and filters
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = 
      item.custom_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || 
      item.equipment_catalog?.category === filterCategory
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get unique categories for filter
  const categories = [...new Set(equipment.map(item => item.equipment_catalog?.category).filter(Boolean))]

  // Handle equipment selection
  const handleEquipmentSelect = async (selectedEquipment: Equipment) => {
    try {
      setIsLoading(true)
      
      // Convert to EquipmentContext format
      const equipmentContext = {
        id: selectedEquipment.id,
        qr_code: selectedEquipment.qr_code,
        custom_name: selectedEquipment.custom_name,
        location: selectedEquipment.location,
        make: selectedEquipment.make,
        model: selectedEquipment.model,
        serial_number: '', // TODO: Add serial number to query
        status: selectedEquipment.status,
        equipment_type: selectedEquipment.equipment_catalog?.equipment_type || 'Unknown',
        site_name: 'TOCA Test Kitchen'
      }
      
      const sessionId = await startTroubleshooting(equipmentContext)
      navigate(`/chat/${sessionId}`)
    } catch (error) {
      console.error('Failed to start troubleshooting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Render equipment card
  const renderEquipmentCard = (item: Equipment) => {
    const statusConfig = {
      operational: { 
        icon: CheckCircle, 
        color: 'text-green-600', 
        bg: 'bg-green-100',
        label: 'Operational' 
      },
      maintenance: { 
        icon: AlertCircle, 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-100',
        label: 'Maintenance' 
      },
      broken: { 
        icon: AlertCircle, 
        color: 'text-red-600', 
        bg: 'bg-red-100',
        label: 'Broken' 
      }
    }

    const config = statusConfig[item.status]
    const StatusIcon = config.icon

    return (
      <div
        key={item.id}
        onClick={() => handleEquipmentSelect(item)}
        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{item.custom_name}</h3>
            <p className="text-gray-600 text-sm">{item.make} {item.model}</p>
          </div>
          <div className={`p-2 rounded-full ${config.bg}`}>
            <StatusIcon size={16} className={config.color} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Location:</span>
            <span className="text-gray-900 font-medium">{item.location}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Type:</span>
            <span className="text-gray-900">{item.equipment_catalog?.equipment_type || 'Unknown'}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Status:</span>
            <span className={`${config.color} font-medium`}>{config.label}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <button className="w-full bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center text-sm font-medium">
            <Wrench size={16} className="mr-2" />
            Start Troubleshooting
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading equipment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Equipment Overview</h1>
                <p className="text-sm text-gray-600">TOCA Test Kitchen • {equipment.length} items</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category?.charAt(0).toUpperCase() + category?.slice(1)}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="operational">Operational</option>
              <option value="maintenance">Maintenance</option>
              <option value="broken">Broken</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredEquipment.length === 0 ? (
          <div className="text-center py-12">
            <Filter size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
            <p className="text-gray-600">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No equipment available for this site'
              }
            </p>
            {(searchTerm || filterCategory !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterCategory('all')
                  setFilterStatus('all')
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map(renderEquipmentCard)}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {equipment.filter(e => e.status === 'operational').length}
              </div>
              <div className="text-sm text-gray-600">Operational</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {equipment.filter(e => e.status === 'maintenance').length}
              </div>
              <div className="text-sm text-gray-600">Maintenance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {equipment.filter(e => e.status === 'broken').length}
              </div>
              <div className="text-sm text-gray-600">Broken</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EquipmentGrid