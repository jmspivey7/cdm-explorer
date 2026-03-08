import type {
  WorshipElementSections,
  WorshipElementKey,
  ElementSectionData,
  LessonSidebarMeta,
  LessonSections,
  LessonSectionData,
  SidebarMeta,
} from "./schema";

export type {
  WorshipElementSections,
  WorshipElementKey,
  ElementSectionData,
  LessonSidebarMeta,
  LessonSections,
  LessonSectionData,
  SidebarMeta,
};

export interface WorshipElement {
  id: string;
  name: string;
  elementKey: WorshipElementKey;
  icon: string;
  color: string;
  shortDescription: string;
  childFriendlyExplanation: string;
  handMotion?: string;
  core: boolean;
  relatedUnits: number[];
}

export interface CallAndResponse {
  leader: string;
  response: string;
}

export interface PreGeneratedQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonData {
  id: number;
  unitId: number;
  number: number;
  title: string;
  mainIdea: string;
  memoryVerse: string;
  memoryVerseReference: string;
  worshipSign: string;
  callAndResponse: CallAndResponse | null;
  activities: string[] | null;
  prayerFocus: string;
  songSuggestions: string[] | null;
  preGeneratedQuiz?: PreGeneratedQuiz[];
  lessonSections?: LessonSections | null;
  sidebarMeta?: SidebarMeta | null;
  preparation?: string;
  bibleBackground?: string;
  elementSections?: WorshipElementSections | null;
  elementSidebarMeta?: LessonSidebarMeta | null;
}

export interface UnitOverview {
  number: number;
  title: string;
  worshipElement: string;
  lessonsCount: number;
}

export interface UnitDetail {
  id: number;
  number: number;
  title: string;
  description: string;
  worshipElement: string;
  elementSpotlight?: string;
  lessons: LessonData[];
}

export const WORSHIP_ELEMENT_KEYS: WorshipElementKey[] = [
  "callToWorship",
  "prayer",
  "praise",
  "readingTheWord",
  "walkingInTheWord",
  "confessionOfSin",
  "assuranceOfPardon",
  "confessionOfFaith",
  "sacraments",
  "tithesAndOfferings",
  "benediction",
];

export const CORE_ELEMENT_KEYS: WorshipElementKey[] = [
  "callToWorship",
  "praise",
  "prayer",
  "readingTheWord",
  "walkingInTheWord",
];

export const WORSHIP_ELEMENTS: WorshipElement[] = [
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
    relatedUnits: [2],
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
    relatedUnits: [3],
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
    relatedUnits: [4],
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
    relatedUnits: [5],
  },
  {
    id: "walking-in-the-word",
    name: "Walking in the Word",
    elementKey: "walkingInTheWord",
    icon: "footprints",
    color: "#A8D5BA",
    shortDescription: "God's Word teaches His people how to live!",
    childFriendlyExplanation: "Walking in the Word means we don't just hear God's Word — we do what it says! God teaches us how to live, how to love others, and how to follow Jesus every single day.",
    handMotion: "March feet in place",
    core: true,
    relatedUnits: [6],
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
    relatedUnits: [7],
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
    relatedUnits: [8],
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
    relatedUnits: [11],
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
    relatedUnits: [9],
  },
  {
    id: "tithes-and-offerings",
    name: "Tithes & Offerings",
    elementKey: "tithesAndOfferings",
    icon: "gift",
    color: "#C4A862",
    shortDescription: "Everything belongs to the Lord!",
    childFriendlyExplanation: "Everything we have comes from God. When we give our tithes and offerings, we are saying thank you to God and trusting Him to take care of us. We give because God gave us the best gift — Jesus!",
    handMotion: "Hold hands out offering something",
    core: false,
    relatedUnits: [10],
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
    relatedUnits: [12],
  },
];
