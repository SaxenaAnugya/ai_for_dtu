# DTU Library Book Due Date Reminder System

This system automatically scrapes library book due dates and adds reminders to Google Calendar.

## Files

1. **dataa.py** / **scrp.py** - Web scraper that logs into DTU Library and extracts book due dates
2. **add_to_google_calendar.py** - Script to add the scraped dates to Google Calendar
3. **auto_calendar_reminder.py** - **NEW!** Automated script that combines scraping and calendar integration
4. **library_due_dates.json** - Generated file with calendar events (created by scraper)
5. **library_checkout_data.json** - Raw scraped data (created by scraper)
6. **library_books.csv** - CSV file for easy viewing (created by scraper)

## Setup

### 1. Install Dependencies

```bash
pip install selenium google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

### 2. Set Up Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Desktop app" as application type
   - Download the credentials file
   - Rename it to `credentials.json` and place it in the `scrapeki` folder

## Usage

### 🚀 Quick Start (Automated - Recommended)

**One-command solution** that scrapes and adds to calendar automatically:

```bash
python scrapeki/auto_calendar_reminder.py
```

This script will:
1. Check for existing scraped data (uses if less than 1 hour old)
2. Authenticate with Google Calendar
3. Add all due dates with automatic reminders
4. Skip duplicate events (won't create duplicates)
5. Set multiple reminders: 3 days, 1 day, and on due date

**First time setup:**
- A browser window will open for Google Calendar authentication
- Sign in with your Google account
- Grant permissions for Calendar access
- A `token.json` file will be created (saved for future use)

### Manual Two-Step Process

#### Step 1: Scrape Library Data

Run the scraper to extract book due dates:

```bash
python scrapeki/dataa.py
# or
python scrapeki/scrp.py
```

This will:
- Automatically log into DTU Library
- Extract all checked out books and their due dates
- Save data to JSON and CSV files
- Keep browser open for 30 seconds for verification

**Output files:**
- `library_due_dates.json` - Ready for Google Calendar API
- `library_checkout_data.json` - Raw data
- `library_books.csv` - Easy-to-read CSV format

#### Step 2: Add to Google Calendar

After scraping, add the events to your Google Calendar:

```bash
python scrapeki/add_to_google_calendar.py
```

**What it does:**
- Reads `library_due_dates.json`
- Creates calendar events for each book's due date
- Sets reminders (email and popup) 3 days, 1 day, and on due date
- Shows summary of added events

## Features

- ✅ **Automatic login** to DTU Library
- ✅ **Extracts** book titles, authors, checkout dates, and due dates
- ✅ **Creates Google Calendar events** with proper formatting
- ✅ **Multiple reminders**: 3 days before, 1 day before, and on due date
- ✅ **Duplicate detection**: Won't create duplicate events
- ✅ **Saves data** in multiple formats (JSON, CSV)
- ✅ **Error handling** and detailed logging
- ✅ **One-command automation** with `auto_calendar_reminder.py`

## Troubleshooting

### ChromeDriver Issues
- Make sure Chrome browser is installed
- Selenium will automatically download ChromeDriver if needed

### Google Calendar API Issues
- Verify `credentials.json` is in the `scrapeki` folder
- Check that Calendar API is enabled in Google Cloud Console
- Delete `token.json` and re-authenticate if needed

### Login Issues
- Verify credentials in `dataa.py` are correct
- Check if DTU Library website structure has changed
- Browser will stay open for 30 seconds for debugging

## Notes

- The scraper keeps the browser open for 30 seconds after completion
- Events are added to your primary Google Calendar
- **Reminders are set for:**
  - 3 days before due date (email + popup)
  - 1 day before due date (email + popup)
  - On the due date (popup)
- Timezone is set to "Asia/Kolkata" (adjust in code if needed)
- Duplicate events are automatically detected and skipped
- You can run `auto_calendar_reminder.py` daily/weekly to keep reminders updated

## Automation

To run automatically on a schedule:

### Windows (Task Scheduler)
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., daily at 9 AM)
4. Action: Start a program
5. Program: `python`
6. Arguments: `C:\path\to\scrapeki\auto_calendar_reminder.py`

### Linux/Mac (Cron)
Add to crontab (`crontab -e`):
```bash
# Run daily at 9 AM
0 9 * * * cd /path/to/scrapeki && python auto_calendar_reminder.py
```

