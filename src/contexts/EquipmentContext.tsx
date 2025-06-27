import React, { createContext, useContext, useState, ReactNode } from 'react'
import { EquipmentContext as Equipment } from '../lib/supabase'

interface EquipmentContextType {
  currentEquipment: Equipment | null
  setCurrentEquipment: (equipment: Equipment | null) => void
  scanHistory: Equipment[]
  addToScanHistory: (equipment: Equipment) => void
  startTroubleshooting: (equipment: Equipment) => Promise<string>
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined)

export const EquipmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentEquipment, setCurrentEquipment] = useState<Equipment | null>(null)
  const [scanHistory, setScanHistory] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addToScanHistory = (equipment: Equipment) => {
    setScanHistory(prev => {
      const exists = prev.find(item => item.id === equipment.id)
      if (exists) return prev
      return [equipment, ...prev.slice(0, 9)] // Keep last 10 scans
    })
  }

  const startTroubleshooting = async (equipment: Equipment): Promise<string> => {
    setCurrentEquipment(equipment)
    addToScanHistory(equipment)
    
    // Create a new chat session ID (could integrate with Supabase later)
    const sessionId = `session_${equipment.id}_${Date.now()}`
    
    return sessionId
  }

  return (
    <EquipmentContext.Provider value={{
      currentEquipment,
      setCurrentEquipment,
      scanHistory,
      addToScanHistory,
      startTroubleshooting,
      isLoading,
      setIsLoading
    }}>
      {children}
    </EquipmentContext.Provider>
  )
}

export const useEquipment = () => {
  const context = useContext(EquipmentContext)
  if (!context) {
    throw new Error('useEquipment must be used within EquipmentProvider')
  }
  return context
}