import { useState, useEffect, useRef } from 'react'
import {
  Search as SearchIcon,
  BookOpen,
  TrendingUp,
  CheckCircle,
  XCircle,
  Send,
  Sparkles,
} from 'lucide-react'
import { libraryService } from '../services/libraryService'
import {
  searchSimilarBooks,
  initializeBooksData,
  getBooksBySubject,
} from '../services/bookSearchService'
import { geminiService, ChatMessage } from '../services/geminiServices'
import { Book } from '../types'
import './Search.css'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<Book[]>([])
  const [booksDataLoaded, setBooksDataLoaded] = useState(false)

  // Gemini AI Chat state
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Initialize book data
  useEffect(() => {
    const init = async () => {
      try {
        await initializeBooksData()
        setBooksDataLoaded(true)
      } catch (error) {
        console.error('Failed to load books data:', error)
      }
    }
    init()
  }, [])

  // Auto search when query changes
  useEffect(() => {
    if (query.length > 2 && booksDataLoaded) {
      handleSearch()
    } else {
      setResults([])
      setRecommendations([])
    }
  }, [query, booksDataLoaded])

  const handleSearch = async () => {
    if (!query.trim() || !booksDataLoaded) return

    setLoading(true)
    try {
      const similarBooks = searchSimilarBooks(query, 20)
      const searchResults: Book[] = similarBooks.map((result, idx) => ({
        id: `book-${idx}`,
        title: result.book.title,
        author: result.book.author,
        callNumber: `${result.book.branch}-${result.book.subject
          .substring(0, 3)
          .toUpperCase()}-${idx + 1}`,
        category: result.book.subject,
        availability: 'available' as const,
        popularity: Math.round(result.score * 100),
        branch: result.book.branch,
        year: result.book.year,
        semester: result.book.semester,
        publisher: result.book.publisher,
        similarityScore: result.score,
        matchedFields: result.matchedFields,
      }))

      setResults(searchResults)

      if (searchResults.length > 0) {
        const firstResult = searchResults[0]
        const subjectBooks = getBooksBySubject(firstResult.category)
        const recs: Book[] = subjectBooks
          .filter((b) => b.title !== firstResult.title)
          .slice(0, 5)
          .map((book, idx) => ({
            id: `rec-${idx}`,
            title: book.title,
            author: book.author,
            callNumber: `${book.branch}-${book.subject
              .substring(0, 3)
              .toUpperCase()}-${idx + 1}`,
            category: book.subject,
            availability: 'available' as const,
            popularity: 75 + idx * 2,
            branch: book.branch,
            year: book.year,
            semester: book.semester,
            publisher: book.publisher,
          }))
        setRecommendations(recs)
      } else {
        setRecommendations([])
      }
    } catch (error) {
      console.error('Search failed:', error)
      try {
        const data = await libraryService.searchBooks(query)
        setResults(data)
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
    }

    setChatMessages((prev) => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    try {
      const response = await geminiService.chat(chatInput, chatMessages)

      if (response.success && response.response) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.response,
        }
        setChatMessages((prev) => [...prev, assistantMessage])
      } else {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `Error: ${response.error || 'Failed to get response'}`,
        }
        setChatMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content:
          'Sorry, I encountered an error. Please make sure the API server is running.',
      }
      setChatMessages((prev) => [...prev, errorMessage])
    } finally {
      setChatLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleChatSend()
    }
  }

  const getAvailabilityBadge = (availability: string) => {
    if (availability === 'available') {
      return (
        <span className="badge available">
          <CheckCircle size={14} />
          Available
        </span>
      )
    }
    return (
      <span className="badge issued">
        <XCircle size={14} />
        Issued
      </span>
    )
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Smart Book Search</h1>
        <p className="subtitle">Find books by title, author, or topic</p>
      </div>

      <div className="search-container">
        <div className="search-box">
          <SearchIcon size={24} className="search-icon" />
          <input
            type="text"
            placeholder="Search for books (e.g., 'Machine Learning', 'Software Engineering', 'Economics')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          className="ai-chat-toggle"
          onClick={() => setShowChat(!showChat)}
          title="AI Assistant"
        >
          <Sparkles size={20} />
          {showChat ? 'Hide AI Chat' : 'AI Assistant'}
        </button>
      </div>

      {/* === AI CHAT SECTION === */}
      {showChat && (
        <div className="ai-chat-container">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <Sparkles size={20} />
              <h3>AI Book Assistant (Powered by Google Gemini)</h3>
            </div>
            <button className="close-chat" onClick={() => setShowChat(false)}>
              ×
            </button>
          </div>

          <div className="ai-chat-messages">
            {chatMessages.length === 0 && (
              <div className="chat-welcome">
                <Sparkles size={32} />
                <p>Hi! I'm your AI book assistant. Ask me about:</p>
                <ul>
                  <li>Book recommendations for specific topics</li>
                  <li>Finding books by subject or author</li>
                  <li>Suggestions for your coursework</li>
                  <li>Any questions about the library catalog</li>
                </ul>
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-message assistant">
                <div className="message-content loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="ai-chat-input">
            <input
              type="text"
              placeholder="Ask me about books..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={chatLoading}
            />
            <button
              onClick={handleChatSend}
              disabled={chatLoading || !chatInput.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* === SEARCH RESULTS === */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Searching...</p>
        </div>
      )}

      {query.length > 2 && !loading && results.length === 0 && (
        <div className="empty-state">
          <BookOpen size={64} color="var(--text-light)" />
          <h2>No results found</h2>
          <p>Try a different search term</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="results-section">
            <h2>Search Results ({results.length})</h2>
            <p className="search-info">
              Found {results.length} similar books using similarity search
            </p>
            <div className="results-grid">
              {results.map((book) => (
                <div key={book.id} className="result-card">
                  <div className="result-header">
                    <h3>{book.title}</h3>
                    {getAvailabilityBadge(book.availability)}
                  </div>
                  <p className="result-author">{book.author}</p>
                  <div className="result-details">
                    <div className="detail-row">
                      <span className="label">Subject:</span>
                      <span>{book.category}</span>
                    </div>
                    {book.branch && (
                      <div className="detail-row">
                        <span className="label">Branch:</span>
                        <span>{book.branch}</span>
                      </div>
                    )}
                    {book.semester && (
                      <div className="detail-row">
                        <span className="label">Semester:</span>
                        <span>{book.semester}</span>
                      </div>
                    )}
                    {book.publisher && (
                      <div className="detail-row">
                        <span className="label">Publisher:</span>
                        <span>{book.publisher}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">Call Number:</span>
                      <span>{book.callNumber}</span>
                    </div>
                    {book.similarityScore !== undefined && (
                      <div className="detail-row">
                        <span className="label">Match Score:</span>
                        <span className="similarity-score">
                          {(book.similarityScore * 100).toFixed(0)}% match
                        </span>
                      </div>
                    )}
                    {book.matchedFields && book.matchedFields.length > 0 && (
                      <div className="detail-row">
                        <span className="label">Matched in:</span>
                        <span className="matched-fields">
                          {book.matchedFields.join(', ')}
                        </span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">Popularity:</span>
                      <span className="popularity">
                        <TrendingUp size={14} />
                        {book.popularity}% relevance
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="recommendations-section">
              <h2>
                <BookOpen size={24} />
                Recommended Books in "{results[0]?.category}"
              </h2>
              <p className="recommendation-info">
                Other books in the same subject category
              </p>
              <div className="recommendations-grid">
                {recommendations.map((book) => (
                  <div key={book.id} className="recommendation-card">
                    <h4>{book.title}</h4>
                    <p>{book.author}</p>
                    {book.publisher && (
                      <p className="rec-publisher">{book.publisher}</p>
                    )}
                    {book.branch && (
                      <span className="rec-branch">{book.branch}</span>
                    )}
                    <div className="recommendation-badge">
                      <TrendingUp size={14} />
                      {book.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
