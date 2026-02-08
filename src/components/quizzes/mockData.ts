export interface Answer {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  questionId: number;
  question: string;
  answers: Answer[];
}

// Quiz Schema
export interface QuizData {
  _id: { $oid: string };
  quizId: string;
  title: string; 
  status: "Published" | "Draft"; 
  section: string;
  courseId: string;
  timestamp: { $date: string };
  questions: Question[];
}

export const mockQuizzes: QuizData[] = [
  {
    _id: { $oid: "6983dd6e46779b82136e8b91" },
    quizId: "QUIZ001",
    title: "Research Methods Basics",
    status: "Published",
    section: "Chapter 1",
    courseId: "COURSE001",
    timestamp: { $date: "2026-02-04T12:00:00.000Z" },
    questions: [
      {
        questionId: 1,
        question: "What is the capital of France?",
        answers: [
          { text: "Berlin", isCorrect: false },
          { text: "Madrid", isCorrect: false },
          { text: "Paris", isCorrect: true },
          { text: "Rome", isCorrect: false },
        ],
      },
      {
        questionId: 2,
        question: "2 + 2 = ?",
        answers: [
          { text: "3", isCorrect: false },
          { text: "4", isCorrect: true },
          { text: "5", isCorrect: false },
        ],
      },
    ],
  },
  {
    _id: { $oid: "6983dd6e46779b82136e8b92" },
    quizId: "QUIZ002",
    title: "Cognitive Psychology Midterm",
    status: "Draft",
    section: "Chapter 5",
    courseId: "COURSE001",
    timestamp: { $date: "2026-02-05T14:30:00.000Z" },
    questions: [
      {
        questionId: 1,
        question: "Define cognition.",
        answers: [
          { text: "The study of internal mental processes", isCorrect: true },
          { text: "The study of behavior", isCorrect: false },
        ],
      },
    ],
  },
  {
    _id: { $oid: "6983dd6e46779b82136e8b93" },
    quizId: "QUIZ003",
    title: "Behavioral Analysis",
    status: "Published",
    section: "Chapter 3",
    courseId: "COURSE002",
    timestamp: { $date: "2026-02-06T09:00:00.000Z" },
    questions: Array(10).fill({
        questionId: 1,
        question: "Placeholder question",
        answers: []
    }),
  },
   {
    _id: { $oid: "6983dd6e46779b82136e8b94" },
    quizId: "QUIZ004",
    title: "Statistical Methods",
    status: "Published",
    section: "Chapter 2",
    courseId: "COURSE003",
    timestamp: { $date: "2026-02-07T10:15:00.000Z" },
    questions: Array(20).fill(null),
  },
  {
    _id: { $oid: "6983dd6e46779b82136e8b95" },
    quizId: "QUIZ005",
    title: "Developmental Stages",
    status: "Draft",
    section: "Chapter 4",
    courseId: "COURSE002",
    timestamp: { $date: "2026-02-08T16:45:00.000Z" },
    questions: Array(12).fill(null),
  },
];

export const mockCourses = [
  { id: "COURSE001", name: "Introduction to Psychology" },
  { id: "COURSE002", name: "Advanced Neuroscience" },
  { id: "COURSE003", name: "Behavioral Analysis" },
];

export const mockSections = [
  "Chapter 1",
  "Chapter 2",
  "Chapter 3",
  "Chapter 4",
  "Chapter 5",
];
