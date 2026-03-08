import type { Express } from "express";
import type { Server } from "http";
import multer from "multer";
import mammoth from "mammoth";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import express from "express";
import { WORSHIP_ELEMENTS } from "@shared/curriculum-data";
import type { LessonData } from "@shared/curriculum-data";
import { db } from "./db";
import { sermons, worshipUnits as worshipUnitsTable, worshipLessons } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as any)[prop];
  }
});
const upload = multer({ dest: "uploads/" });

const uploadProgress: Map<string, {
  status: "processing" | "ready" | "error";
  progress: number;
  currentStep: string;
  unitId?: number;
  error?: string;
  createdAt: string;
}> = new Map();

const IMAGES_DIR = path.resolve("generated", "images");
fs.mkdirSync(IMAGES_DIR, { recursive: true });

export async function registerRoutes(server: Server, app: Express) {
  app.use("/generated", express.static(path.resolve("generated")));

  app.get("/api/sermons", async (_req, res) => {
    try {
      const rows = await db.select().from(sermons);
      const result = rows.map((s) => ({
        id: s.id,
        title: s.title,
        scripture: s.scripture,
        status: s.status,
        sceneCount: (s.scenes as any[])?.length || 0,
        createdAt: s.createdAt,
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch sermons", error: err.message });
    }
  });

  app.get("/api/sermons/:id", async (req, res) => {
    try {
      const [sermon] = await db.select().from(sermons).where(eq(sermons.id, req.params.id));
      if (!sermon) return res.status(404).json({ message: "Sermon not found" });
      res.json(sermon);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch sermon", error: err.message });
    }
  });

  app.delete("/api/sermons/:id", async (req, res) => {
    try {
      const sermonId = req.params.id;
      const [sermon] = await db.select().from(sermons).where(eq(sermons.id, sermonId));
      if (!sermon) return res.status(404).json({ message: "Sermon not found" });

      await db.delete(sermons).where(eq(sermons.id, sermonId));

      const imagesDir = path.resolve("generated", "images");
      if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        for (const file of files) {
          if (file.startsWith(sermonId)) {
            fs.unlinkSync(path.join(imagesDir, file));
          }
        }
      }

      console.log(`Sermon deleted: ${sermonId}`);
      res.json({ message: "Sermon deleted" });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to delete sermon", error: err.message });
    }
  });

  app.get("/api/sermons/:id/scenes/:sceneIndex", async (req, res) => {
    try {
      const [sermon] = await db.select().from(sermons).where(eq(sermons.id, req.params.id));
      if (!sermon) return res.status(404).json({ message: "Sermon not found" });
      const scene = (sermon.scenes as any[])?.[parseInt(req.params.sceneIndex)];
      if (!scene) return res.status(404).json({ message: "Scene not found" });
      res.json(scene);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch scene", error: err.message });
    }
  });

  app.post("/api/upload", upload.single("sermon"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const sermonId = `sermon-${Date.now()}`;
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    try {
      let text = "";
      if (fileName.endsWith(".docx")) {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value;
      } else if (fileName.endsWith(".pdf")) {
        const pdfParse = (await import("pdf-parse")).default;
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        text = pdfData.text;
      } else if (fileName.endsWith(".txt")) {
        text = fs.readFileSync(filePath, "utf-8");
      } else {
        return res.status(400).json({ message: "Unsupported file type. Use .docx, .pdf, or .txt" });
      }

      await db.insert(sermons).values({
        id: sermonId,
        title: "Processing...",
        scripture: "",
        status: "processing",
        rawText: text,
        scenes: [],
      });

      res.json({ sermonId, status: "processing", message: "Sermon uploaded. Processing started." });

      processSermon(sermonId, text).catch(async (err) => {
        console.error("Pipeline error:", err);
        await db.update(sermons).set({ status: "error", error: err.message }).where(eq(sermons.id, sermonId));
      });
    } catch (err: any) {
      res.status(500).json({ message: "Upload failed", error: err.message });
    } finally {
      fs.unlink(filePath, () => {});
    }
  });

  app.get("/api/sermons/:id/status", async (req, res) => {
    try {
      const [sermon] = await db.select().from(sermons).where(eq(sermons.id, req.params.id));
      if (!sermon) return res.status(404).json({ message: "Sermon not found" });
      res.json({
        status: sermon.status,
        progress: sermon.progress || 0,
        currentStep: sermon.currentStep || "",
        sceneCount: (sermon.scenes as any[])?.length || 0,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch status", error: err.message });
    }
  });

  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice } = req.body;
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice || "nova",
        input: text,
        speed: 0.9,
      });
      const buffer = Buffer.from(await mp3.arrayBuffer());
      res.set({ "Content-Type": "audio/mpeg", "Content-Length": buffer.length.toString() });
      res.send(buffer);
    } catch (err: any) {
      res.status(500).json({ message: "TTS failed", error: err.message });
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, sceneIndex, sermonId } = req.body;
      const imageUrl = await generateImage(prompt, sermonId, sceneIndex);

      if (sermonId && sceneIndex !== undefined) {
        const [sermon] = await db.select().from(sermons).where(eq(sermons.id, sermonId));
        if (sermon) {
          const scenes = (sermon.scenes as any[]) || [];
          if (scenes[sceneIndex]) {
            scenes[sceneIndex].imageUrl = imageUrl;
            await db.update(sermons).set({ scenes }).where(eq(sermons.id, sermonId));
          }
        }
      }

      res.json({ imageUrl });
    } catch (err: any) {
      res.status(500).json({ message: "Image generation failed", error: err.message });
    }
  });

  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const { sceneContent, ageGroup } = req.body;
      const questions = await generateQuiz(sceneContent, ageGroup);
      res.json({ questions });
    } catch (err: any) {
      res.status(500).json({ message: "Quiz generation failed", error: err.message });
    }
  });

  // ============================================
  // WORSHIP EXPLORER ENDPOINTS
  // ============================================

  // 1. GET /api/worship/elements - returns WORSHIP_ELEMENTS
  app.get("/api/worship/elements", (_req, res) => {
    res.json(WORSHIP_ELEMENTS);
  });

  // 2. GET /api/worship/units - returns list from database
  app.get("/api/worship/units", async (_req, res) => {
    try {
      const units = await db.select().from(worshipUnitsTable);
      const result = [];
      for (const unit of units) {
        const lessons = await db.select().from(worshipLessons).where(eq(worshipLessons.unitId, unit.id));
        result.push({
          id: unit.id,
          number: unit.number,
          title: unit.title,
          worshipElement: unit.worshipElement,
          lessonsCount: lessons.length,
        });
      }
      result.sort((a, b) => a.number - b.number);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch units", error: err.message });
    }
  });

  // 3. GET /api/worship/units/:id - returns unit detail with lessons
  app.get("/api/worship/units/:id", async (req, res) => {
    try {
      const unitId = parseInt(req.params.id);
      const [unit] = await db.select().from(worshipUnitsTable).where(eq(worshipUnitsTable.id, unitId));
      if (!unit) return res.status(404).json({ message: "Unit not found. Upload curriculum to get started." });
      const lessons = await db.select().from(worshipLessons).where(eq(worshipLessons.unitId, unitId));
      res.json({
        ...unit,
        lessons: lessons.map((l) => ({
          id: l.id,
          unitId: l.unitId,
          number: l.number,
          title: l.title,
          mainIdea: l.mainIdea,
          memoryVerse: l.memoryVerse,
          memoryVerseReference: l.memoryVerseReference,
          worshipSign: l.worshipSign,
          callAndResponse: l.callAndResponse,
          activities: l.activities,
          prayerFocus: l.prayerFocus,
          songSuggestions: l.songSuggestions,
          preGeneratedQuiz: l.preGeneratedQuiz,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch unit", error: err.message });
    }
  });

  // 4. GET /api/worship/lessons/:id - returns single lesson
  app.get("/api/worship/lessons/:id", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const [lesson] = await db.select().from(worshipLessons).where(eq(worshipLessons.id, lessonId));
      if (!lesson) return res.status(404).json({ message: "Lesson not found" });
      res.json(lesson);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch lesson", error: err.message });
    }
  });

  // Helper to fetch a lesson from DB
  async function findLesson(lessonId: number) {
    const [lesson] = await db.select().from(worshipLessons).where(eq(worshipLessons.id, lessonId));
    return lesson || null;
  }

  // 5. POST /api/worship/ai/generate-quiz - generates quiz for worship lesson
  app.post("/api/worship/ai/generate-quiz", async (req, res) => {
    try {
      const { lessonId, difficulty } = req.body;
      const lessonIdNum = parseInt(lessonId);
      const lesson = await findLesson(lessonIdNum);

      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const quiz = lesson.preGeneratedQuiz as any[];
      if (quiz && quiz.length > 0) {
        return res.json({ questions: quiz });
      }

      const content = `
Lesson: ${lesson.title}
Main Idea: ${lesson.mainIdea}
Memory Verse: ${lesson.memoryVerse} (${lesson.memoryVerseReference})
Prayer Focus: ${lesson.prayerFocus}
Worship Sign: ${lesson.worshipSign || "No sign for this lesson"}
${lesson.callAndResponse ? `Call and Response - Leader: "${(lesson.callAndResponse as any).leader}" Response: "${(lesson.callAndResponse as any).response}"` : ""}
${lesson.activities && (lesson.activities as any[]).length > 0 ? `Activities: ${(lesson.activities as any[]).join(", ")}` : ""}
${lesson.songSuggestions && (lesson.songSuggestions as any[]).length > 0 ? `Suggested Songs: ${(lesson.songSuggestions as any[]).join(", ")}` : ""}
      `.trim();

      const questions = await generateWorshipQuiz(content, difficulty || "medium");
      res.json({ questions });
    } catch (err: any) {
      res.status(500).json({ message: "Quiz generation failed", error: err.message });
    }
  });

  // 6. POST /api/worship/ai/teacher-assistant - generates discussion, illustrations, or activities
  app.post("/api/worship/ai/teacher-assistant", async (req, res) => {
    try {
      const { lessonId, requestType } = req.body;
      const lessonIdNum = parseInt(lessonId);
      const lesson = await findLesson(lessonIdNum);

      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const lessonContext = `
Lesson: ${lesson.title}
Main Idea: ${lesson.mainIdea}
Memory Verse: ${lesson.memoryVerse} (${lesson.memoryVerseReference})
Prayer Focus: ${lesson.prayerFocus}
      `.trim();

      let result;
      if (requestType === "discussion") {
        result = await generateTeacherDiscussionQuestions(lessonContext);
      } else if (requestType === "illustration") {
        result = await generateTeacherIllustrations(lessonContext);
      } else if (requestType === "activity") {
        result = await generateTeacherActivities(lessonContext);
      } else {
        return res.status(400).json({ message: "Invalid requestType. Use 'discussion', 'illustration', or 'activity'." });
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: "Teacher assistant generation failed", error: err.message });
    }
  });

  // 7. POST /api/worship/ai/generate-story - generates child-friendly story about worship element
  app.post("/api/worship/ai/generate-story", async (req, res) => {
    try {
      const { elementId } = req.body;

      const element = WORSHIP_ELEMENTS.find(e => e.id === elementId);
      if (!element) {
        return res.status(404).json({ message: "Worship element not found" });
      }

      const story = await generateWorshipStory(element);
      res.json({ story });
    } catch (err: any) {
      res.status(500).json({ message: "Story generation failed", error: err.message });
    }
  });

  // 8. POST /api/worship/ai/parent-guide - generates at-home parent guide
  app.post("/api/worship/ai/parent-guide", async (req, res) => {
    try {
      const { lessonId } = req.body;
      const lessonIdNum = parseInt(lessonId);
      const lesson = await findLesson(lessonIdNum);

      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const guide = await generateParentGuide(lesson as any);
      res.json(guide);
    } catch (err: any) {
      res.status(500).json({ message: "Parent guide generation failed", error: err.message });
    }
  });

  // 9. POST /api/worship/upload - accepts .docx/.pdf curriculum document
  app.post("/api/worship/upload", upload.single("document"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const uploadId = `worship-${Date.now()}`;
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    try {
      let text = "";
      if (fileName.endsWith(".docx")) {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value;
      } else if (fileName.endsWith(".pdf")) {
        const pdfParse = (await import("pdf-parse")).default;
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        text = pdfData.text;
      } else if (fileName.endsWith(".txt")) {
        text = fs.readFileSync(filePath, "utf-8");
      } else {
        return res.status(400).json({ message: "Unsupported file type. Use .docx, .pdf, or .txt" });
      }

      // Initialize progress tracking
      uploadProgress.set(uploadId, {
        status: "processing",
        progress: 0,
        currentStep: "Starting...",
        createdAt: new Date().toISOString(),
      });

      res.json({ uploadId, status: "processing", message: "Document uploaded. Processing started." });

      processWorshipCurriculum(uploadId, text).catch((err) => {
        console.error("Worship processing error:", err);
        const progress = uploadProgress.get(uploadId);
        if (progress) {
          progress.status = "error";
          progress.error = err.message;
        }
      });
    } catch (err: any) {
      res.status(500).json({ message: "Upload failed", error: err.message });
    } finally {
      fs.unlink(filePath, () => {});
    }
  });

  // 10. GET /api/worship/upload/:uploadId/status - progress tracking for worship uploads
  app.get("/api/worship/upload/:uploadId/status", (req, res) => {
    const progress = uploadProgress.get(req.params.uploadId);
    if (!progress) {
      return res.status(404).json({ message: "Upload not found" });
    }
    res.json(progress);
  });

  // 11. DELETE /api/worship/units/:id - deletes uploaded worship unit
  app.delete("/api/worship/units/:id", async (req, res) => {
    try {
      const unitId = parseInt(req.params.id);
      const [unit] = await db.select().from(worshipUnitsTable).where(eq(worshipUnitsTable.id, unitId));
      if (!unit) return res.status(404).json({ message: "Unit not found" });

      await db.delete(worshipUnitsTable).where(eq(worshipUnitsTable.id, unitId));
      console.log(`Worship unit deleted: ${unitId}`);
      res.json({ message: "Unit deleted" });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to delete unit", error: err.message });
    }
  });
}

async function processSermon(sermonId: string, text: string) {
  const updateSermon = async (data: Partial<typeof sermons.$inferInsert>) => {
    await db.update(sermons).set(data).where(eq(sermons.id, sermonId));
  };

  await updateSermon({ currentStep: "Analyzing sermon structure...", progress: 10 });
  const analysis = await analyzeSermon(text);
  await updateSermon({
    title: analysis.title,
    scripture: analysis.scripture,
    summary: analysis.summary,
    keyThemes: analysis.keyThemes,
  });

  await updateSermon({ currentStep: "Breaking sermon into scenes...", progress: 20 });
  const scenes = await generateScenes(text, analysis);
  await updateSermon({ scenes });

  await updateSermon({ currentStep: "Writing age-appropriate narratives...", progress: 35 });
  for (let i = 0; i < scenes.length; i++) {
    await updateSermon({ currentStep: `Writing narratives for scene ${i + 1}/${scenes.length}...`, progress: Math.round(35 + (i / scenes.length) * 15) });
    const narratives = await generateNarratives(scenes[i], i, scenes.length);
    scenes[i].narratives = narratives;
  }
  await updateSermon({ scenes });

  await updateSermon({ currentStep: "Generating illustrations...", progress: 50 });
  for (let i = 0; i < scenes.length; i++) {
    await updateSermon({ currentStep: `Illustrating scene ${i + 1}/${scenes.length}...`, progress: Math.round(50 + (i / scenes.length) * 25) });
    try {
      const imageUrl = await generateImage(scenes[i].imagePrompt, sermonId, i);
      scenes[i].imageUrl = imageUrl;
    } catch (err) {
      console.error(`Image gen failed for scene ${i}:`, err);
      scenes[i].imageUrl = null;
    }
    if (i < scenes.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  await updateSermon({ scenes });

  await updateSermon({ currentStep: "Creating quizzes and discussion prompts...", progress: 80 });
  for (let i = 0; i < scenes.length; i++) {
    const narrativeText = scenes[i].narratives
      ? `Young version: ${scenes[i].narratives.young}\n\nOlder version: ${scenes[i].narratives.older}\n\nFamily version: ${scenes[i].narratives.family}`
      : scenes[i].content;
    const quiz = await generateQuiz(narrativeText, "mixed");
    scenes[i].quiz = quiz;
    const discussion = await generateDiscussionPrompts(scenes[i]);
    scenes[i].discussionPrompts = discussion;
  }

  await updateSermon({
    scenes,
    currentStep: "Complete",
    progress: 100,
    status: "ready",
  });
}

async function analyzeSermon(text: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a sermon analysis expert. Analyze the given sermon transcript and extract structured information. Respond with JSON:
{
  "title": "A clear, engaging title for this sermon",
  "scripture": "The primary Scripture passage (e.g., 'Luke 11:37-54')",
  "summary": "A 2-3 sentence summary of the sermon's main message",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "targetAudience": "Who this sermon is primarily addressing",
  "emotionalArc": "The emotional journey of the sermon (e.g., 'conviction to grace')"
}`,
      },
      { role: "user", content: text.substring(0, 8000) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });
  return JSON.parse(response.choices[0].message.content || "{}");
}

async function generateScenes(text: string, analysis: any) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a creative director turning a sermon into a cohesive illustrated storybook that reads as ONE CONTINUOUS STORY from beginning to end. Break the sermon into 8-10 visual scenes.

RULE 1 — SERMON ORDER (MOST IMPORTANT):
- Scenes MUST follow the sermon's actual sequence from beginning to end. Scene 1 covers the opening, scene 2 what comes next, and so on through to the conclusion.
- Do NOT rearrange, regroup, or reorder the sermon's content. Follow the exact order the pastor delivered it.

RULE 2 — CONTINUOUS NARRATIVE FLOW:
- The storybook must read as one flowing story, NOT as disconnected snapshots. Each scene should build on the previous one.
- Scene content should use transitional language that connects to what came before: "As we continue...", "Next, we learn...", "Building on that idea...", "The story then takes us to...", etc.
- NEVER restart or re-introduce the topic as if starting over. If scene 3 covered a concept, scene 4 should move FORWARD, not circle back.
- Each scene must advance the story. The reader should feel momentum carrying them through the sermon.

RULE 3 — NO DUPLICATE OR REPETITIVE SCENES:
- Every scene must cover DISTINCT content from the sermon. No two scenes should teach the same concept, lesson, or idea.
- If the pastor repeated a theme for emphasis, consolidate it into ONE scene. Do not create separate scenes for variations of the same point.
- Before finalizing, review all scenes together and merge or replace any that overlap significantly.

RULE 4 — IMAGE PROMPT RULES:

STYLE:
- Colorful, cinematic 3D animated style with expressive, big-eyed characters and soft global lighting, like a modern family animated feature film (Pixar/DreamWorks quality). NOT realistic, NOT watercolor, NOT cartoon.
- Warm cinematic lighting. Widescreen 16:9. Rich environmental detail.
- No copyrighted characters, no recognizable brands.

ABSOLUTE PROHIBITIONS (ZERO TOLERANCE):
- NEVER depict God, Jesus, or the Holy Spirit as a person, figure, silhouette, shadow, or character. Not from behind. Not obscured. Not as light in human form. NEVER. Instead: warm golden light rays from above, a glowing cloud, a radiant sunrise, a gentle star, a comforting glow filling a room. The EFFECT of God's presence, never a figure.
- NEVER depict: alcohol, beer, wine, liquor, any drinking vessel that could be interpreted as containing alcohol, bars, pubs, taverns, toasting, clinking glasses.
- NEVER depict: drugs, pills, syringes, smoking, vaping, cigarettes, any substance or paraphernalia.
- NEVER depict: gambling, poker chips, dice, slot machines, playing cards used for gambling, casinos, betting.
- NEVER depict: weapons, swords, spears, knives, bows, shields in combat, violence, blood, injury, death, graves, skeletons, skulls, war scenes, battles.
- NEVER depict: romantic scenes, kissing, intimate situations, suggestive clothing or poses.
- NEVER depict: scary imagery, monsters, demons, dark threatening figures, fire as punishment, hell imagery.
- NEVER include text, words, letters, numbers, labels, captions, names, signs, banners, scrolls with writing, books with visible text, or any readable content.
- Characters must NEVER have open mouths or appear to be speaking or shouting.

METAPHOR MAPPING (CRITICAL):
When the sermon discusses adult topics, the image prompt must use a child-safe visual metaphor instead of depicting the topic literally:
- Sin/wrongdoing -> A child at a fork between a bright sunny path and a dark shadowy path
- Addiction/temptation -> A child being gently pulled toward a warm light while shadows recede behind them
- Hypocrisy -> A shiny apple that is rotten inside (cut in half), or a beautiful cup that is dirty inside
- Judgment/condemnation -> Heavy stone blocks on someone's shoulders while others watch with crossed arms
- Forgiveness/grace -> A wilted flower being restored by warm golden rain, or a dark room filling with sunrise light
- Death/loss -> An empty chair with a warm light shining on it, or a bird flying into golden clouds
- Anger/conflict -> Storm clouds breaking apart to reveal blue sky and a rainbow
- Greed/selfishness -> A child hoarding toys in a corner while other children play together happily
- Repentance -> A child turning around on a dark path to face a warm, glowing light

SETTING RULES:
- Default to biblical-era settings: stone villages, olive groves, hillsides, temple courtyards, simple homes with oil lamps, dusty roads, fishing boats, marketplaces.
- If the pastor used a modern real-world illustration, 1-2 scenes (10-20%) may use modern settings (classroom, family dinner table, playground, living room). These must still follow ALL prohibitions above.
- Characters should be diverse in ethnicity and appearance.
- Include children in scenes where appropriate.

EACH IMAGE PROMPT MUST END WITH:
"No text, no words, no letters, no writing of any kind. No depiction of God or Jesus as a figure. No alcohol, drugs, gambling, weapons, violence, or scary imagery. Suitable for ages 4-12."

RULE 5 — CONTENT FIELD:
- content: The core teaching content (2-3 paragraphs). This is the RAW source material that will be rewritten into age-appropriate narratives. It should contain the key facts, names, places, actions, and lessons from this portion of the sermon. Include specific details that quiz questions can be built from.
- Write the content in plain, clear language. Avoid theological jargon. If a theological concept appears (e.g., tithing, Pharisee, repentance), include a brief parenthetical explanation: "the Pharisees (the religious leaders who followed every rule very carefully)".
- Each scene's content must use transitional language connecting to the previous scene. NEVER restart or re-introduce the topic as if starting over.

RULE 6 — REAL-WORLD ILLUSTRATIONS:
- If the pastor used a memorable real-world example or personal story, 1-2 scenes (10-20%) should depict that modern-day scenario. These must still follow all safety rules above.
- If no real-world examples exist in the sermon, use biblical settings for all scenes.

For each scene, provide:
- title: A short, engaging scene title
- content: The core teaching content following Rule 5 above
- scriptureRef: Any Bible verse referenced
- keyPoint: The single most important idea
- emotion: The emotional tone (joy, wonder, conviction, comfort, etc.)
- imagePrompt: A detailed prompt following ALL image rules above
- animationHint: "zoom-in", "pan-left", "pan-right", "zoom-out", or "fade"

Respond with JSON: { "scenes": [...] }`,
      },
      {
        role: "user",
        content: `Sermon title: ${analysis.title}
Scripture: ${analysis.scripture}
Themes: ${analysis.keyThemes?.join(", ")}

Full sermon text:
${text.substring(0, 12000)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 16384,
  });

  const raw = response.choices[0].message.content || '{"scenes":[]}';

  if (response.choices[0].finish_reason === "length") {
    console.warn("Scene generation response was truncated, retrying with fewer scenes...");
    const retryResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a creative director turning a sermon into a cohesive illustrated storybook. Break the sermon into 5-6 visual scenes that read as ONE CONTINUOUS STORY following the sermon's exact order.

RULES:
1. SERMON ORDER: Follow the exact sequence the sermon was preached. No rearranging.
2. CONTINUOUS FLOW: Each scene builds on the previous one with transitional language. Never restart or re-introduce topics.
3. NO DUPLICATES: Every scene must cover distinct content. No two scenes should teach the same concept.
4. IMAGE SAFETY (ZERO TOLERANCE): ABSOLUTELY NO alcohol, beer, wine, liquor, bars, pubs, drugs, smoking, gambling, poker chips, weapons, violence, romantic scenes, scary imagery in image prompts. NEVER depict God, Jesus, or the Holy Spirit as a person, figure, silhouette, or shadow in any way. Use symbolic light/warmth only. For adult sermon topics, use child-safe metaphors (a bright path vs. dark path, a calm sea after a storm, a dirty cup vs. clean cup, etc.).
5. NO TEXT IN IMAGES: ABSOLUTELY NO text, words, letters, numbers, names, labels, signs, banners, or writing of any kind in image prompts. Images must be purely visual.
6. STYLE: Colorful cinematic 3D animated style, like a modern family animated feature film (NOT realistic). No copyrighted characters. No open mouths on characters.
7. REAL-WORLD ILLUSTRATIONS: If the pastor used real-world examples, 1-2 scenes may depict those in modern-day settings (following all safety rules). Otherwise use biblical settings.
8. EACH IMAGE PROMPT MUST END WITH: "No text, no words, no letters, no writing of any kind. No depiction of God or Jesus as a figure. No alcohol, drugs, gambling, weapons, violence, or scary imagery. Suitable for ages 4-12."

For each scene, provide:
- title: A short, engaging scene title
- content: The core teaching content (1-2 paragraphs). Plain language. If theological terms appear, include brief explanations. Must use transitions connecting to previous scene.
- scriptureRef: Any Bible verse referenced in this section
- keyPoint: The single most important idea in this scene
- emotion: The emotional tone (joy, wonder, conviction, comfort, etc.)
- imagePrompt: A prompt following all rules above. Colorful cinematic 3D animated style, expressive big-eyed characters, soft global lighting, warm cinematic lighting, widescreen 16:9, rich detail.
- animationHint: "zoom-in", "pan-left", "pan-right", "zoom-out", or "fade"

Respond with JSON: { "scenes": [...] }`,
        },
        {
          role: "user",
          content: `Sermon title: ${analysis.title}
Scripture: ${analysis.scripture}
Themes: ${analysis.keyThemes?.join(", ")}

Full sermon text:
${text.substring(0, 8000)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 16384,
    });
    const retryRaw = retryResponse.choices[0].message.content || '{"scenes":[]}';
    const retryParsed = JSON.parse(retryRaw);
    return retryParsed.scenes || [];
  }

  const parsed = JSON.parse(raw);
  return parsed.scenes || [];
}

async function generateNarratives(scene: any, sceneIndex: number = 0, totalScenes: number = 1) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a warm, experienced Sunday school teacher retelling a Bible story to children gathered around you. You are sitting on the floor with them. You have a quilt and a story bag. The children are settled in, looking at you, ready to hear the next part of the story.

HOW YOU SPEAK:
- You talk TO children, not ABOUT theology.
- You start with something they already know. Every scene opens by connecting to a child's real experience before introducing the Bible content. Examples: "Have you ever had an itchy rash?" "Imagine you found a key that opened a special door." "Have you ever been at a dinner where someone said something surprising?"
- You use short, active sentences. Subject-verb-object. "Jesus looked at the men. He saw their sores and bumps." NOT: "Jesus, observing their condition with compassion, recognized the severity of their ailment."
- You name things concretely. Say "sores and bumps" not "affliction." Say "the leaders" not "religious authorities." Say "they got really mad" not "they responded with hostility."
- You use repetition for emphasis, the way a teacher does: "Ten men. Ten sick men. And Jesus healed them all."
- You land every scene on ONE simple sentence the child can remember. Not a paragraph. One sentence.
- You never use words a 5-year-old wouldn't understand in the young tier, or words a 9-year-old wouldn't understand in the older tier.

WHAT YOU NEVER DO:
- Never use abstract theological language in young or older tiers. No: "genuine relationship with God," "external compliance," "religious pretense," "spiritual transformation," "deliberate confrontation," "sacrificial integrity."
- Never start a narration with a summary or thesis statement. Start with a scene. Start with a moment. Start with a question.
- Never preach at the child. The story teaches. You tell the story.
- Never use passive voice. "The men were healed" becomes "Jesus healed the men."
- Never reference the sermon, the pastor, or the app itself. You are telling a Bible story, not summarizing a sermon.

Write THREE versions of this scene:

1. "young" (ages 4-6):
   - Open with something the child already knows (a feeling, an everyday experience, a simple question).
   - Use 5-7 short, active sentences. Subject-verb-object.
   - Name things concretely: "sores and bumps" not "affliction," "the leaders" not "religious authorities."
   - Use "Jesus" by name. Use "God" by name. Children need to hear these names attached to actions.
   - End with ONE simple takeaway sentence a child could repeat back to you. Example: "God takes care of us, even when we forget to say thank you."
   - FORBIDDEN WORDS for this tier: mission, genuine, external, compliance, transformation, relationship (with God), deliberate, confrontation, pretense, sacrificial, integrity, authentic, theological, profound, challenged, navigate, recognized, observed, demonstrated, ultimately, significantly.
   - Read your output aloud in your head. If it sounds like a textbook, rewrite it. It should sound like a person talking to a small child.

2. "older" (ages 7-10):
   - Open with a relatable comparison or scenario the child can picture.
   - 6-8 sentences. Can use simple metaphors.
   - Can include scripture references naturally in the story: "The Bible tells us in Luke 11..."
   - Include enough specific detail (names, places, actions) that quiz questions can be answered from this text alone.
   - End with a clear lesson stated simply. One or two sentences.
   - Avoid: "genuine relationship," "external compliance," "religious pretense," "spiritual transformation."

3. "family" (ages 11+/parents):
   - Full depth of the teaching. Can reference theology.
   - 7-10 sentences.
   - Written for parents who may not know the Bible well. Explain context they'd need. Don't assume familiarity with Pharisees, tithing, or temple customs without a brief, natural explanation.
   - Connect the ancient world to the modern world. What does this look like in a family's life today?
   - End with a forward-looking statement, not a summary.

CRITICAL FLOW RULES:
- If this is scene 2 or later, do NOT re-introduce the overall topic. Continue the story. Use transitions: "Next..." "As the story continues..." "Then something surprising happened..."
- The opening hook (connecting to the child's experience) should still appear, but it connects to THIS scene's specific content, not to the sermon's overall theme.

Respond with JSON: { "young": "...", "older": "...", "family": "..." }`,
      },
      {
        role: "user",
        content: `Scene ${sceneIndex + 1} of ${totalScenes}: ${scene.title}
${sceneIndex === 0 ? "(This is the OPENING scene — introduce the story.)" : `(This is scene ${sceneIndex + 1} — continue the story from the previous scene. Do NOT re-introduce or start over.)`}
Key Point: ${scene.keyPoint}
Content: ${scene.content}
Scripture: ${scene.scriptureRef || "none"}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });
  return JSON.parse(response.choices[0].message.content || "{}");
}

async function generateImage(prompt: string, sermonId?: string, sceneIndex?: number): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required for image generation");

  const { GoogleGenAI } = await import("@google/genai");
  const client = new GoogleGenAI({ apiKey });

  const safetyPrefix = "Generate a bright, cheerful children's storybook illustration for ages 4-12. Colorful 3D animated style with expressive big-eyed characters and soft global lighting, like a modern family animated feature film. The scene must be entirely wholesome and family-friendly. CRITICAL RULES: Do not depict Jesus, God, or any divine figure as a person or character in any way — no silhouettes, no figures, no human forms, not from behind, not obscured. Represent divine presence ONLY through warm golden light rays, glowing clouds, or gentle radiant sunrise. Do not include any text, words, letters, numbers, or writing of any kind anywhere in the image. Characters must have closed mouths. Settings must be child-safe. Widescreen 16:9 composition. ";
  const safePrompt = safetyPrefix + prompt;

  const label = `${sermonId || "on-demand"} scene ${sceneIndex ?? "?"}`;
  console.log(`Generating image with Gemini native for ${label}`);

  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(5000 * Math.pow(2, attempt - 1), 30000);
        console.log(`Retry ${attempt}/${maxRetries} for ${label}, waiting ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      }

      const currentPrompt = attempt === 0 ? safePrompt
        : `Generate a wholesome children's storybook illustration, colorful 3D animated style, big-eyed characters, warm lighting, bright cheerful scene, family-friendly, widescreen 16:9, no text or writing, no depiction of Jesus or God as a person — use golden light rays instead. ${prompt.replace(/[^\w\s,.'"-]/g, ' ').substring(0, 500)}`;

      const response = await client.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: currentPrompt,
        config: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (!parts || parts.length === 0) {
        if (attempt < maxRetries - 1) {
          console.warn(`Gemini returned no parts for ${label}, will retry with simplified prompt`);
          continue;
        }
        throw new Error("Gemini returned no content parts");
      }

      const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));
      if (!imagePart?.inlineData?.data) {
        if (attempt < maxRetries - 1) {
          console.warn(`Gemini returned no image data for ${label}, will retry with simplified prompt`);
          continue;
        }
        throw new Error("Gemini returned no image in response");
      }

      const filename = sermonId && sceneIndex !== undefined
        ? `${sermonId}-scene${sceneIndex}.png`
        : `image-${Date.now()}.png`;

      const filePath = path.join(IMAGES_DIR, filename);
      const buffer = Buffer.from(imagePart.inlineData.data, "base64");
      fs.writeFileSync(filePath, buffer);
      console.log(`Image saved: ${filePath} (${(buffer.length / 1024).toFixed(0)}KB)`);

      return `/generated/images/${filename}`;
    } catch (err: any) {
      lastError = err;
      if (err.status === 429) {
        console.warn(`Rate limited on attempt ${attempt + 1} for ${label}`);
        continue;
      }
      if (attempt < maxRetries - 1 && err.message?.includes("safety")) {
        console.warn(`Safety filter hit for ${label}, will retry with simplified prompt`);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

async function generateQuiz(content: string, ageGroup: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Create quiz questions about a storybook scene for families. You will be given the EXACT narration text that the reader saw and heard. Your questions MUST be answerable ONLY from the information explicitly stated in that narration.

CRITICAL RULE: Every correct answer must come directly from a specific fact, name, place, action, or lesson that is EXPLICITLY mentioned in the narration. If a detail is NOT stated, do NOT ask about it. Do not use your own biblical knowledge to fill gaps.

Before writing each question, mentally verify: "Can I point to the exact sentence in the narration that provides this answer?" If not, discard it and write a different question.

QUESTION STYLE (modeled on Sunday school curriculum):

"young" questions (ages 4-6):
  - Simple Yes/No format. Options: ["Yes", "No"].
  - Frame as something the child just heard in the story: "Did Jesus heal the sick men?" "Did the man say thank you?"
  - Language a 4-year-old can understand. No compound sentences.
  - Explanation should sound like a teacher talking to a child: "That's right! Jesus healed all 10 men because he loved them."
  - Base these on the "Young version" narration.

"older" questions (ages 7-10):
  - Multiple choice with 3 text options.
  - Start with factual recall, then one application question: "What did Jesus tell the men to do?" "Why do you think the one man came back?"
  - Explanation should teach, not just confirm: "Jesus told them to go show themselves to the priests. In Bible times, the priests were the ones who decided if someone was healed."
  - Base these on the "Older version" narration.

"family" questions (ages 11+):
  - Multiple choice with 3 text options.
  - Can be reflective and application-focused: "What does this scene teach about how God sees us?"
  - Explanation should connect to modern life.
  - Base these on the "Family version" narration.

ALL questions must be answerable from the narration text alone. NEVER ask about details not explicitly covered in the narration.
NEVER reference images, pictures, illustrations, or visual elements.
NEVER reference "which picture" or "which image" or ask users to compare visual options.
Explanations should reinforce the lesson by quoting or paraphrasing what the narration actually said.

Respond with JSON:
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C"],
      "correctIndex": 0,
      "explanation": "...",
      "ageGroup": "young" | "older" | "family"
    }
  ]
}

Create 2 questions for each age group (6 total).`,
      },
      { role: "user", content: content },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });
  return JSON.parse(response.choices[0].message.content || '{"questions":[]}');
}

async function generateDiscussionPrompts(scene: any) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Create family discussion prompts for a storybook scene. These help parents and children talk about the story together.

MODEL: Follow the pattern from Sunday school curriculum:

1. Start with a simple recall question about the story: "What did Jesus do for the sick men?"

2. Then an application question connecting to the child's life: "What are some ways God shows love and care for us?"

3. Include a parentTip that tells the parent HOW to respond, modeling the kind of warm, affirming answer a Sunday school teacher would give. Example: "After they share, you can say: 'Yes! God shows his love in so many ways. He gives us families, friends, food, and most of all, he sent Jesus.'"

TONE RULES:
- Questions should be simple enough that a 5-year-old could attempt an answer, even if the family is in "family" mode.
- Parent tips should give the parent actual words to say, not abstract advice like "guide the conversation." Write out example sentences the parent can use.
- connectionToLife should name a specific, concrete action: "At bedtime tonight, pray together and thank God for three specific things" NOT "Practice gratitude as a family."
- Never assume the parent is Bible-literate. Explain any biblical context they'd need right in the parentTip.

Respond with JSON:
{
  "prompts": [
    {
      "question": "An open-ended question for family discussion",
      "parentTip": "Actual words and sentences the parent can say, not abstract advice",
      "connectionToLife": "A specific, concrete action the family can take this week"
    }
  ]
}

Create 2-3 prompts per scene.`,
      },
      {
        role: "user",
        content: `Scene: ${scene.title}\nKey Point: ${scene.keyPoint}\nContent: ${scene.content}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });
  return JSON.parse(response.choices[0].message.content || '{"prompts":[]}');
}

// ============================================
// WORSHIP EXPLORER HELPER FUNCTIONS
// ============================================

async function generateWorshipQuiz(lessonContent: string, difficulty: string) {
  const difficultyGuide = difficulty === "easy"
    ? "For ages 4-6: simple yes/no questions"
    : difficulty === "hard"
    ? "For ages 9-12: more complex questions requiring deeper thinking"
    : "For ages 7-9: moderate difficulty with multiple choice";

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Create quiz questions about a worship lesson for children. ${difficultyGuide}.

CRITICAL RULE: Every correct answer must come directly from the lesson content provided. Do not use outside biblical knowledge.

QUESTION STYLE:
- Simple, clear language appropriate for the age group
- For younger ages: yes/no format
- For older ages: multiple choice with 3 options
- Each question should help children remember the key teaching

Respond with JSON:
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C"],
      "correctIndex": 0,
      "explanation": "..."
    }
  ]
}

Create 3-4 questions.`,
      },
      { role: "user", content: lessonContent },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });
  return JSON.parse(response.choices[0].message.content || '{"questions":[]}');
}

async function generateTeacherDiscussionQuestions(lessonContext: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an experienced children's ministry teacher helping other teachers prepare engaging discussion questions for ages 4-6. Generate discussion questions that:
- Are open-ended but simple enough for young children
- Connect the worship concept to their daily lives
- Encourage participation from shy children
- Include suggested follow-up prompts

Respond with a JSON object: {"questions": [{"question": "...", "followUp": "...", "connection": "..."}]}`,
      },
      { role: "user", content: lessonContext },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });
  return JSON.parse(response.choices[0].message.content || '{"questions":[]}');
}

async function generateTeacherIllustrations(lessonContext: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an experienced children's ministry teacher helping other teachers create engaging illustrations and object lessons for ages 4-6. Generate creative illustration ideas that:
- Use simple, everyday objects children recognize
- Make abstract worship concepts concrete and visible
- Are safe and easy to set up in a classroom
- Create memorable moments that reinforce the lesson

Respond with a JSON object: {"illustrations": [{"title": "...", "materials": ["..."], "description": "...", "connection": "..."}]}`,
      },
      { role: "user", content: lessonContext },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });
  return JSON.parse(response.choices[0].message.content || '{"illustrations":[]}');
}

async function generateTeacherActivities(lessonContext: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an experienced children's ministry teacher helping other teachers design hands-on activities for ages 4-6. Generate activity ideas that:
- Are physically engaging (not just sitting)
- Reinforce the worship concept through movement or creation
- Work for groups of 5-15 children
- Take 5-10 minutes each
- Require minimal supplies

Respond with a JSON object: {"activities": [{"title": "...", "type": "...", "duration": "...", "materials": ["..."], "instructions": "...", "worshipConnection": "..."}]}`,
      },
      { role: "user", content: lessonContext },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });
  return JSON.parse(response.choices[0].message.content || '{"activities":[]}');
}

async function generateWorshipStory(element: any) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a warm, experienced Sunday school teacher creating a child-friendly story about a worship concept. The story should:
- Be engaging and age-appropriate for ages 4-8
- Explain the worship concept in concrete, memorable ways
- Use simple language and vivid imagery
- Connect abstract worship ideas to things children experience
- Be 3-4 paragraphs long
- End with a clear lesson the child will remember

Write the story as natural narrative prose, not Q&A or lesson plan format.`,
      },
      {
        role: "user",
        content: `Create a story about "${element.name}": ${element.childFriendlyExplanation}`,
      },
    ],
    temperature: 0.8,
  });
  return response.choices[0].message.content || "";
}

async function generateParentGuide(lesson: LessonData) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a Sunday school curriculum writer creating an at-home guide for parents. Based on the lesson content, create a family activity guide that:
- Summarizes what the child learned in 2-3 simple sentences
- Provides 2-3 ways to practice the memory verse at home
- Lists 3 concrete family activities (5-15 min each) with materials and instructions
- Gives 3-4 dinner table discussion starters
- Includes a prayer focus with example words the parent can say

Respond with JSON:
{
  "summary": "...",
  "memoryVersePractice": ["tip1", "tip2"],
  "activities": [{"title": "...", "duration": "...", "materials": ["..."], "instructions": "..."}],
  "discussionStarters": ["..."],
  "prayerFocus": "..."
}`,
      },
      {
        role: "user",
        content: `
Lesson: ${lesson.title}
Main Idea: ${lesson.mainIdea}
Memory Verse: "${lesson.memoryVerse}" (${lesson.memoryVerseReference})
Prayer Focus: ${lesson.prayerFocus}
${lesson.songSuggestions && lesson.songSuggestions.length > 0 ? `Suggested Songs: ${lesson.songSuggestions.join(", ")}` : ""}
      `.trim(),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });
  return JSON.parse(response.choices[0].message.content || '{"summary":"","memoryVersePractice":[],"activities":[],"discussionStarters":[],"prayerFocus":""}');
}

async function processWorshipCurriculum(uploadId: string, text: string) {
  const progress = uploadProgress.get(uploadId)!;

  const updateUploadProgress = (step: string, pct: number) => {
    progress.currentStep = step;
    progress.progress = pct;
    console.log(`[${uploadId}] ${step} (${pct}%)`);
  };

  // Step 1: Analyze document structure
  updateUploadProgress("Analyzing document structure...", 10);
  const structureResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are analyzing a children's worship curriculum document. Identify the high-level structure.

Extract:
- unitTitle: The overall unit or curriculum title
- worshipElement: Which element of worship this unit covers (e.g., "Call to Worship", "Prayer", etc.)
- unitDescription: A 1-2 sentence description of what this unit teaches
- lessonCount: How many individual lessons are in this document
- lessonTitles: Array of lesson titles found

Respond with JSON:
{
  "unitTitle": "...",
  "worshipElement": "...",
  "unitDescription": "...",
  "lessonCount": 1,
  "lessonTitles": ["..."]
}`,
      },
      { role: "user", content: text.substring(0, 12000) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const structure = JSON.parse(structureResponse.choices[0].message.content || '{}');

  // Step 2: Extract detailed lesson data
  updateUploadProgress("Extracting lesson content...", 30);
  const lessonsResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are parsing a children's worship curriculum document. Extract ALL lesson data with maximum detail.

For each lesson found, extract every available field:
- title: The lesson title
- mainIdea: The main teaching point (1-2 sentences summarizing the lesson focus)
- memoryVerse: The exact memory verse text (look for "Memory Minute", "Memory Verse", or similar sections)
- memoryVerseReference: The Bible verse reference (e.g., "Psalm 95:6", "Luke 17:11-19")
- worshipSign: Any worship sign, hand motion, or physical gesture described
- callAndResponse: If there are leader/response elements, extract as {leader: "...", response: "..."}. If none found, use null.
- activities: Array of activity descriptions found in the lesson (crafts, games, songs, discussions)
- prayerFocus: The prayer focus, closing prayer, or suggested prayer text
- songSuggestions: Any song titles mentioned (array of strings). If none, use null.

Be thorough - extract EVERYTHING available from the document for each lesson.

Respond with JSON:
{
  "lessons": [
    {
      "title": "...",
      "mainIdea": "...",
      "memoryVerse": "...",
      "memoryVerseReference": "...",
      "worshipSign": "...",
      "callAndResponse": {"leader": "...", "response": "..."} or null,
      "activities": ["..."],
      "prayerFocus": "...",
      "songSuggestions": ["..."] or null
    }
  ]
}`,
      },
      { role: "user", content: text.substring(0, 16000) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  const lessonsData = JSON.parse(lessonsResponse.choices[0].message.content || '{"lessons":[]}');
  const lessons = lessonsData.lessons || [];

  // Step 3: Generate quiz questions for each lesson
  updateUploadProgress("Generating quiz questions...", 50);
  for (let i = 0; i < lessons.length; i++) {
    updateUploadProgress(`Generating quiz for lesson ${i + 1}/${lessons.length}...`, 50 + (i / lessons.length) * 30);

    const lesson = lessons[i];
    const content = `
Lesson: ${lesson.title}
Main Idea: ${lesson.mainIdea}
Memory Verse: ${lesson.memoryVerse} (${lesson.memoryVerseReference})
Prayer Focus: ${lesson.prayerFocus}
${lesson.worshipSign ? `Worship Sign: ${lesson.worshipSign}` : ""}
${lesson.callAndResponse ? `Call and Response - Leader: "${lesson.callAndResponse.leader}" Response: "${lesson.callAndResponse.response}"` : ""}
${lesson.activities?.length > 0 ? `Activities: ${lesson.activities.join(", ")}` : ""}
    `.trim();

    try {
      const quizResult = await generateWorshipQuiz(content, "easy");
      lesson.preGeneratedQuiz = quizResult.questions || [];
    } catch (err) {
      console.error(`Quiz generation failed for lesson ${i + 1}:`, err);
      lesson.preGeneratedQuiz = [];
    }
  }

  // Step 4: Build and store unit in database
  updateUploadProgress("Organizing curriculum...", 90);

  const [{ maxNum }] = await db.select({ maxNum: sql<number>`coalesce(max(${worshipUnitsTable.number}), 0)` }).from(worshipUnitsTable);
  const nextNumber = (maxNum || 0) + 1;

  const [insertedUnit] = await db.insert(worshipUnitsTable).values({
    number: nextNumber,
    title: structure.unitTitle || "Uploaded Curriculum",
    description: structure.unitDescription || `Curriculum about ${structure.worshipElement || "worship"}`,
    worshipElement: structure.worshipElement || "Worship",
  }).returning();

  const unitId = insertedUnit.id;

  for (let idx = 0; idx < lessons.length; idx++) {
    const lesson = lessons[idx];
    await db.insert(worshipLessons).values({
      unitId,
      number: idx + 1,
      title: lesson.title || `Lesson ${idx + 1}`,
      mainIdea: lesson.mainIdea || "",
      memoryVerse: lesson.memoryVerse || "",
      memoryVerseReference: lesson.memoryVerseReference || "",
      worshipSign: lesson.worshipSign || "",
      callAndResponse: lesson.callAndResponse || null,
      activities: lesson.activities || null,
      prayerFocus: lesson.prayerFocus || "",
      songSuggestions: lesson.songSuggestions || null,
      preGeneratedQuiz: lesson.preGeneratedQuiz || [],
    });
  }

  // Step 5: Finalize
  updateUploadProgress("Complete", 100);
  progress.status = "ready";
  progress.unitId = unitId;
  console.log(`Worship curriculum processed and stored: ${uploadId} (${lessons.length} lessons, quizzes generated)`);
}
