import React from 'react'
import { Link } from 'react-router-dom'
import { QrCode, Wrench, BarChart3, Bot } from 'lucide-react'

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-md w-full space-y-8 p-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CaterBot</h1>
          <p className="text-lg text-gray-600">AI-Powered Equipment Assistant</p>
          <p className="text-sm text-gray-500 mt-2">Professional troubleshooting for commercial kitchens</p>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <Link 
            to="/scan" 
            className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <QrCode className="mr-3" size={24} />
            <span className="text-lg font-medium">Scan Equipment QR Code</span>
          </Link>
          
          <Link 
            to="/equipment" 
            className="w-full flex items-center justify-center px-6 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          >
            <Wrench className="mr-3" size={24} />
            <span className="text-lg font-medium">Browse Equipment</span>
          </Link>
          
          <Link 
            to="/dashboard" 
            className="w-full flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            <BarChart3 className="mr-3" size={24} />
            <span className="text-lg font-medium">Manager Dashboard</span>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-sm font-medium text-gray-700">Instant Help</div>
            <div className="text-xs text-gray-500">AI-powered responses</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">🛡️</div>
            <div className="text-sm font-medium text-gray-700">Safety First</div>
            <div className="text-xs text-gray-500">Professional guidance</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-sm font-medium text-gray-700">Mobile Ready</div>
            <div className="text-xs text-gray-500">Works on any device</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-sm font-medium text-gray-700">Cost Tracking</div>
            <div className="text-xs text-gray-500">Monitor expenses</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>TOCA Test Kitchen</p>
          <p>© 2025 CaterBot - Professional Equipment Support</p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage