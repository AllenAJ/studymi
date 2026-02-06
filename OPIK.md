# Opik Integration (Commit To Change Hackathon – Best Use of Opik)

StudyMi uses [Opik](https://github.com/comet-ml/opik) for **LLM observability**: we trace every Gemini call that generates study sets or grades Teach Back explanations, so we can debug, monitor quality, and improve prompts with data.

---

## What we trace

- **Trace** – One per user action (e.g. “StudyMi Gemini – generateStudySet”, “StudyMi Gemini – gradeTeachBack”).
  - **Tags** – Each trace is tagged with:
    - `action`: `generateStudySet` or `gradeTeachBack` (for filtering by feature).
    - `genZ` or `standard`: whether the user had Gen Z mode on (for comparing tone/quality).
  - **Feedback scores** (for evaluation and judging):
    - **study_set_quality** (0–1) – Heuristic score for study-set completeness (title, summary, key concepts, flashcards, quiz, mind map). Visible in the Opik dashboard so you can sort/filter by quality.
    - **teach_back_score** (0–1) – The AI grading score for Teach Back (from the model's JSON). Lets you compare and filter by explanation quality.
- **LLM span** – Each Gemini request is a span with:
  - **Input**: prompt preview, model (`gemini-2.0-flash`), provider (Google).
  - **Output**: response preview, token usage (input/output/total).
  - **Errors**: API errors are captured on the trace and span.

All of this is visible in the Opik UI: prompts, responses, latency, token usage, failures, **tags**, and **feedback scores** (study_set_quality, teach_back_score) so judges can sort and filter by quality.

---

## Where to see it (for judges)

1. **Live app (production)**  
   [studymi.xyz](https://www.studymi.xyz) – Generate a study set or use Teach Back while logged in. Those requests go through our API and are traced to Opik.

2. **Opik dashboard**  
   - **Opik Cloud**: [comet.com/opik](https://www.comet.com/opik) → sign in → open the **studymi** project (or the workspace the team uses for the hackathon).
   - There you’ll see:
     - **Traces** for each generation (name, input, output, token usage).
     - **Tags** on each trace: `action` (generateStudySet / gradeTeachBack) and `genZ` or `standard` for filtering.
     - **Feedback scores**: `study_set_quality` (study sets) and `teach_back_score` (Teach Back) – use these to sort/filter by quality in the dashboard.
     - **Spans** for the Gemini call (model, provider, usage).
     - **Metrics** over time (e.g. trace count, token usage) if the project has been used.

3. **Code**  
   - Tracing is implemented in **`api/gemini.ts`**: we create an Opik client, start a trace and an LLM span around the Gemini request, set output/usage/errors, then `trace.end()` and `client.flush()`.
   - Opik is loaded with dynamic `import('opik')` so it works in Vercel’s ESM serverless environment.

---

## How we use Opik

- **Observability**: Inspect real user flows (prompt → response, tokens, errors) without extra logging.
- **Debugging**: Reproduce issues using trace input/output and error details.
- **Quality**: Use token usage and success/error rates to tune prompts and model usage.
- **Goal alignment**: Traces are tied to the “studymi” project and tagged by action and mode (`genZ` / `standard`), so we can compare behavior across features and over time.
- **Evaluation**: Feedback scores (`study_set_quality`, `teach_back_score`) let judges and the team sort/filter traces by quality and use the dashboard for evaluation and observability.

---

## Env vars (for local / self-host)

To run with Opik enabled (e.g. `vercel dev` or production), set:

- `OPIK_API_KEY` – from [comet.com/opik](https://www.comet.com/opik).
- `OPIK_WORKSPACE_NAME` – your Opik workspace.
- `OPIK_PROJECT_NAME` (optional) – defaults to `studymi`.

Without these, the app runs normally and skips tracing.
