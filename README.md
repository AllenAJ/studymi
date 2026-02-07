# Studymi

An AI-powered study companion that helps you learn through the Feynman Technique.

**Author:** Allen Joseph

---

## Commit To Change Hackathon (Encode Club) – Best Use of Opik

Studymi integrates **Opik** for LLM observability. Every study-set generation and Teach Back grading is traced (prompts, responses, token usage, errors) in the **studymi** project on [Opik](https://www.comet.com/opik). Traces include tags (action, Gen Z vs standard) and feedback scores (`study_set_quality`, `teach_back_score`) so judges can filter and sort by quality in the dashboard.

For judges: see **[OPIK.md](./OPIK.md)** for where to view the dashboard, what we trace, and how we use it.

---

## Features

- **Multiple input methods** – Text, voice, PDF, or YouTube links
- **Flashcards** – Auto-generated flip cards
- **Quizzes** – Multiple choice questions with scoring
- **Mind maps** – Visual topic breakdowns
- **Teach Back** – Explain topics in your own words and get AI feedback
- **Dark mode** – System-friendly theme
- **Gen Z mode** – Informal, aesthetic tone for explanations

---

## Run locally

**Prerequisites:** Node.js

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a `.env` file** with your API keys:

   ```env
   # Supabase (from dashboard.supabase.com > Settings > API)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here

   # Gemini AI
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Set up the Supabase database**
   - Open your Supabase dashboard
   - Go to SQL Editor
   - Run the contents of `supabase-schema.sql`

4. **Enable Google OAuth (optional)**
   - In Supabase: Authentication > Providers
   - Enable Google and add your OAuth credentials

5. **Start the app**

   ```bash
   npm run dev
   ```

   If you see "API Key not found" or "Gemini API key not found" when generating a study set, ensure `GEMINI_API_KEY` is in `.env` and restart the dev server. For production (e.g. Vercel), set `GEMINI_API_KEY` in your project’s environment variables.

### LLM observability (Opik, optional)

To send Gemini traces to [Opik](https://github.com/comet-ml/opik) for debugging and evaluation, add to `.env`:

```env
OPIK_API_KEY=your_opik_api_key
OPIK_WORKSPACE_NAME=your_workspace
OPIK_PROJECT_NAME=studymi
```

Leave these unset to run without tracing.

To test Opik from localhost: run `npm run dev:api` (Vercel CLI serves the API locally), open **http://localhost:3000?useServer=1**, log in, and generate a study set. Traces will appear in your Opik project.

---

## Tech stack

- React 19, TypeScript
- Vite
- Tailwind CSS
- Google Gemini AI
- D3.js (mind maps)
