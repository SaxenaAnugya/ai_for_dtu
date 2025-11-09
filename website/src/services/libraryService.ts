import { Book, IssuedBook, Recommendation } from '../types'
import { 
  searchSimilarBooks, 
  getBooksBySubject, 
  getBooksByBranch,
  getRecommendationsByBook,
  getAllSubjects,
  getAllBranches
} from './bookSearchService'

// Mock data - In production, this would fetch from your backend/API
const MOCK_ISSUED_BOOKS: IssuedBook[] = [
  {
    id: '1',
    title: 'DIGITAL LOGIC AND COMPUTER DESIGN',
    author: 'M. Morris Mano',
    callNumber: '005.43 MAN',
    category: 'Computer Science',
    availability: 'issued',
    popularity: 85,
    issueDate: '2025-01-15',
    dueDate: '2025-02-15',
    remainingDays: 20,
    fine: 0,
    urgency: 'safe'
  },
  {
    id: '2',
    title: 'OPERATING SYSTEM CONCEPTS',
    author: 'SILBERSCHATZ, ABRAHAM',
    callNumber: '005.43 SIL',
    category: 'Computer Science',
    availability: 'issued',
    popularity: 92,
    issueDate: '2025-01-10',
    dueDate: '2025-02-05',
    remainingDays: 5,
    fine: 0,
    urgency: 'warning'
  }
]

const MOCK_BOOKS: Book[] = [
  {
    id: '3',
    title: 'Software Engineering: A Practitioner\'s Approach',
    author: 'Pressman, Roger S.',
    callNumber: '005.1 PRE',
    category: 'Software Engineering',
    availability: 'available',
    popularity: 78
  },
  {
    id: '4',
    title: 'Software Engineering',
    author: 'Sommerville, Ian',
    callNumber: '005.1 SOM',
    category: 'Software Engineering',
    availability: 'available',
    popularity: 82
  },
  {
    id: '5',
    title: 'Fundamentals of Software Engineering',
    author: 'Rajib Mall',
    callNumber: '005.1 MAL',
    category: 'Software Engineering',
    availability: 'issued',
    popularity: 75
  }
]

export const libraryService = {
  // Fetch issued books (would call your scraper API)
  async getIssuedBooks(): Promise<IssuedBook[]> {
    // In production: return await fetch('/api/issued-books').then(r => r.json())
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ISSUED_BOOKS), 500)
    })
  },

  // Search books
  async searchBooks(query: string): Promise<Book[]> {
    // In production: return await fetch(`/api/search?q=${query}`).then(r => r.json())
    const lowerQuery = query.toLowerCase()
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = MOCK_BOOKS.filter(
          book =>
            book.title.toLowerCase().includes(lowerQuery) ||
            book.author.toLowerCase().includes(lowerQuery) ||
            book.category.toLowerCase().includes(lowerQuery)
        )
        resolve(results)
      }, 300)
    })
  },

  // Get recommendations using similarity search from books.json
  async getRecommendations(category?: string, searchQuery?: string): Promise<Recommendation[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results: Recommendation[] = []
        
        if (searchQuery) {
          // Use similarity search
          const similarBooks = searchSimilarBooks(searchQuery, 10)
          results = similarBooks.map((result, idx) => ({
            id: `rec-${idx}`,
            title: result.book.title,
            author: result.book.author,
            reason: `Similar to "${searchQuery}" (${(result.score * 100).toFixed(0)}% match)`,
            category: result.book.subject,
            branch: result.book.branch,
            year: result.book.year,
            semester: result.book.semester,
            publisher: result.book.publisher,
            matchedFields: result.matchedFields
          }))
        } else if (category) {
          // Get books by subject/category
          const books = getBooksBySubject(category)
          results = books.slice(0, 10).map((book, idx) => ({
            id: `rec-${idx}`,
            title: book.title,
            author: book.author,
            reason: `Recommended for ${category}`,
            category: book.subject,
            branch: book.branch,
            year: book.year,
            semester: book.semester,
            publisher: book.publisher
          }))
        } else {
          // Get popular books from CSE branch
          const cseBooks = getBooksByBranch('CSE')
          results = cseBooks.slice(0, 10).map((book, idx) => ({
            id: `rec-${idx}`,
            title: book.title,
            author: book.author,
            reason: `Popular in ${book.branch} branch`,
            category: book.subject,
            branch: book.branch,
            year: book.year,
            semester: book.semester,
            publisher: book.publisher
          }))
        }
        
        resolve(results)
      }, 300)
    })
  },

  // Get recommendations based on a specific book
  async getRecommendationsByBook(bookTitle: string): Promise<Recommendation[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const books = getRecommendationsByBook(bookTitle, 5)
        const results: Recommendation[] = books.map((book, idx) => ({
          id: `rec-book-${idx}`,
          title: book.title,
          author: book.author,
          reason: `Similar subject to "${bookTitle}"`,
          category: book.subject,
          branch: book.branch,
          year: book.year,
          semester: book.semester,
          publisher: book.publisher
        }))
        resolve(results)
      }, 300)
    })
  },

  // Search books using similarity search
  async searchBooksSimilar(query: string): Promise<Book[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = searchSimilarBooks(query, 20)
        const books: Book[] = results.map((result, idx) => ({
          id: `book-${idx}`,
          title: result.book.title,
          author: result.book.author,
          callNumber: `TBD-${result.book.subject.substring(0, 3).toUpperCase()}`,
          category: result.book.subject,
          availability: 'available' as const,
          popularity: Math.round(result.score * 100)
        }))
        resolve(books)
      }, 300)
    })
  },

  // Sync to Google Calendar
  async syncToGoogleCalendar(books: IssuedBook[]): Promise<boolean> {
    // In production: return await fetch('/api/sync-calendar', { method: 'POST', body: JSON.stringify(books) }).then(r => r.ok)
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000)
    })
  }
}

