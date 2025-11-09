import { useState } from 'react'
import { MapPin, Navigation, Search as SearchIcon } from 'lucide-react'
import './Map.css'

interface Point {
  x: number
  y: number
  label: string
  category?: string
}

interface Wall {
  x: number
  y: number
  width: number
  height: number
}

interface Rack {
  x: number
  y: number
  width: number
  height: number
  section: string
  label?: string
}

interface GridNode {
  x: number
  y: number
  walkable: boolean
  g: number  // Cost from start to this node
  h: number  // Heuristic estimate from this node to goal
  f: number  // Total cost: f = g + h
  parent: GridNode | null
}

export default function Map() {
  const [searchQuery, setSearchQuery] = useState('')
  const [startSection, setStartSection] = useState<Point | null>(null)
  const [destinationSection, setDestinationSection] = useState<Point | null>(null)
  const [route, setRoute] = useState<Point[]>([])
  const [navigationMode, setNavigationMode] = useState<'select-start' | 'select-destination' | 'navigating'>('select-start')

  // Library sections with coordinates
  const sections: Point[] = [
    { x: 15, y: 15, label: 'Entrance', category: 'entrance' },
    { x: 25, y: 25, label: 'CS Reference', category: 'computer-science' },
    { x: 45, y: 25, label: 'Engineering', category: 'engineering' },
    { x: 65, y: 25, label: 'Mathematics', category: 'mathematics' },
    { x: 25, y: 50, label: 'Economics', category: 'economics' },
    { x: 45, y: 50, label: 'Physics', category: 'physics' },
    { x: 65, y: 50, label: 'Chemistry', category: 'chemistry' },
    { x: 75, y: 70, label: 'Periodicals', category: 'periodicals' },
    { x: 15, y: 70, label: 'Reading Area', category: 'reading' }
  ]

  // Outer walls of the library
  const walls: Wall[] = [
    { x: 5, y: 5, width: 90, height: 3 },      // Top wall
    { x: 5, y: 5, width: 3, height: 90 },     // Left wall
    { x: 92, y: 5, width: 3, height: 90 },    // Right wall
    { x: 5, y: 92, width: 90, height: 3 },    // Bottom wall
    { x: 20, y: 10, width: 3, height: 85 },  // Internal wall 1
    { x: 50, y: 10, width: 3, height: 40 },   // Internal wall 2
    { x: 50, y: 55, width: 3, height: 40 },   // Internal wall 3
  ]

  // Book racks/shelves in each section
  const racks: Rack[] = [
    // CS Reference section (top left)
    { x: 22, y: 18, width: 6, height: 4, section: 'CS Reference', label: 'R1' },
    { x: 30, y: 18, width: 6, height: 4, section: 'CS Reference', label: 'R2' },
    { x: 22, y: 24, width: 6, height: 4, section: 'CS Reference', label: 'R3' },
    { x: 30, y: 24, width: 6, height: 4, section: 'CS Reference', label: 'R4' },
    
    // Engineering section (top center)
    { x: 42, y: 18, width: 6, height: 4, section: 'Engineering', label: 'R1' },
    { x: 50, y: 18, width: 6, height: 4, section: 'Engineering', label: 'R2' },
    { x: 42, y: 24, width: 6, height: 4, section: 'Engineering', label: 'R3' },
    { x: 50, y: 24, width: 6, height: 4, section: 'Engineering', label: 'R4' },
    
    // Mathematics section (top right)
    { x: 62, y: 18, width: 6, height: 4, section: 'Mathematics', label: 'R1' },
    { x: 70, y: 18, width: 6, height: 4, section: 'Mathematics', label: 'R2' },
    { x: 62, y: 24, width: 6, height: 4, section: 'Mathematics', label: 'R3' },
    { x: 70, y: 24, width: 6, height: 4, section: 'Mathematics', label: 'R4' },
    
    // Economics section (middle left)
    { x: 22, y: 43, width: 6, height: 4, section: 'Economics', label: 'R1' },
    { x: 30, y: 43, width: 6, height: 4, section: 'Economics', label: 'R2' },
    { x: 22, y: 49, width: 6, height: 4, section: 'Economics', label: 'R3' },
    { x: 30, y: 49, width: 6, height: 4, section: 'Economics', label: 'R4' },
    
    // Physics section (middle center)
    { x: 42, y: 43, width: 6, height: 4, section: 'Physics', label: 'R1' },
    { x: 50, y: 43, width: 6, height: 4, section: 'Physics', label: 'R2' },
    { x: 42, y: 49, width: 6, height: 4, section: 'Physics', label: 'R3' },
    { x: 50, y: 49, width: 6, height: 4, section: 'Physics', label: 'R4' },
    
    // Chemistry section (middle right)
    { x: 62, y: 43, width: 6, height: 4, section: 'Chemistry', label: 'R1' },
    { x: 70, y: 43, width: 6, height: 4, section: 'Chemistry', label: 'R2' },
    { x: 62, y: 49, width: 6, height: 4, section: 'Chemistry', label: 'R3' },
    { x: 70, y: 49, width: 6, height: 4, section: 'Chemistry', label: 'R4' },
    
    // Periodicals section (bottom right)
    { x: 72, y: 58, width: 8, height: 4, section: 'Periodicals', label: 'P1' },
    { x: 72, y: 64, width: 8, height: 4, section: 'Periodicals', label: 'P2' },
    { x: 72, y: 70, width: 8, height: 4, section: 'Periodicals', label: 'P3' },
  ]

  // Grid resolution for pathfinding (higher = more precise but slower)
  const GRID_SIZE = 1 // 1 unit per grid cell

  /**
   * Check if a point is inside a wall or rack (obstacle)
   */
  function isObstacle(x: number, y: number): boolean {
    // Check walls
    for (const wall of walls) {
      if (x >= wall.x && x <= wall.x + wall.width &&
          y >= wall.y && y <= wall.y + wall.height) {
        return true
      }
    }
    
    // Check racks (can walk around them, but not through)
    for (const rack of racks) {
      if (x >= rack.x && x <= rack.x + rack.width &&
          y >= rack.y && y <= rack.y + rack.height) {
        return true
      }
    }
    
    return false
  }

  /**
   * Get neighbors of a node (8-directional movement)
   */
  function getNeighbors(node: GridNode): Array<{ x: number; y: number; cost: number }> {
    const neighbors: Array<{ x: number; y: number; cost: number }> = []
    const directions = [
      { dx: -GRID_SIZE, dy: 0, cost: 1.0 },   // Left
      { dx: GRID_SIZE, dy: 0, cost: 1.0 },    // Right
      { dx: 0, dy: -GRID_SIZE, cost: 1.0 },   // Up
      { dx: 0, dy: GRID_SIZE, cost: 1.0 },    // Down
      { dx: -GRID_SIZE, dy: -GRID_SIZE, cost: 1.414 }, // Diagonal: Up-Left
      { dx: GRID_SIZE, dy: -GRID_SIZE, cost: 1.414 },  // Diagonal: Up-Right
      { dx: -GRID_SIZE, dy: GRID_SIZE, cost: 1.414 },  // Diagonal: Down-Left
      { dx: GRID_SIZE, dy: GRID_SIZE, cost: 1.414 }    // Diagonal: Down-Right
    ]

    for (const dir of directions) {
      const newX = node.x + dir.dx
      const newY = node.y + dir.dy

      // Check bounds
      if (newX < 5 || newX > 95 || newY < 5 || newY > 95) {
        continue
      }

      // Check if walkable (not an obstacle)
      if (!isObstacle(newX, newY)) {
        neighbors.push({
          x: newX,
          y: newY,
          cost: dir.cost
        })
      }
    }

    return neighbors
  }

  /**
   * Heuristic function for A* (Euclidean distance)
   */
  function heuristic(node: { x: number; y: number }, goal: Point): number {
    const dx = node.x - goal.x
    const dy = node.y - goal.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Get node key for map lookup
   */
  function getNodeKey(x: number, y: number): string {
    return `${x},${y}`
  }

  /**
   * A* algorithm for finding shortest path
   * Returns the shortest path from start to goal, avoiding obstacles (walls and racks)
   */
  function findPath(start: Point, goal: Point): Point[] {
    // Open set: nodes to be evaluated (sorted by f score)
    const openSet: GridNode[] = []
    // Closed set: nodes already evaluated
    const closedSet = new Set<string>()

    // Initialize start node
    const startNode: GridNode = {
      x: start.x,
      y: start.y,
      walkable: true,
      g: 0,
      h: heuristic(start, goal),
      f: 0,
      parent: null
    }
    startNode.f = startNode.g + startNode.h
    openSet.push(startNode)

    // Main A* loop
    while (openSet.length > 0) {
      // Find node with lowest f score
      let currentIndex = 0
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i
        }
      }

      const current = openSet.splice(currentIndex, 1)[0]
      const currentKey = getNodeKey(current.x, current.y)
      closedSet.add(currentKey)

      // Check if we reached the goal (with tolerance for grid precision)
      const distanceToGoal = Math.sqrt(
        Math.pow(current.x - goal.x, 2) + Math.pow(current.y - goal.y, 2)
      )
      if (distanceToGoal < 2) {
        // Reconstruct path from goal to start
        const path: Point[] = []
        let node: GridNode | null = current

        while (node) {
          path.unshift({ x: node.x, y: node.y, label: '' })
          node = node.parent
        }

        // Ensure goal point is included
        if (path.length === 0 || 
            Math.abs(path[path.length - 1].x - goal.x) > 0.5 || 
            Math.abs(path[path.length - 1].y - goal.y) > 0.5) {
          path.push({ x: goal.x, y: goal.y, label: '' })
        }

        return path
      }

      // Explore neighbors
      const neighbors = getNeighbors(current)
      for (const neighbor of neighbors) {
        const neighborKey = getNodeKey(neighbor.x, neighbor.y)

        // Skip if already evaluated
        if (closedSet.has(neighborKey)) {
          continue
        }

        // Calculate movement cost (diagonal costs more)
        const tentativeG = current.g + neighbor.cost

        // Check if this neighbor is already in open set
        const existingNode = openSet.find(n => 
          getNodeKey(n.x, n.y) === neighborKey
        )

        if (!existingNode) {
          // New node - add to open set
          const neighborNode: GridNode = {
            x: neighbor.x,
            y: neighbor.y,
            walkable: true,
            g: tentativeG,
            h: heuristic(neighbor, goal),
            f: 0,
            parent: current
          }
          neighborNode.f = neighborNode.g + neighborNode.h
          openSet.push(neighborNode)
        } else {
          // Node already in open set - check if this path is better
          if (tentativeG < existingNode.g) {
            existingNode.g = tentativeG
            existingNode.f = existingNode.g + existingNode.h
            existingNode.parent = current
          }
        }
      }
    }

    // No path found
    return []
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    const found = sections.find(
      s =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (found) {
      if (!startSection) {
        setStartSection(found)
        setNavigationMode('select-destination')
      } else if (!destinationSection) {
        setDestinationSection(found)
        setNavigationMode('navigating')
        calculateRoute(startSection, found)
      }
    }
  }

  const calculateRoute = (from: Point, to: Point) => {
    // Use Dijkstra's algorithm to find shortest path
    const path = findPath(from, to)
    
    if (path.length > 0) {
      setRoute(path)
      setNavigationMode('navigating')
    } else {
      console.warn('No path found')
      setRoute([])
    }
  }

  const handleSectionClick = (section: Point) => {
    if (navigationMode === 'select-start' || !startSection) {
      setStartSection(section)
      setDestinationSection(null)
      setRoute([])
      setNavigationMode('select-destination')
    } else if (navigationMode === 'select-destination' || !destinationSection) {
      setDestinationSection(section)
      calculateRoute(startSection, section)
    } else {
      // Reset and select new start
      setStartSection(section)
      setDestinationSection(null)
      setRoute([])
      setNavigationMode('select-destination')
    }
  }

  const resetNavigation = () => {
    setStartSection(null)
    setDestinationSection(null)
    setRoute([])
    setNavigationMode('select-start')
  }

  const getNavigationInstructions = (): string[] => {
    if (route.length < 2) return []
    
    const instructions: string[] = []
    let currentDirection = ''
    
    for (let i = 1; i < route.length; i++) {
      const prev = route[i - 1]
      const curr = route[i]
      const dx = curr.x - prev.x
      const dy = curr.y - prev.y
      
      let direction = ''
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? 'right' : 'left'
      } else {
        direction = dy > 0 ? 'down' : 'up'
      }
      
      if (direction !== currentDirection) {
        const distance = Math.sqrt(dx * dx + dy * dy)
        instructions.push(`Go ${direction} for ~${Math.round(distance * 2)} meters`)
        currentDirection = direction
      }
    }
    
    return instructions
  }

  const getSectionRacks = (sectionName: string) => {
    return racks.filter(r => r.section === sectionName)
  }

  // Calculate distance for display
  const calculateDistance = (path: Point[]): number => {
    if (path.length < 2) return 0
    let distance = 0
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x
      const dy = path[i].y - path[i - 1].y
      distance += Math.sqrt(dx * dx + dy * dy)
    }
    return distance
  }

  return (
    <div className="map-page">
      <div className="map-header">
        <div>
          <h1>Library Map & Navigation</h1>
          <p className="subtitle">Find books and navigate to sections using A* pathfinding algorithm</p>
        </div>
        <div className="map-search-box">
          <SearchIcon size={20} />
          <input
            type="text"
            placeholder="Search section (e.g., 'Economics', 'CS Reference')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      <div className="map-container">
        <div className="map-wrapper">
          <svg viewBox="0 0 100 100" className="library-map">
            <defs>
              <pattern id="grid" width="2" height="2" patternUnits="userSpaceOnUse">
                <path d="M 2 0 L 0 0 0 2" fill="none" stroke="#e2e8f0" strokeWidth="0.3" />
              </pattern>
              <marker
                id="arrowhead"
                markerWidth="4"
                markerHeight="4"
                refX="2"
                refY="2"
                orient="auto"
              >
                <polygon points="0 0, 4 2, 0 4" fill="#3b82f6" />
              </marker>
            </defs>
            
            {/* Floor */}
            <rect width="100" height="100" fill="#f8fafc" />
            <rect width="100" height="100" fill="url(#grid)" opacity="0.3" />

            {/* Walls */}
            {walls.map((wall, idx) => (
              <rect
                key={`wall-${idx}`}
                x={wall.x}
                y={wall.y}
                width={wall.width}
                height={wall.height}
                fill="#475569"
                stroke="#334155"
                strokeWidth="0.2"
                className="wall"
              />
            ))}

            {/* Aisles (walking paths) */}
            <rect x="8" y="8" width="10" height="87" fill="#e2e8f0" opacity="0.5" />
            <rect x="23" y="8" width="25" height="10" fill="#e2e8f0" opacity="0.5" />
            <rect x="23" y="30" width="25" height="10" fill="#e2e8f0" opacity="0.5" />
            <rect x="23" y="55" width="25" height="10" fill="#e2e8f0" opacity="0.5" />
            <rect x="53" y="8" width="25" height="10" fill="#e2e8f0" opacity="0.5" />
            <rect x="53" y="30" width="25" height="10" fill="#e2e8f0" opacity="0.5" />
            <rect x="53" y="55" width="25" height="10" fill="#e2e8f0" opacity="0.5" />
            <rect x="8" y="55" width="12" height="40" fill="#e2e8f0" opacity="0.5" />
            <rect x="70" y="55" width="20" height="40" fill="#e2e8f0" opacity="0.5" />

            {/* Book Racks */}
            {racks.map((rack, idx) => {
              const isStart = startSection && rack.section === startSection.label
              const isDestination = destinationSection && rack.section === destinationSection.label
              const isSelected = isStart || isDestination
              return (
                <g key={`rack-${idx}`}>
                  <rect
                    x={rack.x}
                    y={rack.y}
                    width={rack.width}
                    height={rack.height}
                    fill={isStart ? "#10b981" : isDestination ? "#ef4444" : "#cbd5e1"}
                    stroke={isStart ? "#059669" : isDestination ? "#dc2626" : "#94a3b8"}
                    strokeWidth="0.3"
                    className="rack"
                    opacity={isSelected ? 0.8 : 0.6}
                  />
                  {rack.label && (
                    <text
                      x={rack.x + rack.width / 2}
                      y={rack.y + rack.height / 2}
                      fontSize="1.2"
                      textAnchor="middle"
                      fill={isSelected ? "white" : "#64748b"}
                      fontWeight="600"
                      className="rack-label"
                    >
                      {rack.label}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Route path from A* algorithm */}
            {route.length > 1 && (
              <>
                <polyline
                  points={route.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="0.8"
                  strokeDasharray="2,2"
                  opacity="0.8"
                  markerEnd="url(#arrowhead)"
                />
                {/* Route nodes for better visibility */}
                {route.map((point, idx) => (
                  <circle
                    key={`route-node-${idx}`}
                    cx={point.x}
                    cy={point.y}
                    r="0.3"
                    fill="#3b82f6"
                    opacity="0.6"
                  />
                ))}
              </>
            )}

            {/* Section labels */}
            {sections.map((section, idx) => {
              const isStart = startSection === section
              const isDestination = destinationSection === section
              const sectionRacks = getSectionRacks(section.label)
              return (
                <g 
                  key={`section-${idx}`}
                  onClick={() => handleSectionClick(section)} 
                  style={{ cursor: 'pointer' }}
                >
                  {/* Section highlight area */}
                  {(isStart || isDestination) && sectionRacks.length > 0 && (
                    <rect
                      x={sectionRacks[0].x - 2}
                      y={sectionRacks[0].y - 2}
                      width={
                        Math.max(...sectionRacks.map(r => r.x + r.width)) -
                        Math.min(...sectionRacks.map(r => r.x)) + 4
                      }
                      height={
                        Math.max(...sectionRacks.map(r => r.y + r.height)) -
                        Math.min(...sectionRacks.map(r => r.y)) + 4
                      }
                      fill={isStart ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"}
                      stroke={isStart ? "#10b981" : "#ef4444"}
                      strokeWidth="0.5"
                      strokeDasharray="1,1"
                    />
                  )}
                  
                  {/* Section marker */}
                  <circle
                    cx={section.x}
                    cy={section.y}
                    r={section.category === 'entrance' ? 1.5 : isStart || isDestination ? 1.3 : 1}
                    fill={
                      isStart
                        ? '#10b981'
                        : isDestination
                        ? '#ef4444'
                        : section.category === 'entrance'
                        ? '#10b981'
                        : '#64748b'
                    }
                    stroke="white"
                    strokeWidth="0.3"
                    className="section-point"
                  />
                  
                  {/* Section label */}
                  <text
                    x={section.x}
                    y={section.y - 2}
                    fontSize="2"
                    textAnchor="middle"
                    fill={
                      isStart ? "#10b981" : 
                      isDestination ? "#ef4444" : 
                      "#1e293b"
                    }
                    fontWeight="700"
                    className="section-label"
                  >
                    {section.label}
                    {isStart && " (Start)"}
                    {isDestination && " (Destination)"}
                  </text>
                </g>
              )
            })}

            {/* Legend */}
            <g transform="translate(2, 2)">
              <rect x="0" y="0" width="12" height="20" fill="white" stroke="#cbd5e1" strokeWidth="0.3" opacity="0.9" />
              <text x="6" y="3" fontSize="1.5" textAnchor="middle" fill="#1e293b" fontWeight="700">Legend</text>
              <rect x="1" y="4.5" width="2" height="1.5" fill="#10b981" />
              <text x="4" y="5.5" fontSize="1.2" fill="#1e293b">Entrance</text>
              <rect x="1" y="7" width="2" height="1.5" fill="#cbd5e1" />
              <text x="4" y="8" fontSize="1.2" fill="#1e293b">Racks</text>
              <rect x="1" y="9.5" width="2" height="1.5" fill="#475569" />
              <text x="4" y="10.5" fontSize="1.2" fill="#1e293b">Walls</text>
              <line x1="1" y1="12" x2="3" y2="12" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="1,1" />
              <text x="4" y="12.5" fontSize="1.2" fill="#1e293b">Route (A*)</text>
            </g>
          </svg>
        </div>

        <div className="map-sidebar">
          <div className="navigation-controls">
            <h3>Navigation</h3>
            <div className="nav-mode-indicator">
              {navigationMode === 'select-start' && (
                <p className="nav-hint">Click a section to set as <strong>Start</strong></p>
              )}
              {navigationMode === 'select-destination' && startSection && (
                <p className="nav-hint">
                  Start: <strong>{startSection.label}</strong><br />
                  Click a section to set as <strong>Destination</strong>
                </p>
              )}
              {navigationMode === 'navigating' && startSection && destinationSection && (
                <p className="nav-hint">
                  Navigating from <strong>{startSection.label}</strong> to <strong>{destinationSection.label}</strong>
                </p>
              )}
            </div>
            {(startSection || destinationSection) && (
              <button className="reset-button" onClick={resetNavigation}>
                Reset Navigation
              </button>
            )}
          </div>

          <div className="sections-list">
            <h3>Library Sections</h3>
            {sections.map((section, idx) => {
              const sectionRacks = getSectionRacks(section.label)
              const isStart = startSection === section
              const isDestination = destinationSection === section
              return (
                <div
                  key={idx}
                  className={`section-item ${
                    isStart ? 'start-section' : 
                    isDestination ? 'destination-section' : 
                    ''
                  }`}
                  onClick={() => handleSectionClick(section)}
                >
                  <MapPin size={16} />
                  <div>
                    <strong>{section.label}</strong>
                    <span className="section-category">
                      {sectionRacks.length} racks
                      {isStart && ' • Start'}
                      {isDestination && ' • Destination'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {startSection && destinationSection && (
            <div className="route-info">
              <h4>
                <Navigation size={20} />
                Route Navigation
              </h4>
              {route.length > 0 ? (
                <div className="route-details">
                  <div className="route-summary">
                    <p>
                      <strong>From:</strong> {startSection.label}
                    </p>
                    <p>
                      <strong>To:</strong> {destinationSection.label}
                    </p>
                  </div>
                  <div className="route-stats">
                    <p>
                      <strong>Algorithm:</strong> A* (A-Star) Pathfinding
                    </p>
                    <p>
                      <strong>Distance:</strong> ~{Math.round(calculateDistance(route) * 2)} meters
                    </p>
                    <p>
                      <strong>Path nodes:</strong> {route.length} waypoints
                    </p>
                    <p>
                      <strong>Estimated time:</strong> ~{Math.round(calculateDistance(route) * 0.3)} minutes
                    </p>
                  </div>
                  <div className="navigation-instructions">
                    <strong>Turn-by-turn directions:</strong>
                    <ol>
                      {getNavigationInstructions().map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ol>
                    {getNavigationInstructions().length === 0 && (
                      <p style={{ fontStyle: 'italic', color: 'var(--text-light)' }}>
                        Direct path - no turns needed
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="route-details">
                  <p style={{ color: 'var(--danger)' }}>
                    No path found. Please try different sections.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
