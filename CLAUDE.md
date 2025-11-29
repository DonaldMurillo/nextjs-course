# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Architecture

This is a Next.js 16 course learning platform with offline-first capabilities using IndexedDB (Dexie).

### Data Flow

1. **Course Content**: Static markdown files in `content/courses/[course-name]/chapters/` with metadata in `metadata.json`
2. **Server Loading**: `lib/courseLibrary.ts` reads course files from disk, exposed via `/api/courses/available`
3. **Client Storage**: Courses are imported into IndexedDB (`lib/db.ts`) for offline access
4. **Live Queries**: Components use `useLiveQuery` from Dexie to reactively read from IndexedDB

### Key Data Models (lib/db.ts)

- **Course**: id, title, description, order, author, tags, difficulty, estimatedHours, version, nextjsVersion, prerequisites
- **Part**: courseId, partId, title, order (groups chapters into sections)
- **Chapter**: courseId, chapterId, partId, title, content (markdown), order
- **Subchapter**: courseId, chapterId, subchapterId, title, content (markdown), order
- **Progress**: courseId, chapterId, subchapterId (optional), completed, lastRead
- **Note**: courseId, chapterId, title, content

### Routing

- `/` - Dashboard with course list (client component)
- `/course/[id]?chapter=&subchapter=` - Course viewer with parts/chapter/subchapter navigation
- `/api/courses/available` - Returns courses from `content/` directory

### Course UI Structure

The course viewer sidebar displays:
1. **Parts** - Collapsible sections grouping related chapters
2. **Chapters** - Main content units within each part
3. **Subchapters** - Optional nested content within chapters

### UI Components

Uses shadcn/ui (new-york style) with Radix primitives. Components in `components/ui/` follow shadcn patterns. Add new components with:
```bash
npx shadcn-ui@latest add [component-name]
```

### Adding New Courses

Create a folder in `content/courses/` with:
- `metadata.json` - Course metadata, parts, and chapter list
- `chapters/` - Markdown files for chapters and subchapters

Example metadata.json structure:
```json
{
  "id": "course-id",
  "title": "Course Title",
  "description": "Description",
  "author": "Author Name",
  "version": "1.0.0",
  "nextjsVersion": "15+",
  "order": 1,
  "tags": ["nextjs", "react"],
  "difficulty": "beginner-to-intermediate",
  "estimatedHours": 20,
  "prerequisites": ["Basic programming knowledge"],
  "parts": [
    { "id": "part-1", "title": "Foundations", "order": 1 },
    { "id": "part-2", "title": "Advanced Topics", "order": 2 }
  ],
  "chapters": [
    {
      "id": "01-intro",
      "title": "Introduction",
      "part": "part-1",
      "order": 1,
      "file": "01-intro.md",
      "subchapters": [
        { "id": "01.1-getting-started", "title": "Getting Started", "order": 1, "file": "01.1-getting-started.md" }
      ]
    }
  ]
}
```
