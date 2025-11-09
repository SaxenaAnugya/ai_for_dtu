"""
Simple script to start the Gemini API server
Run this file to start the API server for the AI chat feature
"""

import os
import sys

# Add the api directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Check if required packages are installed
try:
    import flask
    import flask_cors
    import google.generativeai
    print("✓ All required packages are installed")
except ImportError as e:
    print("=" * 60)
    print("ERROR: Missing required package!")
    print("=" * 60)
    print(f"Missing: {e.name}")
    print("\nPlease install all dependencies:")
    print("  pip install -r requirements.txt")
    print("=" * 60)
    input("Press Enter to exit...")
    sys.exit(1)

# Start the API server
if __name__ == '__main__':
    print("=" * 60)
    print("Starting Gemini API Server...")
    print("=" * 60)
    print()
    
    # Change to api directory and run the server
    api_dir = os.path.join(os.path.dirname(__file__), 'api')
    os.chdir(api_dir)
    
    # Run the gemini_api.py file
    import subprocess
    subprocess.run([sys.executable, 'gemini_api.py'])

