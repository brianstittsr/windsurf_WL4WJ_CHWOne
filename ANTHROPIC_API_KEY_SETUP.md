# 🔑 Quick Setup: Anthropic API Key

## The Error You're Seeing:
```
API Error: 500 Internal Server Error
Document analysis failed. Please ensure you have a valid Anthropic API key configured.
```

## ✅ Solution (3 Steps):

### Step 1: Get Your API Key
1. Go to: **https://console.anthropic.com/**
2. Sign up or log in
3. Click "API Keys" in the sidebar
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-api03-...`)

### Step 2: Add to .env.local
Open your `.env.local` file and add this line:

```env
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
```

**Important:** Replace `YOUR_KEY_HERE` with your actual API key!

### Step 3: Restart Dev Server
```bash
# Stop the server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

## 💡 What This Does:
The Anthropic Claude AI automatically analyzes uploaded grant documents and extracts:
- Grant title and description
- Funding source and amount
- Timeline and deadlines
- Collaborating organizations
- Data collection requirements
- Project milestones

## 💰 Cost:
- **~$0.001 per document** (less than a penny!)
- Free tier: 5 requests/minute
- Perfect for development and testing

## 🔒 Security:
- ✅ `.env.local` is already in `.gitignore`
- ✅ Never commit API keys to version control
- ✅ API key only works server-side (not exposed to browser)

## ❓ Need Help?
See full documentation: `docs/ANTHROPIC_API_SETUP.md`

---

**Status:** ⚠️ Not configured yet
**Priority:** Medium (grant analysis won't work without it)
**Time to fix:** ~2 minutes
