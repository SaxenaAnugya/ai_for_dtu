// Import books data - adjust path as needed
// In production, this would be loaded from an API
let booksData: any = {}

// Load books.json dynamically
async function loadBooksData() {
  if (Object.keys(booksData).length === 0) {
    try {
      const response = await fetch('/dataji/books.json')
      booksData = await response.json()
    } catch (error) {
      console.error('Failed to load books.json:', error)
      // Fallback to empty object
      booksData = {}
    }
  }
  return booksData
}

interface BookFromJSON {
  title: string
  author: string
  publisher: string
}

interface BookWithContext extends BookFromJSON {
  subject: string
  branch: string
  year: string
  semester: string
  degree: string
}

interface SimilarityResult {
  book: BookWithContext
  score: number
  matchedFields: string[]
}

/**
 * Calculate similarity score between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1.0
  if (s1.includes(s2) || s2.includes(s1)) return 0.8
  
  // Simple word-based similarity
  const words1 = s1.split(/\s+/)
  const words2 = s2.split(/\s+/)
  const commonWords = words1.filter(w => words2.includes(w))
  const totalWords = Math.max(words1.length, words2.length)
  
  if (totalWords === 0) return 0
  return commonWords.length / totalWords
}

/**
 * Flatten the nested books.json structure into a flat array with context
 */
function flattenBooks(): BookWithContext[] {
  const books: BookWithContext[] = []
  
  if (!booksData || Object.keys(booksData).length === 0) {
    return books
  }
  
  for (const [degree, branches] of Object.entries(booksData)) {
    for (const [branch, years] of Object.entries(branches as any)) {
      for (const [year, semesters] of Object.entries(years as any)) {
        for (const [semester, subjects] of Object.entries(semesters as any)) {
          for (const [subject, bookList] of Object.entries(subjects as any)) {
            for (const book of bookList as BookFromJSON[]) {
              books.push({
                ...book,
                subject,
                branch,
                year,
                semester,
                degree
              })
            }
          }
        }
      }
    }
  }
  
  return books
}

/**
 * Search for similar books based on query
 */
export function searchSimilarBooks(
  query: string,
  limit: number = 10
): SimilarityResult[] {
  if (!query || query.trim().length === 0) {
    return []
  }

  // Ensure books data is loaded
  if (Object.keys(booksData).length === 0) {
    console.warn('Books data not loaded yet')
    return []
  }

  const allBooks = flattenBooks()
  const queryLower = query.toLowerCase().trim()
  const queryWords = queryLower.split(/\s+/)
  
  const results: SimilarityResult[] = []

  for (const book of allBooks) {
    let score = 0
    const matchedFields: string[] = []

    // Check title similarity
    const titleScore = calculateSimilarity(queryLower, book.title)
    if (titleScore > 0.3) {
      score += titleScore * 0.5
      matchedFields.push('title')
    }

    // Check author similarity
    const authorScore = calculateSimilarity(queryLower, book.author)
    if (authorScore > 0.3) {
      score += authorScore * 0.3
      matchedFields.push('author')
    }

    // Check subject/category similarity
    const subjectScore = calculateSimilarity(queryLower, book.subject)
    if (subjectScore > 0.3) {
      score += subjectScore * 0.15
      matchedFields.push('subject')
    }

    // Check publisher similarity
    const publisherScore = calculateSimilarity(queryLower, book.publisher)
    if (publisherScore > 0.3) {
      score += publisherScore * 0.05
      matchedFields.push('publisher')
    }

    // Check for keyword matches
    for (const word of queryWords) {
      if (word.length > 2) {
        if (book.title.toLowerCase().includes(word)) {
          score += 0.1
          if (!matchedFields.includes('title')) matchedFields.push('title')
        }
        if (book.author.toLowerCase().includes(word)) {
          score += 0.05
          if (!matchedFields.includes('author')) matchedFields.push('author')
        }
        if (book.subject.toLowerCase().includes(word)) {
          score += 0.05
          if (!matchedFields.includes('subject')) matchedFields.push('subject')
        }
      }
    }

    if (score > 0.2 && matchedFields.length > 0) {
      results.push({
        book,
        score,
        matchedFields
      })
    }
  }

  // Sort by score (highest first) and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Get books by subject/category
 */
export function getBooksBySubject(subject: string): BookWithContext[] {
  if (Object.keys(booksData).length === 0) return []
  const allBooks = flattenBooks()
  return allBooks.filter(
    book => book.subject.toLowerCase().includes(subject.toLowerCase())
  )
}

/**
 * Get books by branch
 */
export function getBooksByBranch(branch: string): BookWithContext[] {
  if (Object.keys(booksData).length === 0) return []
  const allBooks = flattenBooks()
  return allBooks.filter(
    book => book.branch.toLowerCase() === branch.toLowerCase()
  )
}

/**
 * Get all unique subjects
 */
export function getAllSubjects(): string[] {
  if (Object.keys(booksData).length === 0) return []
  const allBooks = flattenBooks()
  const subjects = new Set(allBooks.map(book => book.subject))
  return Array.from(subjects).sort()
}

/**
 * Get all unique branches
 */
export function getAllBranches(): string[] {
  if (Object.keys(booksData).length === 0) return []
  const allBooks = flattenBooks()
  const branches = new Set(allBooks.map(book => book.branch))
  return Array.from(branches).sort()
}

/**
 * Initialize and load books data
 */
export async function initializeBooksData() {
  await loadBooksData()
}

/**
 * Get recommendations based on a book title or subject
 */
export function getRecommendationsByBook(bookTitle: string, limit: number = 5): BookWithContext[] {
  const allBooks = flattenBooks()
  const queryBook = allBooks.find(
    b => b.title.toLowerCase().includes(bookTitle.toLowerCase())
  )

  if (!queryBook) {
    // If book not found, search by title similarity
    const similar = searchSimilarBooks(bookTitle, 1)
    if (similar.length > 0) {
      return getBooksBySubject(similar[0].book.subject)
        .filter(b => b.title !== similar[0].book.title)
        .slice(0, limit)
    }
    return []
  }

  // Find books in the same subject
  const sameSubject = allBooks.filter(
    b => b.subject === queryBook.subject && b.title !== queryBook.title
  )

  // Find books in the same branch
  const sameBranch = allBooks.filter(
    b => b.branch === queryBook.branch && 
         b.subject !== queryBook.subject &&
         b.title !== queryBook.title
  )

  // Combine and deduplicate
  const recommendations = [...sameSubject, ...sameBranch]
  const unique = recommendations.filter(
    (book, index, self) =>
      index === self.findIndex(b => b.title === book.title && b.author === book.author)
  )

  return unique.slice(0, limit)
}

