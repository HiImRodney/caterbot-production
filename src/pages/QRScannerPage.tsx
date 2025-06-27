import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, QrCode, AlertCircle, CheckCircle, X, Settings, Zap, ArrowLeft } from 'lucide-react'
import { useEquipment } from '../contexts/EquipmentContext'
import { getEquipmentByQRCode, EquipmentContext } from '../lib/supabase'

interface ScanResult {
  success: boolean
  equipment?: EquipmentContext
  error?: string
  timestamp: Date
}

const QRScannerPage: React.FC = () => {
  const navigate = useNavigate()
  const { startTroubleshooting, setIsLoading } = useEquipment()
  
  // State management
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<Array<{code: string, name: string}>>([])

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // TOCA Test Equipment for autocomplete
  const availableEquipment = [
    { code: 'CB-PREC-PPC410-TOCA1-001', name: 'Pizza Station Prep Counter' },
    { code: 'CB-PREC-PPC307-TOCA1-001', name: 'Main Prep Counter' },
    { code: 'CB-PREC-HPU153-TOCA1-001', name: 'Cold Storage Unit 1' },
    { code: 'CB-COOK-CVN608-TOCA1-001', name: 'Convection Oven Main' },
    { code: 'CB-COOK-DFR512-TOCA1-001', name: 'Deep Fryer Station' },
    { code: 'CB-COOK-GRL205-TOCA1-001', name: 'Char Grill' },
    { code: 'CB-REFR-WIF315-TOCA1-001', name: 'Walk-in Freezer' },
    { code: 'CB-REFR-WIC318-TOCA1-001', name: 'Walk-in Cooler' },
    { code: 'CB-WASH-DWM825-TOCA1-001', name: 'Dishwasher Main' },
    { code: 'CB-ICE-ICM190-TOCA1-001', name: 'Ice Machine' }
  ]

  // Request camera permission and start scanning
  const startScanning = async () => {
    try {
      setIsLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      streamRef.current = stream
      setHasPermission(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      
      setIsScanning(true)
      startQRCodeDetection()
    } catch (error) {
      console.error('Camera access error:', error)
      setHasPermission(false)
      setScanResult({
        success: false,
        error: 'Camera access denied. Please enable camera permissions or use manual input.',
        timestamp: new Date()
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Stop scanning and cleanup
  const stopScanning = () => {
    setIsScanning(false)
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // QR Code detection using simple canvas scanning
  const startQRCodeDetection = () => {
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        
        if (ctx && video.videoWidth > 0) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          // Simple QR detection simulation (in real app, use jsQR library)
          // For demo, we'll simulate detection after 3 seconds
          setTimeout(() => {
            if (isScanning) {
              simulateQRDetection()
            }
          }, 3000)
        }
      }
    }, 100)
  }

  // Simulate QR code detection (replace with real QR library)
  const simulateQRDetection = () => {
    const testQRCode = 'CB-COOK-CVN608-TOCA1-001' // Test with convection oven
    handleQRCodeDetected(testQRCode)
  }

  // Handle QR code detection
  const handleQRCodeDetected = async (qrCode: string) => {
    setIsScanning(false)
    setIsLoading(true)
    
    try {
      const equipment = await getEquipmentByQRCode(qrCode)
      
      if (equipment) {
        setScanResult({
          success: true,
          equipment,
          timestamp: new Date()
        })
      } else {
        setScanResult({
          success: false,
          error: `No equipment found with QR code: ${qrCode}`,
          timestamp: new Date()
        })
      }
    } catch (error) {
      setScanResult({
        success: false,
        error: 'Failed to lookup equipment. Please try again.',
        timestamp: new Date()
      })
    } finally {
      setIsLoading(false)
      stopScanning()
    }
  }

  // Handle manual QR input
  const handleManualSubmit = async () => {
    if (manualCode.trim()) {
      await handleQRCodeDetected(manualCode.trim())
      setManualCode('')
      setShowManualInput(false)
    }
  }

  // Handle manual input changes for autocomplete
  const handleManualInputChange = (value: string) => {
    setManualCode(value)
    
    if (value.length > 2) {
      const filtered = availableEquipment.filter(item =>
        item.code.toLowerCase().includes(value.toLowerCase()) ||
        item.name.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  // Start troubleshooting with equipment
  const handleStartTroubleshooting = async (equipment: EquipmentContext) => {
    try {
      setIsLoading(true)
      const sessionId = await startTroubleshooting(equipment)
      navigate(`/chat/${sessionId}`)
    } catch (error) {
      console.error('Failed to start troubleshooting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  // Render scanning interface
  const renderScanningInterface = () => (
    <div className="relative h-96 bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Scanning overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 border-2 border-white rounded-lg relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setTorchEnabled(!torchEnabled)}
          className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
        >
          {torchEnabled ? <Zap size={20} /> : <Zap size={20} className="text-gray-400" />}
        </button>
        <button
          onClick={stopScanning}
          className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )

  // Render equipment card
  const renderEquipmentCard = (equipment: EquipmentContext) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{equipment.custom_name}</h3>
          <p className="text-gray-600">{equipment.make} {equipment.model}</p>
          <p className="text-sm text-gray-500">{equipment.site_name} • {equipment.location}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          equipment.status === 'operational' ? 'bg-green-100 text-green-800' :
          equipment.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <span className="font-medium text-gray-700">Serial Number:</span>
          <p className="text-gray-900">{equipment.serial_number}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">QR Code:</span>
          <p className="text-gray-900 font-mono text-xs">{equipment.qr_code}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={() => handleStartTroubleshooting(equipment)}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          🤖 Start Troubleshooting
        </button>
        <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors">
          📋 View History
        </button>
      </div>
    </div>
  )

  // Render scan result
  const renderScanResult = () => {
    if (!scanResult) return null

    if (scanResult.success && scanResult.equipment) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <CheckCircle size={20} />
            Equipment Found!
          </div>
          {renderEquipmentCard(scanResult.equipment)}
          <button
            onClick={() => {
              setScanResult(null)
              setIsScanning(true)
              startScanning()
            }}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Scan Another QR Code
          </button>
        </div>
      )
    } else {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600 font-medium">
            <AlertCircle size={20} />
            Scan Failed
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{scanResult.error}</p>
          </div>
          <button
            onClick={() => {
              setScanResult(null)
              setIsScanning(true)
              startScanning()
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Equipment Scanner</h1>
          </div>
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Manual Input Section */}
        {showManualInput && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 relative">
            <h3 className="font-medium text-gray-900 mb-3">Manual QR Code Entry</h3>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => handleManualInputChange(e.target.value)}
                  onFocus={() => {
                    if (manualCode.length > 0 && filteredSuggestions.length > 0) {
                      setShowSuggestions(true)
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 150)
                  }}
                  placeholder="Type equipment name or QR code..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {/* Autocomplete suggestions */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredSuggestions.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setManualCode(item.code)
                          setShowSuggestions(false)
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500 font-mono">{item.code}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Lookup Equipment
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!scanResult && (
          <div className="space-y-6">
            {isScanning ? (
              <div className="space-y-4">
                {renderScanningInterface()}
                <div className="text-center">
                  <p className="text-gray-600">Position QR code within the frame</p>
                  <p className="text-sm text-gray-500">The camera will automatically detect the code</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <QrCode size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Scan Equipment QR Code</h3>
                  <p className="text-gray-600 mb-4">Point your camera at the QR code on the equipment</p>
                  
                  {hasPermission === false ? (
                    <div className="space-y-3">
                      <p className="text-red-600 text-sm">Camera access required for scanning</p>
                      <button
                        onClick={startScanning}
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Enable Camera
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={startScanning}
                      className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
                    >
                      <Camera className="mr-2" size={20} />
                      Start Scanning
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scan Results */}
        {scanResult && renderScanResult()}
      </div>
    </div>
  )
}

export default QRScannerPage