import type { Express } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { db } from "./db";
import { smjLessons } from "@shared/schema";
import { eq } from "drizzle-orm";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as any)[prop];
  },
});

const upload = multer({ dest: "uploads/" });

const smjUploadProgress: Map<
  string,
  {
    status: "processing" | "ready" | "error";
    progress: number;
    currentStep: string;
    lessonId?: string;
    error?: string;
    createdAt: string;
  }
> = new Map();

const IMAGES_DIR = path.resolve("generated", "images");

export function registerSMJRoutes(app: Express) {
  app.get("/api/smj/lessons", async (_req, res) => {
    try {
      const rows = await db.select().from(smjLessons);
      const result = rows.map((l) => ({
        id: l.id,
        lessonNumber: l.lessonNumber,
        title: l.title,
        scripture: l.scripture,
        status: l.status,
        createdAt: l.createdAt,
      }));
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/smj/lessons/:id", async (req, res) => {
    try {
      const [lesson] = await db
        .select()
        .from(smjLessons)
        .where(eq(smjLessons.id, req.params.id));
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
      res.json(lesson);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/smj/lessons/:id", async (req, res) => {
    try {
      const [lesson] = await db
        .select()
        .from(smjLessons)
        .where(eq(smjLessons.id, req.params.id));
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });

      const { deleteImage } = await import("./image-storage");
      const scenes = (lesson.bibleStoryScenes as any[]) || [];
      for (const scene of scenes) {
        if (scene.imageUrl) {
          const fname = scene.imageUrl.split("/").pop();
          if (fname) await deleteImage(fname);
        }
      }

      await db.delete(smjLessons).where(eq(smjLessons.id, req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/smj/upload", upload.single("document"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const ext = path.extname(req.file.originalname).toLowerCase();
      let rawText = "";

      if (ext === ".pdf") {
        const pdfParse = (await import("pdf-parse")).default;
        const buffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(buffer);
        rawText = data.text;
      } else if (ext === ".docx") {
        const mammoth = (await import("mammoth")).default;
        const result = await mammoth.extractRawText({ path: req.file.path });
        rawText = result.value;
      } else if (ext === ".txt") {
        rawText = fs.readFileSync(req.file.path, "utf8");
      } else {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "Unsupported file type" });
      }

      fs.unlinkSync(req.file.path);

      if (!rawText.trim()) {
        return res.status(400).json({ error: "Could not extract text from file" });
      }

      const uploadId = `smj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      smjUploadProgress.set(uploadId, {
        status: "processing",
        progress: 0,
        currentStep: "Starting...",
        createdAt: new Date().toISOString(),
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
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/smj/upload/:uploadId/status", (req, res) => {
    const prog = smjUploadProgress.get(req.params.uploadId);
    if (!prog) return res.status(404).json({ error: "Upload not found" });
    res.json({
      status: prog.status,
      percentage: prog.progress,
      currentStep: prog.currentStep,
      lessonId: prog.lessonId,
      error: prog.error,
    });
  });

  app.post("/api/smj/ai/catechism-hint", async (req, res) => {
    try {
      const { question, answer } = req.body;
      if (!question || !answer)
        return res.status(400).json({ error: "question and answer required" });

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You help preschool children (ages 3-5) remember catechism answers. Given a catechism question and its answer, provide a simple, fun hint that helps a young child remember the answer. Use simple words, a fun analogy, or a short rhyme. Keep it to 1-2 sentences.",
          },
          {
            role: "user",
            content: `Question: ${question}\nAnswer: ${answer}\n\nGive a child-friendly hint to help remember this answer.`,
          },
        ],
        max_tokens: 150,
      });

      const hint =
        response.choices[0]?.message?.content?.trim() || "Think about it!";
      res.json({ hint });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/smj/ai/parent-guide", async (req, res) => {
    try {
      const { lessonId } = req.body;
      if (!lessonId)
        return res.status(400).json({ error: "lessonId required" });

      const [lesson] = await db
        .select()
        .from(smjLessons)
        .where(eq(smjLessons.id, lessonId));
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });

      const catechismText = (lesson.catechismPairs as any[])
        ?.map(
          (p: any) =>
            `${p.questionNumber ? p.questionNumber + ": " : ""}${p.question} — ${p.answer}`
        )
        .join("\n") || "No catechism pairs available";

      const versesText = (lesson.bibleVerses as any[])
        ?.map((v: any) => `${v.reference}: ${v.text}`)
        .join("\n") || "No verses available";

      const discussionText = (lesson.discussionQuestions as any[])
        ?.map((q: any) => `Q: ${q.question} (Expected: ${q.expectedAnswer})`)
        .join("\n") || "No discussion questions";

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You generate parent take-home guides for a preschool Bible curriculum called "Show Me Jesus." Parents will use this to reinforce what their child learned in class. Write warmly and simply. Return valid JSON only.`,
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
}`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const guide = JSON.parse(
        response.choices[0]?.message?.content || "{}"
      );
      res.json(guide);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/smj/ai/teacher-assistant", async (req, res) => {
    try {
      const { lessonId, requestType } = req.body;
      if (!lessonId || !requestType)
        return res
          .status(400)
          .json({ error: "lessonId and requestType required" });

      const [lesson] = await db
        .select()
        .from(smjLessons)
        .where(eq(smjLessons.id, lessonId));
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });

      const lessonContext = `Lesson: "${lesson.title}" (Lesson ${lesson.lessonNumber})
Scripture: ${lesson.scripture}
Bible Truth: ${lesson.bibleTruth}
Lesson Focus: ${lesson.lessonFocus}
Goals: ${(lesson.goalsForChildren as string[])?.join("; ") || "N/A"}`;

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
            content:
              "You are a creative preschool Bible curriculum assistant. Return valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const result = JSON.parse(
        response.choices[0]?.message?.content || "{}"
      );
      res.json({ type: requestType, ...result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}

async function generateSMJImage(
  prompt: string,
  lessonId: string,
  sceneIndex: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required for image generation");

  const { GoogleGenAI } = await import("@google/genai");
  const client = new GoogleGenAI({ apiKey });

  const safetyPrefix =
    "Generate a bright, cheerful children's storybook illustration for ages 3-6. Colorful 3D animated style with expressive big-eyed characters and soft global lighting, like a modern family animated feature film. The scene must be entirely wholesome and family-friendly. CRITICAL RULES: Do not depict Jesus, God, or any divine figure as a person or character in any way — no silhouettes, no figures, no human forms, not from behind, not obscured. Represent divine presence ONLY through warm golden light rays, glowing clouds, or gentle radiant sunrise. Do not include any text, words, letters, numbers, or writing of any kind anywhere in the image. Characters must have closed mouths. Settings must be child-safe. Widescreen 16:9 composition. ";
  const safePrompt = safetyPrefix + prompt;

  const label = `smj-${lessonId} scene ${sceneIndex}`;
  console.log(`Generating SMJ image with Gemini for ${label}`);

  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(10000 * Math.pow(2, attempt - 1), 60000);
        console.log(`Retry ${attempt}/${maxRetries} for ${label}, waiting ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
      }

      const currentPrompt =
        attempt === 0
          ? safePrompt
          : `Generate a wholesome children's storybook illustration, colorful 3D animated style, big-eyed characters, warm lighting, bright cheerful scene, family-friendly, widescreen 16:9, no text or writing, no depiction of Jesus or God as a person — use golden light rays instead. ${prompt.replace(/[^\w\s,.'"-]/g, " ").substring(0, 500)}`;

      const response = await client.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: currentPrompt,
        config: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (!parts || parts.length === 0) {
        if (attempt < maxRetries - 1) continue;
        throw new Error("Gemini returned no content parts");
      }

      const imagePart = parts.find((p: any) =>
        p.inlineData?.mimeType?.startsWith("image/")
      );
      if (!imagePart?.inlineData?.data) {
        if (attempt < maxRetries - 1) continue;
        throw new Error("Gemini returned no image in response");
      }

      const filename = `smj-${lessonId}-scene${sceneIndex}.png`;
      const buffer = Buffer.from(imagePart.inlineData.data, "base64");
      const { saveImage } = await import("./image-storage");
      const imageUrl = await saveImage(filename, buffer);
      console.log(`SMJ image saved: ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`);

      return imageUrl;
    } catch (err: any) {
      lastError = err;
      if (err.status === 429 || err.message?.includes("safety")) {
        continue;
      }
      if (attempt >= maxRetries - 1) throw err;
    }
  }

  throw lastError;
}

async function processSMJLesson(uploadId: string, rawText: string) {
  const prog = smjUploadProgress.get(uploadId)!;
  const lessonId = `smj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    await db.insert(smjLessons).values({
      id: lessonId,
      status: "processing",
      progress: 0,
      currentStep: "Starting...",
    });

    prog.lessonId = lessonId;

    // Step 1: Extract metadata (10%)
    prog.progress = 5;
    prog.currentStep = "Extracting lesson metadata...";
    await db.update(smjLessons).set({ progress: 5, currentStep: prog.currentStep }).where(eq(smjLessons.id, lessonId));

    const metaResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You extract metadata from a "Show Me Jesus" preschool Bible curriculum lesson. Return valid JSON only.`,
        },
        {
          role: "user",
          content: `Extract metadata from this lesson document:

${rawText.substring(0, 6000)}

Return JSON:
{
  "lessonNumber": <number>,
  "title": "lesson title without 'Lesson X:' prefix",
  "scripture": "e.g. Genesis 3",
  "bibleTruth": "the Bible Truth doctrinal statement",
  "lessonFocus": "what the lesson teaches",
  "goalsForChildren": ["goal 1", "goal 2", ...],
  "bibleVerseReferences": ["Exodus 20:8", "John 15:14", ...]
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const metadata = JSON.parse(metaResponse.choices[0]?.message?.content || "{}");
    prog.progress = 10;
    prog.currentStep = "Metadata extracted";

    await db
      .update(smjLessons)
      .set({
        lessonNumber: metadata.lessonNumber || 0,
        title: metadata.title || "Untitled",
        scripture: metadata.scripture || "",
        bibleTruth: metadata.bibleTruth || "",
        lessonFocus: metadata.lessonFocus || "",
        goalsForChildren: metadata.goalsForChildren || [],
        progress: 10,
        currentStep: "Metadata extracted",
      })
      .where(eq(smjLessons.id, lessonId));

    // Step 2: Extract Bible story narrative (25%)
    prog.progress = 15;
    prog.currentStep = "Extracting Bible story...";
    await db.update(smjLessons).set({ progress: 15, currentStep: prog.currentStep }).where(eq(smjLessons.id, lessonId));

    const storyResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You extract the Bible Time narrative from a "Show Me Jesus" lesson. This is the continuous Bible story the teacher reads to children. It's usually in the "Bible Time" section, spanning multiple paragraphs. Return valid JSON only.`,
        },
        {
          role: "user",
          content: `Extract the full Bible Time narrative from this lesson. This is the Bible story retelling written for preschoolers, NOT the welcome/bridge story. Include all paragraphs. Remove Teaching Aid references like "(Show TA 10, panel 1)" but keep the narrative text.

${rawText}

Return JSON:
{
  "bibleStoryNarrative": "the full Bible story text, all paragraphs combined"
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 3000,
    });

    const storyData = JSON.parse(storyResponse.choices[0]?.message?.content || "{}");
    const bibleStoryNarrative = storyData.bibleStoryNarrative || "";
    prog.progress = 25;
    prog.currentStep = "Bible story extracted";

    // Step 3: Extract structured content (35%)
    prog.progress = 28;
    prog.currentStep = "Extracting structured content...";
    await db.update(smjLessons).set({ progress: 28, currentStep: prog.currentStep }).where(eq(smjLessons.id, lessonId));

    const structuredResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You extract structured content from a "Show Me Jesus" preschool Bible lesson. Return valid JSON only.`,
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
The references from metadata are: ${(metadata.bibleVerseReferences || []).join(", ")}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2500,
    });

    const structured = JSON.parse(structuredResponse.choices[0]?.message?.content || "{}");
    prog.progress = 35;
    prog.currentStep = "Structured content extracted";

    await db
      .update(smjLessons)
      .set({
        welcomeStory: structured.welcomeStory || "",
        catechismPairs: structured.catechismPairs || [],
        discussionQuestions: structured.discussionQuestions || [],
        bibleVerses: structured.bibleVerses || [],
        closingPrayer: structured.closingPrayer || "",
        progress: 35,
        currentStep: "Structured content extracted",
      })
      .where(eq(smjLessons.id, lessonId));

    // Step 4: Break Bible story into scenes (50%)
    prog.progress = 40;
    prog.currentStep = "Breaking story into scenes...";
    await db.update(smjLessons).set({ progress: 40, currentStep: prog.currentStep }).where(eq(smjLessons.id, lessonId));

    const scenesResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You break a Bible story narrative into illustrated scenes for preschool children. Each scene should be a distinct moment in the story that can be illustrated. Return valid JSON only.`,
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
- NEVER describe God, Jesus, or the Holy Spirit as a person/figure — use warm golden light rays, glowing clouds, or radiant sunrise instead
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
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 3000,
    });

    const scenesData = JSON.parse(scenesResponse.choices[0]?.message?.content || "{}");
    const scenes = (scenesData.scenes || []).map((s: any) => ({
      ...s,
      imageUrl: null,
    }));
    prog.progress = 50;
    prog.currentStep = "Story broken into scenes";

    // Step 5: Generate illustrations (70%)
    prog.progress = 52;
    prog.currentStep = "Generating illustrations...";
    await db.update(smjLessons).set({ progress: 52, currentStep: prog.currentStep }).where(eq(smjLessons.id, lessonId));

    for (let i = 0; i < scenes.length; i++) {
      try {
        prog.currentStep = `Generating illustration ${i + 1} of ${scenes.length}...`;
        prog.progress = 52 + Math.round((i / scenes.length) * 18);
        await db.update(smjLessons).set({ progress: prog.progress, currentStep: prog.currentStep }).where(eq(smjLessons.id, lessonId));

        const imageUrl = await generateSMJImage(
          scenes[i].imagePrompt,
          lessonId,
          i
        );
        scenes[i].imageUrl = imageUrl;

        if (i < scenes.length - 1) {
          await new Promise((r) => setTimeout(r, 10000));
        }
      } catch (err: any) {
        console.error(`Failed to generate SMJ image for scene ${i}:`, err.message);
        scenes[i].imageUrl = null;
      }
    }

    prog.progress = 70;
    prog.currentStep = "Illustrations generated";

    await db
      .update(smjLessons)
      .set({
        bibleStoryScenes: scenes,
        progress: 70,
        currentStep: "Illustrations generated",
      })
      .where(eq(smjLessons.id, lessonId));

    // Step 6: Generate quiz questions (85%)
    prog.progress = 75;
    prog.currentStep = "Generating quiz questions...";
    await db.update(smjLessons).set({ progress: 75, currentStep: prog.currentStep }).where(eq(smjLessons.id, lessonId));

    const quizResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You create quiz questions for preschool/early elementary children about a Bible story. Questions must be answerable from the story text alone. Use simple language. Return valid JSON only.`,
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
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const quizData = JSON.parse(quizResponse.choices[0]?.message?.content || "{}");
    prog.progress = 85;
    prog.currentStep = "Quiz questions generated";

    await db
      .update(smjLessons)
      .set({
        preGeneratedQuiz: quizData.questions || [],
        progress: 85,
        currentStep: "Quiz questions generated",
      })
      .where(eq(smjLessons.id, lessonId));

    // Step 7: Generate story sequence events (92%)
    prog.progress = 88;
    prog.currentStep = "Generating story sequence...";
    await db.update(smjLessons).set({ progress: 88, currentStep: prog.currentStep }).where(eq(smjLessons.id, lessonId));

    const seqResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You create story sequencing events for a preschool Bible story retelling game. Each event is a short, simple sentence describing a key moment in the story. Return valid JSON only.`,
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
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const seqData = JSON.parse(seqResponse.choices[0]?.message?.content || "{}");
    prog.progress = 92;
    prog.currentStep = "Story sequence generated";

    // Step 8: Finalize (100%)
    prog.progress = 95;
    prog.currentStep = "Finalizing...";

    await db
      .update(smjLessons)
      .set({
        storySequenceEvents: seqData.events || [],
        status: "ready",
        progress: 100,
        currentStep: "Complete",
      })
      .where(eq(smjLessons.id, lessonId));

    prog.progress = 100;
    prog.currentStep = "Complete";
    prog.status = "ready";

    console.log(`SMJ lesson processed successfully: ${lessonId}`);
  } catch (err: any) {
    console.error(`SMJ processing error for ${lessonId}:`, err);
    prog.status = "error";
    prog.error = err.message || "Processing failed";

    try {
      await db
        .update(smjLessons)
        .set({
          status: "error",
          error: err.message || "Processing failed",
          currentStep: "Error",
        })
        .where(eq(smjLessons.id, lessonId));
    } catch {}
  }
}
