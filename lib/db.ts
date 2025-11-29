import Dexie, { type EntityTable } from 'dexie';

interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  order?: number;
  author?: string;
  version?: string;
  nextjsVersion?: string;
  tags?: string[];
  difficulty?: string;
  estimatedHours?: number;
  prerequisites?: string[];
}

interface Part {
  id: string; // courseId-partId
  courseId: string;
  partId: string;
  title: string;
  order: number;
}

interface Chapter {
  id: string; // courseId-chapterId
  courseId: string;
  chapterId: string;
  partId: string;
  title: string;
  content: string; // Markdown content
  order: number;
  createdAt: number;
}

interface Subchapter {
  id: string; // courseId-chapterId-subchapterId
  courseId: string;
  chapterId: string;
  subchapterId: string;
  title: string;
  content: string; // Markdown content
  order: number;
  createdAt: number;
}

interface Progress {
  id: string; // courseId-chapterId or courseId-chapterId-subchapterId
  courseId: string;
  chapterId: string;
  subchapterId?: string;
  completed: boolean;
  lastRead: number;
}

interface Note {
  id: string;
  courseId: string;
  chapterId?: string;
  subchapterId?: string;
  title: string;
  content: string;
  createdAt: number;
}

const db = new Dexie('CourseDatabase') as Dexie & {
  courses: EntityTable<Course, 'id'>;
  parts: EntityTable<Part, 'id'>;
  chapters: EntityTable<Chapter, 'id'>;
  subchapters: EntityTable<Subchapter, 'id'>;
  progress: EntityTable<Progress, 'id'>;
  notes: EntityTable<Note, 'id'>;
};

db.version(3).stores({
  courses: 'id, title, createdAt, order',
  parts: 'id, courseId, partId, order',
  chapters: 'id, courseId, chapterId, partId, order',
  subchapters: 'id, courseId, chapterId, subchapterId, order',
  progress: 'id, courseId, chapterId, subchapterId, completed, lastRead',
  notes: 'id, courseId, chapterId, subchapterId, title, createdAt'
});

export { db };
export type { Course, Part, Chapter, Subchapter, Progress, Note };
