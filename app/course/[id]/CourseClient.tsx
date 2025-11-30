"use client"

import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { useParams, useSearchParams } from "next/navigation"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { Skeleton } from "@/components/ui/skeleton"
import { NoteTaker } from "@/components/NoteTaker"
import { CourseHeader } from "@/components/CourseHeader"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CheckCircle2, Circle, ChevronRight, ChevronDown, ChevronLeft, BookOpen, StickyNote, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CourseClient() {
    const params = useParams()
    const searchParams = useSearchParams()
    const courseId = params.id as string
    const chapterId = searchParams.get('chapter')
    const subchapterId = searchParams.get('subchapter')

    const [isNotesPanelCollapsed, setIsNotesPanelCollapsed] = useState(false)
    const [openParts, setOpenParts] = useState<Set<string>>(new Set())

    const course = useLiveQuery(() => db.courses.get(courseId), [courseId])
    const parts = useLiveQuery(
        () => db.parts.where('courseId').equals(courseId).sortBy('order'),
        [courseId]
    )
    const chapters = useLiveQuery(
        () => db.chapters.where('courseId').equals(courseId).sortBy('order'),
        [courseId]
    )
    const subchapters = useLiveQuery(
        () => db.subchapters.where('courseId').equals(courseId).sortBy('order'),
        [courseId]
    )
    const progress = useLiveQuery(() => db.progress.toArray(), [])

    // Get current chapter (don't default to first one anymore)
    const currentChapter = chapters?.find(c => c.chapterId === chapterId)

    // Get current subchapter if specified
    const currentSubchapter = subchapterId
        ? subchapters?.find(s => s.subchapterId === subchapterId && s.chapterId === currentChapter?.chapterId)
        : null

    // Auto-expand the part containing the current chapter
    const currentPartId = currentChapter?.partId
    if (currentPartId && !openParts.has(currentPartId) && parts?.length) {
        setOpenParts(new Set([...openParts, currentPartId]))
    }

    const togglePart = (partId: string) => {
        const newOpenParts = new Set(openParts)
        if (newOpenParts.has(partId)) {
            newOpenParts.delete(partId)
        } else {
            newOpenParts.add(partId)
        }
        setOpenParts(newOpenParts)
    }

    const isChapterComplete = (chapId: string) => {
        return progress?.some(p => p.chapterId === chapId && !p.subchapterId && p.completed) ?? false
    }

    const isSubchapterComplete = (chapId: string, subchapId: string) => {
        return progress?.some(p => p.chapterId === chapId && p.subchapterId === subchapId && p.completed) ?? false
    }

    const getChaptersForPart = (partId: string) => {
        return chapters?.filter(c => c.partId === partId) || []
    }

    const getSubchaptersForChapter = (chapId: string) => {
        return subchapters?.filter(s => s.chapterId === chapId) || []
    }

    // Get chapter number (based on order)
    const getChapterNumber = (chapterOrder: number) => chapterOrder

    // Get subchapter number (e.g., "3.2" for chapter 3, subchapter 2)
    const getSubchapterNumber = (chapterOrder: number, subchapterOrder: number) =>
        `${chapterOrder}.${subchapterOrder}`

    // Determine what content to display
    const displayContent = currentSubchapter?.content || currentChapter?.content || ''
    const currentChapterNumber = currentChapter?.order || 1
    const displayTitle = currentSubchapter
        ? `${getSubchapterNumber(currentChapterNumber, currentSubchapter.order)} ${currentSubchapter.title}`
        : currentChapter
            ? `${currentChapterNumber}. ${currentChapter.title}`
            : course?.title || 'Course Overview'

    // Build flat navigation list (chapters and subchapters in order)
    type NavItem = {
        type: 'chapter' | 'subchapter'
        chapterId: string
        subchapterId?: string
        title: string
        number: string
    }

    const navItems: NavItem[] = []
    if (chapters && subchapters) {
        const sortedChapters = [...chapters].sort((a, b) => a.order - b.order)
        for (const chapter of sortedChapters) {
            navItems.push({
                type: 'chapter',
                chapterId: chapter.chapterId,
                title: chapter.title,
                number: `${chapter.order}`
            })
            const chapterSubs = subchapters
                .filter(s => s.chapterId === chapter.chapterId)
                .sort((a, b) => a.order - b.order)
            for (const sub of chapterSubs) {
                navItems.push({
                    type: 'subchapter',
                    chapterId: chapter.chapterId,
                    subchapterId: sub.subchapterId,
                    title: sub.title,
                    number: `${chapter.order}.${sub.order}`
                })
            }
        }
    }

    // Find current index and prev/next items
    const currentNavIndex = navItems.findIndex(item => {
        if (currentSubchapter) {
            return item.type === 'subchapter' &&
                item.chapterId === currentChapter?.chapterId &&
                item.subchapterId === currentSubchapter.subchapterId
        }
        return item.type === 'chapter' && item.chapterId === currentChapter?.chapterId
    })

    const prevItem = currentNavIndex > 0 ? navItems[currentNavIndex - 1] : null
    const nextItem = currentNavIndex < navItems.length - 1 ? navItems[currentNavIndex + 1] :
        (currentNavIndex === -1 && navItems.length > 0) ? navItems[0] : null

    const getNavUrl = (item: NavItem) => {
        if (item.type === 'subchapter') {
            return `/course/${courseId}?chapter=${item.chapterId}&subchapter=${item.subchapterId}`
        }
        return `/course/${courseId}?chapter=${item.chapterId}`
    }

    if (!course || !chapters) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 px-4 max-w-[1600px] h-[calc(100vh-4rem)] flex flex-col">
            <CourseHeader
                courseId={courseId}
                chapterId={currentChapter?.chapterId || ''}
                subchapterId={currentSubchapter?.subchapterId}
                title={course.title}
            />

            <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
                {/* Chapter Sidebar */}
                <div className="w-full lg:w-72 flex-shrink-0 overflow-y-auto hidden lg:block">
                    <Link href={`/course/${courseId}`} className="mb-4 block">
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <Home className="h-4 w-4" />
                            Course Home
                        </Button>
                    </Link>
                    <h3 className="font-semibold mb-4">Contents</h3>
                    <div className="space-y-1">
                        {parts && parts.length > 0 ? (
                            // Render with parts structure
                            parts.map((part) => (
                                <Collapsible
                                    key={part.id}
                                    open={openParts.has(part.partId)}
                                    onOpenChange={() => togglePart(part.partId)}
                                >
                                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 text-left hover:bg-muted rounded-md transition-colors">
                                        {openParts.has(part.partId) ? (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="font-medium text-sm">Part {part.order}: {part.title}</span>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pl-4">
                                        <div className="space-y-1 border-l border-border ml-2 pl-2">
                                            {getChaptersForPart(part.partId).map((chapter) => {
                                                const chapterSubchapters = getSubchaptersForChapter(chapter.chapterId)
                                                const isCurrentChapter = currentChapter?.id === chapter.id && !currentSubchapter
                                                const chapterNum = getChapterNumber(chapter.order)

                                                return (
                                                    <div key={chapter.id}>
                                                        <Link
                                                            href={`/course/${courseId}?chapter=${chapter.chapterId}`}
                                                            className={`flex items-start gap-2 p-2 rounded-md transition-colors hover:bg-muted ${isCurrentChapter ? 'bg-primary/10 text-primary' : ''
                                                                }`}
                                                        >
                                                            {isChapterComplete(chapter.chapterId) ? (
                                                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                            ) : (
                                                                <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                            )}
                                                            <span className="text-sm line-clamp-2">{chapterNum}. {chapter.title}</span>
                                                        </Link>

                                                        {/* Subchapters */}
                                                        {chapterSubchapters.length > 0 && (
                                                            <div className="ml-6 space-y-1 border-l border-border/50 pl-2">
                                                                {chapterSubchapters.map((subchapter) => {
                                                                    const isCurrentSubchapter = currentSubchapter?.id === subchapter.id
                                                                    const subchapterNum = getSubchapterNumber(chapter.order, subchapter.order)

                                                                    return (
                                                                        <Link
                                                                            key={subchapter.id}
                                                                            href={`/course/${courseId}?chapter=${chapter.chapterId}&subchapter=${subchapter.subchapterId}`}
                                                                            className={`flex items-start gap-2 p-1.5 rounded-md transition-colors hover:bg-muted ${isCurrentSubchapter ? 'bg-primary/10 text-primary' : ''
                                                                                }`}
                                                                        >
                                                                            {isSubchapterComplete(chapter.chapterId, subchapter.subchapterId) ? (
                                                                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                                                            ) : (
                                                                                <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                                            )}
                                                                            <span className="text-xs line-clamp-2">{subchapterNum} {subchapter.title}</span>
                                                                        </Link>
                                                                    )
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))
                        ) : (
                            // Fallback: render chapters without parts
                            chapters.map((chapter) => {
                                const chapterSubchapters = getSubchaptersForChapter(chapter.chapterId)
                                const isCurrentChapter = currentChapter?.id === chapter.id && !currentSubchapter
                                const chapterNum = getChapterNumber(chapter.order)

                                return (
                                    <div key={chapter.id}>
                                        <Link
                                            href={`/course/${courseId}?chapter=${chapter.chapterId}`}
                                            className={`flex items-start gap-2 p-2 rounded-md transition-colors hover:bg-muted ${isCurrentChapter ? 'bg-primary/10 text-primary' : ''
                                                }`}
                                        >
                                            {isChapterComplete(chapter.chapterId) ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                            )}
                                            <span className="text-sm line-clamp-2">{chapterNum}. {chapter.title}</span>
                                        </Link>

                                        {/* Subchapters */}
                                        {chapterSubchapters.length > 0 && (
                                            <div className="ml-6 space-y-1 border-l border-border/50 pl-2">
                                                {chapterSubchapters.map((subchapter) => {
                                                    const isCurrentSubchapter = currentSubchapter?.id === subchapter.id
                                                    const subchapterNum = getSubchapterNumber(chapter.order, subchapter.order)

                                                    return (
                                                        <Link
                                                            key={subchapter.id}
                                                            href={`/course/${courseId}?chapter=${chapter.chapterId}&subchapter=${subchapter.subchapterId}`}
                                                            className={`flex items-start gap-2 p-1.5 rounded-md transition-colors hover:bg-muted ${isCurrentSubchapter ? 'bg-primary/10 text-primary' : ''
                                                                }`}
                                                        >
                                                            {isSubchapterComplete(chapter.chapterId, subchapter.subchapterId) ? (
                                                                <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                                            ) : (
                                                                <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                            )}
                                                            <span className="text-xs line-clamp-2">{subchapterNum} {subchapter.title}</span>
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto pr-4">
                    {currentChapter ? (
                        <>
                            <article className="max-w-3xl mx-auto pb-8">
                                <h2 className="text-2xl font-bold mb-4">{displayTitle}</h2>
                                <MarkdownRenderer content={displayContent} />
                            </article>

                            {/* Chapter Navigation */}
                            <nav className="max-w-3xl mx-auto border-t pt-6 pb-12">
                                <div className="flex items-center justify-between gap-4">
                                    {prevItem ? (
                                        <Link href={getNavUrl(prevItem)} className="flex-1 max-w-[45%]">
                                            <Button variant="outline" className="w-full h-auto py-3 px-4 flex flex-col items-start gap-1 whitespace-normal">
                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <ChevronLeft className="h-3 w-3" />
                                                    Previous
                                                </span>
                                                <span className="text-sm font-medium text-left">
                                                    {prevItem.number}. {prevItem.title}
                                                </span>
                                            </Button>
                                        </Link>
                                    ) : (
                                        <div className="flex-1 max-w-[45%]" />
                                    )}

                                    {nextItem ? (
                                        <Link href={getNavUrl(nextItem)} className="flex-1 max-w-[45%]">
                                            <Button variant="outline" className="w-full h-auto py-3 px-4 flex flex-col items-end gap-1 whitespace-normal">
                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    Next
                                                    <ChevronRight className="h-3 w-3" />
                                                </span>
                                                <span className="text-sm font-medium text-right">
                                                    {nextItem.number}. {nextItem.title}
                                                </span>
                                            </Button>
                                        </Link>
                                    ) : (
                                        <div className="flex-1 max-w-[45%]" />
                                    )}
                                </div>
                            </nav>
                        </>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
                            <Tabs defaultValue="chapters" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-8">
                                    <TabsTrigger value="chapters" className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        Chapters
                                    </TabsTrigger>
                                    <TabsTrigger value="notes" className="flex items-center gap-2">
                                        <StickyNote className="h-4 w-4" />
                                        My Notes
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="chapters">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Course Content</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {parts && parts.length > 0 ? (
                                                parts.map((part) => (
                                                    <div key={part.id} className="space-y-2">
                                                        <h3 className="font-semibold text-lg text-muted-foreground">Part {part.order}: {part.title}</h3>
                                                        <div className="grid gap-2">
                                                            {getChaptersForPart(part.partId).map((chapter) => (
                                                                <Link
                                                                    key={chapter.id}
                                                                    href={`/course/${courseId}?chapter=${chapter.chapterId}`}
                                                                    className="block"
                                                                >
                                                                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                                                        <div className="flex items-center gap-3">
                                                                            {isChapterComplete(chapter.chapterId) ? (
                                                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                                            ) : (
                                                                                <Circle className="h-5 w-5 text-muted-foreground" />
                                                                            )}
                                                                            <div>
                                                                                <p className="font-medium">{chapter.order}. {chapter.title}</p>
                                                                            </div>
                                                                        </div>
                                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="grid gap-2">
                                                    {chapters.map((chapter) => (
                                                        <Link
                                                            key={chapter.id}
                                                            href={`/course/${courseId}?chapter=${chapter.chapterId}`}
                                                            className="block"
                                                        >
                                                            <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    {isChapterComplete(chapter.chapterId) ? (
                                                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                                    ) : (
                                                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                                                    )}
                                                                    <div>
                                                                        <p className="font-medium">{chapter.order}. {chapter.title}</p>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="notes">
                                    <div className="h-[600px]">
                                        <NoteTaker courseId={courseId} />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </div>

                {/* Notes Sidebar */}
                <div className={`border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6 flex flex-col h-full bg-background transition-all duration-300 ${isNotesPanelCollapsed ? 'w-auto lg:w-20' : 'w-full lg:w-[400px]'
                    }`}>
                    <NoteTaker
                        courseId={courseId}
                        chapterId={currentChapter?.chapterId}
                        subchapterId={currentSubchapter?.subchapterId}
                        onCollapseChange={setIsNotesPanelCollapsed}
                    />
                </div>
            </div>
        </div>
    )
}
