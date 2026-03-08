# SMJ Explorer — Implementation Prompt for Replit

## What This Is

This document tells you exactly what to build: a third explorer card called **SMJ Explorer** inside the existing CDM Explorer app. SMJ stands for "Show Me Jesus" — a preschool Bible curriculum published by Great Commission Publications. Admins upload lesson PDFs. The AI parses the lesson content and generates interactive children's experiences, teacher tools, and parent take-home guides.

SMJ Explorer follows the same architecture as the two explorers already in the app (Sermon Explorer and Worship Explorer). Same stack, same patterns, same design language. If you've read the existing code, you already know how this works.

---

## The App You're Working In

**Stack:** React 18 + TypeScript + Vite + Express.js + Tailwind CSS
**AI:** OpenAI GPT-4o (text), Google Gemini native `gemini-3-pro-image-preview` (images), OpenAI TTS-1 (narration)
**Routing:** Wouter
**Data fetching:** TanStack React Query
**Animations:** Framer Motion
**File parsing:** Mammoth (DOCX), pdf-parse (PDF)
**Storage:** In-memory Maps (no database)

**Design system:**
- White backgrounds, clean cards with rounded-2xl corners
- Tailwind custom colors: `se-blue` (#1d88a9), `se-green` (#80ad40), `se-purple` (#785992), `se-brown` (#7c6752), `se-cream` (#FFF8F0)
- Fonts: `font-display` (Source Sans 3), `font-accent` (Yellowtail)
- Framer Motion for all transitions and hover states

---

## What a Show Me Jesus Lesson Contains

Each uploaded PDF is a single lesson (typically 6 pages) with this structure. The AI parser needs to extract all of it:

**Page 1 — Metadata:**
- Lesson number and title (e.g., "Lesson 10: God Reached Out in Love")
- Bible Truth (1-2 sentence doctrinal statement)
- Scripture reference (e.g., "Genesis 3")
- Lesson Focus (what the lesson teaches)
- Goals for the Children (3-5 bullet points of child-level outcomes)
- Bible Verse Review references (e.g., "Exodus 20:8, John 15:14, 1 John 5:17")

**Page 2 — Lesson at a Glance:**
- 5-step lesson flow with timing: Welcome (5-10 min), Bible Time (10-15 min), Talk Time (5-10 min), Sing Make & Do (15-20 min), Final Focus (5 min)
- Children's activities per step
- Supply lists per step
- Practical prep notes

**Pages 3-4 — Welcome + Bible Time:**
- Welcome section: An opening bridge story (e.g., "Brown Bear" story) that parallels the Bible story. Full scripted narrative the teacher reads aloud.
- Bible Time section: The full Bible story retelling in preschool-friendly language, broken into paragraphs with Teaching Aid references (TA markers like "Show TA 10, panel 1"). This is the core narrative — typically 10-15 paragraphs.

**Page 5 — Talk Time + Sing, Make & Do:**
- Talk Time questions with expected answers in italics (e.g., "Who is a sinner?" *(everyone is a sinner; we are all sinners and need a Savior)*)
- First Catechism Q&A pairs (e.g., "Q 37: What effect did the sin of Adam have on you and all people?" / "A: We are all born guilty and sinful.")
- Song references, craft instructions, activity descriptions

**Page 6 — Final Focus + Take-Home:**
- Closing prayer text (full scripted prayer the teacher leads)
- Discussion questions
- Things to send home list
- Let's Do / Let's Recite sections with verse review instructions

---

## What to Build

### 1. Data Model

Create a new in-memory Map and TypeScript interfaces for SMJ lessons:

```typescript
const smjLessons: Map<string, any> = new Map();
const smjUploadProgress: Map<string, {
  status: "processing" | "ready" | "error";
  progress: number;
  currentStep: string;
  lessonId?: string;
  error?: string;
  createdAt: string;
}> = new Map();
```

Each parsed lesson should have this shape:

```typescript
interface SMJLesson {
  id: string;
  lessonNumber: number;
  title: string;               // "God Reached Out in Love"
  scripture: string;           // "Genesis 3"
  bibleTruth: string;          // doctrinal summary statement
  lessonFocus: string;         // what the lesson teaches
  goalsForChildren: string[];  // 3-5 child-level outcomes

  // The Bible story — broken into scenes by the AI
  bibleStoryScenes: {
    sceneNumber: number;
    title: string;
    narrative: string;         // preschool-friendly text
    imageUrl: string | null;   // AI-generated illustration
    imagePrompt: string;       // prompt used
  }[];

  // Welcome bridge story
  welcomeStory: string;        // the Brown Bear-type opening story

  // Catechism Q&A
  catechismPairs: {
    question: string;          // "What effect did the sin of Adam have on you?"
    answer: string;            // "We are all born guilty and sinful."
    questionNumber?: string;   // "Q 37" if present
  }[];

  // Talk Time discussion
  discussionQuestions: {
    question: string;
    expectedAnswer: string;    // the italicized answer from the lesson
  }[];

  // Bible verses to review
  bibleVerses: {
    reference: string;         // "Exodus 20:8"
    text: string;              // full verse text (AI fills this if not in doc)
  }[];

  // Closing prayer
  closingPrayer: string;       // full prayer text

  // Pre-generated content
  preGeneratedQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];

  // Sequencing game events
  storySequenceEvents: {
    order: number;
    event: string;             // short description of story event
  }[];

  // Metadata
  status: "processing" | "ready" | "error";
  progress: number;
  currentStep: string;
  createdAt: string;
}
```

### 2. Backend — Upload Pipeline

**New endpoint: `POST /api/smj/upload`**

Accepts a .pdf or .docx file. Returns immediately with `{ uploadId, status: "processing" }`. Kicks off async `processSMJLesson()` in the background.

**New endpoint: `GET /api/smj/upload/:uploadId/status`**

Returns `{ status, progress, currentStep, lessonId, error }` for polling.

**New endpoint: `GET /api/smj/lessons`**

Returns array of all uploaded lessons (id, lessonNumber, title, scripture, status).

**New endpoint: `GET /api/smj/lessons/:id`**

Returns full lesson detail.

**New endpoint: `DELETE /api/smj/lessons/:id`**

Deletes a lesson from the Map.

**New endpoint: `POST /api/smj/ai/catechism-hint`**

Given a catechism question, generates a child-friendly hint to help them remember the answer. Used in the Catechism Quiz activity.

**New endpoint: `POST /api/smj/ai/parent-guide`**

Given a lesson ID, generates a parent take-home guide with: lesson summary, catechism Q&A to practice, verse cards, family discussion starters, closing prayer text.

**New endpoint: `POST /api/smj/ai/teacher-assistant`**

Given a lesson ID and requestType ("discussion" | "illustration" | "activity"), generates additional teacher resources — same pattern as the Worship Explorer teacher assistant.

### 3. The AI Processing Pipeline — `processSMJLesson()`

Model this on the existing `processSermon()` and `processWorshipCurriculum()` functions. Same async pattern with progress tracking.

**Step 1 (10%): Extract lesson metadata**
Single GPT-4o call. Extract: title, lessonNumber, scripture, bibleTruth, lessonFocus, goalsForChildren, bibleVerses references.

**Step 2 (25%): Extract the Bible story narrative**
GPT-4o call on the full text. Pull out the Bible Time section — the continuous narrative the teacher reads to children. Return as one long text block.

**Step 3 (35%): Extract structured content**
GPT-4o call. Extract: welcomeStory, catechismPairs, discussionQuestions (with expected answers), closingPrayer, bibleVerses (with full text — if the doc only has references, ask the AI to provide the ESV text).

**Step 4 (50%): Break Bible story into scenes**
GPT-4o call. Take the Bible Time narrative and break it into 4-6 illustrated scenes. Each scene gets: a title, the narrative text for that scene, and an image prompt following the exact same safety rules as the Sermon Explorer image prompts (no depiction of God/Jesus as figures — use golden light; no violence, alcohol, weapons; colorful 3D animated Pixar-quality style; no text in images).

**Step 5 (70%): Generate illustrations**
For each scene, call `generateImage()` (the existing Gemini native function). Save images to `/generated/images/smj-{lessonId}-scene{index}.png`. Include 2-second delays between calls to avoid rate limits. Same retry logic as sermon images.

**Step 6 (85%): Generate quiz questions**
GPT-4o call. Generate 4-6 quiz questions based on the Bible story narrative. Format: `{ question, options (3 choices), correctIndex, explanation }`. Questions must be answerable from the story text alone. Age-appropriate for preschool/early elementary.

**Step 7 (92%): Generate story sequence events**
GPT-4o call. Create 5-7 key events from the Bible story in order. Each event is a short sentence (e.g., "Adam and Eve ate the fruit God told them not to eat"). These power the Story Retelling game.

**Step 8 (100%): Store and finalize**
Build the full SMJLesson object, store in `smjLessons` Map, update progress to "ready".

### 4. Frontend — New Pages

All pages follow the existing design language. White backgrounds, se-color accents, font-display/font-accent, Framer Motion animations, rounded-2xl cards.

#### 4a. Home Page — Add Third Card

**File: `client/src/pages/home.tsx`**

Change the grid from `md:grid-cols-2` to `md:grid-cols-3`. Add a third card:

```
SMJ Explorer
"Show Me Jesus, Brought to Life"
Interactive Bible lessons that transform preschool curriculum into engaging experiences for children, teachers, and families.
```

Route: `/smj`

#### 4b. Admin Page — Add Third Card

**File: `client/src/pages/admin.tsx`**

Add a third admin card below the existing two:

```
SMJ Explorer
Upload and manage Show Me Jesus lessons
```

Icon: `GraduationCap` from lucide-react. Route: `/admin/smj`

#### 4c. App.tsx — Add Routes

Add these new routes:

```
/smj                → SMJHome (role selection: Teacher / Children / Parents)
/smj/teacher        → SMJTeacher
/smj/children       → SMJChildren
/smj/parents        → SMJParents
/admin/smj          → AdminSMJ
```

#### 4d. SMJ Home — Role Selection

**File: `client/src/pages/smj.tsx`**

Same pattern as `worship.tsx`. Three cards: Teacher, Children, Parents. Each routes to its respective page. Back arrow returns to `/`.

#### 4e. Admin SMJ

**File: `client/src/pages/admin-smj.tsx`**

Same pattern as `admin-worship.tsx`:
- Drag-and-drop file upload for .pdf/.docx
- Upload progress bar with step descriptions (polls `/api/smj/upload/:id/status`)
- List of uploaded lessons with title, scripture, lesson number
- Delete button per lesson
- After upload completes, lesson appears in the list

#### 4f. SMJ Teacher Dashboard

**File: `client/src/pages/smj-teacher.tsx`**

Same layout pattern as `worship-teacher.tsx`. Two-column on desktop:

**Left panel:** Lesson browser. Lists all uploaded SMJ lessons. Click to select.

**Right panel (when lesson selected):**
- Lesson overview card: title, scripture, Bible Truth, Lesson Focus, Goals for Children
- Lesson flow timeline: the 5 steps (Welcome → Bible Time → Talk Time → Sing Make Do → Final Focus) shown as a visual timeline with timing
- AI Assistant panel with three buttons: Discussion Questions, Object Lesson Ideas, Activity Ideas
- AI responses appear in cards below the buttons (same pattern as worship teacher)

#### 4g. SMJ Children — Activity Hub

**File: `client/src/pages/smj-children.tsx`**

Same flow as `worship-children.tsx`:
1. Name entry screen
2. Lesson selection (if multiple lessons uploaded, pick one; auto-select if only one)
3. Activity menu with 4 cards:

**Activity 1: Bible Story Explorer** (se-blue)
Route to component. Displays the Bible story scene by scene. Each scene shows:
- AI-generated illustration
- Narrative text below
- TTS play button (voice: "nova") to hear the scene read aloud
- Forward/back navigation between scenes
- Scene indicator dots at bottom

**Activity 2: Catechism Quiz** (se-green)
Flashcard-style game. Shows the catechism question. Child thinks of the answer, then taps to reveal. TTS reads both question and answer. After all cards, shows completion celebration. Option to "shuffle and try again."

**Activity 3: Bible Verse Practice** (se-purple)
Multi-verse game. Shows list of verses for this lesson. Child picks one. Then modes:
- Learn: See the full verse with reference, TTS reads it
- Order: Words scrambled, tap to put in order (same as worship memory-verse.tsx word ordering)
- Fill in: Key words blanked out, tap the correct word to fill each blank
- After completing all verses, celebration screen

**Activity 4: Story Retelling** (se-brown)
Sequencing game. Shows 5-7 story events in scrambled order. Child taps/drags them into the correct sequence. When correct, each event highlights green with a checkmark. Wrong order shows gentle feedback ("Try again!"). Completion celebration when all in order.

#### 4h. SMJ Parents — At-Home Guide

**File: `client/src/pages/smj-parents.tsx`**

Same pattern as `worship-parents.tsx`:
- Lesson selector (dropdown or cards)
- When selected, shows lesson title + scripture
- "Generate At-Home Guide" button
- AI generates and displays:
  - **This Week's Lesson:** 2-3 sentence summary of what the child learned
  - **Catechism Practice:** The Q&A pairs from the lesson, formatted as cards parents can practice with their child
  - **Bible Verses to Review:** Verse text + reference, formatted for easy reading at home
  - **Family Discussion:** 3-4 dinner-table conversation starters drawn from the Talk Time questions
  - **Closing Prayer:** The prayer text from the lesson, formatted for parents to pray with their child

### 5. Children's Activity Components

Create these in `client/src/components/smj/children/`:

#### `bible-story-explorer.tsx`

Props: `{ childName: string, lessonId: string }`

Fetches lesson from `/api/smj/lessons/${lessonId}`. Displays `bibleStoryScenes` one at a time:
- Full-width illustration at top (or placeholder if imageUrl is null)
- Narrative text below in a clean card
- TTS button that calls `/api/tts` with voice "nova"
- Left/right arrows to navigate scenes
- Dot indicators showing current scene position
- Final scene shows a simple celebration: "Great job, {childName}! You finished the story!"

#### `catechism-quiz.tsx`

Props: `{ childName: string, lessonId: string }`

Fetches lesson, uses `catechismPairs`. Flashcard UI:
- Shows question on a card with "?" visual
- "Show Answer" button reveals the answer with flip animation
- TTS reads the question, then the answer
- "Next" button advances to next pair
- Progress indicator (1/5, 2/5, etc.)
- Completion screen with celebration and "Try Again (Shuffled)" option

#### `bible-verse-practice.tsx`

Props: `{ childName: string, lessonId: string }`

Fetches lesson, uses `bibleVerses`. Verse selector if multiple verses. Then three modes (same game logic as the existing `memory-verse.tsx` in worship explorer):
- **Learn:** Full verse displayed, TTS reads it
- **Order:** Words scrambled, tap in correct order
- **Fill In:** Key words blanked, tap correct word from options
- Mode selector at top as pill buttons
- Completion celebration per verse

#### `story-retelling.tsx`

Props: `{ childName: string, lessonId: string }`

Fetches lesson, uses `storySequenceEvents`. Shuffles events on load. Child taps events in order:
- Tapping the correct next event moves it to the "completed" pile with green highlight and checkmark
- Tapping wrong event shows gentle shake animation and "Not quite — try another!"
- Progress bar showing how many events placed correctly
- Completion celebration when all events in order
- "Shuffle and Play Again" button

### 6. What NOT to Build

- No database. In-memory Maps only, same as the other explorers.
- No authentication or user accounts.
- No Drizzle schema.
- No separate CSS files — Tailwind utility classes only, inline.
- No new npm dependencies beyond what's already installed.
- Do not modify any Sermon Explorer or Worship Explorer code. This is additive only.

### 7. Files to Create

```
client/src/pages/smj.tsx                              — Role selection
client/src/pages/smj-teacher.tsx                       — Teacher dashboard
client/src/pages/smj-children.tsx                      — Children activity hub
client/src/pages/smj-parents.tsx                       — Parent at-home guide
client/src/pages/admin-smj.tsx                         — Upload + manage lessons
client/src/components/smj/children/bible-story-explorer.tsx
client/src/components/smj/children/catechism-quiz.tsx
client/src/components/smj/children/bible-verse-practice.tsx
client/src/components/smj/children/story-retelling.tsx
```

### 8. Files to Modify

```
client/src/App.tsx          — Add 5 new routes + imports
client/src/pages/home.tsx   — Add third explorer card, change grid to 3-col
client/src/pages/admin.tsx  — Add third admin card
server/routes.ts            — Add all SMJ endpoints + processing pipeline
```

### 9. Testing Checklist

After implementation, verify:

1. **Upload flow:** Upload the Sample Lesson PDF → progress bar advances through all 8 steps → lesson appears in lesson list with "ready" status
2. **Admin:** Uploaded lesson shows title, scripture, lesson number. Delete works.
3. **Teacher:** Select lesson → see overview, lesson flow timeline, AI assistant generates responses
4. **Bible Story Explorer:** Scenes display with illustrations. TTS works. Navigation works.
5. **Catechism Quiz:** Cards flip to show answers. TTS reads both. Shuffled replay works.
6. **Bible Verse Practice:** All three modes work (learn, order, fill-in). Multiple verses selectable.
7. **Story Retelling:** Events shuffle. Correct ordering tracked. Celebration on completion.
8. **Parents:** Guide generates with all sections. Catechism pairs display. Prayer text shows.
9. **Home page:** Three cards display in a row on desktop. All three route correctly.
10. **No regressions:** Sermon Explorer and Worship Explorer still work exactly as before.
