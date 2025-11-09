export interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  callNumber: string
  category: string
  availability: 'available' | 'issued' | 'reserved'
  popularity: number
  issueDate?: string
  dueDate?: string
  fine?: number
  branch?: string
  year?: string
  semester?: string
  publisher?: string
  similarityScore?: number
  matchedFields?: string[]
  location?: {
    section: string
    shelf: string
    coordinates: { x: number; y: number }
  }
}

export interface IssuedBook extends Book {
  issueDate: string
  dueDate: string
  remainingDays: number
  fine: number
  urgency: 'safe' | 'warning' | 'danger'
}

export interface Recommendation {
  id: string
  title: string
  author: string
  reason: string
  category: string
  branch?: string
  year?: string
  semester?: string
  publisher?: string
  matchedFields?: string[]
}

export interface LibrarySection {
  id: string
  name: string
  category: string
  coordinates: { x: number; y: number }
  books: string[]
}

export interface Route {
  from: { x: number; y: number }
  to: { x: number; y: number }
  path: Array<{ x: number; y: number }>
  distance: number
}

