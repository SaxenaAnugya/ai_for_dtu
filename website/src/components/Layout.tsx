import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Map, BookOpen, Bell } from 'lucide-react'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/map', icon: Map, label: 'Map' },
    { path: '/recommendations', icon: BookOpen, label: 'Recommendations' },
    { path: '/notifications', icon: Bell, label: 'Due Dates' }
  ]

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">DTU Library Hub</h1>
          <nav className="nav">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`nav-link ${location.pathname === path ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

