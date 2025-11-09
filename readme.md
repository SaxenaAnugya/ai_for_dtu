# Smart Library Management System

## Overview
The Smart Library Management System is a web-based platform designed to make library usage smarter, faster, and more personalized for students.

It integrates with the college OPAC (Online Public Access Catalog) — such as DTU’s library system — to automatically fetch issued books, track their due dates, and sync reminders with Google Calendar.

Beyond that, it offers intelligent book search, recommendations, and even indoor navigation inside the library to guide users to the exact rack in the shortest path.

---

## Inspiration
This project was inspired by a real student experience — forgetting to return books on time and being fined ₹200 due to lack of reminders.  
The goal is to prevent overdue fines and make the library experience seamless through automation and smart technologies.

---

## Features

### 1. Automated Due Date Reminders
- Fetches issued books and due dates directly from the OPAC system.
- Automatically syncs due dates to Google Calendar with reminders 2–3 days before.
- Option for email or push notifications.

### 2. Smart Book Search and Availability
- Search for books by title, author, or topic (e.g., "Economics", "AI", "Data Science").
- Instantly shows availability status (Available / Issued).
- Suggests top recommended books in that category, ranked by issue frequency from the library database.

### 3. Library Map and Navigation
- Interactive 2D map of the library.
- Displays section locations (like "Computer Science", "Economics", etc.).
- Provides the shortest path navigation from entrance or user location to the selected section or book.

### 4. Book Recommendations
- A dedicated "Recommended for You" tab showing:
  - Trending books in the user’s branch.
  - Most issued books across the library.
  - Recently added titles.

### 5. Due Dates and Notifications Dashboard
- Color-coded book tracker:
  - Green: Due in more than 3 days  
  - Orange: Due in 1–3 days  
  - Red: Overdue
- Quick "Sync All to Google Calendar" button.

### 6. Admin Dashboard (Optional)
- Librarian dashboard for managing books and analyzing usage.
- View most issued books, update map sections, and add new entries.

---

