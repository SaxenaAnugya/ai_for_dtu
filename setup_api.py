"""
Setup script to install all prerequisites and verify Gemini API integration
Run this script to set up everything needed for the AI assistant
"""

import subprocess
import sys
import os

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("ERROR: Python 3.8 or higher is required!")
        print(f"Current version: {sys.version}")
        return False
    print(f"[OK] Python version: {sys.version.split()[0]}")
    return True

def install_package(package):
    """Install a package using pip"""
    try:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package], 
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"[OK] {package} installed successfully")
        return True
    except subprocess.CalledProcessError:
        print(f"[X] Failed to install {package}")
        return False

def check_package(package_name, import_name=None):
    """Check if a package is installed"""
    if import_name is None:
        import_name = package_name
    
    try:
        __import__(import_name)
        print(f"[OK] {package_name} is installed")
        return True
    except ImportError:
        print(f"[X] {package_name} is NOT installed")
        return False

def main():
    print("=" * 60)
    print("Gemini API Setup Script")
    print("=" * 60)
    print()
    
    # Check Python version
    if not check_python_version():
        input("Press Enter to exit...")
        sys.exit(1)
    
    print()
    print("Checking required packages...")
    print("-" * 60)
    
    # Required packages - (package_name, import_name)
    packages = [
        ("google-generativeai", "google.generativeai"),
        ("flask", "flask"),
        ("flask-cors", "flask_cors"),
    ]
    
    # Special handling for google-generativeai which might need a different import check
    def check_google_genai():
        try:
            import google.generativeai as genai
            return True
        except ImportError:
            try:
                from google import genai
                return True
            except ImportError:
                return False
    
    missing_packages = []
    for package, import_name in packages:
        if package == "google-generativeai":
            # Special check for google-generativeai
            if not check_google_genai():
                missing_packages.append(package)
        else:
            if not check_package(package, import_name):
                missing_packages.append(package)
    
    print()
    
    if missing_packages:
        print("Installing missing packages...")
        print("-" * 60)
        for package in missing_packages:
            install_package(package)
        print()
    
    # Verify all packages are now installed
    print("Verifying installation...")
    print("-" * 60)
    all_installed = True
    for package, import_name in packages:
        if package == "google-generativeai":
            if not check_google_genai():
                all_installed = False
        else:
            if not check_package(package, import_name):
                all_installed = False
    
    print()
    
    if not all_installed:
        print("=" * 60)
        print("ERROR: Some packages failed to install")
        print("=" * 60)
        print("Please try installing manually:")
        print("  pip install -r requirements.txt")
        print("=" * 60)
        return
    
    # Check API key
    print("Checking API configuration...")
    print("-" * 60)
    api_file = os.path.join("api", "gemini_api.py")
    if os.path.exists(api_file):
        with open(api_file, 'r') as f:
            content = f.read()
            if "AIzaSyAoD8aJJ32aVWj4bF9brGzyrIyvpFB0QwM" in content:
                print("[OK] Gemini API key is configured")
            else:
                print("⚠ API key not found in gemini_api.py")
    else:
        print("⚠ api/gemini_api.py not found")
    
    print()
    print("=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Start the API server:")
    print("   python api\\gemini_api.py")
    print()
    print("2. Keep the server running and open your website")
    print()
    print("3. Click 'AI Assistant' in the Smart Book Search page")
    print()
    print("=" * 60)
    
    print("\nTo start the API server, run:")
    print("  python api\\gemini_api.py")
    print("\nOr use the batch file:")
    print("  api\\start_api.bat")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user.")
    except Exception as e:
        print(f"\n\nError during setup: {e}")
        import traceback
        traceback.print_exc()

