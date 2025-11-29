import fs from 'fs';
import path from 'path';

export interface ChapterMetadata {
  id: string;
  title: string;
  order: number;
  file: string;
}

export interface CourseMetadata {
  id: string;
  title: string;
  description: string;
  author?: string;
  order?: number;
  tags?: string[];
  difficulty?: string;
  estimatedHours?: number;
  chapters: ChapterMetadata[];
}

export interface AvailableCourse extends CourseMetadata {
  chaptersContent: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
  }>;
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

        const chaptersContent = [];
        for (const chapter of metadata.chapters) {
          const chapterFilePath = path.join(chaptersPath, chapter.file);
          if (fs.existsSync(chapterFilePath)) {
            const content = fs.readFileSync(chapterFilePath, 'utf-8');
            chaptersContent.push({
              id: chapter.id,
              title: chapter.title,
              content,
              order: chapter.order
            });
          }
        }

        courses.push({
          ...metadata,
          chaptersContent
        });
      } catch (error) {
        console.error(`Error loading course ${folder}:`, error);
      }
    }
  }

  return courses.sort((a, b) => (a.order || 999) - (b.order || 999));
}
