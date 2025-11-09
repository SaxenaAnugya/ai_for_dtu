import { useEffect, useState } from 'react'
import { Calendar, AlertCircle, CheckCircle, Clock, Bell, Mail } from 'lucide-react'
import { libraryService } from '../services/libraryService'
import { IssuedBook } from '../types'
import { differenceInDays, parseISO } from 'date-fns'
import './Notifications.css'

export default function Notifications() {
  const [books, setBooks] = useState<IssuedBook[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    setLoading(true)
    try {
      const data = await libraryService.getIssuedBooks()
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
      // Sort by urgency and due date
      updated.sort((a, b) => {
        if (a.urgency !== b.urgency) {
          const order = { danger: 0, warning: 1, safe: 2 }
          return order[a.urgency] - order[b.urgency]
        }
        return a.remainingDays - b.remainingDays
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
        alert('✓ Successfully synced all books to Google Calendar!')
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

  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case 'danger': return 'danger'
      case 'warning': return 'warning'
      default: return 'safe'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'danger': return <AlertCircle size={20} />
      case 'warning': return <Clock size={20} />
      default: return <CheckCircle size={20} />
    }
  }

  const safeBooks = books.filter(b => b.urgency === 'safe')
  const warningBooks = books.filter(b => b.urgency === 'warning')
  const dangerBooks = books.filter(b => b.urgency === 'danger')

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading due dates...</p>
      </div>
    )
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Due Dates & Notifications</h1>
          <p className="subtitle">Manage your book due dates and reminders</p>
        </div>
        <button
          className="sync-button"
          onClick={handleSyncCalendar}
          disabled={syncing || books.length === 0}
        >
          <Calendar size={20} />
          {syncing ? 'Syncing...' : 'Sync All to Google Calendar'}
        </button>
      </div>

      <div className="notification-settings">
        <h2>Notification Preferences</h2>
        <div className="settings-grid">
          <label className="setting-item">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
            />
            <Mail size={20} />
            <div>
              <strong>Email Notifications</strong>
              <span>Receive reminders via email</span>
            </div>
          </label>
          <label className="setting-item">
            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={(e) => setPushEnabled(e.target.checked)}
            />
            <Bell size={20} />
            <div>
              <strong>Push Notifications</strong>
              <span>Get browser push notifications</span>
            </div>
          </label>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} color="var(--text-light)" />
          <h2>No books issued</h2>
          <p>You don't have any books with due dates.</p>
        </div>
      ) : (
        <div className="due-dates-sections">
          {dangerBooks.length > 0 && (
            <div className="urgency-section danger">
              <h2>
                <AlertCircle size={24} />
                Overdue ({dangerBooks.length})
              </h2>
              <div className="books-list">
                {dangerBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>
          )}

          {warningBooks.length > 0 && (
            <div className="urgency-section warning">
              <h2>
                <Clock size={24} />
                Due in 1-3 Days ({warningBooks.length})
              </h2>
              <div className="books-list">
                {warningBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>
          )}

          {safeBooks.length > 0 && (
            <div className="urgency-section safe">
              <h2>
                <CheckCircle size={24} />
                Due in More Than 3 Days ({safeBooks.length})
              </h2>
              <div className="books-list">
                {safeBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BookCard({ book }: { book: IssuedBook }) {
  const urgencyClass = book.urgency === 'danger' ? 'danger' : book.urgency === 'warning' ? 'warning' : 'safe'
  const icon = book.urgency === 'danger' ? <AlertCircle size={20} /> : 
               book.urgency === 'warning' ? <Clock size={20} /> : 
               <CheckCircle size={20} />

  return (
    <div className={`book-card ${urgencyClass}`}>
      <div className="book-header">
        <div className="book-title-section">
          <h3>{book.title}</h3>
          <p className="book-author">{book.author}</p>
        </div>
        <div className={`urgency-badge ${urgencyClass}`}>
          {icon}
        </div>
      </div>
      <div className="book-details">
        <div className="detail-item">
          <span className="label">Due Date:</span>
          <span className={urgencyClass}>
            {new Date(book.dueDate).toLocaleDateString()}
          </span>
        </div>
        <div className="detail-item">
          <span className="label">Status:</span>
          <span className={urgencyClass}>
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
      </div>
    </div>
  )
}

