import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = "AIzaSyAoD8aJJ32aVWj4bF9brGzyrIyvpFB0QwM" // safer with Vite env vars
const genAI = new GoogleGenerativeAI(apiKey)

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface GeminiResponse {
  response?: string
  success: boolean
  error?: string
}

export const geminiService = {
  chat: async (input: string, history: ChatMessage[] = []): Promise<GeminiResponse> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

      const formattedHistory = history.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }))

      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: { temperature: 0.7 },
      })

      const result = await chat.sendMessage(input)
      const text = result.response.text()

      return { success: true, response: text }
    } catch (error: any) {
      console.error("Gemini chat error:", error)
      return { success: false, error: error.message || "Unknown error" }
    }
  },
}
