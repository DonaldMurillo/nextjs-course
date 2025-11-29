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

- **Course**: id, title, description, order, author, tags, difficulty, estimatedHours
- **Chapter**: courseId, chapterId, title, content (markdown), order
- **Progress**: courseId, chapterId, completed, lastRead
- **Note**: courseId, chapterId, title, content

### Routing

- `/` - Dashboard with course list (client component)
- `/course/[id]?chapter=` - Course viewer with chapter navigation
- `/api/courses/available` - Returns courses from `content/` directory

### UI Components

Uses shadcn/ui (new-york style) with Radix primitives. Components in `components/ui/` follow shadcn patterns. Add new components with:
```bash
npx shadcn-ui@latest add [component-name]
```

### Adding New Courses

Create a folder in `content/courses/` with:
- `metadata.json` - Course metadata and chapter list
- `chapters/` - Markdown files for each chapter

Example metadata.json structure:
```json
{
  "id": "course-id",
  "title": "Course Title",
  "description": "Description",
  "chapters": [
    { "id": "01-intro", "title": "Introduction", "order": 1, "file": "01-intro.md" }
  ]
}
```
