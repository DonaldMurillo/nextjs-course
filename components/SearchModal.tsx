"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, FileText, BookOpen, Hash, ArrowRight, Command, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

// PageFind types
interface PagefindResult {
    id: string
    data: () => Promise<PagefindResultData>
}

interface PagefindResultData {
    url: string
    content: string
    excerpt: string
    meta: {
        title: string
        type: 'course' | 'chapter' | 'subchapter'
        courseId: string
        courseTitle: string
        chapterId?: string
        chapterTitle?: string
        subchapterId?: string
        description?: string
    }
}

interface PagefindSearchResponse {
    results: PagefindResult[]
}

interface Pagefind {
    init: () => Promise<void>
    search: (query: string, options?: { filters?: Record<string, string> }) => Promise<PagefindSearchResponse>
}

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
    excerpt?: string
}

interface SearchModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [pagefind, setPagefind] = useState<Pagefind | null>(null)
    const [pagefindError, setPagefindError] = useState<string | null>(null)
    const searchTimeout = useRef<NodeJS.Timeout | null>(null)
    const prevOpen = useRef(open)
    const resultRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

    // Initialize PageFind
    useEffect(() => {
        async function loadPagefind() {
            try {
                // @ts-expect-error - Dynamic import with webpackIgnore
                const pf = await import(/* webpackIgnore: true */ '/pagefind/pagefind.js')
                await pf.init()
                setPagefind(pf as Pagefind)
                setPagefindError(null)
            } catch (error) {
                console.error('Failed to load PageFind:', error)
                setPagefindError('Search index not available. Run build first.')
            }
        }

        loadPagefind()
    }, [])

    // Reset state when modal opens
    useEffect(() => {
        if (open && !prevOpen.current) {
            setQuery("")
            setSelectedIndex(0)
            setResults([])
        }
        prevOpen.current = open
    }, [open])

    // Debounced search
    useEffect(() => {
        if (!pagefind || !query.trim()) {
            setResults([])
            return
        }

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current)
        }

        searchTimeout.current = setTimeout(async () => {
            setLoading(true)
            try {
                const response = await pagefind.search(query)
                
                // Load the first 15 results
                const loadedResults = await Promise.all(
                    response.results.slice(0, 15).map(async (result) => {
                        const data = await result.data()
                        return {
                            type: data.meta.type,
                            id: result.id,
                            title: data.meta.title,
                            description: data.meta.description,
                            courseId: data.meta.courseId,
                            courseTitle: data.meta.courseTitle,
                            chapterId: data.meta.chapterId,
                            chapterTitle: data.meta.chapterTitle,
                            subchapterId: data.meta.subchapterId,
                            url: data.url,
                            excerpt: data.excerpt
                        } as SearchResult
                    })
                )
                
                setResults(loadedResults)
                setSelectedIndex(0)
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setLoading(false)
            }
        }, 150) // 150ms debounce

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current)
            }
        }
    }, [query, pagefind])

    const navigateToResult = useCallback((result: SearchResult) => {
        // The URLs from pagefind don't include basePath, just use them directly
        // Append the search query as a highlight param
        const separator = result.url.includes('?') ? '&' : '?'
        const urlWithHighlight = query.trim() 
            ? `${result.url}${separator}highlight=${encodeURIComponent(query.trim())}`
            : result.url
        console.log('Navigating to:', urlWithHighlight)
        router.push(urlWithHighlight)
        onOpenChange(false)
    }, [router, onOpenChange, query])

    // Scroll selected item into view
    useEffect(() => {
        const selectedElement = resultRefs.current.get(selectedIndex)
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
    }, [selectedIndex])

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
            navigateToResult(results[selectedIndex])
        }
    }, [results, selectedIndex, navigateToResult])

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
                    {loading && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                    )}
                    <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 font-mono text-xs text-muted-foreground ml-2">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {pagefindError ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="text-sm">{pagefindError}</p>
                        </div>
                    ) : query.trim() === '' ? (
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
                    ) : results.length === 0 && !loading ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <p>No results found for &quot;{query}&quot;</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {results.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    ref={(el) => {
                                        if (el) resultRefs.current.set(index, el)
                                        else resultRefs.current.delete(index)
                                    }}
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
                                        {result.excerpt && (
                                            <div 
                                                className="text-xs text-muted-foreground mt-1 line-clamp-2"
                                                dangerouslySetInnerHTML={{ __html: result.excerpt }}
                                            />
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
