# Quick Start: Gemini API Server

## The "API server not available" Error

This error means the Flask API server is not running. You need to start it before using the AI chat.

## How to Start the API Server

### Option 1: Using the Batch File (Windows - Easiest)

1. **Double-click** the file: `api\start_api.bat`
2. A terminal window will open showing the server starting
3. Keep this window open while using the AI chat

### Option 2: Using Command Line

1. **Open a new terminal/command prompt**
2. **Navigate to the project folder:**
   ```bash
   cd C:\Users\finda\Code\hackathons\mlh\ai_for_dtu
   ```

3. **Make sure dependencies are installed:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the server:**
   ```bash
   python api\gemini_api.py
   ```

5. **You should see:**
   ```
   ============================================================
   Gemini AI API Server
   ============================================================
   Server starting on http://localhost:5000
   ...
   ```

6. **Keep this terminal open** - don't close it!

### Option 3: Using PowerShell

```powershell
cd C:\Users\finda\Code\hackathons\mlh\ai_for_dtu
python api\gemini_api.py
```

## Verify Server is Running

1. Open your browser
2. Go to: `http://localhost:5000/health`
3. You should see: `{"status":"ok","service":"Gemini API"}`

If you see this, the server is running correctly!

## Using the AI Chat

Once the server is running:
1. Go to the Smart Book Search page in your website
2. Click the "AI Assistant" button
3. Start chatting!

## Troubleshooting

### "Module not found" errors
```bash
pip install google-generativeai flask flask-cors
```

### "Port 5000 already in use"
- Close any other applications using port 5000
- Or change the port in `api/gemini_api.py` (line 234) and `website/src/services/geminiService.ts` (line 31)

### Server starts but chat still doesn't work
- Check the browser console for errors (F12)
- Make sure the website is running on `http://localhost:5173` (Vite default)
- Verify CORS is working by checking the server terminal for CORS errors

## Important Notes

- **Keep the server terminal open** while using the AI chat
- The server must be running on `http://localhost:5000`
- You can stop the server by pressing `Ctrl+C` in the terminal

