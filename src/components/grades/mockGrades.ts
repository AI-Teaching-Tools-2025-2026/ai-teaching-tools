export type Grade = {
  id: string;
  name: string;
  email: string;
  assignmentName: string;
  score: number;
  maxScore: number;
  percentage: number;
  dateSubmitted?: string;
};

export const mockGrades: Grade[] = [
  { id: "1", name: "John Doe", email: "john@example.com", assignmentName: "Assignment 1", score: 85, maxScore: 100, percentage: 85, dateSubmitted: "2025-11-10" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", assignmentName: "Assignment 1", score: 92, maxScore: 100, percentage: 92, dateSubmitted: "2025-11-09" },
  { id: "3", name: "Sam Lee", email: "sam@example.com", assignmentName: "Assignment 2", score: 78, maxScore: 100, percentage: 78, dateSubmitted: "2025-11-12" },
  { id: "4", name: "John Doe", email: "john@example.com", assignmentName: "Assignment 2", score: 88, maxScore: 100, percentage: 88, dateSubmitted: "2025-11-14" },
  { id: "5", name: "Jane Smith", email: "jane@example.com", assignmentName: "Assignment 2", score: 75, maxScore: 100, percentage: 75, dateSubmitted: "2025-11-13" },
  { id: "6", name: "Alex Kim", email: "alex@example.com", assignmentName: "Assignment 1", score: 95, maxScore: 100, percentage: 95, dateSubmitted: "2025-11-08" },
  { id: "7", name: "Maria Garcia", email: "maria@example.com", assignmentName: "Assignment 1", score: 67, maxScore: 100, percentage: 67, dateSubmitted: "2025-11-07" },
  { id: "8", name: "Sam Lee", email: "sam@example.com", assignmentName: "Assignment 3", score: 82, maxScore: 100, percentage: 82, dateSubmitted: "2025-11-16" },
  { id: "9", name: "John Doe", email: "john@example.com", assignmentName: "Assignment 3", score: 91, maxScore: 100, percentage: 91, dateSubmitted: "2025-11-18" },
  { id: "10", name: "Jane Smith", email: "jane@example.com", assignmentName: "Assignment 3", score: 88, maxScore: 100, percentage: 88, dateSubmitted: "2025-11-17" },
  { id: "11", name: "Alex Kim", email: "alex@example.com", assignmentName: "Assignment 2", score: 84, maxScore: 100, percentage: 84, dateSubmitted: "2025-11-11" },
  { id: "12", name: "Maria Garcia", email: "maria@example.com", assignmentName: "Assignment 2", score: 73, maxScore: 100, percentage: 73, dateSubmitted: "2025-11-15" },
  { id: "13", name: "John Doe", email: "john@example.com", assignmentName: "Assignment 4", score: 77, maxScore: 100, percentage: 77, dateSubmitted: "2025-11-20" },
  { id: "14", name: "Jane Smith", email: "jane@example.com", assignmentName: "Assignment 4", score: 94, maxScore: 100, percentage: 94, dateSubmitted: "2025-11-19" },
  { id: "15", name: "Sam Lee", email: "sam@example.com", assignmentName: "Assignment 4", score: 69, maxScore: 100, percentage: 69, dateSubmitted: "2025-11-21" },
  { id: "16", name: "Alex Kim", email: "alex@example.com", assignmentName: "Assignment 3", score: 88, maxScore: 100, percentage: 88, dateSubmitted: "2025-11-22" },
  { id: "17", name: "Maria Garcia", email: "maria@example.com", assignmentName: "Assignment 3", score: 81, maxScore: 100, percentage: 81, dateSubmitted: "2025-11-23" },
  { id: "18", name: "John Doe", email: "john@example.com", assignmentName: "Assignment 5", score: 93, maxScore: 100, percentage: 93, dateSubmitted: "2025-11-24" },
  { id: "19", name: "Jane Smith", email: "jane@example.com", assignmentName: "Assignment 5", score: 78, maxScore: 100, percentage: 78, dateSubmitted: "2025-11-24" },
  { id: "20", name: "Sam Lee", email: "sam@example.com", assignmentName: "Assignment 5", score: 86, maxScore: 100, percentage: 86, dateSubmitted: "2025-11-24" },
  { id: "21", name: "Alex Kim", email: "alex@example.com", assignmentName: "Assignment 4", score: 91, maxScore: 100, percentage: 91, dateSubmitted: "2025-11-24" },
  { id: "22", name: "Maria Garcia", email: "maria@example.com", assignmentName: "Assignment 4", score: 76, maxScore: 100, percentage: 76, dateSubmitted: "2025-11-24" },
  { id: "23", name: "Liam Chen", email: "liam@example.com", assignmentName: "Assignment 1", score: 82, maxScore: 100, percentage: 82, dateSubmitted: "2025-11-05" },
  { id: "24", name: "Olivia Brown", email: "olivia@example.com", assignmentName: "Assignment 1", score: 89, maxScore: 100, percentage: 89, dateSubmitted: "2025-11-06" },
  { id: "25", name: "Noah Wilson", email: "noah@example.com", assignmentName: "Assignment 2", score: 74, maxScore: 100, percentage: 74, dateSubmitted: "2025-11-07" },
  { id: "26", name: "Emma Davis", email: "emma@example.com", assignmentName: "Assignment 2", score: 96, maxScore: 100, percentage: 96, dateSubmitted: "2025-11-08" },
  { id: "27", name: "Ava Martinez", email: "ava@example.com", assignmentName: "Assignment 3", score: 68, maxScore: 100, percentage: 68, dateSubmitted: "2025-11-09" },
  { id: "28", name: "Isabella Garcia", email: "isabella@example.com", assignmentName: "Assignment 4", score: 90, maxScore: 100, percentage: 90, dateSubmitted: "2025-11-10" },
  { id: "29", name: "Mason Anderson", email: "mason@example.com", assignmentName: "Assignment 5", score: 83, maxScore: 100, percentage: 83, dateSubmitted: "2025-11-11" },
  { id: "30", name: "Ethan Thomas", email: "ethan@example.com", assignmentName: "Assignment 1", score: 79, maxScore: 100, percentage: 79, dateSubmitted: "2025-11-12" },
];
