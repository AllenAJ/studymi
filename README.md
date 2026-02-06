# Studymi

An AI-powered study companion that helps you learn through the Feynman Technique.

**Created by Allen Joseph**

---

### 🏆 Commit To Change Hackathon (Encode Club) – Best Use of Opik

StudyMi integrates **Opik** for LLM observability: every study-set generation and Teach Back grading is traced (prompts, responses, token usage, errors) in the **studymi** project on [Opik](https://www.comet.com/opik). Traces include **tags** (action, Gen Z vs standard) and **feedback scores** (`study_set_quality`, `teach_back_score`) so judges can filter and sort by quality in the dashboard. For judges: see **[OPIK.md](./OPIK.md)** for where to view the dashboard, what we trace, and how we use it.

---

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

   If you see **"API Key not found"** or **"Gemini API key not found"** when generating a study set: ensure `GEMINI_API_KEY` is in `.env`, then **restart the dev server** (stop and run `npm run dev` again) so the key is loaded. For production (e.g. Vercel), set `GEMINI_API_KEY` in your project’s Environment Variables.

### LLM observability (Opik, optional)

To log Gemini traces to [Opik](https://github.com/comet-ml/opik) for debugging and evaluation, add to `.env`:

```env
OPIK_API_KEY=your_opik_api_key
OPIK_WORKSPACE_NAME=your_workspace
OPIK_PROJECT_NAME=studymi
```

Leave these unset to run without tracing.

**Test Opik from localhost:** run `npm run dev:api` (uses Vercel CLI to serve the API locally), open **http://localhost:3000?useServer=1**, log in, and generate a study set. Traces will appear in your Opik project.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI
- D3.js (mind maps)
