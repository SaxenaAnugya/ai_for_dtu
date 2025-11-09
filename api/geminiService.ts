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

const API_BASE_URL = 'http://localhost:5000'

export const geminiService = {
  /**
   * Send a chat message to Gemini AI
   */
  async chat(message: string, history: ChatMessage[] = []): Promise<GeminiResponse> {
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
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error calling Gemini API:', error)
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
        }),
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

