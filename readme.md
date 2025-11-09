📚 Smart Library Management System

“Never pay a library fine again — let technology handle your reminders, navigation, and recommendations.”

🌟 Overview

The Smart Library Management System is a web-based platform designed to make library usage smarter, faster, and more personalized for students.

It integrates with your college OPAC (Online Public Access Catalog) — like DTU’s library system — to automatically fetch issued books, track their due dates, and sync reminders with Google Calendar.

Beyond that, it offers intelligent book search, recommendations, and even indoor navigation inside the library to guide you to the exact rack in the shortest path.

🧠 Inspiration

This project was inspired by a real student experience — forgetting to return books on time and being fined ₹200 due to lack of reminders.
The goal is to prevent overdue fines and make the library experience seamless through automation and AI-powered tools.

🚀 Features
📅 Automated Due Date Reminders

Fetches issued books and due dates directly from the DTU OPAC system.

Automatically syncs due dates to Google Calendar with reminders 2–3 days before.

Option for email or push notifications.

🔍 Smart Book Search & Availability

Search for books by title, author, or topic (e.g., “Economics”, “AI”, “Data Science”).

Instantly see availability status (Available / Issued).

Suggests top-recommended books in that category, ranked by issue frequency from the library database.

🗺️ Library Map & Navigation

Interactive 2D map of the library.

Displays section locations (like “Computer Science”, “Economics”, etc.).

Provides shortest path navigation from entrance or user location to the selected section or book.

📈 Book Recommendations

“Recommended for You” tab showing:

Trending books in the user’s branch.

Most-issued books across the library.

Recently added titles.

🔔 Due Dates & Notifications Dashboard

Color-coded book tracker:

🟢 Due in >3 days

🟠 Due in 1–3 days

🔴 Overdue

Quick “Sync All to Google Calendar” button.

👩‍💻 Admin Dashboard (Optional)

Librarian dashboard for managing books and analyzing usage.

View most issued books, update map sections, and add new entries.

🧩 System Architecture
+-------------------------+
|      Frontend (React)   |
|-------------------------|
| UI for dashboard, search|
| map, and recommendations|
+------------+------------+
             |
             ↓
+-------------------------+
|     Backend (Node/Flask)|
|-------------------------|
| Fetches OPAC data       |
| Integrates Google API   |
| Handles authentication  |
+------------+------------+
             |
             ↓
+-------------------------+
|       Database (MongoDB/Firebase) |
|----------------------------------|
| Stores user, book, and map data  |
+----------------------------------+

⚙️ Tech Stack
Component	Technology
Frontend	React.js + Tailwind CSS
Backend	Node.js / Flask
Database	MongoDB / Firebase
Automation	Selenium or BeautifulSoup (for OPAC scraping)
API Integration	Google Calendar API
Map Rendering	Leaflet.js / Google Maps API
🧭 User Flow

Login: User logs in using DTU OPAC credentials or Google account.

Fetch Books: Issued book data and due dates are fetched automatically.

Reminders: Due dates are added to Google Calendar with auto reminders.

Search: User searches for a topic/book — availability and recommendations appear.

Navigate: The system shows the shortest path to that book’s section on a 2D map.

Notify: Email/push alerts are sent 2–3 days before the due date.

🧪 Future Enhancements

📱 Mobile app version for on-the-go tracking.

🤖 AI chatbot for book recommendations and query assistance.

🔍 Optical recognition for scanning shelf labels via phone camera.

📊 Personalized reading analytics dashboard.

🧑‍💻 Setup Instructions
1️⃣ Clone Repository
git clone https://github.com/your-username/library-management-system.git
cd library-management-system

2️⃣ Install Dependencies
npm install    # For frontend
pip install -r requirements.txt    # For backend (if using Flask)

3️⃣ Environment Variables

Create a .env file and include:

GOOGLE_API_KEY=your_google_calendar_api_key
MONGO_URI=your_database_connection
OPAC_USERNAME=your_dtu_opac_username
OPAC_PASSWORD=your_dtu_opac_password

4️⃣ Run Application
npm start
# or
python app.py

5️⃣ Access

Open your browser at:

http://localhost:3000

🎨 UI Design Highlights

Clean academic UI with white & blue theme.

Responsive dashboard cards for due dates.

Map view with clickable sections and search bar.

Dynamic progress bars and status icons for quick updates.

❤️ Acknowledgments

Delhi Technological University Library (DTU)

Google Calendar API

OPAC system for data access

Inspiration from real student experience

🧑‍🎓 Author

Anugya Saxena
Co-Head, AIMS-DTU | CSE @ DTU | NTSE Scholar
Building tech that simplifies life — one idea at a time.
