// Hardcoded curriculum data for CDM Explorer — Worship Explorer section
// Based on "Exploring the Elements of Worship" curriculum by Teach Us to Worship

export interface WorshipElement {
  id: string;
  name: string;
  icon: string;
  color: string;
  shortDescription: string;
  childFriendlyExplanation: string;
  handMotion?: string;
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
  lessons: LessonData[];
}

// ============================================
// 12 WORSHIP ELEMENTS (hardcoded constants)
// ============================================

export const WORSHIP_ELEMENTS: WorshipElement[] = [
  {
    id: "call-to-worship",
    name: "Call to Worship",
    icon: "megaphone",
    color: "#3FD0A6",
    shortDescription: "God calls us to worship Him!",
    childFriendlyExplanation: "When we come to church, God invites us to worship Him. It is like getting a special invitation to talk to the King of everything! The Call to Worship tells us that God wants to be with us and hear our praises.",
    handMotion: "Cup hands around mouth like calling out",
    relatedUnits: [2],
  },
  {
    id: "prayer-of-invocation",
    name: "Prayer of Invocation",
    icon: "hand-heart",
    color: "#F2C94C",
    shortDescription: "We ask God to be with us!",
    childFriendlyExplanation: "After God calls us to worship, we pray and ask Him to be right here with us. We know God is everywhere, but in this prayer we say, 'God, please be close to us today as we worship You.'",
    handMotion: "Fold hands in prayer, then open wide",
    relatedUnits: [3],
  },
  {
    id: "hymn-of-praise",
    name: "Hymn of Praise",
    icon: "music",
    color: "#87CEEB",
    shortDescription: "We sing to tell God how great He is!",
    childFriendlyExplanation: "We sing songs to God because He is wonderful! When we sing hymns, we are using our voices to tell God how awesome, strong, and loving He is. Singing together makes worship special.",
    handMotion: "Hands up, swaying gently",
    relatedUnits: [4],
  },
  {
    id: "reading-of-the-law",
    name: "Reading of the Law",
    icon: "scroll-text",
    color: "#FF7F7F",
    shortDescription: "We hear God's rules for living!",
    childFriendlyExplanation: "God gave us rules because He loves us. The Ten Commandments help us know how to love God and love other people. When we hear the Law read in church, it reminds us of how God wants us to live.",
    handMotion: "Hold hands open like a book",
    relatedUnits: [5],
  },
  {
    id: "confession-of-sin",
    name: "Confession of Sin",
    icon: "heart-crack",
    color: "#B8A9C9",
    shortDescription: "We tell God when we mess up.",
    childFriendlyExplanation: "Everyone makes mistakes and does things wrong sometimes. In confession, we tell God we are sorry for the wrong things we have done. God loves us so much that He always listens and forgives us.",
    handMotion: "Hand on heart, then open palms up",
    relatedUnits: [6],
  },
  {
    id: "assurance-of-pardon",
    name: "Assurance of Pardon",
    icon: "sun",
    color: "#FFDAB9",
    shortDescription: "God tells us we are forgiven!",
    childFriendlyExplanation: "After we say we are sorry, God tells us something wonderful: we are forgiven! Because Jesus died for us, our sins are washed away. It is like the sun coming out after a storm.",
    handMotion: "Arms spread wide with a big smile",
    relatedUnits: [7],
  },
  {
    id: "reading-of-the-word",
    name: "Reading of the Word",
    icon: "book-open",
    color: "#3FD0A6",
    shortDescription: "We listen to God's special book!",
    childFriendlyExplanation: "The Bible is God's Word. When it is read in church, God is speaking to us! We listen carefully because the Bible tells us about who God is, what He has done, and how much He loves us.",
    handMotion: "Cup hand to ear, then open hands like a book",
    relatedUnits: [8],
  },
  {
    id: "sermon",
    name: "Sermon",
    icon: "message-circle",
    color: "#F2C94C",
    shortDescription: "The pastor helps us understand God's Word!",
    childFriendlyExplanation: "The sermon is when the pastor teaches us what the Bible means. The pastor is like a guide who helps us understand God's story and how it matters for our lives today.",
    handMotion: "Point to ear, then point forward",
    relatedUnits: [10],
  },
  {
    id: "sacraments",
    name: "Sacraments",
    icon: "droplets",
    color: "#87CEEB",
    shortDescription: "Special signs that show God's promises!",
    childFriendlyExplanation: "Baptism and the Lord's Supper are special gifts from God. Baptism uses water to show that God has made us part of His family. The Lord's Supper uses bread and juice to remind us of Jesus.",
    handMotion: "Cup hands together as if holding water",
    relatedUnits: [11],
  },
  {
    id: "benediction",
    name: "Benediction",
    icon: "hand",
    color: "#F5C6D0",
    shortDescription: "God sends us out with a blessing!",
    childFriendlyExplanation: "At the end of worship, the pastor speaks God's blessing over us. It is like God giving us a big hug and saying, 'Go and share my love with everyone you meet this week!'",
    handMotion: "Hands raised receiving, then pointing outward",
    relatedUnits: [12],
  },
  {
    id: "doxology",
    name: "Doxology",
    icon: "star",
    color: "#F2C94C",
    shortDescription: "A special song praising God forever!",
    childFriendlyExplanation: "The Doxology is a song that Christians have been singing for hundreds of years. It praises God the Father, Son, and Holy Spirit. When we sing it, we join with Christians everywhere and throughout all of history!",
    handMotion: "Hands lifted high, fingers spread like stars",
    relatedUnits: [13],
  },
  {
    id: "prayer-of-illumination",
    name: "Prayer of Illumination",
    icon: "lightbulb",
    color: "#FFDAB9",
    shortDescription: "We ask God to help us understand!",
    childFriendlyExplanation: "Before we hear God's Word read and taught, we pray and ask God's Holy Spirit to turn the lights on in our minds and hearts so we can understand what He is saying to us.",
    handMotion: "Hands on head like a lightbulb turning on",
    relatedUnits: [9],
  },
];

