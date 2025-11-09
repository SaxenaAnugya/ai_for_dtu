from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
import json
from datetime import datetime, timedelta

username = "22234325"
password = "1234"

# Initialize the WebDriver
driver = webdriver.Chrome()
driver.get("https://dtu.bestbookbuddies.com/cgi-bin/koha/opac-user.pl")

wait = WebDriverWait(driver, 20)  # Increased wait time

try:
    # Step 1: Login automatically
    print("Logging in...")
    print(f"Page title: {driver.title}")
    print(f"Current URL: {driver.current_url}")
    
    # Wait a bit for page to fully load
    sleep(2)
    
    # Try multiple possible field names for username
    username_field = None
    possible_username_fields = ["userid", "username", "cardnumber", "user", "login_userid"]
    
    for field_name in possible_username_fields:
        try:
            print(f"Trying to find username field with name='{field_name}'...")
            username_field = wait.until(EC.presence_of_element_located((By.NAME, field_name)))
            print(f"✓ Found username field: {field_name}")
            break
        except:
            continue
    
    # If not found by name, try by ID
    if username_field is None:
        possible_ids = ["userid", "username", "cardnumber", "user"]
        for field_id in possible_ids:
            try:
                print(f"Trying to find username field with id='{field_id}'...")
                username_field = driver.find_element(By.ID, field_id)
                print(f"✓ Found username field by ID: {field_id}")
                break
            except:
                continue
    
    # If still not found, try to find any input field
    if username_field is None:
        print("Trying to find any input fields on the page...")
        all_inputs = driver.find_elements(By.TAG_NAME, "input")
        print(f"Found {len(all_inputs)} input fields")
        for inp in all_inputs:
            inp_type = inp.get_attribute("type")
            inp_name = inp.get_attribute("name")
            inp_id = inp.get_attribute("id")
            print(f"  Input: type={inp_type}, name={inp_name}, id={inp_id}")
            if inp_type == "text" and (inp_name and ("user" in inp_name.lower() or "card" in inp_name.lower() or "id" in inp_name.lower())):
                username_field = inp
                print(f"✓ Using input field: name={inp_name}")
                break
    
    if username_field is None:
        raise Exception("Could not find username field. Please check the page structure.")
    
    # Wait for element to be interactable and scroll into view
    print("Waiting for username field to be interactable...")
    wait.until(EC.element_to_be_clickable(username_field))
    
    # Scroll element into view
    driver.execute_script("arguments[0].scrollIntoView(true);", username_field)
    sleep(0.5)
    
    # Try to interact with the field
    try:
        # Click the field first to focus it
        username_field.click()
        sleep(0.3)
        username_field.clear()
        username_field.send_keys(username)
        print("✓ Username entered")
    except Exception as e:
        print(f"Normal interaction failed, trying JavaScript: {e}")
        # Fallback: Use JavaScript to set the value
        driver.execute_script("arguments[0].value = arguments[1];", username_field, username)
        # Trigger input event to ensure the form recognizes the change
        driver.execute_script("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", username_field)
        driver.execute_script("arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", username_field)
        print("✓ Username entered via JavaScript")
    
    # Find password field
    password_field = None
    try:
        password_field = driver.find_element(By.NAME, "password")
    except:
        try:
            password_field = driver.find_element(By.ID, "password")
        except:
            # Try to find password input by type
            all_inputs = driver.find_elements(By.TAG_NAME, "input")
            for inp in all_inputs:
                if inp.get_attribute("type") == "password":
                    password_field = inp
                    break
    
    if password_field is None:
        raise Exception("Could not find password field.")
    
    # Wait for password field to be interactable and scroll into view
    print("Waiting for password field to be interactable...")
    wait.until(EC.element_to_be_clickable(password_field))
    driver.execute_script("arguments[0].scrollIntoView(true);", password_field)
    sleep(0.5)
    
    # Try to interact with the password field
    try:
        password_field.click()
        sleep(0.3)
        password_field.clear()
        password_field.send_keys(password)
        print("✓ Password entered")
    except Exception as e:
        print(f"Normal interaction failed, trying JavaScript: {e}")
        # Fallback: Use JavaScript to set the value
        driver.execute_script("arguments[0].value = arguments[1];", password_field, password)
        driver.execute_script("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", password_field)
        driver.execute_script("arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", password_field)
        print("✓ Password entered via JavaScript")
    
    # Find login button
    login_button = None
    try:
        login_button = driver.find_element(By.NAME, "login")
    except:
        try:
            login_button = driver.find_element(By.ID, "login")
        except:
            try:
                # Try to find button with text containing "login" or "sign in"
                buttons = driver.find_elements(By.TAG_NAME, "button")
                for btn in buttons:
                    if "login" in btn.text.lower() or "sign in" in btn.text.lower():
                        login_button = btn
                        break
            except:
                # Try input with type="submit"
                submit_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='submit']")
                if submit_inputs:
                    login_button = submit_inputs[0]
    
    if login_button is None:
        raise Exception("Could not find login button.")
    
    # Wait for login button to be clickable and scroll into view
    print("Waiting for login button to be clickable...")
    wait.until(EC.element_to_be_clickable(login_button))
    driver.execute_script("arguments[0].scrollIntoView(true);", login_button)
    sleep(0.5)
    
    # Try to click the login button
    try:
        login_button.click()
        print("✓ Login button clicked")
    except Exception as e:
        print(f"Normal click failed, trying JavaScript: {e}")
        # Fallback: Use JavaScript to click
        driver.execute_script("arguments[0].click();", login_button)
        print("✓ Login button clicked via JavaScript")
    
    # Wait for login to complete and page to load
    sleep(3)
    print("Login successful!")
    
    # Step 2: Wait for the checkouts table to be present
    print("Waiting for checkouts table...")
    checkout_table = wait.until(EC.presence_of_element_located((By.ID, "checkoutst")))
    
    # Step 3: Find all rows in the tbody of the checkouts table
    rows = checkout_table.find_elements(By.CSS_SELECTOR, "tbody tr")
    
    checkout_data = []
    calendar_events = []
    
    # Helper function to parse date from format "DD/MM/YYYY HH:MM" or "DD/MM/YYYY"
    def parse_date(date_str):
        """Parse date string and return datetime object"""
        try:
            # Try format: "19/08/2025 20:26" or "06/01/2026"
            date_str = date_str.strip()
            if ' ' in date_str:
                date_part, time_part = date_str.split(' ', 1)
                day, month, year = map(int, date_part.split('/'))
                hour, minute = map(int, time_part.split(':'))
                return datetime(year, month, day, hour, minute)
            else:
                day, month, year = map(int, date_str.split('/'))
                # Set time to end of day (23:59) for due dates
                return datetime(year, month, day, 23, 59)
        except Exception as e:
            print(f"Error parsing date '{date_str}': {e}")
            return None
    
    # Helper function to convert datetime to RFC3339 format for Google Calendar
    def to_rfc3339(dt):
        """Convert datetime to RFC3339 format (Google Calendar API format)"""
        if dt is None:
            return None
        return dt.strftime('%Y-%m-%dT%H:%M:%S')
    
    # Step 4: Extract checkout date and due date from each row
    for row in rows:
        try:
            # Extract checkout date - class: checkout_date
            checkout_date_elem = row.find_element(By.CSS_SELECTOR, "td.checkout_date")
            checkout_date_str = checkout_date_elem.text.strip()
            
            # Extract due date - class: date_due
            due_date_elem = row.find_element(By.CSS_SELECTOR, "td.date_due")
            due_date_str = due_date_elem.text.strip()
            
            # Optionally extract title for reference
            try:
                title_elem = row.find_element(By.CSS_SELECTOR, "td.title .biblio-title")
                title = title_elem.text.strip()
            except:
                title = "N/A"
            
            # Parse dates
            checkout_date_dt = parse_date(checkout_date_str)
            due_date_dt = parse_date(due_date_str)
            
            # Store the extracted data (raw format)
            item_data = {
                "title": title,
                "checkout_date": checkout_date_str,
                "due_date": due_date_str
            }
            
            checkout_data.append(item_data)
            
            # Create Google Calendar event format
            if due_date_dt:
                # Set reminder 1 day before due date
                reminder_date = due_date_dt - timedelta(days=1)
                
                calendar_event = {
                    "summary": f"Library Book Due: {title}",
                    "description": f"Book: {title}\nChecked out on: {checkout_date_str}\nDue date: {due_date_str}",
                    "start": {
                        "dateTime": to_rfc3339(due_date_dt),
                        "timeZone": "Asia/Kolkata"  # Adjust timezone as needed
                    },
                    "end": {
                        "dateTime": to_rfc3339(due_date_dt + timedelta(hours=1)),
                        "timeZone": "Asia/Kolkata"
                    },
                    "reminders": {
                        "useDefault": False,
                        "overrides": [
                            {"method": "email", "minutes": 1440},  # 1 day before
                            {"method": "popup", "minutes": 1440}   # 1 day before
                        ]
                    }
                }
                
                calendar_events.append(calendar_event)
            
        except Exception as e:
            print(f"Error extracting data from row: {e}")
            continue
    
    # Step 5: Display the extracted data
    print("\n" + "=" * 80)
    print("CHECKED OUT ITEMS - CHECKOUT AND DUE DATES")
    print("=" * 80)
    
    for i, item in enumerate(checkout_data, 1):
        print(f"\nItem {i}:")
        print(f"  Title: {item['title']}")
        print(f"  Checked out on: {item['checkout_date']}")
        print(f"  Due date: {item['due_date']}")
        print("-" * 80)
    
    print(f"\nTotal items checked out: {len(checkout_data)}")
    
    # Step 6: Save data in formats suitable for Google Calendar API
    # Save as JSON for Google Calendar API
    calendar_json = {
        "events": calendar_events,
        "metadata": {
            "total_events": len(calendar_events),
            "extracted_at": datetime.now().isoformat(),
            "source": "DTU Library Checkouts"
        }
    }
    
    # Save to JSON file
    json_filename = "library_due_dates.json"
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(calendar_json, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Calendar events saved to {json_filename}")
    
    # Also save raw data for reference
    raw_data_filename = "library_checkout_data.json"
    with open(raw_data_filename, 'w', encoding='utf-8') as f:
        json.dump({
            "checkout_data": checkout_data,
            "extracted_at": datetime.now().isoformat()
        }, f, indent=2, ensure_ascii=False)
    print(f"✓ Raw checkout data saved to {raw_data_filename}")
    
    # Print sample of calendar events
    print("\n" + "=" * 80)
    print("GOOGLE CALENDAR EVENTS (Sample)")
    print("=" * 80)
    for i, event in enumerate(calendar_events[:3], 1):  # Show first 3
        print(f"\nEvent {i}:")
        print(f"  Summary: {event['summary']}")
        print(f"  Start: {event['start']['dateTime']}")
        print(f"  End: {event['end']['dateTime']}")
        print(f"  Description: {event['description'][:50]}...")
    
    if len(calendar_events) > 3:
        print(f"\n... and {len(calendar_events) - 3} more events")
    
    # Keep browser open to see results
    sleep(5)
    
except Exception as e:
    print(f"An error occurred: {e}")
    import traceback
    traceback.print_exc()
    sleep(10)  # Keep browser open to debug

finally:
    driver.close()
