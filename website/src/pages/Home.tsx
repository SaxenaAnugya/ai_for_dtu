import { useEffect, useState } from 'react'
import { Calendar, AlertCircle, CheckCircle, Clock, BookOpen } from 'lucide-react'
import { libraryService } from '../services/libraryService'
import { IssuedBook } from '../types'
import { differenceInDays, parseISO } from 'date-fns'
import './Home.css'

export default function Home() {
  const [books, setBooks] = useState<IssuedBook[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    setLoading(true)
    try {
      const data = await libraryService.getIssuedBooks()
      // Calculate remaining days and urgency
      const now = new Date()
      const updated = data.map(book => {
        const dueDate = parseISO(book.dueDate)
        const remainingDays = differenceInDays(dueDate, now)
        let urgency: 'safe' | 'warning' | 'danger' = 'safe'
        if (remainingDays < 0) urgency = 'danger'
        else if (remainingDays <= 3) urgency = 'warning'

        return {
          ...book,
          remainingDays,
          urgency
        }
      })
      setBooks(updated)
    } catch (error) {
      console.error('Failed to load books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncCalendar = async () => {
    setSyncing(true)
    try {
      const success = await libraryService.syncToGoogleCalendar(books)
      if (success) {
        alert('✓ Successfully synced to Google Calendar!')
      } else {
        alert('✗ Failed to sync. Please try again.')
      }
    } catch (error) {
      console.error('Sync failed:', error)
      alert('✗ Failed to sync. Please try again.')
    } finally {
      setSyncing(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'danger': return 'var(--danger)'
      case 'warning': return 'var(--warning)'
      default: return 'var(--success)'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'danger': return <AlertCircle size={20} />
      case 'warning': return <Clock size={20} />
      default: return <CheckCircle size={20} />
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading your books...</p>
      </div>
    )
  }

  return (
    <div className="home">
      <div className="home-header">
        <div>
          <h1>My Issued Books</h1>
          <p className="subtitle">Track your library books and due dates</p>
        </div>
        <button
          className="sync-button"
          onClick={handleSyncCalendar}
          disabled={syncing || books.length === 0}
        >
          <Calendar size={20} />
          {syncing ? 'Syncing...' : 'Sync with Google Calendar'}
        </button>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={64} color="var(--text-light)" />
          <h2>No books issued</h2>
          <p>You don't have any books issued at the moment.</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map(book => (
            <div key={book.id} className="book-card">
              <div className="book-header">
                <div className="book-title-section">
                  <h3>{book.title}</h3>
                  <p className="book-author">{book.author}</p>
                </div>
                <div
                  className="urgency-badge"
                  style={{ color: getUrgencyColor(book.urgency) }}
                >
                  {getUrgencyIcon(book.urgency)}
                </div>
              </div>

              <div className="book-details">
                <div className="detail-item">
                  <span className="label">Issue Date:</span>
                  <span>{new Date(book.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Due Date:</span>
                  <span className={book.urgency}>{new Date(book.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Remaining Days:</span>
                  <span className={book.urgency}>
                    {book.remainingDays < 0
                      ? `${Math.abs(book.remainingDays)} days overdue`
                      : `${book.remainingDays} days left`}
                  </span>
                </div>
                {book.fine > 0 && (
                  <div className="detail-item">
                    <span className="label">Fine:</span>
                    <span className="fine">₹{book.fine}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="label">Call Number:</span>
                  <span>{book.callNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Google Calendar Section */}
      <div className="calendar-section">
        <h2>
          <Calendar size={24} />
          Your Google Calendar
        </h2>
        <p className="calendar-subtitle">View your library due dates and reminders</p>
        <div className="calendar-container">
          <iframe
            src="https://calendar.google.com/calendar/embed?src=findanugya%40gmail.com&ctz=Asia%2FKolkata"
            style={{ border: 0 }}
            width="100%"
            height="600"
            frameBorder="0"
            scrolling="no"
            title="Google Calendar"
            className="calendar-iframe"
          ></iframe>
        </div>
      </div>
    </div>
  )
}

