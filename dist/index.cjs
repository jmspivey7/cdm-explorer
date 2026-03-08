"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  sermons: () => sermons,
  smjLessons: () => smjLessons,
  worshipLessons: () => worshipLessons,
  worshipUnits: () => worshipUnits
});
var import_pg_core, sermons, worshipUnits, smjLessons, worshipLessons;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    import_pg_core = require("drizzle-orm/pg-core");
    sermons = (0, import_pg_core.pgTable)("sermons", {
      id: (0, import_pg_core.text)("id").primaryKey(),
      title: (0, import_pg_core.text)("title").notNull().default("Processing..."),
      scripture: (0, import_pg_core.text)("scripture").default(""),
      summary: (0, import_pg_core.text)("summary"),
      keyThemes: (0, import_pg_core.jsonb)("key_themes").$type(),
      status: (0, import_pg_core.text)("status").notNull().default("processing"),
      rawText: (0, import_pg_core.text)("raw_text"),
      scenes: (0, import_pg_core.jsonb)("scenes").$type(),
      progress: (0, import_pg_core.integer)("progress").default(0),
      currentStep: (0, import_pg_core.text)("current_step").default(""),
      error: (0, import_pg_core.text)("error"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    worshipUnits = (0, import_pg_core.pgTable)("worship_units", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      number: (0, import_pg_core.integer)("number").notNull(),
      title: (0, import_pg_core.text)("title").notNull(),
      description: (0, import_pg_core.text)("description").default(""),
      worshipElement: (0, import_pg_core.text)("worship_element").default(""),
      elementSpotlight: (0, import_pg_core.text)("element_spotlight").default(""),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    smjLessons = (0, import_pg_core.pgTable)("smj_lessons", {
      id: (0, import_pg_core.text)("id").primaryKey(),
      lessonNumber: (0, import_pg_core.integer)("lesson_number").notNull().default(0),
      title: (0, import_pg_core.text)("title").notNull().default("Processing..."),
      scripture: (0, import_pg_core.text)("scripture").default(""),
      bibleTruth: (0, import_pg_core.text)("bible_truth").default(""),
      lessonFocus: (0, import_pg_core.text)("lesson_focus").default(""),
      goalsForChildren: (0, import_pg_core.jsonb)("goals_for_children").$type(),
      bibleStoryScenes: (0, import_pg_core.jsonb)("bible_story_scenes").$type(),
      welcomeStory: (0, import_pg_core.text)("welcome_story").default(""),
      catechismPairs: (0, import_pg_core.jsonb)("catechism_pairs").$type(),
      discussionQuestions: (0, import_pg_core.jsonb)("discussion_questions").$type(),
      bibleVerses: (0, import_pg_core.jsonb)("bible_verses").$type(),
      closingPrayer: (0, import_pg_core.text)("closing_prayer").default(""),
      preGeneratedQuiz: (0, import_pg_core.jsonb)("pre_generated_quiz").$type(),
      storySequenceEvents: (0, import_pg_core.jsonb)("story_sequence_events").$type(),
      status: (0, import_pg_core.text)("status").notNull().default("processing"),
      progress: (0, import_pg_core.integer)("progress").default(0),
      currentStep: (0, import_pg_core.text)("current_step").default(""),
      error: (0, import_pg_core.text)("error"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    worshipLessons = (0, import_pg_core.pgTable)("worship_lessons", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      unitId: (0, import_pg_core.integer)("unit_id").notNull().references(() => worshipUnits.id, { onDelete: "cascade" }),
      number: (0, import_pg_core.integer)("number").notNull(),
      title: (0, import_pg_core.text)("title").notNull(),
      mainIdea: (0, import_pg_core.text)("main_idea").default(""),
      memoryVerse: (0, import_pg_core.text)("memory_verse").default(""),
      memoryVerseReference: (0, import_pg_core.text)("memory_verse_reference").default(""),
      worshipSign: (0, import_pg_core.text)("worship_sign").default(""),
      callAndResponse: (0, import_pg_core.jsonb)("call_and_response").$type(),
      activities: (0, import_pg_core.jsonb)("activities").$type(),
      prayerFocus: (0, import_pg_core.text)("prayer_focus").default(""),
      songSuggestions: (0, import_pg_core.jsonb)("song_suggestions").$type(),
      preGeneratedQuiz: (0, import_pg_core.jsonb)("pre_generated_quiz").$type(),
      lessonSections: (0, import_pg_core.jsonb)("lesson_sections").$type(),
      sidebarMeta: (0, import_pg_core.jsonb)("sidebar_meta").$type(),
      preparation: (0, import_pg_core.text)("preparation").default(""),
      bibleBackground: (0, import_pg_core.text)("bible_background").default(""),
      elementSections: (0, import_pg_core.jsonb)("element_sections").$type(),
      elementSidebarMeta: (0, import_pg_core.jsonb)("element_sidebar_meta").$type()
    });
  }
});

// server/db.ts
var import_node_postgres, import_pg, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    import_node_postgres = require("drizzle-orm/node-postgres");
    import_pg = __toESM(require("pg"), 1);
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required. Please provision a database.");
    }
    pool = new import_pg.default.Pool({ connectionString: process.env.DATABASE_URL });
    db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });
  }
});

// server/smj-routes.ts
var smj_routes_exports = {};
__export(smj_routes_exports, {
  registerSMJRoutes: () => registerSMJRoutes
});
function getOpenAI() {
  return new import_openai.default({ apiKey: process.env.OPENAI_API_KEY });
}
function registerSMJRoutes(app2) {
  app2.get("/api/smj/lessons", async (_req, res) => {
    try {
      const rows = await db.select().from(smjLessons);
      const result = rows.map((l) => ({
        id: l.id,
        lessonNumber: l.lessonNumber,
        title: l.title,
        scripture: l.scripture,
        status: l.status,
        createdAt: l.createdAt
      }));
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/smj/lessons/:id", async (req, res) => {
    try {
      const [lesson] = await db.select().from(smjLessons).where((0, import_drizzle_orm.eq)(smjLessons.id, req.params.id));
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
      res.json(lesson);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.delete("/api/smj/lessons/:id", async (req, res) => {
    try {
      const [lesson] = await db.select().from(smjLessons).where((0, import_drizzle_orm.eq)(smjLessons.id, req.params.id));
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
      const scenes = lesson.bibleStoryScenes || [];
      for (const scene of scenes) {
        if (scene.imageUrl) {
          const imgPath = import_path.default.resolve(
            "generated",
            scene.imageUrl.replace(/^\/generated\//, "")
          );
          if (import_fs.default.existsSync(imgPath)) {
            import_fs.default.unlinkSync(imgPath);
          }
        }
      }
      await db.delete(smjLessons).where((0, import_drizzle_orm.eq)(smjLessons.id, req.params.id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/smj/upload", upload.single("document"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const ext = import_path.default.extname(req.file.originalname).toLowerCase();
      let rawText = "";
      if (ext === ".pdf") {
        const pdfParse = (await import("pdf-parse")).default;
        const buffer = import_fs.default.readFileSync(req.file.path);
        const data = await pdfParse(buffer);
        rawText = data.text;
      } else if (ext === ".docx") {
        const mammoth2 = (await import("mammoth")).default;
        const result = await mammoth2.extractRawText({ path: req.file.path });
        rawText = result.value;
      } else if (ext === ".txt") {
        rawText = import_fs.default.readFileSync(req.file.path, "utf8");
      } else {
        import_fs.default.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Unsupported file type" });
      }
      import_fs.default.unlinkSync(req.file.path);
      if (!rawText.trim()) {
        return res.status(400).json({ error: "Could not extract text from file" });
      }
      const uploadId = `smj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      smjUploadProgress.set(uploadId, {
        status: "processing",
        progress: 0,
        currentStep: "Starting...",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      processSMJLesson(uploadId, rawText).catch((err) => {
        console.error("SMJ processing failed:", err);
        const prog = smjUploadProgress.get(uploadId);
        if (prog) {
          prog.status = "error";
          prog.error = err.message || "Processing failed";
        }
      });
      res.json({ uploadId, status: "processing" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/smj/upload/:uploadId/status", (req, res) => {
    const prog = smjUploadProgress.get(req.params.uploadId);
    if (!prog) return res.status(404).json({ error: "Upload not found" });
    res.json({
      status: prog.status,
      percentage: prog.progress,
      currentStep: prog.currentStep,
      lessonId: prog.lessonId,
      error: prog.error
    });
  });
  app2.post("/api/smj/ai/catechism-hint", async (req, res) => {
    try {
      const { question, answer } = req.body;
      if (!question || !answer)
        return res.status(400).json({ error: "question and answer required" });
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You help preschool children (ages 3-5) remember catechism answers. Given a catechism question and its answer, provide a simple, fun hint that helps a young child remember the answer. Use simple words, a fun analogy, or a short rhyme. Keep it to 1-2 sentences."
          },
          {
            role: "user",
            content: `Question: ${question}
Answer: ${answer}

Give a child-friendly hint to help remember this answer.`
          }
        ],
        max_tokens: 150
      });
      const hint = response.choices[0]?.message?.content?.trim() || "Think about it!";
      res.json({ hint });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/smj/ai/parent-guide", async (req, res) => {
    try {
      const { lessonId } = req.body;
      if (!lessonId)
        return res.status(400).json({ error: "lessonId required" });
      const [lesson] = await db.select().from(smjLessons).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
      const catechismText = lesson.catechismPairs?.map(
        (p) => `${p.questionNumber ? p.questionNumber + ": " : ""}${p.question} \u2014 ${p.answer}`
      ).join("\n") || "No catechism pairs available";
      const versesText = lesson.bibleVerses?.map((v) => `${v.reference}: ${v.text}`).join("\n") || "No verses available";
      const discussionText = lesson.discussionQuestions?.map((q) => `Q: ${q.question} (Expected: ${q.expectedAnswer})`).join("\n") || "No discussion questions";
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You generate parent take-home guides for a preschool Bible curriculum called "Show Me Jesus." Parents will use this to reinforce what their child learned in class. Write warmly and simply. Return valid JSON only.`
          },
          {
            role: "user",
            content: `Generate a parent take-home guide for:

Lesson: "${lesson.title}" (Lesson ${lesson.lessonNumber})
Scripture: ${lesson.scripture}
Bible Truth: ${lesson.bibleTruth}
Lesson Focus: ${lesson.lessonFocus}

Catechism Q&A from this lesson:
${catechismText}

Bible Verses to review:
${versesText}

Discussion questions from class:
${discussionText}

Closing prayer from class:
${lesson.closingPrayer || "Not available"}

Return JSON:
{
  "summary": "2-3 sentence summary of what the child learned",
  "catechismPractice": [{ "question": "...", "answer": "...", "tip": "short parent tip for practicing" }],
  "versesToReview": [{ "reference": "...", "text": "..." }],
  "familyDiscussion": ["discussion starter 1", "starter 2", "starter 3", "starter 4"],
  "closingPrayer": "formatted prayer text for parents to pray with their child"
}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });
      const guide = JSON.parse(
        response.choices[0]?.message?.content || "{}"
      );
      res.json(guide);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/smj/ai/teacher-assistant", async (req, res) => {
    try {
      const { lessonId, requestType } = req.body;
      if (!lessonId || !requestType)
        return res.status(400).json({ error: "lessonId and requestType required" });
      const [lesson] = await db.select().from(smjLessons).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
      const lessonContext = `Lesson: "${lesson.title}" (Lesson ${lesson.lessonNumber})
Scripture: ${lesson.scripture}
Bible Truth: ${lesson.bibleTruth}
Lesson Focus: ${lesson.lessonFocus}
Goals: ${lesson.goalsForChildren?.join("; ") || "N/A"}`;
      let prompt = "";
      if (requestType === "discussion") {
        prompt = `${lessonContext}

Generate 5 age-appropriate discussion questions for preschool/early elementary children about this Bible lesson. Each question should have a follow-up question and a connection to the child's daily life.

Return JSON: { "questions": [{ "question": "...", "followUp": "...", "connection": "..." }] }`;
      } else if (requestType === "illustration") {
        prompt = `${lessonContext}

Generate 3 creative object lesson ideas that a teacher could use to illustrate the Bible truth from this lesson. Each should use simple, inexpensive materials.

Return JSON: { "illustrations": [{ "title": "...", "description": "...", "materials": "...", "setup": "..." }] }`;
      } else if (requestType === "activity") {
        prompt = `${lessonContext}

Generate 3 engaging activity ideas for preschool/early elementary children that reinforce this Bible lesson. Include active games, crafts, or sensory activities.

Return JSON: { "activities": [{ "title": "...", "description": "...", "materials": "...", "duration": "..." }] }`;
      } else {
        return res.status(400).json({ error: "Invalid requestType" });
      }
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a creative preschool Bible curriculum assistant. Return valid JSON only."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });
      const result = JSON.parse(
        response.choices[0]?.message?.content || "{}"
      );
      res.json({ type: requestType, ...result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}
async function generateSMJImage(prompt, lessonId, sceneIndex) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required for image generation");
  const { GoogleGenAI } = await import("@google/genai");
  const client = new GoogleGenAI({ apiKey });
  const safetyPrefix = "Generate a bright, cheerful children's storybook illustration for ages 3-6. Colorful 3D animated style with expressive big-eyed characters and soft global lighting, like a modern family animated feature film. The scene must be entirely wholesome and family-friendly. CRITICAL RULES: Do not depict Jesus, God, or any divine figure as a person or character in any way \u2014 no silhouettes, no figures, no human forms, not from behind, not obscured. Represent divine presence ONLY through warm golden light rays, glowing clouds, or gentle radiant sunrise. Do not include any text, words, letters, numbers, or writing of any kind anywhere in the image. Characters must have closed mouths. Settings must be child-safe. Widescreen 16:9 composition. ";
  const safePrompt = safetyPrefix + prompt;
  const label = `smj-${lessonId} scene ${sceneIndex}`;
  console.log(`Generating SMJ image with Gemini for ${label}`);
  const maxRetries = 3;
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(5e3 * Math.pow(2, attempt - 1), 3e4);
        console.log(`Retry ${attempt}/${maxRetries} for ${label}, waiting ${delay / 1e3}s...`);
        await new Promise((r) => setTimeout(r, delay));
      }
      const currentPrompt = attempt === 0 ? safePrompt : `Generate a wholesome children's storybook illustration, colorful 3D animated style, big-eyed characters, warm lighting, bright cheerful scene, family-friendly, widescreen 16:9, no text or writing, no depiction of Jesus or God as a person \u2014 use golden light rays instead. ${prompt.replace(/[^\w\s,.'"-]/g, " ").substring(0, 500)}`;
      const response = await client.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: currentPrompt,
        config: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      });
      const parts = response.candidates?.[0]?.content?.parts;
      if (!parts || parts.length === 0) {
        if (attempt < maxRetries - 1) continue;
        throw new Error("Gemini returned no content parts");
      }
      const imagePart = parts.find(
        (p) => p.inlineData?.mimeType?.startsWith("image/")
      );
      if (!imagePart?.inlineData?.data) {
        if (attempt < maxRetries - 1) continue;
        throw new Error("Gemini returned no image in response");
      }
      const filename = `smj-${lessonId}-scene${sceneIndex}.png`;
      const filePath = import_path.default.join(IMAGES_DIR, filename);
      const buffer = Buffer.from(imagePart.inlineData.data, "base64");
      import_fs.default.writeFileSync(filePath, buffer);
      console.log(`SMJ image saved: ${filePath} (${(buffer.length / 1024).toFixed(0)}KB)`);
      return `/generated/images/${filename}`;
    } catch (err) {
      lastError = err;
      if (err.status === 429 || err.message?.includes("safety")) {
        continue;
      }
      if (attempt >= maxRetries - 1) throw err;
    }
  }
  throw lastError;
}
async function processSMJLesson(uploadId, rawText) {
  const prog = smjUploadProgress.get(uploadId);
  const lessonId = `smj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    await db.insert(smjLessons).values({
      id: lessonId,
      status: "processing",
      progress: 0,
      currentStep: "Starting..."
    });
    prog.lessonId = lessonId;
    prog.progress = 5;
    prog.currentStep = "Extracting lesson metadata...";
    await db.update(smjLessons).set({ progress: 5, currentStep: prog.currentStep }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
    const metaResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You extract metadata from a "Show Me Jesus" preschool Bible curriculum lesson. Return valid JSON only.`
        },
        {
          role: "user",
          content: `Extract metadata from this lesson document:

${rawText.substring(0, 6e3)}

Return JSON:
{
  "lessonNumber": <number>,
  "title": "lesson title without 'Lesson X:' prefix",
  "scripture": "e.g. Genesis 3",
  "bibleTruth": "the Bible Truth doctrinal statement",
  "lessonFocus": "what the lesson teaches",
  "goalsForChildren": ["goal 1", "goal 2", ...],
  "bibleVerseReferences": ["Exodus 20:8", "John 15:14", ...]
}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1e3
    });
    const metadata = JSON.parse(metaResponse.choices[0]?.message?.content || "{}");
    prog.progress = 10;
    prog.currentStep = "Metadata extracted";
    await db.update(smjLessons).set({
      lessonNumber: metadata.lessonNumber || 0,
      title: metadata.title || "Untitled",
      scripture: metadata.scripture || "",
      bibleTruth: metadata.bibleTruth || "",
      lessonFocus: metadata.lessonFocus || "",
      goalsForChildren: metadata.goalsForChildren || [],
      progress: 10,
      currentStep: "Metadata extracted"
    }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
    prog.progress = 15;
    prog.currentStep = "Extracting Bible story...";
    await db.update(smjLessons).set({ progress: 15, currentStep: prog.currentStep }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
    const storyResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You extract the Bible Time narrative from a "Show Me Jesus" lesson. This is the continuous Bible story the teacher reads to children. It's usually in the "Bible Time" section, spanning multiple paragraphs. Return valid JSON only.`
        },
        {
          role: "user",
          content: `Extract the full Bible Time narrative from this lesson. This is the Bible story retelling written for preschoolers, NOT the welcome/bridge story. Include all paragraphs. Remove Teaching Aid references like "(Show TA 10, panel 1)" but keep the narrative text.

${rawText}

Return JSON:
{
  "bibleStoryNarrative": "the full Bible story text, all paragraphs combined"
}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 3e3
    });
    const storyData = JSON.parse(storyResponse.choices[0]?.message?.content || "{}");
    const bibleStoryNarrative = storyData.bibleStoryNarrative || "";
    prog.progress = 25;
    prog.currentStep = "Bible story extracted";
    prog.progress = 28;
    prog.currentStep = "Extracting structured content...";
    await db.update(smjLessons).set({ progress: 28, currentStep: prog.currentStep }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
    const structuredResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You extract structured content from a "Show Me Jesus" preschool Bible lesson. Return valid JSON only.`
        },
        {
          role: "user",
          content: `Extract the following from this lesson document:

${rawText}

Return JSON:
{
  "welcomeStory": "The opening bridge story from the Welcome section (e.g. the Brown Bear story). Full text.",
  "catechismPairs": [
    { "questionNumber": "Q 37", "question": "What effect did the sin of Adam have on you and all people?", "answer": "We are all born guilty and sinful." }
  ],
  "discussionQuestions": [
    { "question": "Who is a sinner?", "expectedAnswer": "Everyone is a sinner; we are all sinners and need a Savior." }
  ],
  "bibleVerses": [
    { "reference": "Genesis 3:15", "text": "Full ESV text of the verse" }
  ],
  "closingPrayer": "The full closing prayer text from the Final Focus section"
}

For bibleVerses: if the document only lists references without full text, provide the ESV text from your knowledge. Include all Bible Verse Review references from the lesson metadata.
The references from metadata are: ${(metadata.bibleVerseReferences || []).join(", ")}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2500
    });
    const structured = JSON.parse(structuredResponse.choices[0]?.message?.content || "{}");
    prog.progress = 35;
    prog.currentStep = "Structured content extracted";
    await db.update(smjLessons).set({
      welcomeStory: structured.welcomeStory || "",
      catechismPairs: structured.catechismPairs || [],
      discussionQuestions: structured.discussionQuestions || [],
      bibleVerses: structured.bibleVerses || [],
      closingPrayer: structured.closingPrayer || "",
      progress: 35,
      currentStep: "Structured content extracted"
    }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
    prog.progress = 40;
    prog.currentStep = "Breaking story into scenes...";
    await db.update(smjLessons).set({ progress: 40, currentStep: prog.currentStep }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
    const scenesResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You break a Bible story narrative into illustrated scenes for preschool children. Each scene should be a distinct moment in the story that can be illustrated. Return valid JSON only.`
        },
        {
          role: "user",
          content: `Break this Bible story into 4-6 illustrated scenes:

"${bibleStoryNarrative}"

For each scene, provide:
1. A short title
2. The narrative text (preschool-friendly, 2-4 sentences)
3. An image prompt for a children's book illustration

Image prompt rules:
- Describe the scene visually with specific details (setting, characters, actions, colors)
- NEVER describe God, Jesus, or the Holy Spirit as a person/figure \u2014 use warm golden light rays, glowing clouds, or radiant sunrise instead
- No text in the image
- Characters should have simple, expressive features
- Bright, warm colors

Return JSON:
{
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene title",
      "narrative": "The story text for this scene",
      "imagePrompt": "Detailed image description"
    }
  ]
}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 3e3
    });
    const scenesData = JSON.parse(scenesResponse.choices[0]?.message?.content || "{}");
    const scenes = (scenesData.scenes || []).map((s) => ({
      ...s,
      imageUrl: null
    }));
    prog.progress = 50;
    prog.currentStep = "Story broken into scenes";
    prog.progress = 52;
    prog.currentStep = "Generating illustrations...";
    await db.update(smjLessons).set({ progress: 52, currentStep: prog.currentStep }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
    for (let i = 0; i < scenes.length; i++) {
      try {
        prog.currentStep = `Generating illustration ${i + 1} of ${scenes.length}...`;
        prog.progress = 52 + Math.round(i / scenes.length * 18);
        await db.update(smjLessons).set({ progress: prog.progress, currentStep: prog.currentStep }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
        const imageUrl = await generateSMJImage(
          scenes[i].imagePrompt,
          lessonId,
          i
        );
        scenes[i].imageUrl = imageUrl;
        if (i < scenes.length - 1) {
          await new Promise((r) => setTimeout(r, 2e3));
        }
      } catch (err) {
        console.error(`Failed to generate SMJ image for scene ${i}:`, err.message);
        scenes[i].imageUrl = null;
      }
    }
    prog.progress = 70;
    prog.currentStep = "Illustrations generated";
    await db.update(smjLessons).set({
      bibleStoryScenes: scenes,
      progress: 70,
      currentStep: "Illustrations generated"
    }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
    prog.progress = 75;
    prog.currentStep = "Generating quiz questions...";
    await db.update(smjLessons).set({ progress: 75, currentStep: prog.currentStep }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
    const quizResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You create quiz questions for preschool/early elementary children about a Bible story. Questions must be answerable from the story text alone. Use simple language. Return valid JSON only.`
        },
        {
          role: "user",
          content: `Create 5 quiz questions about this Bible story for preschool children (ages 3-6):

"${bibleStoryNarrative}"

Each question should have 3 answer options (one correct, two wrong). Use simple Yes/No or short-answer format when possible.

Return JSON:
{
  "questions": [
    {
      "question": "Simple question text",
      "options": ["Option A", "Option B", "Option C"],
      "correctIndex": 0,
      "explanation": "That's right! Brief encouraging explanation."
    }
  ]
}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    });
    const quizData = JSON.parse(quizResponse.choices[0]?.message?.content || "{}");
    prog.progress = 85;
    prog.currentStep = "Quiz questions generated";
    await db.update(smjLessons).set({
      preGeneratedQuiz: quizData.questions || [],
      progress: 85,
      currentStep: "Quiz questions generated"
    }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
    prog.progress = 88;
    prog.currentStep = "Generating story sequence...";
    await db.update(smjLessons).set({ progress: 88, currentStep: prog.currentStep }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
    const seqResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You create story sequencing events for a preschool Bible story retelling game. Each event is a short, simple sentence describing a key moment in the story. Return valid JSON only.`
        },
        {
          role: "user",
          content: `Create 5-7 key events from this Bible story in chronological order. Each event should be one simple sentence that a preschooler can understand:

"${bibleStoryNarrative}"

Return JSON:
{
  "events": [
    { "order": 1, "event": "Short sentence describing what happened" }
  ]
}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800
    });
    const seqData = JSON.parse(seqResponse.choices[0]?.message?.content || "{}");
    prog.progress = 92;
    prog.currentStep = "Story sequence generated";
    prog.progress = 95;
    prog.currentStep = "Finalizing...";
    await db.update(smjLessons).set({
      storySequenceEvents: seqData.events || [],
      status: "ready",
      progress: 100,
      currentStep: "Complete"
    }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
    prog.progress = 100;
    prog.currentStep = "Complete";
    prog.status = "ready";
    console.log(`SMJ lesson processed successfully: ${lessonId}`);
  } catch (err) {
    console.error(`SMJ processing error for ${lessonId}:`, err);
    prog.status = "error";
    prog.error = err.message || "Processing failed";
    try {
      await db.update(smjLessons).set({
        status: "error",
        error: err.message || "Processing failed",
        currentStep: "Error"
      }).where((0, import_drizzle_orm.eq)(smjLessons.id, lessonId));
    } catch {
    }
  }
}
var import_multer, import_fs, import_path, import_openai, import_drizzle_orm, openai, upload, smjUploadProgress, IMAGES_DIR;
var init_smj_routes = __esm({
  "server/smj-routes.ts"() {
    "use strict";
    import_multer = __toESM(require("multer"), 1);
    import_fs = __toESM(require("fs"), 1);
    import_path = __toESM(require("path"), 1);
    import_openai = __toESM(require("openai"), 1);
    init_db();
    init_schema();
    import_drizzle_orm = require("drizzle-orm");
    openai = new Proxy({}, {
      get(_target, prop) {
        return getOpenAI()[prop];
      }
    });
    upload = (0, import_multer.default)({ dest: "uploads/" });
    smjUploadProgress = /* @__PURE__ */ new Map();
    IMAGES_DIR = import_path.default.resolve("generated", "images");
  }
});

// vite.config.ts
var import_vite, import_plugin_react, import_path3, import_url, import_meta, __dirname2, vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    import_vite = require("vite");
    import_plugin_react = __toESM(require("@vitejs/plugin-react"), 1);
    import_path3 = __toESM(require("path"), 1);
    import_url = require("url");
    import_meta = {};
    __dirname2 = import_path3.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
    vite_config_default = (0, import_vite.defineConfig)({
      plugins: [(0, import_plugin_react.default)()],
      resolve: {
        alias: {
          "@": import_path3.default.resolve(__dirname2, "client", "src"),
          "@shared": import_path3.default.resolve(__dirname2, "shared"),
          "@assets": import_path3.default.resolve(__dirname2, "attached_assets")
        }
      },
      root: import_path3.default.resolve(__dirname2, "client"),
      build: {
        outDir: import_path3.default.resolve(__dirname2, "dist", "public"),
        emptyOutDir: true
      },
      server: {
        proxy: {
          "/api": "http://localhost:5000"
        }
      }
    });
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  setupVite: () => setupVite
});
async function setupVite(server2, app2) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server: server2, path: "/vite-hmr" },
    allowedHosts: true
  };
  const vite = await (0, import_vite2.createServer)({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = import_path4.default.resolve(__dirname3, "..", "client", "index.html");
      let template = await import_fs3.default.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${(0, import_nanoid.nanoid)()}"`);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
var import_vite2, import_fs3, import_path4, import_url2, import_nanoid, import_meta2, __filename, __dirname3, viteLogger;
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
    import_vite2 = require("vite");
    init_vite_config();
    import_fs3 = __toESM(require("fs"), 1);
    import_path4 = __toESM(require("path"), 1);
    import_url2 = require("url");
    import_nanoid = require("nanoid");
    import_meta2 = {};
    __filename = (0, import_url2.fileURLToPath)(import_meta2.url);
    __dirname3 = import_path4.default.dirname(__filename);
    viteLogger = (0, import_vite2.createLogger)();
  }
});

// server/static.ts
var static_exports = {};
__export(static_exports, {
  serveStatic: () => serveStatic
});
function serveStatic(app2) {
  const distPath = import_path5.default.resolve(__dirname, "public");
  if (!import_fs4.default.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}`);
  }
  app2.use(import_express2.default.static(distPath));
  app2.use("/{*path}", (_req, res) => {
    res.sendFile(import_path5.default.resolve(distPath, "index.html"));
  });
}
var import_express2, import_fs4, import_path5;
var init_static = __esm({
  "server/static.ts"() {
    "use strict";
    import_express2 = __toESM(require("express"), 1);
    import_fs4 = __toESM(require("fs"), 1);
    import_path5 = __toESM(require("path"), 1);
  }
});

// server/index.ts
var import_express3 = __toESM(require("express"), 1);
var import_http = require("http");

// server/routes.ts
var import_multer2 = __toESM(require("multer"), 1);
var import_mammoth = __toESM(require("mammoth"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_openai2 = __toESM(require("openai"), 1);
var import_express = __toESM(require("express"), 1);

// shared/curriculum-data.ts
var WORSHIP_ELEMENTS = [
  {
    id: "call-to-worship",
    name: "Call to Worship",
    elementKey: "callToWorship",
    icon: "megaphone",
    color: "#3FD0A6",
    shortDescription: "God calls His people to gather and worship Him!",
    childFriendlyExplanation: "When we come to church, God invites us to worship Him. It is like getting a special invitation to talk to the King of everything! The Call to Worship tells us that God wants to be with us and hear our praises.",
    handMotion: "Cup hands around mouth like calling out",
    core: true,
    relatedUnits: [2]
  },
  {
    id: "prayer",
    name: "Prayer",
    elementKey: "prayer",
    icon: "hand-heart",
    color: "#F2C94C",
    shortDescription: "We talk to God through prayer!",
    childFriendlyExplanation: "Prayer is how we talk to God. We can thank Him, tell Him we are sorry, ask Him for help, and ask Him to help others. God always listens when we pray because He loves us so much!",
    handMotion: "Fold hands together in prayer",
    core: true,
    relatedUnits: [3]
  },
  {
    id: "praise",
    name: "Praise",
    elementKey: "praise",
    icon: "music",
    color: "#87CEEB",
    shortDescription: "We gather to praise God with all our being!",
    childFriendlyExplanation: "We sing songs to God because He is wonderful! When we praise God, we use our voices, our hands, and our whole bodies to tell God how awesome, strong, and loving He is. Singing together makes worship special.",
    handMotion: "Hands up, swaying gently",
    core: true,
    relatedUnits: [4]
  },
  {
    id: "reading-the-word",
    name: "Reading the Word",
    elementKey: "readingTheWord",
    icon: "book-open",
    color: "#FF7F7F",
    shortDescription: "God speaks to His people through His Word!",
    childFriendlyExplanation: "The Bible is God's Word. When it is read in church, God is speaking to us! We listen carefully because the Bible tells us about who God is, what He has done, and how much He loves us.",
    handMotion: "Cup hand to ear, then open hands like a book",
    core: true,
    relatedUnits: [5]
  },
  {
    id: "walking-in-the-word",
    name: "Walking in the Word",
    elementKey: "walkingInTheWord",
    icon: "footprints",
    color: "#A8D5BA",
    shortDescription: "God's Word teaches His people how to live!",
    childFriendlyExplanation: "Walking in the Word means we don't just hear God's Word \u2014 we do what it says! God teaches us how to live, how to love others, and how to follow Jesus every single day.",
    handMotion: "March feet in place",
    core: true,
    relatedUnits: [6]
  },
  {
    id: "confession-of-sin",
    name: "Confession of Sin",
    elementKey: "confessionOfSin",
    icon: "heart-crack",
    color: "#B8A9C9",
    shortDescription: "Because God loves us, we can confess our sins to Him.",
    childFriendlyExplanation: "Everyone makes mistakes and does things wrong sometimes. In confession, we tell God we are sorry for the wrong things we have done. God loves us so much that He always listens and forgives us.",
    handMotion: "Hand on heart, then open palms up",
    core: false,
    relatedUnits: [7]
  },
  {
    id: "assurance-of-pardon",
    name: "Assurance of Pardon",
    elementKey: "assuranceOfPardon",
    icon: "sun",
    color: "#FFDAB9",
    shortDescription: "We know we are forgiven because Jesus died for our sins!",
    childFriendlyExplanation: "After we say we are sorry, God tells us something wonderful: we are forgiven! Because Jesus died for us, our sins are washed away. It is like the sun coming out after a storm.",
    handMotion: "Arms spread wide with a big smile",
    core: false,
    relatedUnits: [8]
  },
  {
    id: "confession-of-faith",
    name: "Confession of Faith",
    elementKey: "confessionOfFaith",
    icon: "shield",
    color: "#E8B4B8",
    shortDescription: "We gather and affirm what we, as God's people, believe.",
    childFriendlyExplanation: "A confession of faith is when we all say together what we believe about God. It's like making a promise out loud that we trust in God the Father, Jesus His Son, and the Holy Spirit.",
    handMotion: "Hand on heart, standing tall",
    core: false,
    relatedUnits: [11]
  },
  {
    id: "sacraments",
    name: "Sacraments",
    elementKey: "sacraments",
    icon: "droplets",
    color: "#87CEEB",
    shortDescription: "God gives us signs to proclaim His love for us!",
    childFriendlyExplanation: "Baptism and the Lord's Supper are special gifts from God. Baptism uses water to show that God has made us part of His family. The Lord's Supper uses bread and juice to remind us of Jesus.",
    handMotion: "Cup hands together as if holding water",
    core: false,
    relatedUnits: [9]
  },
  {
    id: "tithes-and-offerings",
    name: "Tithes & Offerings",
    elementKey: "tithesAndOfferings",
    icon: "gift",
    color: "#C4A862",
    shortDescription: "Everything belongs to the Lord!",
    childFriendlyExplanation: "Everything we have comes from God. When we give our tithes and offerings, we are saying thank you to God and trusting Him to take care of us. We give because God gave us the best gift \u2014 Jesus!",
    handMotion: "Hold hands out offering something",
    core: false,
    relatedUnits: [10]
  },
  {
    id: "benediction",
    name: "Benediction",
    elementKey: "benediction",
    icon: "hand",
    color: "#F5C6D0",
    shortDescription: "God sends us with His blessing!",
    childFriendlyExplanation: "At the end of worship, the pastor speaks God's blessing over us. It is like God giving us a big hug and saying, 'Go and share my love with everyone you meet this week!'",
    handMotion: "Hands raised receiving, then pointing outward",
    core: false,
    relatedUnits: [12]
  }
];

// server/routes.ts
init_db();
init_schema();
var import_drizzle_orm2 = require("drizzle-orm");
function getOpenAI2() {
  return new import_openai2.default({ apiKey: process.env.OPENAI_API_KEY });
}
var openai2 = new Proxy({}, {
  get(_target, prop) {
    return getOpenAI2()[prop];
  }
});
var upload2 = (0, import_multer2.default)({ dest: "uploads/" });
var uploadProgress = /* @__PURE__ */ new Map();
var IMAGES_DIR2 = import_path2.default.resolve("generated", "images");
import_fs2.default.mkdirSync(IMAGES_DIR2, { recursive: true });
async function registerRoutes(server2, app2) {
  app2.use("/generated", import_express.default.static(import_path2.default.resolve("generated")));
  const { registerSMJRoutes: registerSMJRoutes2 } = await Promise.resolve().then(() => (init_smj_routes(), smj_routes_exports));
  registerSMJRoutes2(app2);
  app2.get("/api/sermons", async (_req, res) => {
    try {
      const rows = await db.select().from(sermons);
      const result = rows.map((s) => ({
        id: s.id,
        title: s.title,
        scripture: s.scripture,
        status: s.status,
        sceneCount: s.scenes?.length || 0,
        createdAt: s.createdAt
      }));
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch sermons", error: err.message });
    }
  });
  app2.get("/api/sermons/:id", async (req, res) => {
    try {
      const [sermon] = await db.select().from(sermons).where((0, import_drizzle_orm2.eq)(sermons.id, req.params.id));
      if (!sermon) return res.status(404).json({ message: "Sermon not found" });
      res.json(sermon);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch sermon", error: err.message });
    }
  });
  app2.delete("/api/sermons/:id", async (req, res) => {
    try {
      const sermonId = req.params.id;
      const [sermon] = await db.select().from(sermons).where((0, import_drizzle_orm2.eq)(sermons.id, sermonId));
      if (!sermon) return res.status(404).json({ message: "Sermon not found" });
      await db.delete(sermons).where((0, import_drizzle_orm2.eq)(sermons.id, sermonId));
      const imagesDir = import_path2.default.resolve("generated", "images");
      if (import_fs2.default.existsSync(imagesDir)) {
        const files = import_fs2.default.readdirSync(imagesDir);
        for (const file of files) {
          if (file.startsWith(sermonId)) {
            import_fs2.default.unlinkSync(import_path2.default.join(imagesDir, file));
          }
        }
      }
      console.log(`Sermon deleted: ${sermonId}`);
      res.json({ message: "Sermon deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete sermon", error: err.message });
    }
  });
  app2.get("/api/sermons/:id/scenes/:sceneIndex", async (req, res) => {
    try {
      const [sermon] = await db.select().from(sermons).where((0, import_drizzle_orm2.eq)(sermons.id, req.params.id));
      if (!sermon) return res.status(404).json({ message: "Sermon not found" });
      const scene = sermon.scenes?.[parseInt(req.params.sceneIndex)];
      if (!scene) return res.status(404).json({ message: "Scene not found" });
      res.json(scene);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch scene", error: err.message });
    }
  });
  app2.post("/api/upload", upload2.single("sermon"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const sermonId = `sermon-${Date.now()}`;
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    try {
      let text2 = "";
      if (fileName.endsWith(".docx")) {
        const result = await import_mammoth.default.extractRawText({ path: filePath });
        text2 = result.value;
      } else if (fileName.endsWith(".pdf")) {
        const pdfParse = (await import("pdf-parse")).default;
        const dataBuffer = import_fs2.default.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        text2 = pdfData.text;
      } else if (fileName.endsWith(".txt")) {
        text2 = import_fs2.default.readFileSync(filePath, "utf-8");
      } else {
        return res.status(400).json({ message: "Unsupported file type. Use .docx, .pdf, or .txt" });
      }
      await db.insert(sermons).values({
        id: sermonId,
        title: "Processing...",
        scripture: "",
        status: "processing",
        rawText: text2,
        scenes: []
      });
      res.json({ sermonId, status: "processing", message: "Sermon uploaded. Processing started." });
      processSermon(sermonId, text2).catch(async (err) => {
        console.error("Pipeline error:", err);
        await db.update(sermons).set({ status: "error", error: err.message }).where((0, import_drizzle_orm2.eq)(sermons.id, sermonId));
      });
    } catch (err) {
      res.status(500).json({ message: "Upload failed", error: err.message });
    } finally {
      import_fs2.default.unlink(filePath, () => {
      });
    }
  });
  app2.get("/api/sermons/:id/status", async (req, res) => {
    try {
      const [sermon] = await db.select().from(sermons).where((0, import_drizzle_orm2.eq)(sermons.id, req.params.id));
      if (!sermon) return res.status(404).json({ message: "Sermon not found" });
      res.json({
        status: sermon.status,
        progress: sermon.progress || 0,
        currentStep: sermon.currentStep || "",
        sceneCount: sermon.scenes?.length || 0
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch status", error: err.message });
    }
  });
  app2.post("/api/tts", async (req, res) => {
    try {
      const { text: text2, voice } = req.body;
      const mp3 = await openai2.audio.speech.create({
        model: "tts-1",
        voice: voice || "nova",
        input: text2,
        speed: 0.9
      });
      const buffer = Buffer.from(await mp3.arrayBuffer());
      res.set({ "Content-Type": "audio/mpeg", "Content-Length": buffer.length.toString() });
      res.send(buffer);
    } catch (err) {
      res.status(500).json({ message: "TTS failed", error: err.message });
    }
  });
  app2.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, sceneIndex, sermonId } = req.body;
      const imageUrl = await generateImage(prompt, sermonId, sceneIndex);
      if (sermonId && sceneIndex !== void 0) {
        const [sermon] = await db.select().from(sermons).where((0, import_drizzle_orm2.eq)(sermons.id, sermonId));
        if (sermon) {
          const scenes = sermon.scenes || [];
          if (scenes[sceneIndex]) {
            scenes[sceneIndex].imageUrl = imageUrl;
            await db.update(sermons).set({ scenes }).where((0, import_drizzle_orm2.eq)(sermons.id, sermonId));
          }
        }
      }
      res.json({ imageUrl });
    } catch (err) {
      res.status(500).json({ message: "Image generation failed", error: err.message });
    }
  });
  app2.post("/api/generate-quiz", async (req, res) => {
    try {
      const { sceneContent, ageGroup } = req.body;
      const questions = await generateQuiz(sceneContent, ageGroup);
      res.json({ questions });
    } catch (err) {
      res.status(500).json({ message: "Quiz generation failed", error: err.message });
    }
  });
  app2.get("/api/worship/elements", (_req, res) => {
    res.json(WORSHIP_ELEMENTS);
  });
  app2.get("/api/worship/units", async (_req, res) => {
    try {
      const units = await db.select().from(worshipUnits);
      const result = [];
      for (const unit of units) {
        const lessons = await db.select().from(worshipLessons).where((0, import_drizzle_orm2.eq)(worshipLessons.unitId, unit.id));
        result.push({
          id: unit.id,
          number: unit.number,
          title: unit.title,
          worshipElement: unit.worshipElement,
          lessonsCount: lessons.length
        });
      }
      result.sort((a, b) => a.number - b.number);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch units", error: err.message });
    }
  });
  app2.get("/api/worship/units/:id", async (req, res) => {
    try {
      const unitId = parseInt(req.params.id);
      const [unit] = await db.select().from(worshipUnits).where((0, import_drizzle_orm2.eq)(worshipUnits.id, unitId));
      if (!unit) return res.status(404).json({ message: "Unit not found. Upload curriculum to get started." });
      const lessons = await db.select().from(worshipLessons).where((0, import_drizzle_orm2.eq)(worshipLessons.unitId, unitId));
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
          lessonSections: l.lessonSections,
          sidebarMeta: l.sidebarMeta,
          preparation: l.preparation,
          bibleBackground: l.bibleBackground,
          elementSections: l.elementSections,
          elementSidebarMeta: l.elementSidebarMeta
        }))
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch unit", error: err.message });
    }
  });
  app2.get("/api/worship/lessons/:id", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const [lesson] = await db.select().from(worshipLessons).where((0, import_drizzle_orm2.eq)(worshipLessons.id, lessonId));
      if (!lesson) return res.status(404).json({ message: "Lesson not found" });
      res.json(lesson);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch lesson", error: err.message });
    }
  });
  async function findLesson(lessonId) {
    const [lesson] = await db.select().from(worshipLessons).where((0, import_drizzle_orm2.eq)(worshipLessons.id, lessonId));
    return lesson || null;
  }
  app2.post("/api/worship/ai/generate-quiz", async (req, res) => {
    try {
      const { lessonId, difficulty } = req.body;
      const lessonIdNum = parseInt(lessonId);
      const lesson = await findLesson(lessonIdNum);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      const quiz = lesson.preGeneratedQuiz;
      if (quiz && quiz.length > 0) {
        return res.json({ questions: quiz });
      }
      const content = `
Lesson: ${lesson.title}
Main Idea: ${lesson.mainIdea}
Memory Verse: ${lesson.memoryVerse} (${lesson.memoryVerseReference})
Prayer Focus: ${lesson.prayerFocus}
Worship Sign: ${lesson.worshipSign || "No sign for this lesson"}
${lesson.callAndResponse ? `Call and Response - Leader: "${lesson.callAndResponse.leader}" Response: "${lesson.callAndResponse.response}"` : ""}
${lesson.activities && lesson.activities.length > 0 ? `Activities: ${lesson.activities.join(", ")}` : ""}
${lesson.songSuggestions && lesson.songSuggestions.length > 0 ? `Suggested Songs: ${lesson.songSuggestions.join(", ")}` : ""}
      `.trim();
      const questions = await generateWorshipQuiz(content, difficulty || "medium");
      res.json({ questions });
    } catch (err) {
      res.status(500).json({ message: "Quiz generation failed", error: err.message });
    }
  });
  app2.post("/api/worship/ai/teacher-assistant", async (req, res) => {
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
    } catch (err) {
      res.status(500).json({ message: "Teacher assistant generation failed", error: err.message });
    }
  });
  app2.post("/api/worship/ai/generate-story", async (req, res) => {
    try {
      const { elementId } = req.body;
      const element = WORSHIP_ELEMENTS.find((e) => e.id === elementId);
      if (!element) {
        return res.status(404).json({ message: "Worship element not found" });
      }
      const story = await generateWorshipStory(element);
      res.json({ story });
    } catch (err) {
      res.status(500).json({ message: "Story generation failed", error: err.message });
    }
  });
  app2.post("/api/worship/ai/parent-guide", async (req, res) => {
    try {
      const { lessonId } = req.body;
      const lessonIdNum = parseInt(lessonId);
      const lesson = await findLesson(lessonIdNum);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      const guide = await generateParentGuide(lesson);
      res.json(guide);
    } catch (err) {
      res.status(500).json({ message: "Parent guide generation failed", error: err.message });
    }
  });
  app2.post("/api/worship/upload", upload2.single("document"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const uploadId = `worship-${Date.now()}`;
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    try {
      let text2 = "";
      if (fileName.endsWith(".docx")) {
        const result = await import_mammoth.default.extractRawText({ path: filePath });
        text2 = result.value;
      } else if (fileName.endsWith(".pdf")) {
        const pdfParse = (await import("pdf-parse")).default;
        const dataBuffer = import_fs2.default.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        text2 = pdfData.text;
      } else if (fileName.endsWith(".txt")) {
        text2 = import_fs2.default.readFileSync(filePath, "utf-8");
      } else {
        return res.status(400).json({ message: "Unsupported file type. Use .docx, .pdf, or .txt" });
      }
      uploadProgress.set(uploadId, {
        status: "processing",
        progress: 0,
        currentStep: "Starting...",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json({ uploadId, status: "processing", message: "Document uploaded. Processing started." });
      processWorshipCurriculum(uploadId, text2).catch((err) => {
        console.error("Worship processing error:", err);
        const progress = uploadProgress.get(uploadId);
        if (progress) {
          progress.status = "error";
          progress.error = err.message;
        }
      });
    } catch (err) {
      res.status(500).json({ message: "Upload failed", error: err.message });
    } finally {
      import_fs2.default.unlink(filePath, () => {
      });
    }
  });
  app2.get("/api/worship/upload/:uploadId/status", (req, res) => {
    const progress = uploadProgress.get(req.params.uploadId);
    if (!progress) {
      return res.status(404).json({ message: "Upload not found" });
    }
    res.json(progress);
  });
  app2.delete("/api/worship/units/:id", async (req, res) => {
    try {
      const unitId = parseInt(req.params.id);
      const [unit] = await db.select().from(worshipUnits).where((0, import_drizzle_orm2.eq)(worshipUnits.id, unitId));
      if (!unit) return res.status(404).json({ message: "Unit not found" });
      await db.delete(worshipUnits).where((0, import_drizzle_orm2.eq)(worshipUnits.id, unitId));
      console.log(`Worship unit deleted: ${unitId}`);
      res.json({ message: "Unit deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete unit", error: err.message });
    }
  });
}
async function processSermon(sermonId, text2) {
  const updateSermon = async (data) => {
    await db.update(sermons).set(data).where((0, import_drizzle_orm2.eq)(sermons.id, sermonId));
  };
  await updateSermon({ currentStep: "Analyzing sermon structure...", progress: 10 });
  const analysis = await analyzeSermon(text2);
  await updateSermon({
    title: analysis.title,
    scripture: analysis.scripture,
    summary: analysis.summary,
    keyThemes: analysis.keyThemes
  });
  await updateSermon({ currentStep: "Breaking sermon into scenes...", progress: 20 });
  const scenes = await generateScenes(text2, analysis);
  await updateSermon({ scenes });
  await updateSermon({ currentStep: "Writing age-appropriate narratives...", progress: 35 });
  for (let i = 0; i < scenes.length; i++) {
    await updateSermon({ currentStep: `Writing narratives for scene ${i + 1}/${scenes.length}...`, progress: Math.round(35 + i / scenes.length * 15) });
    const narratives = await generateNarratives(scenes[i], i, scenes.length);
    scenes[i].narratives = narratives;
  }
  await updateSermon({ scenes });
  await updateSermon({ currentStep: "Generating illustrations...", progress: 50 });
  for (let i = 0; i < scenes.length; i++) {
    await updateSermon({ currentStep: `Illustrating scene ${i + 1}/${scenes.length}...`, progress: Math.round(50 + i / scenes.length * 25) });
    try {
      const imageUrl = await generateImage(scenes[i].imagePrompt, sermonId, i);
      scenes[i].imageUrl = imageUrl;
    } catch (err) {
      console.error(`Image gen failed for scene ${i}:`, err);
      scenes[i].imageUrl = null;
    }
    if (i < scenes.length - 1) {
      await new Promise((r) => setTimeout(r, 2e3));
    }
  }
  await updateSermon({ scenes });
  await updateSermon({ currentStep: "Creating quizzes and discussion prompts...", progress: 80 });
  for (let i = 0; i < scenes.length; i++) {
    const narrativeText = scenes[i].narratives ? `Young version: ${scenes[i].narratives.young}

Older version: ${scenes[i].narratives.older}

Family version: ${scenes[i].narratives.family}` : scenes[i].content;
    const quiz = await generateQuiz(narrativeText, "mixed");
    scenes[i].quiz = quiz;
    const discussion = await generateDiscussionPrompts(scenes[i]);
    scenes[i].discussionPrompts = discussion;
  }
  await updateSermon({
    scenes,
    currentStep: "Complete",
    progress: 100,
    status: "ready"
  });
}
async function analyzeSermon(text2) {
  const response = await openai2.chat.completions.create({
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
}`
      },
      { role: "user", content: text2.substring(0, 8e3) }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3
  });
  return JSON.parse(response.choices[0].message.content || "{}");
}
async function generateScenes(text2, analysis) {
  const response = await openai2.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a creative director turning a sermon into a cohesive illustrated storybook that reads as ONE CONTINUOUS STORY from beginning to end. Break the sermon into 8-10 visual scenes.

RULE 1 \u2014 SERMON ORDER (MOST IMPORTANT):
- Scenes MUST follow the sermon's actual sequence from beginning to end. Scene 1 covers the opening, scene 2 what comes next, and so on through to the conclusion.
- Do NOT rearrange, regroup, or reorder the sermon's content. Follow the exact order the pastor delivered it.

RULE 2 \u2014 CONTINUOUS NARRATIVE FLOW:
- The storybook must read as one flowing story, NOT as disconnected snapshots. Each scene should build on the previous one.
- Scene content should use transitional language that connects to what came before: "As we continue...", "Next, we learn...", "Building on that idea...", "The story then takes us to...", etc.
- NEVER restart or re-introduce the topic as if starting over. If scene 3 covered a concept, scene 4 should move FORWARD, not circle back.
- Each scene must advance the story. The reader should feel momentum carrying them through the sermon.

RULE 3 \u2014 NO DUPLICATE OR REPETITIVE SCENES:
- Every scene must cover DISTINCT content from the sermon. No two scenes should teach the same concept, lesson, or idea.
- If the pastor repeated a theme for emphasis, consolidate it into ONE scene. Do not create separate scenes for variations of the same point.
- Before finalizing, review all scenes together and merge or replace any that overlap significantly.

RULE 4 \u2014 IMAGE PROMPT RULES:

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

RULE 5 \u2014 CONTENT FIELD:
- content: The core teaching content (2-3 paragraphs). This is the RAW source material that will be rewritten into age-appropriate narratives. It should contain the key facts, names, places, actions, and lessons from this portion of the sermon. Include specific details that quiz questions can be built from.
- Write the content in plain, clear language. Avoid theological jargon. If a theological concept appears (e.g., tithing, Pharisee, repentance), include a brief parenthetical explanation: "the Pharisees (the religious leaders who followed every rule very carefully)".
- Each scene's content must use transitional language connecting to the previous scene. NEVER restart or re-introduce the topic as if starting over.

RULE 6 \u2014 REAL-WORLD ILLUSTRATIONS:
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

Respond with JSON: { "scenes": [...] }`
      },
      {
        role: "user",
        content: `Sermon title: ${analysis.title}
Scripture: ${analysis.scripture}
Themes: ${analysis.keyThemes?.join(", ")}

Full sermon text:
${text2.substring(0, 12e3)}`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 16384
  });
  const raw = response.choices[0].message.content || '{"scenes":[]}';
  if (response.choices[0].finish_reason === "length") {
    console.warn("Scene generation response was truncated, retrying with fewer scenes...");
    const retryResponse = await openai2.chat.completions.create({
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

Respond with JSON: { "scenes": [...] }`
        },
        {
          role: "user",
          content: `Sermon title: ${analysis.title}
Scripture: ${analysis.scripture}
Themes: ${analysis.keyThemes?.join(", ")}

Full sermon text:
${text2.substring(0, 8e3)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 16384
    });
    const retryRaw = retryResponse.choices[0].message.content || '{"scenes":[]}';
    const retryParsed = JSON.parse(retryRaw);
    return retryParsed.scenes || [];
  }
  const parsed = JSON.parse(raw);
  return parsed.scenes || [];
}
async function generateNarratives(scene, sceneIndex = 0, totalScenes = 1) {
  const response = await openai2.chat.completions.create({
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

Respond with JSON: { "young": "...", "older": "...", "family": "..." }`
      },
      {
        role: "user",
        content: `Scene ${sceneIndex + 1} of ${totalScenes}: ${scene.title}
${sceneIndex === 0 ? "(This is the OPENING scene \u2014 introduce the story.)" : `(This is scene ${sceneIndex + 1} \u2014 continue the story from the previous scene. Do NOT re-introduce or start over.)`}
Key Point: ${scene.keyPoint}
Content: ${scene.content}
Scripture: ${scene.scriptureRef || "none"}`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7
  });
  return JSON.parse(response.choices[0].message.content || "{}");
}
async function generateImage(prompt, sermonId, sceneIndex) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required for image generation");
  const { GoogleGenAI } = await import("@google/genai");
  const client = new GoogleGenAI({ apiKey });
  const safetyPrefix = "Generate a bright, cheerful children's storybook illustration for ages 4-12. Colorful 3D animated style with expressive big-eyed characters and soft global lighting, like a modern family animated feature film. The scene must be entirely wholesome and family-friendly. CRITICAL RULES: Do not depict Jesus, God, or any divine figure as a person or character in any way \u2014 no silhouettes, no figures, no human forms, not from behind, not obscured. Represent divine presence ONLY through warm golden light rays, glowing clouds, or gentle radiant sunrise. Do not include any text, words, letters, numbers, or writing of any kind anywhere in the image. Characters must have closed mouths. Settings must be child-safe. Widescreen 16:9 composition. ";
  const safePrompt = safetyPrefix + prompt;
  const label = `${sermonId || "on-demand"} scene ${sceneIndex ?? "?"}`;
  console.log(`Generating image with Gemini native for ${label}`);
  const maxRetries = 3;
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(5e3 * Math.pow(2, attempt - 1), 3e4);
        console.log(`Retry ${attempt}/${maxRetries} for ${label}, waiting ${delay / 1e3}s...`);
        await new Promise((r) => setTimeout(r, delay));
      }
      const currentPrompt = attempt === 0 ? safePrompt : `Generate a wholesome children's storybook illustration, colorful 3D animated style, big-eyed characters, warm lighting, bright cheerful scene, family-friendly, widescreen 16:9, no text or writing, no depiction of Jesus or God as a person \u2014 use golden light rays instead. ${prompt.replace(/[^\w\s,.'"-]/g, " ").substring(0, 500)}`;
      const response = await client.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: currentPrompt,
        config: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      });
      const parts = response.candidates?.[0]?.content?.parts;
      if (!parts || parts.length === 0) {
        if (attempt < maxRetries - 1) {
          console.warn(`Gemini returned no parts for ${label}, will retry with simplified prompt`);
          continue;
        }
        throw new Error("Gemini returned no content parts");
      }
      const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));
      if (!imagePart?.inlineData?.data) {
        if (attempt < maxRetries - 1) {
          console.warn(`Gemini returned no image data for ${label}, will retry with simplified prompt`);
          continue;
        }
        throw new Error("Gemini returned no image in response");
      }
      const filename = sermonId && sceneIndex !== void 0 ? `${sermonId}-scene${sceneIndex}.png` : `image-${Date.now()}.png`;
      const filePath = import_path2.default.join(IMAGES_DIR2, filename);
      const buffer = Buffer.from(imagePart.inlineData.data, "base64");
      import_fs2.default.writeFileSync(filePath, buffer);
      console.log(`Image saved: ${filePath} (${(buffer.length / 1024).toFixed(0)}KB)`);
      return `/generated/images/${filename}`;
    } catch (err) {
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
async function generateQuiz(content, ageGroup) {
  const response = await openai2.chat.completions.create({
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

Create 2 questions for each age group (6 total).`
      },
      { role: "user", content }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7
  });
  return JSON.parse(response.choices[0].message.content || '{"questions":[]}');
}
async function generateDiscussionPrompts(scene) {
  const response = await openai2.chat.completions.create({
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

Create 2-3 prompts per scene.`
      },
      {
        role: "user",
        content: `Scene: ${scene.title}
Key Point: ${scene.keyPoint}
Content: ${scene.content}`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.8
  });
  return JSON.parse(response.choices[0].message.content || '{"prompts":[]}');
}
async function generateWorshipQuiz(lessonContent, difficulty) {
  const difficultyGuide = difficulty === "easy" ? "For ages 4-6: simple yes/no questions" : difficulty === "hard" ? "For ages 9-12: more complex questions requiring deeper thinking" : "For ages 7-9: moderate difficulty with multiple choice";
  const response = await openai2.chat.completions.create({
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

Create 3-4 questions.`
      },
      { role: "user", content: lessonContent }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7
  });
  return JSON.parse(response.choices[0].message.content || '{"questions":[]}');
}
async function generateTeacherDiscussionQuestions(lessonContext) {
  const response = await openai2.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an experienced children's ministry teacher helping other teachers prepare engaging discussion questions for ages 4-6. Generate discussion questions that:
- Are open-ended but simple enough for young children
- Connect the worship concept to their daily lives
- Encourage participation from shy children
- Include suggested follow-up prompts

Respond with a JSON object: {"questions": [{"question": "...", "followUp": "...", "connection": "..."}]}`
      },
      { role: "user", content: lessonContext }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7
  });
  return JSON.parse(response.choices[0].message.content || '{"questions":[]}');
}
async function generateTeacherIllustrations(lessonContext) {
  const response = await openai2.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an experienced children's ministry teacher helping other teachers create engaging illustrations and object lessons for ages 4-6. Generate creative illustration ideas that:
- Use simple, everyday objects children recognize
- Make abstract worship concepts concrete and visible
- Are safe and easy to set up in a classroom
- Create memorable moments that reinforce the lesson

Respond with a JSON object: {"illustrations": [{"title": "...", "materials": ["..."], "description": "...", "connection": "..."}]}`
      },
      { role: "user", content: lessonContext }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7
  });
  return JSON.parse(response.choices[0].message.content || '{"illustrations":[]}');
}
async function generateTeacherActivities(lessonContext) {
  const response = await openai2.chat.completions.create({
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

Respond with a JSON object: {"activities": [{"title": "...", "type": "...", "duration": "...", "materials": ["..."], "instructions": "...", "worshipConnection": "..."}]}`
      },
      { role: "user", content: lessonContext }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7
  });
  return JSON.parse(response.choices[0].message.content || '{"activities":[]}');
}
async function generateWorshipStory(element) {
  const response = await openai2.chat.completions.create({
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

Write the story as natural narrative prose, not Q&A or lesson plan format.`
      },
      {
        role: "user",
        content: `Create a story about "${element.name}": ${element.childFriendlyExplanation}`
      }
    ],
    temperature: 0.8
  });
  return response.choices[0].message.content || "";
}
async function generateParentGuide(lesson) {
  const worshipElements = [];
  if (lesson.elementSections) {
    const elementNames = {
      callToWorship: "Call to Worship",
      prayer: "Prayer",
      praise: "Praise",
      readingTheWord: "Reading the Word",
      walkingInTheWord: "Walking in the Word",
      confessionOfSin: "Confession of Sin",
      assuranceOfPardon: "Assurance of Pardon",
      confessionOfFaith: "Confession of Faith",
      sacraments: "Sacraments",
      tithesAndOfferings: "Tithes & Offerings",
      benediction: "Benediction"
    };
    for (const [key, section] of Object.entries(lesson.elementSections)) {
      if (section && (section.content || section.teacherScript)) {
        worshipElements.push(elementNames[key] || key);
      }
    }
  }
  const response = await openai2.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a Sunday school curriculum writer creating an at-home guide for parents. The curriculum teaches children about the elements of corporate worship (Call to Worship, Prayer, Praise, Reading the Word, etc.).

Based on the lesson content, create a family activity guide that:
- Summarizes what the child learned in 2-3 simple sentences, mentioning the specific worship elements covered
- Provides 2-3 ways to practice the memory verse at home
- Lists 3 concrete family activities (5-15 min each) with materials and instructions, connecting them to the worship elements the child learned
- Gives 3-4 dinner table discussion starters about worship and the Bible story
- Includes a prayer focus with example words the parent can say

Respond with JSON:
{
  "summary": "...",
  "memoryVersePractice": ["tip1", "tip2"],
  "activities": [{"title": "...", "duration": "...", "materials": ["..."], "instructions": "..."}],
  "discussionStarters": ["..."],
  "prayerFocus": "..."
}`
      },
      {
        role: "user",
        content: `
Lesson: ${lesson.title}
Main Idea: ${lesson.mainIdea}
Memory Verse: "${lesson.memoryVerse}" (${lesson.memoryVerseReference})
Prayer Focus: ${lesson.prayerFocus}
${lesson.worshipSign ? `Worship Sign: ${lesson.worshipSign}` : ""}
${worshipElements.length > 0 ? `Worship Elements Covered: ${worshipElements.join(", ")}` : ""}
${lesson.songSuggestions && lesson.songSuggestions.length > 0 ? `Suggested Songs: ${lesson.songSuggestions.join(", ")}` : ""}
      `.trim()
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7
  });
  return JSON.parse(response.choices[0].message.content || '{"summary":"","memoryVersePractice":[],"activities":[],"discussionStarters":[],"prayerFocus":""}');
}
async function processWorshipCurriculum(uploadId, text2) {
  const progress = uploadProgress.get(uploadId);
  const updateUploadProgress = (step, pct) => {
    progress.currentStep = step;
    progress.progress = pct;
    console.log(`[${uploadId}] ${step} (${pct}%)`);
  };
  updateUploadProgress("Analyzing document structure...", 10);
  const structureResponse = await openai2.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are analyzing a children's worship curriculum document from "Exploring the Elements of Worship" by Teach Us to Worship / PCA CDM.

This curriculum is organized by units, each focused on a specific element of corporate worship. The 11 elements are: Call to Worship, Prayer, Praise, Reading the Word, Walking in the Word, Confession of Sin, Assurance of Pardon, Confession of Faith, Sacraments, Tithes & Offerings, Benediction. Unit 1 ("We Gather to Worship") is introductory.

Each unit has 4 lessons and an "Element of Worship Spotlight" \u2014 an introductory dialogue/script that teaches children about the unit's focus element (e.g., explaining what "Call to Worship" means, with hand motions and interactive dialogue).

Extract:
- unitTitle: The unit title (e.g., "Call to Worship" or "We Gather to Worship")
- worshipElement: Which element of worship this unit covers (must be one of the 11 listed above, or "We Gather to Worship" for intro unit)
- unitDescription: A 1-2 sentence description of what this unit teaches
- lessonCount: How many individual lessons are in this document
- lessonTitles: Array of lesson titles found
- elementSpotlight: The full "Element of Worship Spotlight" teacher dialogue/script that introduces the element to children. Include all teacher words and instructions. If not found, use empty string.

Respond with JSON:
{
  "unitTitle": "...",
  "worshipElement": "...",
  "unitDescription": "...",
  "lessonCount": 4,
  "lessonTitles": ["..."],
  "elementSpotlight": "..."
}`
      },
      { role: "user", content: text2.substring(0, 12e3) }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3
  });
  const structure = JSON.parse(structureResponse.choices[0].message.content || "{}");
  updateUploadProgress("Extracting lesson content...", 30);
  const lessonsResponse = await openai2.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are parsing a children's worship curriculum document from "Exploring the Elements of Worship" by Teach Us to Worship / PCA CDM. Extract ALL lesson data with maximum detail.

This curriculum organizes each lesson around the ELEMENTS OF CORPORATE WORSHIP. Each lesson incorporates multiple worship elements (Call to Worship, Prayer, Praise, Reading the Word, Walking in the Word, Confession of Sin, Assurance of Pardon, Confession of Faith, Sacraments, Tithes & Offerings, Benediction/Closing). Not every element appears in every lesson. Each element section has its own page or section in the document.

For each lesson found, extract:

BASIC FIELDS:
- title: The lesson title (e.g., "God Is the Creator")
- mainIdea: The main teaching point or Bible truth (1-2 sentences)
- memoryVerse: The exact memory verse text
- memoryVerseReference: The Bible verse reference (e.g., "Genesis 1:1")
- worshipSign: Any worship sign, hand motion, or physical gesture described for this lesson or the unit's element
- callAndResponse: If leader/response liturgical elements exist, extract as {leader: "...", response: "..."}. If none, use null.
- activities: Array of all activities found across the lesson (crafts, games, discussion, etc.)
- prayerFocus: The prayer focus, closing prayer, or prayer content
- songSuggestions: Any song titles mentioned (array of strings). If none, use null.

SIDEBAR / LESSON METADATA:
- elementSidebarMeta: {
    "scripture": The main scripture reference (e.g., "Genesis 1"),
    "scriptureText": The actual Bible passage text if included,
    "lessonFocus": The lesson focus or main idea statement,
    "goalsForChildren": What children should learn/take away from this lesson,
    "memoryVerse": The memory verse text,
    "memoryVerseReference": The scripture reference for the memory verse,
    "worshipSign": Description of the worship sign or hand motion,
    "bibleTruth": The key Bible truth or doctrine being taught
  }

PREPARATION & BACKGROUND:
- preparation: Teacher preparation instructions \u2014 what to gather, set up, print, or read ahead of time
- bibleBackground: Bible background or context explaining the passage for the teacher's understanding

WORSHIP ELEMENT SECTIONS \u2014 Extract each element of worship that appears in this lesson:
- elementSections: {
    "callToWorship": Content for the Call to Worship element \u2014 how the lesson opens with God calling His people. Include any scripted dialogue (teacher words bold, instructions not), responsive reading, or opening activity.
    "prayer": Content for the Prayer element \u2014 prayers during the lesson, prayer activities, guided prayer, or prayer focus.
    "praise": Content for the Praise element \u2014 songs to sing, singing activities, hymns, hand motions during songs, how music connects to the lesson.
    "readingTheWord": Content for the Reading the Word element \u2014 the Bible story, scripture reading, dramatic retelling, or scripture engagement activity.
    "walkingInTheWord": Content for the Walking in the Word element \u2014 application of the Bible story, discussion questions, life application, crafts or activities that reinforce the lesson.
    "confessionOfSin": Content for the Confession of Sin element \u2014 teaching about sin, confession activities, guided confession. If not in this lesson, use null.
    "assuranceOfPardon": Content for the Assurance of Pardon element \u2014 teaching about forgiveness, assurance activities. If not in this lesson, use null.
    "confessionOfFaith": Content for the Confession of Faith element \u2014 creed, affirmation of belief, or faith statement activity. If not in this lesson, use null.
    "sacraments": Content for the Sacraments element \u2014 teaching about baptism or Lord's Supper. If not in this lesson, use null.
    "tithesAndOfferings": Content for the Tithes & Offerings element \u2014 teaching about giving, offering activity. If not in this lesson, use null.
    "benediction": Content for the Benediction/Closing element \u2014 closing blessing, dismissal, transition back to corporate worship. If not in this lesson, use null.
  }

Each element section should be structured as:
{
  "title": "Element name as written in the document (e.g., 'Call to Worship', 'Reading the Word')",
  "content": "The main narrative/descriptive content \u2014 include the full teacher script with bold teacher words and non-bold instructions preserved",
  "instructions": ["Step 1...", "Step 2...", ...] (specific teacher instructions),
  "materials": ["item1", "item2", ...] (if any materials are listed for this element),
  "teacherScript": "The scripted teacher dialogue if present \u2014 bold text is what the teacher says aloud, non-bold text is stage directions/instructions"
}

If a worship element section is not found in the lesson, set it to null.

IMPORTANT:
- Extract ALL fields thoroughly. Never skip or force-null a field that has content in the document.
- The curriculum uses BOLD text for teacher's spoken words and regular text for instructions \u2014 preserve this distinction in teacherScript.
- Some element pages are shared across all lessons in the unit (printed once, used four times). If an element page has content for multiple lessons, extract the relevant content for each lesson.
- Core elements (Call to Worship, Prayer, Praise, Reading the Word, Walking in the Word, Closing) appear in most lessons. Additional elements (Confession of Sin, Assurance of Pardon, etc.) may only appear in some.

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
      "songSuggestions": ["..."] or null,
      "elementSidebarMeta": { "scripture": "...", "scriptureText": "...", "lessonFocus": "...", "goalsForChildren": "...", "memoryVerse": "...", "memoryVerseReference": "...", "worshipSign": "...", "bibleTruth": "..." },
      "preparation": "...",
      "bibleBackground": "...",
      "elementSections": {
        "callToWorship": { "title": "...", "content": "...", "instructions": ["..."], "teacherScript": "..." } or null,
        "prayer": { "title": "...", "content": "...", "instructions": ["..."], "teacherScript": "..." } or null,
        "praise": { "title": "...", "content": "...", "instructions": ["..."] } or null,
        "readingTheWord": { "title": "...", "content": "...", "instructions": ["..."], "teacherScript": "..." } or null,
        "walkingInTheWord": { "title": "...", "content": "...", "instructions": ["..."], "materials": ["..."] } or null,
        "confessionOfSin": null or { ... },
        "assuranceOfPardon": null or { ... },
        "confessionOfFaith": null or { ... },
        "sacraments": null or { ... },
        "tithesAndOfferings": null or { ... },
        "benediction": { "title": "...", "content": "...", "instructions": ["..."] } or null
      }
    }
  ]
}`
      },
      { role: "user", content: text2.substring(0, 24e3) }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3
  });
  const lessonsData = JSON.parse(lessonsResponse.choices[0].message.content || '{"lessons":[]}');
  const lessons = lessonsData.lessons || [];
  updateUploadProgress("Generating quiz questions...", 50);
  for (let i = 0; i < lessons.length; i++) {
    updateUploadProgress(`Generating quiz for lesson ${i + 1}/${lessons.length}...`, 50 + i / lessons.length * 30);
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
  updateUploadProgress("Organizing curriculum...", 90);
  const [{ maxNum }] = await db.select({ maxNum: import_drizzle_orm2.sql`coalesce(max(${worshipUnits.number}), 0)` }).from(worshipUnits);
  const nextNumber = (maxNum || 0) + 1;
  const [insertedUnit] = await db.insert(worshipUnits).values({
    number: nextNumber,
    title: structure.unitTitle || "Uploaded Curriculum",
    description: structure.unitDescription || `Curriculum about ${structure.worshipElement || "worship"}`,
    worshipElement: structure.worshipElement || "Worship",
    elementSpotlight: structure.elementSpotlight || ""
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
      lessonSections: lesson.lessonSections || null,
      sidebarMeta: lesson.sidebarMeta || null,
      preparation: lesson.preparation || "",
      bibleBackground: lesson.bibleBackground || "",
      elementSections: lesson.elementSections || null,
      elementSidebarMeta: lesson.elementSidebarMeta || null
    });
  }
  updateUploadProgress("Complete", 100);
  progress.status = "ready";
  progress.unitId = unitId;
  console.log(`Worship curriculum processed and stored: ${uploadId} (${lessons.length} lessons, quizzes generated)`);
}

// server/index.ts
var app = (0, import_express3.default)();
app.use(import_express3.default.json({ limit: "10mb" }));
app.use(import_express3.default.urlencoded({ extended: false, limit: "10mb" }));
var server = (0, import_http.createServer)(app);
(async () => {
  await registerRoutes(server, app);
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    const { setupVite: setupVite2 } = await Promise.resolve().then(() => (init_vite(), vite_exports));
    await setupVite2(server, app);
  } else {
    const { serveStatic: serveStatic2 } = await Promise.resolve().then(() => (init_static(), static_exports));
    serveStatic2(app);
  }
  const port = 5e3;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Sermon Explorer running on port ${port}`);
  });
})();
