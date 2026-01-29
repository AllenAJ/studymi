# Studymi

An AI-powered study companion that helps you learn through the Feynman Technique.

**Created by Allen Joseph**

## Features

- 📝 **Multiple Input Methods** - Text, voice, PDF, or YouTube links
- 🃏 **Flashcards** - Auto-generated flip cards
- ✅ **Quizzes** - Multiple choice questions with scoring
- 🧠 **Mind Maps** - Visual topic breakdowns
- 🎓 **Teach Back** - Explain topics and get AI feedback
- 🌙 **Dark Mode** - Easy on the eyes
- 😎 **Gen Z Mode** - Chill, aesthetic explanations

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your API keys:
   ```env
   # Supabase (get from dashboard.supabase.com > Settings > API)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here

   # Gemini AI
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Set up Supabase database:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the contents of `supabase-schema.sql`

4. Enable Google OAuth (optional):
   - In Supabase, go to Authentication > Providers
   - Enable Google and add your OAuth credentials

5. Run the app:
   ```bash
   npm run dev
   ```

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI
- D3.js (mind maps)
