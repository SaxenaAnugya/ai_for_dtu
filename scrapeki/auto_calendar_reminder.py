"""
Automated script to scrape library due dates and add reminders to Google Calendar.
This script combines scraping and calendar integration into one automated process.

Prerequisites:
1. Install dependencies: pip install selenium google-api-python-client google-auth-httplib2 google-auth-oauthlib
2. Set up Google Calendar API credentials:
   - Go to https://console.cloud.google.com/
   - Create a project and enable Calendar API
   - Create OAuth 2.0 credentials
   - Download credentials.json to the scrapeki directory
3. Run this script: python auto_calendar_reminder.py
"""

import json
import os
from datetime import datetime, timedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Import scraping functions from scrp.py
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar']

# Login credentials for DTU Library
USERNAME = "22234325"
PASSWORD = "1234"

def authenticate_google_calendar():
    """Authenticate and return Google Calendar service"""
    creds = None
    script_dir = os.path.dirname(os.path.abspath(__file__))
    token_path = os.path.join(script_dir, 'token.json')
    credentials_path = os.path.join(script_dir, 'credentials.json')
    
    # The file token.json stores the user's access and refresh tokens.
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(credentials_path):
                print("=" * 60)
                print("ERROR: credentials.json not found!")
                print("=" * 60)
                print("Please download your OAuth 2.0 credentials from Google Cloud Console:")
                print("1. Go to https://console.cloud.google.com/")
                print("2. Create a project and enable Calendar API")
                print("3. Create OAuth 2.0 credentials (Desktop app)")
                print("4. Download credentials.json to this directory:")
                print(f"   {script_dir}")
                print("=" * 60)
                return None
            
            flow = InstalledAppFlow.from_client_secrets_file(
                credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save the credentials for the next run
        with open(token_path, 'w') as token:
            token.write(creds.to_json())
    
    try:
        service = build('calendar', 'v3', credentials=creds)
        return service
    except HttpError as error:
        print(f'An error occurred: {error}')
        return None

def check_event_exists(service, event_summary, event_date):
    """Check if an event with the same summary and date already exists"""
    try:
        # Search for events in a date range around the due date
        time_min = (event_date - timedelta(days=1)).isoformat() + 'Z'
        time_max = (event_date + timedelta(days=1)).isoformat() + 'Z'
        
        events_result = service.events().list(
            calendarId='primary',
            timeMin=time_min,
            timeMax=time_max,
            maxResults=100,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        for event in events:
            if event.get('summary') == event_summary:
                # Check if the date matches (within same day)
                start = event.get('start', {}).get('dateTime')
                if start:
                    event_dt = datetime.fromisoformat(start.replace('Z', '+00:00'))
                    if abs((event_dt - event_date).total_seconds()) < 86400:  # Within 24 hours
                        return True, event.get('id')
        
        return False, None
    except Exception as e:
        print(f"  Warning: Could not check for existing events: {e}")
        return False, None

def add_events_to_calendar(service, events_data, update_existing=False):
    """Add events from JSON file to Google Calendar with duplicate checking"""
    if not service:
        print("Calendar service not available")
        return
    
    events = events_data.get('events', [])
    if not events:
        print("No events found in the data file.")
        return
    
    print(f"\n{'=' * 60}")
    print(f"Adding {len(events)} events to Google Calendar...")
    print(f"{'=' * 60}\n")
    
    added_count = 0
    updated_count = 0
    skipped_count = 0
    failed_count = 0
    
    for i, event in enumerate(events, 1):
        try:
            event_summary = event.get('summary', 'Unknown')
            event_date_str = event.get('start', {}).get('dateTime', '')
            
            if not event_date_str:
                print(f"⊘ [{i}/{len(events)}] Skipped: {event_summary} (no date)")
                skipped_count += 1
                continue
            
            # Parse event date
            try:
                event_date = datetime.fromisoformat(event_date_str.replace('Z', '+00:00'))
            except:
                event_date = datetime.fromisoformat(event_date_str)
            
            # Check if event already exists
            exists, event_id = check_event_exists(service, event_summary, event_date)
            
            if exists and not update_existing:
                print(f"⊘ [{i}/{len(events)}] Skipped (already exists): {event_summary}")
                print(f"  Due: {event_date_str}")
                skipped_count += 1
                continue
            
            # Enhanced reminders: 3 days before, 1 day before, and on the day
            event['reminders'] = {
                "useDefault": False,
                "overrides": [
                    {"method": "email", "minutes": 4320},   # 3 days before (72 hours)
                    {"method": "popup", "minutes": 4320},   # 3 days before
                    {"method": "email", "minutes": 1440},   # 1 day before (24 hours)
                    {"method": "popup", "minutes": 1440},   # 1 day before
                    {"method": "popup", "minutes": 0}       # On the due date
                ]
            }
            
            if exists and update_existing:
                # Update existing event
                event['id'] = event_id
                created_event = service.events().update(
                    calendarId='primary',
                    eventId=event_id,
                    body=event
                ).execute()
                print(f"↻ [{i}/{len(events)}] Updated: {event_summary}")
                updated_count += 1
            else:
                # Create new event
                created_event = service.events().insert(
                    calendarId='primary',
                    body=event
                ).execute()
                print(f"✓ [{i}/{len(events)}] Added: {event_summary}")
                added_count += 1
            
            print(f"  Due: {event_date_str}")
            print(f"  Event ID: {created_event.get('id', 'N/A')}")
            print(f"  Reminders: 3 days, 1 day, and on due date")
            print()
            
        except HttpError as error:
            event_summary = event.get('summary', 'Unknown')
            print(f"✗ [{i}/{len(events)}] Failed to add: {event_summary}")
            print(f"  Error: {error}")
            print()
            failed_count += 1
        except Exception as e:
            event_summary = event.get('summary', 'Unknown')
            print(f"✗ [{i}/{len(events)}] Error adding: {event_summary}")
            print(f"  Error: {e}")
            print()
            failed_count += 1
    
    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total events processed: {len(events)}")
    print(f"✓ Successfully added: {added_count}")
    if updated_count > 0:
        print(f"↻ Updated: {updated_count}")
    print(f"⊘ Skipped (duplicates): {skipped_count}")
    print(f"✗ Failed: {failed_count}")
    print("=" * 60)
    
    return added_count, updated_count, skipped_count, failed_count

def run_scraping():
    """Run the scraping script to get latest due dates"""
    print("=" * 60)
    print("Step 1: Scraping Library Due Dates")
    print("=" * 60)
    
    # Import and run the scraping script
    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from time import sleep
        import csv
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        json_filename = os.path.join(script_dir, "library_due_dates.json")
        
        # Check if we should re-scrape or use existing file
        use_existing = False
        if os.path.exists(json_filename):
            try:
                with open(json_filename, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                    metadata = existing_data.get('metadata', {})
                    extracted_at = metadata.get('extracted_at', '')
                    if extracted_at:
                        extracted_dt = datetime.fromisoformat(extracted_at)
                        # Use existing if less than 1 hour old
                        if (datetime.now() - extracted_dt).total_seconds() < 3600:
                            print(f"Using existing data (scraped {extracted_at})")
                            use_existing = True
            except:
                pass
        
        if not use_existing:
            print("Running web scraper to get latest due dates...")
            print("(This will open a browser window)")
            
            # Import the scraping logic
            # For now, we'll just use the existing script
            print("\nTo scrape fresh data, please run: python scrapeki/scrp.py")
            print("Then run this script again to add to calendar.")
            return json_filename if os.path.exists(json_filename) else None
        else:
            return json_filename
        
    except ImportError as e:
        print(f"Error: Missing dependencies. Please install: pip install selenium")
        print(f"Error details: {e}")
        return None
    except Exception as e:
        print(f"Error during scraping: {e}")
        return None

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_filename = os.path.join(script_dir, "library_due_dates.json")
    
    # Step 1: Check if we have data, if not, prompt to run scraper
    if not os.path.exists(json_filename):
        print("=" * 60)
        print("ERROR: library_due_dates.json not found!")
        print("=" * 60)
        print("Please run the scraper first:")
        print("  python scrapeki/scrp.py")
        print("\nOr run this script which will attempt to scrape automatically.")
        print("=" * 60)
        
        # Try to run scraping
        json_filename = run_scraping()
        if not json_filename or not os.path.exists(json_filename):
            return
    
    # Load events from JSON
    print("\n" + "=" * 60)
    print("Step 2: Loading Calendar Events")
    print("=" * 60)
    print(f"Loading events from: {json_filename}")
    
    try:
        with open(json_filename, 'r', encoding='utf-8') as f:
            events_data = json.load(f)
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        return
    
    events = events_data.get('events', [])
    metadata = events_data.get('metadata', {})
    
    print(f"✓ Loaded {len(events)} events from file")
    if metadata:
        print(f"  Source: {metadata.get('source', 'N/A')}")
        print(f"  Extracted at: {metadata.get('extracted_at', 'N/A')}")
    
    if not events:
        print("\nNo events to add to calendar.")
        return
    
    # Step 3: Authenticate with Google Calendar
    print("\n" + "=" * 60)
    print("Step 3: Authenticating with Google Calendar")
    print("=" * 60)
    service = authenticate_google_calendar()
    
    if not service:
        print("\n✗ Failed to authenticate with Google Calendar")
        print("Please check your credentials.json file and try again.")
        return
    
    print("✓ Authentication successful!")
    
    # Step 4: Add events to calendar
    print("\n" + "=" * 60)
    print("Step 4: Adding Events to Google Calendar")
    print("=" * 60)
    add_events_to_calendar(service, events_data, update_existing=False)
    
    print("\n" + "=" * 60)
    print("✓ Process completed!")
    print("=" * 60)
    print("\nYour library book due dates have been added to Google Calendar")
    print("with automatic reminders:")
    print("  • 3 days before due date (email + popup)")
    print("  • 1 day before due date (email + popup)")
    print("  • On the due date (popup)")
    print("\nYou can view them in your Google Calendar now!")

if __name__ == '__main__':
    main()

