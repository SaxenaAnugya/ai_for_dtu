/**
 * Service for interacting with Gemini AI API
 */

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface GeminiResponse {
  response: string
  success: boolean
  error?: string
}

export interface BookRecommendation {
  title: string
  author: string
  subject: string
  reason: string
}

export interface RecommendationsResponse {
  recommendations: BookRecommendation[]
  text?: string
  success: boolean
  error?: string
}

// API Base URL - change this if your server runs on a different port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Check if API server is running
 */
async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3 second timeout
    })
    return response.ok
  } catch {
    return false
  }
}

export const geminiService = {
  /**
   * Send a chat message to Gemini AI
   */
  async chat(message: string, history: ChatMessage[] = []): Promise<GeminiResponse> {
    // Check if API is available first
    const isApiRunning = await checkApiHealth()
    if (!isApiRunning) {
      return {
        response: '⚠️ API server is not running. Please start the API server:\n\n1. Open terminal in the project root\n2. Run: python api/gemini_api.py\n3. Make sure the server is running on http://localhost:5000',
        success: false,
        error: 'API server not available',
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            response: 'Request timed out. The API server might be slow or unresponsive.',
            success: false,
            error: 'Timeout',
          }
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return {
            response: '⚠️ Cannot connect to API server. Please make sure:\n\n1. The API server is running (python api/gemini_api.py)\n2. The server is accessible at http://localhost:5000\n3. No firewall is blocking the connection',
            success: false,
            error: error.message,
          }
        }
      }
      
      return {
        response: 'Sorry, I encountered an error. Please try again later.',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },

  /**
   * Get AI-powered book recommendations
   */
  async getRecommendations(query: string): Promise<RecommendationsResponse> {
    // Check if API is available first
    const isApiRunning = await checkApiHealth()
    if (!isApiRunning) {
      return {
        recommendations: [],
        success: false,
        error: 'API server not available. Please start the API server.',
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error calling Gemini recommend API:', error)
      return {
        recommendations: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
}

