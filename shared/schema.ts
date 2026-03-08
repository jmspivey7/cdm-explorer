import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const sermons = pgTable("sermons", {
  id: text("id").primaryKey(),
  title: text("title").notNull().default("Processing..."),
  scripture: text("scripture").default(""),
  summary: text("summary"),
  keyThemes: jsonb("key_themes").$type<string[]>(),
  status: text("status").notNull().default("processing"),
  rawText: text("raw_text"),
  scenes: jsonb("scenes").$type<any[]>(),
  progress: integer("progress").default(0),
  currentStep: text("current_step").default(""),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const worshipUnits = pgTable("worship_units", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  description: text("description").default(""),
  worshipElement: text("worship_element").default(""),
  elementSpotlight: text("element_spotlight").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export interface ElementSectionData {
  title: string;
  content: string;
  instructions: string[];
  materials?: string[];
  teacherScript?: string;
}

export interface WorshipElementSections {
  callToWorship: ElementSectionData | null;
  prayer: ElementSectionData | null;
  praise: ElementSectionData | null;
  readingTheWord: ElementSectionData | null;
  walkingInTheWord: ElementSectionData | null;
  confessionOfSin: ElementSectionData | null;
  assuranceOfPardon: ElementSectionData | null;
  confessionOfFaith: ElementSectionData | null;
  sacraments: ElementSectionData | null;
  tithesAndOfferings: ElementSectionData | null;
  benediction: ElementSectionData | null;
}

export type WorshipElementKey = keyof WorshipElementSections;

export interface LessonSidebarMeta {
  scripture: string;
  scriptureText: string;
  lessonFocus: string;
  goalsForChildren: string;
  memoryVerse: string;
  memoryVerseReference: string;
  worshipSign: string;
  bibleTruth: string;
}

export interface LessonSectionData {
  title: string;
  content: string;
  instructions: string[];
  materials?: string[];
}

export interface LessonSections {
  welcome: LessonSectionData | null;
  bibleTime: LessonSectionData | null;
  talkAndMemorize: LessonSectionData | null;
  sing: LessonSectionData | null;
  makeAndDo: LessonSectionData | null;
  finalFocus: LessonSectionData | null;
}

export interface SidebarMeta {
  bibleTruths: string;
  scripture: string;
  scriptureText: string;
  lessonFocus: string;
  goalsForChildren: string;
  memoryMinute: string;
}

export interface SMJBibleStoryScene {
  sceneNumber: number;
  title: string;
  narrative: string;
  imageUrl: string | null;
  imagePrompt: string;
}

export interface SMJCatechismPair {
  question: string;
  answer: string;
  questionNumber?: string;
}

export interface SMJDiscussionQuestion {
  question: string;
  expectedAnswer: string;
}

export interface SMJBibleVerse {
  reference: string;
  text: string;
}

export interface SMJQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SMJStorySequenceEvent {
  order: number;
  event: string;
}

export const smjLessons = pgTable("smj_lessons", {
  id: text("id").primaryKey(),
  lessonNumber: integer("lesson_number").notNull().default(0),
  title: text("title").notNull().default("Processing..."),
  scripture: text("scripture").default(""),
  bibleTruth: text("bible_truth").default(""),
  lessonFocus: text("lesson_focus").default(""),
  goalsForChildren: jsonb("goals_for_children").$type<string[]>(),
  bibleStoryScenes: jsonb("bible_story_scenes").$type<SMJBibleStoryScene[]>(),
  welcomeStory: text("welcome_story").default(""),
  catechismPairs: jsonb("catechism_pairs").$type<SMJCatechismPair[]>(),
  discussionQuestions: jsonb("discussion_questions").$type<SMJDiscussionQuestion[]>(),
  bibleVerses: jsonb("bible_verses").$type<SMJBibleVerse[]>(),
  closingPrayer: text("closing_prayer").default(""),
  preGeneratedQuiz: jsonb("pre_generated_quiz").$type<SMJQuizQuestion[]>(),
  storySequenceEvents: jsonb("story_sequence_events").$type<SMJStorySequenceEvent[]>(),
  status: text("status").notNull().default("processing"),
  progress: integer("progress").default(0),
  currentStep: text("current_step").default(""),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const worshipLessons = pgTable("worship_lessons", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id").notNull().references(() => worshipUnits.id, { onDelete: "cascade" }),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  mainIdea: text("main_idea").default(""),
  memoryVerse: text("memory_verse").default(""),
  memoryVerseReference: text("memory_verse_reference").default(""),
  worshipSign: text("worship_sign").default(""),
  callAndResponse: jsonb("call_and_response").$type<{ leader: string; response: string } | null>(),
  activities: jsonb("activities").$type<string[] | null>(),
  prayerFocus: text("prayer_focus").default(""),
  songSuggestions: jsonb("song_suggestions").$type<string[] | null>(),
  preGeneratedQuiz: jsonb("pre_generated_quiz").$type<any[]>(),
  lessonSections: jsonb("lesson_sections").$type<LessonSections | null>(),
  sidebarMeta: jsonb("sidebar_meta").$type<SidebarMeta | null>(),
  preparation: text("preparation").default(""),
  bibleBackground: text("bible_background").default(""),
  elementSections: jsonb("element_sections").$type<WorshipElementSections | null>(),
  elementSidebarMeta: jsonb("element_sidebar_meta").$type<LessonSidebarMeta | null>(),
});
