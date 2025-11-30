"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, FileText, BookOpen, Hash, ArrowRight, Command } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface SearchResult {
    type: 'course' | 'chapter' | 'subchapter'
    id: string
    title: string
    description?: string
    courseId: string
    courseTitle: string
    chapterId?: string
    chapterTitle?: string
    subchapterId?: string
    url: string
    matchedContent?: string
}

interface SearchModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
    const router = useRouter()
    const [query, setQueryState] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [prevOpen, setPrevOpen] = useState(open)

    // Wrap setQuery to also reset selectedIndex
    const setQuery = (value: string) => {
        setQueryState(value)
        setSelectedIndex(0)
    }

    const courses = useLiveQuery(() => db.courses.toArray())
    const chapters = useLiveQuery(() => db.chapters.toArray())
    const subchapters = useLiveQuery(() => db.subchapters.toArray())

    // Reset state when modal opens (using derived state pattern)
    if (open && !prevOpen) {
        setQuery("")
        setSelectedIndex(0)
    }
    if (open !== prevOpen) {
        setPrevOpen(open)
    }

    // Search logic
    const results = useMemo((): SearchResult[] => {
        if (!query.trim() || !courses || !chapters) return []

        const searchTerm = query.toLowerCase().trim()
        const results: SearchResult[] = []

        // Search courses
        for (const course of courses) {
            const titleMatch = course.title.toLowerCase().includes(searchTerm)
            const descMatch = course.description?.toLowerCase().includes(searchTerm)

            if (titleMatch || descMatch) {
                results.push({
                    type: 'course',
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    courseId: course.id,
                    courseTitle: course.title,
                    url: `/course/${course.id}`
                })
            }
        }

        // Search chapters
        for (const chapter of chapters) {
            const course = courses.find(c => c.id === chapter.courseId)
            if (!course) continue

            const titleMatch = chapter.title.toLowerCase().includes(searchTerm)
            const contentMatch = chapter.content?.toLowerCase().includes(searchTerm)

            if (titleMatch || contentMatch) {
                let matchedContent: string | undefined
                if (contentMatch && chapter.content) {
                    const idx = chapter.content.toLowerCase().indexOf(searchTerm)
                    const start = Math.max(0, idx - 40)
                    const end = Math.min(chapter.content.length, idx + searchTerm.length + 40)
                    matchedContent = (start > 0 ? '...' : '') + 
                        chapter.content.slice(start, end).replace(/\n/g, ' ') + 
                        (end < chapter.content.length ? '...' : '')
                }

                results.push({
                    type: 'chapter',
                    id: chapter.id,
                    title: chapter.title,
                    courseId: course.id,
                    courseTitle: course.title,
                    chapterId: chapter.chapterId,
                    url: `/course/${course.id}?chapter=${chapter.chapterId}`,
                    matchedContent
                })
            }
        }

        // Search subchapters
        if (subchapters) {
            for (const subchapter of subchapters) {
                const course = courses.find(c => c.id === subchapter.courseId)
                const chapter = chapters.find(c => c.chapterId === subchapter.chapterId)
                if (!course || !chapter) continue

                const titleMatch = subchapter.title.toLowerCase().includes(searchTerm)
                const contentMatch = subchapter.content?.toLowerCase().includes(searchTerm)

                if (titleMatch || contentMatch) {
                    let matchedContent: string | undefined
                    if (contentMatch && subchapter.content) {
                        const idx = subchapter.content.toLowerCase().indexOf(searchTerm)
                        const start = Math.max(0, idx - 40)
                        const end = Math.min(subchapter.content.length, idx + searchTerm.length + 40)
                        matchedContent = (start > 0 ? '...' : '') + 
                            subchapter.content.slice(start, end).replace(/\n/g, ' ') + 
                            (end < subchapter.content.length ? '...' : '')
                    }

                    results.push({
                        type: 'subchapter',
                        id: subchapter.id,
                        title: subchapter.title,
                        courseId: course.id,
                        courseTitle: course.title,
                        chapterId: chapter.chapterId,
                        chapterTitle: chapter.title,
                        subchapterId: subchapter.subchapterId,
                        url: `/course/${course.id}?chapter=${chapter.chapterId}&subchapter=${subchapter.subchapterId}`,
                        matchedContent
                    })
                }
            }
        }

        // Sort: courses first, then chapters, then subchapters
        // Within each type, prioritize title matches over content matches
        return results.slice(0, 20) // Limit results
    }, [query, courses, chapters, subchapters])

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(i => Math.min(i + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            e.preventDefault()
            router.push(results[selectedIndex].url)
            onOpenChange(false)
        }
    }, [results, selectedIndex, router, onOpenChange])

    const navigateToResult = (result: SearchResult) => {
        router.push(result.url)
        onOpenChange(false)
    }

    const getIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'course':
                return <BookOpen className="h-4 w-4 text-blue-500" />
            case 'chapter':
                return <FileText className="h-4 w-4 text-green-500" />
            case 'subchapter':
                return <Hash className="h-4 w-4 text-purple-500" />
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
                <DialogTitle className="sr-only">Search</DialogTitle>
                {/* Search Input */}
                <div className="flex items-center border-b px-4 py-3">
                    <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search courses, chapters, content..."
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base"
                        autoFocus
                    />
                    <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 font-mono text-xs text-muted-foreground ml-2">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {query.trim() === '' ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="text-sm">Start typing to search across all courses and content</p>
                            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 rounded border bg-muted">↑</kbd>
                                    <kbd className="px-1.5 py-0.5 rounded border bg-muted">↓</kbd>
                                    to navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 rounded border bg-muted">↵</kbd>
                                    to select
                                </span>
                            </div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <p>No results found for &quot;{query}&quot;</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {results.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => navigateToResult(result)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={cn(
                                        "w-full px-4 py-3 flex items-start gap-3 text-left transition-colors",
                                        selectedIndex === index 
                                            ? "bg-accent" 
                                            : "hover:bg-accent/50"
                                    )}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {getIcon(result.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium truncate">
                                                {result.title}
                                            </span>
                                            {selectedIndex === index && (
                                                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                                            {result.type === 'course' && result.description}
                                            {result.type === 'chapter' && (
                                                <span>{result.courseTitle}</span>
                                            )}
                                            {result.type === 'subchapter' && (
                                                <span>{result.courseTitle} → {result.chapterTitle}</span>
                                            )}
                                        </div>
                                        {result.matchedContent && (
                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                                                &quot;{result.matchedContent}&quot;
                                            </div>
                                        )}
                                    </div>
                                    <div className="shrink-0">
                                        <span className={cn(
                                            "text-[10px] px-1.5 py-0.5 rounded",
                                            result.type === 'course' && "bg-blue-500/10 text-blue-500",
                                            result.type === 'chapter' && "bg-green-500/10 text-green-500",
                                            result.type === 'subchapter' && "bg-purple-500/10 text-purple-500"
                                        )}>
                                            {result.type}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {results.length > 0 && (
                    <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
                        <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
                        <span className="hidden sm:flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 rounded border bg-muted">↵</kbd>
                            to open
                        </span>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

// Hook for global keyboard shortcut
export function useSearchModal() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // CMD+K or CTRL+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setOpen(true)
            }
            // Also support "/" when not in an input
            if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
                e.preventDefault()
                setOpen(true)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return { open, setOpen }
}

// Search trigger button component
export function SearchTrigger({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border rounded-lg hover:bg-accent transition-colors"
        >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                <Command className="h-3 w-3" />K
            </kbd>
        </button>
    )
}
