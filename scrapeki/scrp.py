"""
Web scraper for DTU Library to extract checkout and due dates
and format them for Google Calendar API reminders.
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
import json
import os
import csv
from datetime import datetime, timedelta

# Login credentials
username = "22234325"
password = "1234"

# Initialize the WebDriver
driver = webdriver.Chrome()
driver.get("https://dtu.bestbookbuddies.com/cgi-bin/koha/opac-user.pl")

wait = WebDriverWait(driver, 20)

def parse_date(date_str):
    """Parse date string from format 'DD/MM/YYYY HH:MM' or 'DD/MM/YYYY' and return datetime object"""
    try:
        date_str = date_str.strip()
        if ' ' in date_str:
            date_part, time_part = date_str.split(' ', 1)
            day, month, year = map(int, date_part.split('/'))
            hour, minute = map(int, time_part.split(':'))
            return datetime(year, month, day, hour, minute)
        else:
            day, month, year = map(int, date_str.split('/'))
            return datetime(year, month, day, 23, 59)  # End of day for due dates
    except Exception as e:
        print(f"Error parsing date '{date_str}': {e}")
        return None

def to_rfc3339(dt):
    """Convert datetime to RFC3339 format for Google Calendar API"""
    if dt is None:
        return None
    return dt.strftime('%Y-%m-%dT%H:%M:%S')

try:
    # Step 1: Automatic Login
    print("=" * 60)
    print("DTU Library Web Scraper - Login")
    print("=" * 60)
    print(f"Page: {driver.title}")
    
    sleep(2)  # Wait for page to load
    
    # Find username field using specific selectors: id="userid" or name="login_userid"
    print("Finding username field...")
    username_field = None
    try:
        username_field = wait.until(EC.presence_of_element_located((By.ID, "userid")))
        print("✓ Found username field by ID: userid")
    except:
        try:
            username_field = wait.until(EC.presence_of_element_located((By.NAME, "login_userid")))
            print("✓ Found username field by NAME: login_userid")
        except:
            raise Exception("Could not find username field with id='userid' or name='login_userid'")
    
    # Enter username
    wait.until(EC.element_to_be_clickable(username_field))
    driver.execute_script("arguments[0].scrollIntoView(true);", username_field)
    sleep(0.5)
    
    try:
        username_field.click()
        sleep(0.3)
        username_field.clear()
        username_field.send_keys(username)
        print(f"✓ Username '{username}' entered")
    except Exception as e:
        print(f"Normal interaction failed, using JavaScript: {e}")
        driver.execute_script("arguments[0].value = arguments[1];", username_field, username)
        driver.execute_script("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", username_field)
        driver.execute_script("arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", username_field)
        print(f"✓ Username '{username}' entered via JavaScript")
    
    # Find password field using specific selectors: id="password" or name="login_password"
    print("Finding password field...")
    password_field = None
    try:
        password_field = wait.until(EC.presence_of_element_located((By.ID, "password")))
        print("✓ Found password field by ID: password")
    except:
        try:
            password_field = wait.until(EC.presence_of_element_located((By.NAME, "login_password")))
            print("✓ Found password field by NAME: login_password")
        except:
            raise Exception("Could not find password field with id='password' or name='login_password'")
    
    wait.until(EC.element_to_be_clickable(password_field))
    driver.execute_script("arguments[0].scrollIntoView(true);", password_field)
    sleep(0.5)
    
    try:
        password_field.click()
        sleep(0.3)
        password_field.clear()
        password_field.send_keys(password)
        print("✓ Password entered")
    except Exception as e:
        print(f"Normal interaction failed, using JavaScript: {e}")
        driver.execute_script("arguments[0].value = arguments[1];", password_field, password)
        driver.execute_script("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", password_field)
        driver.execute_script("arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", password_field)
        print("✓ Password entered via JavaScript")
    
    # Find and click login button: <input type="submit" value="Log in" class="btn btn-primary">
    print("Finding login button...")
    login_button = None
    try:
        # First try: Exact match - input with type="submit", class="btn btn-primary", value="Log in"
        try:
            login_button = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='submit'].btn.btn-primary[value='Log in']")))
            print("✓ Found login button: input[type='submit'].btn.btn-primary[value='Log in']")
        except:
            # Second try: Find by class and value (without type check)
            try:
                login_button = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input.btn.btn-primary[value='Log in']")))
                print("✓ Found login button: input.btn.btn-primary[value='Log in']")
            except:
                # Third try: Find button inside fieldset.action
                try:
                    login_button = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "fieldset.action input[type='submit'].btn.btn-primary[value='Log in']")))
                    print("✓ Found login button inside fieldset.action")
                except:
                    # Fourth try: Find by fieldset.action and button attributes
                    try:
                        login_button = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "fieldset.action input[type='submit'][value='Log in']")))
                        print("✓ Found login button in fieldset.action by value")
                    except:
                        # Fifth try: Find button inside fieldset.action (any submit button)
                        try:
                            login_button = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "fieldset.action input[type='submit']")))
                            print("✓ Found login button in fieldset.action")
                        except:
                            # Sixth try: Find by class only
                            try:
                                login_button = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='submit'].btn.btn-primary")))
                                print("✓ Found login button by class")
                            except:
                                # Seventh try: Find by value attribute (search all submit buttons)
                                login_buttons = driver.find_elements(By.CSS_SELECTOR, "input[type='submit']")
                                for btn in login_buttons:
                                    if btn.get_attribute("value") == "Log in":
                                        login_button = btn
                                        print("✓ Found login button by value attribute")
                                        break
                                if login_button is None and login_buttons:
                                    # Use first submit button if no exact match
                                    login_button = login_buttons[0]
                                    print("✓ Found login button: first input[type='submit']")
    except Exception as e:
        print(f"Error finding login button: {e}")
        raise Exception("Could not find login button")
    
    if login_button:
        # Wait for button to be clickable
        wait.until(EC.element_to_be_clickable(login_button))
        # Scroll button into view
        driver.execute_script("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", login_button)
        sleep(1)
        
        # Try multiple click methods
        clicked = False
        try:
            # Method 1: Normal click
            login_button.click()
            clicked = True
            print("✓ Login button clicked (normal click)")
        except Exception as e1:
            print(f"Normal click failed: {e1}, trying JavaScript click...")
            try:
                # Method 2: JavaScript click
                driver.execute_script("arguments[0].click();", login_button)
                clicked = True
                print("✓ Login button clicked (JavaScript click)")
            except Exception as e2:
                print(f"JavaScript click failed: {e2}, trying form submit...")
                try:
                    # Method 3: Submit the form directly
                    form = login_button.find_element(By.XPATH, "./ancestor::form")
                    driver.execute_script("arguments[0].submit();", form)
                    clicked = True
                    print("✓ Login form submitted (form submit)")
                except Exception as e3:
                    print(f"Form submit failed: {e3}, trying dispatchEvent...")
                    # Method 4: Dispatch click event
                    driver.execute_script("""
                        var btn = arguments[0];
                        var evt = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        btn.dispatchEvent(evt);
                    """, login_button)
                    clicked = True
                    print("✓ Login button clicked (dispatchEvent)")
        
        if not clicked:
            raise Exception("All click methods failed")
    else:
        raise Exception("Login button not found")
    
    # Wait for login to complete
    sleep(3)
    print("✓ Login successful!\n")
    
    # Step 2: Extract tabular data from dashboard
    print("=" * 60)
    print("Extracting Book Names and Due Dates")
    print("=" * 60)
    
    # Wait for dashboard to load and checkouts table to appear
    print("Waiting for dashboard to load...")
    sleep(3)
    
    # Wait for checkouts table
    checkout_table = wait.until(EC.presence_of_element_located((By.ID, "checkoutst")))
    print("✓ Found checkouts table")
    
    # Find all rows in tbody
    rows = checkout_table.find_elements(By.CSS_SELECTOR, "tbody tr")
    print(f"✓ Found {len(rows)} checked out items\n")
    
    checkout_data = []
    calendar_events = []
    
    # Extract data from each row
    for i, row in enumerate(rows, 1):
        try:
            # Extract book name from <span class="biblio-title">
            try:
                title_elem = row.find_element(By.CSS_SELECTOR, "span.biblio-title")
                title = title_elem.text.strip()
                print(f"Item {i}: {title}")
            except Exception as e:
                print(f"✗ Could not find book title in row {i}: {e}")
                title = f"Book {i}"
            
            # Extract due date from the "Due" column
            # The Due column has class containing "dt-type-date"
            # We need to find the td in the same column position as the "Due" header
            try:
                # Find the Due date cell - it's in a column with date_due class
                due_date_elem = row.find_element(By.CSS_SELECTOR, "td.date_due")
                due_date_str = due_date_elem.text.strip()
                print(f"  Due date: {due_date_str}")
            except:
                # Alternative: try to find by data-order attribute or by position
                try:
                    # Find all date cells in the row
                    date_cells = row.find_elements(By.CSS_SELECTOR, "td[class*='date'], td[data-order]")
                    # The due date is typically the last date column
                    if date_cells:
                        due_date_elem = date_cells[-1]  # Last date cell is usually due date
                        due_date_str = due_date_elem.text.strip()
                        print(f"  Due date: {due_date_str}")
                    else:
                        raise Exception("No date cells found")
                except Exception as e:
                    print(f"✗ Could not find due date in row {i}: {e}")
                    due_date_str = None
            
            # Extract checkout date if available (optional)
            checkout_date_str = None
            try:
                checkout_date_elem = row.find_element(By.CSS_SELECTOR, "td.checkout_date")
                checkout_date_str = checkout_date_elem.text.strip()
                print(f"  Checkout date: {checkout_date_str}")
            except:
                pass  # Checkout date is optional
            
            # Extract author if available (optional)
            author = "N/A"
            try:
                author_elem = row.find_element(By.CSS_SELECTOR, "td.author")
                author = author_elem.text.strip()
            except:
                pass
            
            # Parse due date
            due_date_dt = None
            if due_date_str:
                due_date_dt = parse_date(due_date_str)
            
            # Store raw data
            item_data = {
                "title": title,
                "author": author,
                "checkout_date": checkout_date_str if checkout_date_str else "N/A",
                "due_date": due_date_str if due_date_str else "N/A"
            }
            checkout_data.append(item_data)
            
            # Create Google Calendar event only if we have a valid due date
            if due_date_dt:
                calendar_event = {
                    "summary": f"Library Book Due: {title}",
                    "description": f"Book: {title}\nAuthor: {author}\n" + 
                                 (f"Checked out on: {checkout_date_str}\n" if checkout_date_str else "") +
                                 f"Due date: {due_date_str}",
                    "start": {
                        "dateTime": to_rfc3339(due_date_dt),
                        "timeZone": "Asia/Kolkata"
                    },
                    "end": {
                        "dateTime": to_rfc3339(due_date_dt + timedelta(hours=1)),
                        "timeZone": "Asia/Kolkata"
                    },
                    "reminders": {
                        "useDefault": False,
                        "overrides": [
                            {"method": "email", "minutes": 4320},   # 3 days before (72 hours)
                            {"method": "popup", "minutes": 4320},   # 3 days before
                            {"method": "email", "minutes": 1440},   # 1 day before (24 hours)
                            {"method": "popup", "minutes": 1440},   # 1 day before
                            {"method": "popup", "minutes": 0}       # On the due date
                        ]
                    }
                }
                calendar_events.append(calendar_event)
                print(f"  ✓ Calendar event created")
            else:
                print(f"  ✗ Skipped calendar event (no valid due date)")
            
            print()  # Empty line for readability
            
        except Exception as e:
            print(f"✗ Error extracting data from row {i}: {e}")
            import traceback
            traceback.print_exc()
            continue
    
    print(f"\n✓ Extracted {len(checkout_data)} items")
    
    # Step 3: Save data for Google Calendar API
    print("\n" + "=" * 60)
    print("Saving Data for Google Calendar API")
    print("=" * 60)
    
    # Save calendar events JSON
    calendar_json = {
        "events": calendar_events,
        "metadata": {
            "total_events": len(calendar_events),
            "extracted_at": datetime.now().isoformat(),
            "source": "DTU Library Checkouts"
        }
    }
    
    # Save calendar events JSON to scrapeki folder
    output_dir = os.path.dirname(os.path.abspath(__file__))
    json_filename = os.path.join(output_dir, "library_due_dates.json")
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(calendar_json, f, indent=2, ensure_ascii=False)
    print(f"✓ Calendar events saved to: {json_filename}")
    
    # Save raw data to scrapeki folder
    raw_data_filename = os.path.join(output_dir, "library_checkout_data.json")
    with open(raw_data_filename, 'w', encoding='utf-8') as f:
        json.dump({
            "checkout_data": checkout_data,
            "extracted_at": datetime.now().isoformat()
        }, f, indent=2, ensure_ascii=False)
    print(f"✓ Raw checkout data saved to: {raw_data_filename}")
    
    # Also save a simple CSV file for easy viewing
    csv_filename = os.path.join(output_dir, "library_books.csv")
    with open(csv_filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["Title", "Author", "Checkout Date", "Due Date"])
        for item in checkout_data:
            writer.writerow([
                item['title'],
                item['author'],
                item['checkout_date'],
                item['due_date']
            ])
    print(f"✓ CSV data saved to: {csv_filename}")
    
    # Display summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Total items checked out: {len(checkout_data)}")
    print(f"Calendar events created: {len(calendar_events)}")
    print("\nSample calendar events:")
    for i, event in enumerate(calendar_events[:3], 1):
        print(f"  {i}. {event['summary']}")
        print(f"     Due: {event['start']['dateTime']}")
    
    if len(calendar_events) > 3:
        print(f"  ... and {len(calendar_events) - 3} more events")
    
    print("\n✓ Data ready for Google Calendar API!")
    print("\n" + "=" * 60)
    print("Browser will stay open for 30 seconds for verification...")
    print("You can manually close it or wait for auto-close.")
    print("=" * 60)
    sleep(30)  # Keep browser open for 30 seconds
    
except Exception as e:
    print(f"\n✗ An error occurred: {e}")
    import traceback
    traceback.print_exc()
    print("\n" + "=" * 60)
    print("Browser will stay open for 30 seconds for debugging...")
    print("=" * 60)
    sleep(30)  # Keep browser open for debugging

finally:
    print("\nClosing browser...")
    driver.close()
    print("✓ Browser closed")

