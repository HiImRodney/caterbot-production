import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for CaterBot database
export interface EquipmentContext {
  id: string
  qr_code: string
  custom_name: string
  location: string
  make: string
  model: string
  serial_number: string
  status: 'operational' | 'maintenance' | 'broken'
  equipment_type: string
  site_name: string
}

export interface ChatMessage {
  id: string
  session_id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
  equipment_context?: EquipmentContext
}

export interface ChatSession {
  id: string
  site_id: string
  equipment_id?: string
  user_id: string
  status: 'active' | 'completed' | 'escalated'
  created_at: string
  updated_at: string
}

// Chat API integration with our Edge Functions
export const sendChatMessage = async (
  message: string, 
  sessionId: string,
  equipmentContext?: EquipmentContext
) => {
  try {
    const { data, error } = await supabase.functions.invoke('master-chat', {
      body: {
        message,
        session_id: sessionId,
        equipment_context: equipmentContext,
        user_id: 'staff-user', // TODO: Get from auth
        site_id: 'TOCA-TEST-001' // TODO: Get from context
      }
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Chat API error:', error)
    throw error
  }
}

// Equipment lookup by QR code
export const getEquipmentByQRCode = async (qrCode: string): Promise<EquipmentContext | null> => {
  try {
    const { data, error } = await supabase
      .from('site_equipment')
      .select(`
        id,
        qr_code,
        custom_name,
        location,
        make,
        model,
        serial_number,
        status,
        equipment_catalog(equipment_type)
      `)
      .eq('qr_code', qrCode)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No equipment found
      }
      throw error
    }

    return {
      id: data.id,
      qr_code: data.qr_code,
      custom_name: data.custom_name,
      location: data.location,
      make: data.make,
      model: data.model,
      serial_number: data.serial_number,
      status: data.status,
      equipment_type: data.equipment_catalog?.equipment_type || 'Unknown',
      site_name: 'TOCA Test Kitchen' // TODO: Get from site data
    }
  } catch (error) {
    console.error('Equipment lookup error:', error)
    throw error
  }
}

// Get all equipment for a site
export const getSiteEquipment = async (siteId: string = 'TOCA-TEST-001') => {
  try {
    const { data, error } = await supabase
      .from('site_equipment')
      .select(`
        id,
        qr_code,
        custom_name,
        location,
        make,
        model,
        status,
        equipment_catalog(equipment_type, category)
      `)
      .eq('site_id', siteId)
      .order('location')

    if (error) throw error
    return data
  } catch (error) {
    console.error('Site equipment fetch error:', error)
    throw error
  }
}

// Create new chat session
export const createChatSession = async (equipmentId?: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        site_id: 'TOCA-TEST-001',
        equipment_id: equipmentId,
        user_id: 'staff-user',
        status: 'active'
      })
      .select('id')
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Create chat session error:', error)
    throw error
  }
}