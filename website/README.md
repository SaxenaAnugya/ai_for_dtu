# DTU Library Hub - Central Library Management System

A comprehensive web application for DTU Library users featuring automatic due date reminders, smart book search, library navigation, and more.

## Features

### 🏠 Home Dashboard
- View all currently issued books
- See issue dates, due dates, and remaining days
- Color-coded urgency indicators (🟢 Safe, 🟠 Warning, 🔴 Overdue)
- One-click sync to Google Calendar
- Email reminder options

### 🔍 Smart Search & Recommendations
- Search books by title, author, or topic
- Real-time availability status
- Popularity rankings based on issue frequency
- Category-based recommendations
- Top books in each category

### 🗺️ Library Map & Navigation
- Interactive 2D map of DTU Library
- Search for sections (e.g., "Economics", "CS Reference")
- Shortest route calculation from entrance
- Indoor GPS-style navigation
- Section highlighting and directions

### 📚 Recommendations Tab
- Personalized book recommendations
- Top books in your branch
- Trending books this month
- Recently added books

### 🔔 Due Dates & Notifications
- Color-coded urgency system:
  - 🟢 Due in more than 3 days
  - 🟠 Due in 1-3 days
  - 🔴 Overdue
- Sync all to Google Calendar
- Email and push notification settings
- Fine tracking

## Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **date-fns** - Date utilities
- **Lucide React** - Icons
- **CSS3** - Styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
website/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout.tsx
│   │   └── Layout.css
│   ├── pages/          # Page components
│   │   ├── Home.tsx
│   │   ├── Search.tsx
│   │   ├── Map.tsx
│   │   ├── Recommendations.tsx
│   │   └── Notifications.tsx
│   ├── services/       # API services
│   │   └── libraryService.ts
│   ├── types/          # TypeScript types
│   │   └── index.ts
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Integration with Backend

The app uses mock data by default. To connect to your backend:

1. Update `src/services/libraryService.ts` to point to your API endpoints
2. The service methods are already structured for easy API integration
3. Replace mock data with actual API calls

### API Endpoints Expected

- `GET /api/issued-books` - Get user's issued books
- `GET /api/search?q={query}` - Search books
- `GET /api/recommendations?category={cat}` - Get recommendations
- `POST /api/sync-calendar` - Sync to Google Calendar

## Features in Detail

### Google Calendar Integration

The app can sync book due dates to Google Calendar:
- Creates events for each book's due date
- Sets reminders 3 days before due date
- Includes book details in event description

### Library Map

The interactive map shows:
- All library sections with coordinates
- Route calculation from entrance to any section
- Distance and time estimates
- Click-to-navigate functionality

### Smart Recommendations

Recommendations are based on:
- Your branch/course
- Popular books in your category
- Trending books across the library
- Recently added books

## Customization

### Colors

Edit CSS variables in `src/index.css`:
```css
:root {
  --primary: #2563eb;
  --secondary: #10b981;
  /* ... */
}
```

### Library Sections

Update sections in `src/pages/Map.tsx`:
```typescript
const sections: Point[] = [
  { x: 20, y: 15, label: 'Entrance', category: 'entrance' },
  // Add your sections
]
```

## Future Enhancements

- [ ] Real-time book availability updates
- [ ] User authentication
- [ ] Book reservation system
- [ ] Fine payment integration
- [ ] Mobile app version
- [ ] Advanced route optimization
- [ ] Book reviews and ratings

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

