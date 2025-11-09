# Complete Setup Guide for AI Assistant

## Quick Start (All-in-One)

### Step 1: Run the Setup Script

This will install all prerequisites automatically:

```bash
python setup_api.py
```

The script will:
- ✓ Check Python version
- ✓ Install google-generativeai
- ✓ Install flask and flask-cors
- ✓ Verify API key is configured
- ✓ Optionally start the server for you

### Step 2: Start the API Server

**Option A: If setup script didn't start it automatically:**
```bash
python api\gemini_api.py
```

**Option B: Use the batch file (Windows):**
Double-click: `api\start_api.bat`

**Option C: Use the startup script:**
```bash
python start_api_server.py
```

### Step 3: Verify Server is Running

Open browser and go to: `http://localhost:5000/health`

You should see: `{"status":"ok","service":"Gemini API"}`

### Step 4: Use AI Assistant

1. Open your website (usually `http://localhost:5173`)
2. Go to **Smart Book Search** page
3. Click the **"AI Assistant"** button
4. Start chatting!

## Manual Installation (If Setup Script Fails)

### Install Dependencies

```bash
pip install google-generativeai flask flask-cors
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

### Verify Installation

```bash
python -c "import google.generativeai; import flask; import flask_cors; print('All packages installed!')"
```

## API Key

Your Gemini API key is already configured in `api/gemini_api.py`:
- Key: `AIzaSyAoD8aJJ32aVWj4bF9brGzyrIyvpFB0QwM`
- No additional configuration needed!

## Troubleshooting

### "Module not found" errors
```bash
pip install --upgrade google-generativeai flask flask-cors
```

### "Port 5000 already in use"
- Close other applications using port 5000
- Or change port in `api/gemini_api.py` (line 242) and `website/src/services/geminiService.ts` (line 31)

### "API server not available" in chat
- Make sure the server is running (see Step 2)
- Check browser console (F12) for errors
- Verify server is accessible at `http://localhost:5000/health`

### Server starts but chat doesn't work
- Check CORS settings in `api/gemini_api.py`
- Make sure website is running on `http://localhost:5173` (Vite default)
- Check server terminal for error messages

## Important Notes

- **Keep the API server terminal open** while using AI chat
- The server must run on `http://localhost:5000`
- Stop server with `Ctrl+C` in the terminal
- API key is already integrated - no need to change it

## Quick Test

Test the API is working:
```bash
# In browser:
http://localhost:5000/api/gemini/test

# Or in terminal:
curl http://localhost:5000/health
```

