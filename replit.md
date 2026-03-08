# CDM Explorer

A full-stack application with two modules: **Sermon Explorer** transforms sermon transcripts into animated family storybooks, and **Worship Explorer** teaches corporate worship elements to children.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion + CDM Brand
- **Backend**: Express.js (Node.js) + TypeScript
- **Database**: PostgreSQL (Neon) via Drizzle ORM + `@neondatabase/serverless`
- **Combined server**: Express serves both the API and the Vite dev middleware on port 5000
- **AI**: OpenAI GPT-4o for content generation + TTS for narration, Gemini 3 Pro Image (native) for illustrations

## Project Structure

```
client/          - React frontend (Vite root)
  src/
    pages/       - Home (hub), Sermons (list), Admin (manage), Upload, Viewer pages
    components/  - UI components
      viewer/    - SceneViewer, SceneQuiz, DiscussionTime, StorySetup, FinalSummary
    lib/         - Query client and utilities
  public/        - Static assets (cdm-logo.webp)
server/          - Express backend
  index.ts       - Server entry point (port 5000, host 0.0.0.0)
  routes.ts      - API routes, AI processing pipeline, Gemini native image generation
  db.ts          - Drizzle ORM database client (Neon serverless pool)
  vite.ts        - Vite dev server middleware integration
  static.ts      - Static file serving for production
shared/          - Shared types and schema
  schema.ts      - Drizzle table definitions (sermons, worship_units, worship_lessons)
  curriculum-data.ts - Worship element definitions and types
generated/       - Runtime-generated content
  images/        - Generated images from Gemini native (served via Express static)
drizzle.config.ts - Drizzle Kit configuration
script/
  build.ts       - Production build script
```

## Database Schema

Three tables managed by Drizzle ORM (`shared/schema.ts`):

- **sermons**: id (text PK), title, scripture, summary, key_themes (jsonb), status, raw_text, scenes (jsonb), progress, current_step, error, created_at
- **worship_units**: id (serial PK), number, title, description, worship_element, created_at
- **worship_lessons**: id (serial PK), unit_id (FK → worship_units.id, cascade delete), number, title, main_idea, memory_verse, memory_verse_reference, worship_sign, call_and_response (jsonb), activities (jsonb), prayer_focus, song_suggestions (jsonb), pre_generated_quiz (jsonb), lesson_sections (jsonb — structured sections: welcome/bibleTime/talkAndMemorize/sing/makeAndDo/finalFocus), sidebar_meta (jsonb — bibleTruths/scripture/scriptureText/lessonFocus/goalsForChildren/memoryMinute), preparation (text), bible_background (text)

Upload progress is kept in an in-memory Map (transient processing state only).

## Running

- Dev: `npm run dev` (runs `tsx server/index.ts` — starts Express + Vite middleware on port 5000)
- Build: `npm run build`
- Prod: `npm start` (runs `node dist/index.cjs`)
- DB push: `npx drizzle-kit push` (syncs schema to database)

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (set automatically by Replit)
- `OPENAI_API_KEY` (secret) — Required for AI content generation (GPT-4o) and TTS narration
- `GEMINI_API_KEY` (secret) — Required for image generation via Gemini 3 Pro Image (native)

## Key Features

- Upload sermons as .docx, .pdf, or .txt files
- AI pipeline: analyze → scene breakdown → age-adaptive narratives → Gemini native illustrations → quizzes → discussion prompts
- Scene images displayed with Ken Burns CSS effects (zoom-in, zoom-out, pan-left, pan-right, fade) for cinematic animation feel
- Colorful cinematic 3D animated style — no realistic rendering. No copyrighted characters or brands.
- Never depicts God, Jesus, or the Holy Spirit — uses symbolic light/warmth instead
- No mouth movements or speaking gestures on characters
- Auto-narration via TTS (model tts-1, voice nova, speed 0.9) starts immediately when each scene appears
- Three age groups: Young (4-6), Older (7-10), Family (11+)
- Inline action buttons (Next Scene / Skip) below content — skip advances through phases in order (scene → quiz → discussion → next scene)
- Worship curriculum upload and AI processing with quiz generation
- All sermon and worship data persists in PostgreSQL database
- Sermon deletion with image cleanup

## API Endpoints

### Sermon Explorer
- `GET /api/sermons` - List all sermons
- `GET /api/sermons/:id` - Get sermon details with scenes
- `DELETE /api/sermons/:id` - Delete a sermon and its generated images
- `GET /api/sermons/:id/status` - Check sermon processing progress
- `GET /api/sermons/:id/scenes/:sceneIndex` - Get individual scene data
- `POST /api/upload` - Upload sermon file (.docx, .pdf, .txt)
- `POST /api/tts` - Generate TTS audio
- `POST /api/generate-image` - Generate image via Gemini native
- `POST /api/generate-quiz` - Generate quiz questions
- `GET /generated/images/*` - Serve generated image files

### Worship Explorer
- `GET /api/worship/elements` - List worship elements
- `GET /api/worship/units` - List uploaded curriculum units
- `GET /api/worship/units/:id` - Get unit detail with lessons
- `DELETE /api/worship/units/:id` - Delete a worship unit and its lessons
- `GET /api/worship/lessons/:id` - Get single lesson
- `POST /api/worship/upload` - Upload worship curriculum document
- `GET /api/worship/upload/:id/status` - Check upload processing progress
- `POST /api/worship/ai/generate-quiz` - Generate quiz for a lesson
- `POST /api/worship/ai/teacher-assistant` - Generate teaching aids
- `POST /api/worship/ai/generate-story` - Generate child-friendly worship story
- `POST /api/worship/ai/parent-guide` - Generate parent guide for a lesson

## Teacher Lesson Plan View

The teacher view (`worship-teacher.tsx`) renders lesson plans in a two-column layout:
- **Main content (left 2/3)**: Preparation, Bible Background, then six expandable lesson section cards (Welcome, Bible Time, Talk and Memorize, Sing, Make and Do, Final Focus) each with content, instructions, and materials
- **Sidebar (right 1/3)**: Scripture, Lesson Focus, Bible Truths, Goals for Children, Memory Minute
- Falls back gracefully for lessons uploaded before the structured format was added (shows flat mainIdea/activities/etc.)
- AI extraction prompt is optimized for the "Exploring the Elements of Worship" curriculum format

## Image Generation (Gemini Native)

- Uses `@google/genai` SDK: `client.models.generateContent()` with model `gemini-3-pro-image-preview`
- Config: `{ responseModalities: ["TEXT", "IMAGE"] }`
- Response: Find `inlineData` part in `response.candidates[0].content.parts` — base64-encoded image data
- Safety prefix prepended to every prompt: child-safe settings, no Jesus/God figures, no text, no inappropriate content
- Images saved locally to `generated/images/` as PNG files
- URLs returned as `/generated/images/<sermonId>-scene<index>.png`
- Retry logic: 3 attempts with exponential backoff; simplified prompt on retries

## Ken Burns CSS Effects

- Defined in `client/src/index.css`: `ken-zoom-in`, `ken-zoom-out`, `ken-pan-left`, `ken-pan-right`, `ken-fade`
- 8-second animation duration per scene
- Applied to scene images based on `scene.animationHint` from GPT-4o scene generation

## Brand / Design

- **CDM Brand Colors**: Blue #1d88a9, Green #80ad40, Purple #785992, Brown #7c6752, Gray-Blue #54636c
- **Theme**: White/light background with CDM brand accent colors; dark text (gray-800/700/600/500)
- **Tailwind color prefix**: `se-` (e.g., `se-blue`, `se-green`, `se-purple`, `se-brown`, `se-grayblue`, `se-navy`, `se-cream`)
- **Branding pattern**: First word (Sermon/Worship) in se-green, "Explorer" in se-blue, subtitle in black
- **Fonts**: Source Sans 3 (structural — sans, display, story), Yellowtail (accent/decorative — `font-accent`)
- **Google Fonts loaded in**: `client/index.html`
- **CDM logo**: `client/public/cdm-logo.webp` (transparent background, works on white)

## Notes

- `nanoid` is a transitive dependency (used in server/vite.ts for cache busting)
- OpenAI client reads API key fresh from env on every call (no caching)
- `__dirname` polyfill added to vite.config.ts and server/vite.ts for ESM compatibility
- Quiz data format: handles both flat array and `{ questions: [...] }` object format
- Discussion prompts format: handles both flat array and `{ prompts: [...] }` object format
- Vite config has `@assets` alias pointing to `attached_assets/` directory
