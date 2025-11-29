import Dexie, { type EntityTable } from 'dexie';

interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  order?: number;
  author?: string;
  tags?: string[];
  difficulty?: string;
  estimatedHours?: number;
}

interface Chapter {
  id: string; // courseId-chapterId
  courseId: string;
  chapterId: string;
  title: string;
  content: string; // Markdown content
  order: number;
  createdAt: number;
}

interface Progress {
  id: string; // chapterId
  courseId: string;
  chapterId: string;
  completed: boolean;
  lastRead: number;
}

interface Note {
  id: string;
  courseId: string;
  chapterId?: string;
  title: string;
  content: string;
  createdAt: number;
}

const db = new Dexie('CourseDatabase') as Dexie & {
  courses: EntityTable<Course, 'id'>;
  chapters: EntityTable<Chapter, 'id'>;
  progress: EntityTable<Progress, 'id'>;
  notes: EntityTable<Note, 'id'>;
};

db.version(2).stores({
  courses: 'id, title, createdAt, order',
  chapters: 'id, courseId, chapterId, order',
  progress: 'id, courseId, chapterId, completed, lastRead',
  notes: 'id, courseId, chapterId, title, createdAt'
});

export { db };
export type { Course, Chapter, Progress, Note };
