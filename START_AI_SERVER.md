# 🚀 Quick Start: AI Assistant

## ✅ All Prerequisites Installed!

Your Gemini API key is already integrated: `AIzaSyAoD8aJJ32aVWj4bF9brGzyrIyvpFB0QwM`

All required packages are installed:
- ✅ google-generativeai
- ✅ flask
- ✅ flask-cors

## 🎯 Start the API Server

**Open a NEW terminal window** and run:

```bash
python api\gemini_api.py
```

You should see:
```
============================================================
Gemini AI API Server
============================================================
Server starting on http://localhost:5000
...
```

**⚠️ IMPORTANT: Keep this terminal window open!**

## ✅ Verify Server is Running

Open your browser and go to:
```
http://localhost:5000/health
```

You should see: `{"status":"ok","service":"Gemini API"}`

## 🎉 Use the AI Assistant

1. Open your website (usually `http://localhost:5173`)
2. Go to **Smart Book Search** page
3. Click the **"AI Assistant"** button (purple button with sparkles icon)
4. Start chatting! Ask questions like:
   - "What books do you recommend for machine learning?"
   - "Find books about data structures"
   - "Suggest books for CSE students"

## 🔧 Troubleshooting

### Server won't start
- Make sure port 5000 is not in use
- Check if all packages are installed: `pip install -r requirements.txt`

### "API server not available" error
- Make sure the server is running (see step above)
- Check browser console (F12) for errors
- Verify server at: `http://localhost:5000/health`

### Chat doesn't respond
- Check the server terminal for error messages
- Make sure your API key is valid
- Check internet connection (Gemini API needs internet)

## 📝 Notes

- The API server must be running for the AI chat to work
- Keep the server terminal open while using the chat
- Stop the server with `Ctrl+C` when done

