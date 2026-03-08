# CDM Explorer

A full-stack application with three modules: **Sermon Explorer** transforms sermon transcripts into animated family storybooks, **Worship Explorer** teaches corporate worship elements to children, and **SMJ Explorer** brings "Show Me Jesus" preschool Bible curriculum to life with interactive activities.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion + CDM Brand
- **Backend**: Express.js (Node.js) + TypeScript
- **Database**: PostgreSQL via Drizzle ORM + `pg` (node-postgres driver)
- **Combined server**: Express serves both the API and the Vite dev middleware on port 5000
- **AI**: OpenAI GPT-4o for content generation + TTS for narration, Gemini 3 Pro Image (native) for illustrations

## Project Structure

```
client/          - React frontend (Vite root)
  src/
    pages/       - Home (hub), Sermons (list), Admin (manage), Upload, Viewer pages
                   SMJ pages: smj.tsx, smj-teacher.tsx, smj-children.tsx, smj-parents.tsx, admin-smj.tsx
    components/  - UI components
      viewer/    - SceneViewer, SceneQuiz, DiscussionTime, StorySetup, FinalSummary
      worship/children/ - Worship Explorer children activities
      smj/children/    - SMJ Explorer children activities (bible-story-explorer, catechism-quiz, bible-verse-practice, story-retelling)
    lib/         - Query client and utilities
  public/        - Static assets (cdm-logo.webp)
server/          - Express backend
  index.ts       - Server entry point (port 5000, host 0.0.0.0)
  routes.ts      - API routes, AI processing pipeline, Gemini native image generation
  smj-routes.ts  - SMJ Explorer API routes and processing pipeline
  db.ts          - Drizzle ORM database client (Neon serverless pool)
  vite.ts        - Vite dev server middleware integration
  static.ts      - Static file serving for production
shared/          - Shared types and schema
  schema.ts      - Drizzle table definitions (sermons, worship_units, worship_lessons, smj_lessons)
  curriculum-data.ts - Worship element definitions and types
generated/       - Runtime-generated content
  images/        - Generated images from Gemini native (served via Express static)
Reference_Docs/  - SMJ curriculum reference documents and sample lesson PDF
drizzle.config.ts - Drizzle Kit configuration
script/
  build.ts       - Production build script
```

## Database Schema

Four tables managed by Drizzle ORM (`shared/schema.ts`):

- **sermons**: id (text PK), title, scripture, summary, key_themes (jsonb), status, raw_text, scenes (jsonb), progress, current_step, error, created_at
- **worship_units**: id (serial PK), number, title, description, worship_element, element_spotlight (text), created_at
- **worship_lessons**: id (serial PK), unit_id (FK → worship_units.id, cascade delete), number, title, main_idea, memory_verse, memory_verse_reference, worship_sign, call_and_response (jsonb), activities (jsonb), prayer_focus, song_suggestions (jsonb), pre_generated_quiz (jsonb), lesson_sections (jsonb), sidebar_meta (jsonb), preparation (text), bible_background (text), element_sections (jsonb), element_sidebar_meta (jsonb)
- **smj_lessons**: id (text PK), lesson_number, title, scripture, bible_truth, lesson_focus, goals_for_children (jsonb), bible_story_scenes (jsonb — array of {sceneNumber, title, narrative, imageUrl, imagePrompt}), welcome_story (text), catechism_pairs (jsonb — array of {question, answer, questionNumber?}), discussion_questions (jsonb — array of {question, expectedAnswer}), bible_verses (jsonb — array of {reference, text}), closing_prayer (text), pre_generated_quiz (jsonb — array of {question, options, correctIndex, explanation}), story_sequence_events (jsonb — array of {order, event}), status, progress, current_step, error, created_at

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

### Sermon Explorer
- Upload sermons as .docx, .pdf, or .txt files
- AI pipeline: analyze → scene breakdown → age-adaptive narratives → Gemini native illustrations → quizzes → discussion prompts
- Scene images displayed with Ken Burns CSS effects (zoom-in, zoom-out, pan-left, pan-right, fade)
- Colorful cinematic 3D animated style — no realistic rendering
- Never depicts God, Jesus, or the Holy Spirit — uses symbolic light/warmth instead
- Auto-narration via TTS (model tts-1, voice nova, speed 0.9)
- Three age groups: Young (4-6), Older (7-10), Family (11+)

### Worship Explorer
- Upload worship curriculum documents
- AI extraction of element-based lesson content
- Teacher view with expandable worship element cards and AI assistant
- Children's activities: Element Explorer, Memory Verse, Story Quiz, Call & Response
- Parent guide generation with family activities and discussion starters

### SMJ Explorer (Show Me Jesus)
- Upload "Show Me Jesus" preschool Bible curriculum PDFs
- 8-step AI processing pipeline: metadata → Bible story → structured content → scene breakdown → Gemini illustrations → quiz → story sequence → finalize
- Teacher dashboard with lesson overview, 5-step lesson flow timeline, AI assistant (discussion/illustration/activity)
- Children's activity hub with 4 activities:
  - **Bible Story Explorer**: Scene-by-scene illustrated story with TTS narration and Ken Burns transitions
  - **Catechism Quiz**: Flashcard game with flip animations, TTS, shuffle replay
  - **Bible Verse Practice**: Three modes (Learn, Order, Fill In) for multiple verses
  - **Story Retelling**: Sequencing game with drag-to-order events
- Parent at-home guide: lesson summary, catechism practice cards, verse review, family discussion, closing prayer

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

### SMJ Explorer
- `GET /api/smj/lessons` - List all uploaded SMJ lessons
- `GET /api/smj/lessons/:id` - Get full lesson detail
- `DELETE /api/smj/lessons/:id` - Delete a lesson and its generated images
- `POST /api/smj/upload` - Upload lesson PDF/DOCX
- `GET /api/smj/upload/:uploadId/status` - Check upload processing progress
- `POST /api/smj/ai/catechism-hint` - Generate child-friendly catechism hint
- `POST /api/smj/ai/parent-guide` - Generate parent take-home guide
- `POST /api/smj/ai/teacher-assistant` - Generate teaching aids (discussion/illustration/activity)

## Teacher Lesson Plan View

The teacher view (`worship-teacher.tsx`) renders lesson plans in a two-column layout based on the "Exploring the Elements of Worship" curriculum format:
- **Main content (left 2/3)**: Preparation, Bible Background, then expandable worship element cards (Call to Worship, Prayer, Praise, Reading the Word, Walking in the Word, Confession of Sin, Assurance of Pardon, Confession of Faith, Sacraments, Tithes & Offerings, Benediction). Core elements are labeled. Each card can include teacher scripts (formatted in blue), content, materials, and numbered instructions.
- **Sidebar (right 1/3)**: Scripture, Lesson Focus, Bible Truth, Goals for Children, Memory Verse (with TTS), Worship Sign
- **Unit overview** shows the Element of Worship Spotlight dialogue (a teacher script introducing the unit's focus element to children)
- Three fallback tiers: (1) element-based sections (new format), (2) legacy 6-section format, (3) flat legacy fields
- AI extraction prompt understands modular worship-element structure — each element has its own section page in the curriculum
- The `WORSHIP_ELEMENTS` constant in `curriculum-data.ts` defines 11 elements with icons, colors, child-friendly explanations, hand motions, and core/non-core flags

## Image Generation (Gemini Native)

- Uses `@google/genai` SDK: `client.models.generateContent()` with model `gemini-3-pro-image-preview`
- Config: `{ responseModalities: ["TEXT", "IMAGE"] }`
- Response: Find `inlineData` part in `response.candidates[0].content.parts` — base64-encoded image data
- Safety prefix prepended to every prompt: child-safe settings, no Jesus/God figures, no text, no inappropriate content
- Images saved locally to `generated/images/` as PNG files
- URLs returned as `/generated/images/<id>-scene<index>.png`
- Retry logic: 3 attempts with exponential backoff; simplified prompt on retries
- SMJ images saved as `smj-<lessonId>-scene<index>.png`

## Ken Burns CSS Effects

- Defined in `client/src/index.css`: `ken-zoom-in`, `ken-zoom-out`, `ken-pan-left`, `ken-pan-right`, `ken-fade`
- 8-second animation duration per scene
- Applied to scene images based on `scene.animationHint` from GPT-4o scene generation

## Brand / Design

- **CDM Brand Colors**: Blue #1d88a9, Green #80ad40, Purple #785992, Brown #7c6752, Gray-Blue #54636c
- **Theme**: White/light background with CDM brand accent colors; dark text (gray-800/700/600/500)
- **Tailwind color prefix**: `se-` (e.g., `se-blue`, `se-green`, `se-purple`, `se-brown`, `se-grayblue`, `se-navy`, `se-cream`)
- **Branding pattern**: First word (Sermon/Worship/SMJ) in se-green, "Explorer" in se-blue, subtitle in black
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
- SMJ routes registered via dynamic import in `server/routes.ts` → `registerSMJRoutes()`
