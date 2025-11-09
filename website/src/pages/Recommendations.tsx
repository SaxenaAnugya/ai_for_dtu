import { useEffect, useState } from 'react'
import { TrendingUp, BookOpen, Star, Clock, Search as SearchIcon } from 'lucide-react'
import { libraryService } from '../services/libraryService'
import { Recommendation } from '../types'
import { 
  searchSimilarBooks, 
  getBooksByBranch, 
  getAllBranches,
  initializeBooksData 
} from '../services/bookSearchService'
import './Recommendations.css'

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [branchRecommendations, setBranchRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Recommendation[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('CSE')
  const [branches, setBranches] = useState<string[]>([])

  useEffect(() => {
    const init = async () => {
      await initializeBooksData()
      loadRecommendations()
      loadBranches()
    }
    init()
  }, [])

  useEffect(() => {
    if (selectedBranch) {
      loadBranchRecommendations(selectedBranch)
    }
  }, [selectedBranch])

  const loadBranches = () => {
    const allBranches = getAllBranches()
    setBranches(allBranches)
  }

  const loadRecommendations = async () => {
    setLoading(true)
    try {
      const data = await libraryService.getRecommendations()
      setRecommendations(data)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBranchRecommendations = async (branch: string) => {
    try {
      const books = getBooksByBranch(branch)
      const recs: Recommendation[] = books.slice(0, 10).map((book, idx) => ({
        id: `branch-${idx}`,
        title: book.title,
        author: book.author,
        reason: `${book.subject} - ${book.semester}`,
        category: book.subject,
        branch: book.branch,
        year: book.year,
        semester: book.semester,
        publisher: book.publisher
      }))
      setBranchRecommendations(recs)
    } catch (error) {
      console.error('Failed to load branch recommendations:', error)
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const results = searchSimilarBooks(searchQuery, 10)
    const recs: Recommendation[] = results.map((result, idx) => ({
      id: `search-${idx}`,
      title: result.book.title,
      author: result.book.author,
      reason: `Similarity: ${(result.score * 100).toFixed(0)}% (matched: ${result.matchedFields.join(', ')})`,
      category: result.book.subject,
      branch: result.book.branch,
      year: result.book.year,
      semester: result.book.semester,
      publisher: result.book.publisher,
      matchedFields: result.matchedFields
    }))
    setSearchResults(recs)
  }

  // Mock data for trending books
  const trendingBooks = [
    { title: 'Introduction to Algorithms', author: 'Cormen et al.', category: 'CS', issues: 145 },
    { title: 'Data Structures Using C', author: 'Reema Thareja', category: 'CS', issues: 132 },
    { title: 'The C Programming Language', author: 'Kernighan & Ritchie', category: 'CS', issues: 128 }
  ]

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading recommendations...</p>
      </div>
    )
  }

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <h1>Recommendations for You</h1>
        <p className="subtitle">Discover books tailored to your interests using similarity search</p>
      </div>

      {/* Similarity Search Section */}
      <div className="search-section">
        <div className="search-box">
          <SearchIcon size={20} />
          <input
            type="text"
            placeholder="Search for books by title, author, or subject (e.g., 'Mathematics', 'C Programming', 'Physics')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Similar Books Found ({searchResults.length})</h3>
            <div className="books-list">
              {searchResults.map(rec => (
                <div key={rec.id} className="book-item search-result">
                  <div className="book-info">
                    <h3>{rec.title}</h3>
                    <p className="book-author">{rec.author}</p>
                    <div className="book-meta">
                      <span className="book-category">{rec.category}</span>
                      {rec.branch && <span className="book-branch">{rec.branch}</span>}
                      {rec.semester && <span className="book-semester">{rec.semester}</span>}
                    </div>
                    <p className="book-reason">{rec.reason}</p>
                    {rec.publisher && (
                      <p className="book-publisher">Publisher: {rec.publisher}</p>
                    )}
                  </div>
                  {rec.matchedFields && rec.matchedFields.length > 0 && (
                    <div className="match-badge">
                      <Star size={14} />
                      Matched in {rec.matchedFields.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="recommendations-grid">
        <div className="recommendation-section">
          <h2>
            <BookOpen size={24} />
            Recommended for Your Branch
          </h2>
          <div className="branch-selector">
            <label>Select Branch:</label>
            <select 
              value={selectedBranch} 
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
          <div className="books-list">
            {branchRecommendations.length > 0 ? (
              branchRecommendations.map(rec => (
                <div key={rec.id} className="book-item">
                  <div className="book-info">
                    <h3>{rec.title}</h3>
                    <p className="book-author">{rec.author}</p>
                    <div className="book-meta">
                      <span className="book-category">{rec.category}</span>
                      {rec.semester && <span className="book-semester">{rec.semester}</span>}
                    </div>
                    {rec.publisher && (
                      <p className="book-publisher">Publisher: {rec.publisher}</p>
                    )}
                  </div>
                  <div className="book-badge">
                    <Star size={16} />
                    {rec.branch}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">No books found for this branch</p>
            )}
          </div>
        </div>

        <div className="recommendation-section">
          <h2>
            <TrendingUp size={24} />
            Trending This Month
          </h2>
          <div className="books-list">
            {trendingBooks.map((book, idx) => (
              <div key={idx} className="book-item trending">
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="book-author">{book.author}</p>
                  <div className="book-stats">
                    <span className="stat-item">
                      <TrendingUp size={14} />
                      {book.issues} issues
                    </span>
                    <span className="stat-item">
                      <Star size={14} />
                      #{idx + 1} Trending
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recommendation-section">
          <h2>
            <BookOpen size={24} />
            General Recommendations
          </h2>
          <div className="books-list">
            {recommendations.slice(0, 5).map(rec => (
              <div key={rec.id} className="book-item">
                <div className="book-info">
                  <h3>{rec.title}</h3>
                  <p className="book-author">{rec.author}</p>
                  <span className="book-category">{rec.category}</span>
                  {rec.publisher && (
                    <p className="book-publisher">Publisher: {rec.publisher}</p>
                  )}
                </div>
                <div className="book-badge">
                  <Star size={16} />
                  Recommended
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
