import fs from 'fs';
import path from 'path';

export interface SubchapterMetadata {
  id: string;
  title: string;
  order: number;
  file: string;
}

export interface ChapterMetadata {
  id: string;
  title: string;
  part: string;
  order: number;
  file: string;
  subchapters?: SubchapterMetadata[];
}

export interface PartMetadata {
  id: string;
  title: string;
  order: number;
}

export interface CourseMetadata {
  id: string;
  title: string;
  description: string;
  author?: string;
  version?: string;
  nextjsVersion?: string;
  order?: number;
  tags?: string[];
  difficulty?: string;
  estimatedHours?: number;
  prerequisites?: string[];
  parts: PartMetadata[];
  chapters: ChapterMetadata[];
}

export interface SubchapterContent {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface ChapterContent {
  id: string;
  title: string;
  partId: string;
  content: string;
  order: number;
  subchapters: SubchapterContent[];
}

export interface AvailableCourse extends Omit<CourseMetadata, 'chapters'> {
  chaptersContent: ChapterContent[];
}

export async function getAvailableCourses(): Promise<AvailableCourse[]> {
  const coursesDir = path.join(process.cwd(), 'content', 'courses');

  if (!fs.existsSync(coursesDir)) {
    return [];
  }

  const courseFolders = fs.readdirSync(coursesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const courses: AvailableCourse[] = [];

  for (const folder of courseFolders) {
    const coursePath = path.join(coursesDir, folder);
    const metadataPath = path.join(coursePath, 'metadata.json');
    const chaptersPath = path.join(coursePath, 'chapters');

    if (fs.existsSync(metadataPath) && fs.existsSync(chaptersPath)) {
      try {
        const metadata: CourseMetadata = JSON.parse(
          fs.readFileSync(metadataPath, 'utf-8')
        );

        const chaptersContent: ChapterContent[] = [];

        for (const chapter of metadata.chapters) {
          const chapterFilePath = path.join(chaptersPath, chapter.file);
          let chapterContent = '';

          if (fs.existsSync(chapterFilePath)) {
            chapterContent = fs.readFileSync(chapterFilePath, 'utf-8');
          }

          // Load subchapters
          const subchaptersContent: SubchapterContent[] = [];
          if (chapter.subchapters) {
            for (const subchapter of chapter.subchapters) {
              const subchapterFilePath = path.join(chaptersPath, subchapter.file);
              if (fs.existsSync(subchapterFilePath)) {
                const content = fs.readFileSync(subchapterFilePath, 'utf-8');
                subchaptersContent.push({
                  id: subchapter.id,
                  title: subchapter.title,
                  content,
                  order: subchapter.order
                });
              }
            }
          }

          chaptersContent.push({
            id: chapter.id,
            title: chapter.title,
            partId: chapter.part,
            content: chapterContent,
            order: chapter.order,
            subchapters: subchaptersContent.sort((a, b) => a.order - b.order)
          });
        }

        courses.push({
          id: metadata.id,
          title: metadata.title,
          description: metadata.description,
          author: metadata.author,
          version: metadata.version,
          nextjsVersion: metadata.nextjsVersion,
          order: metadata.order,
          tags: metadata.tags,
          difficulty: metadata.difficulty,
          estimatedHours: metadata.estimatedHours,
          prerequisites: metadata.prerequisites,
          parts: metadata.parts || [],
          chaptersContent: chaptersContent.sort((a, b) => a.order - b.order)
        });
      } catch (error) {
        console.error(`Error loading course ${folder}:`, error);
      }
    }
  }

  return courses.sort((a, b) => (a.order || 999) - (b.order || 999));
}
