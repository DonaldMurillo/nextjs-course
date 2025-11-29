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
import { CheckCircle2, Circle, ChevronRight, ChevronDown } from "lucide-react"
import Link from "next/link"

export default function CoursePage() {
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

    // Get current chapter or first chapter
    const currentChapter = chapters?.find(c => c.chapterId === chapterId) || chapters?.[0]
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
        : `${currentChapterNumber}. ${currentChapter?.title || ''}`

    if (!course || !chapters || !currentChapter) {
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
                chapterId={currentChapter.chapterId}
                subchapterId={currentSubchapter?.subchapterId}
                title={course.title}
            />

            <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
                {/* Chapter Sidebar */}
                <div className="w-full lg:w-72 flex-shrink-0 overflow-y-auto">
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
                                                const isCurrentChapter = currentChapter.id === chapter.id && !currentSubchapter
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
                                const isCurrentChapter = currentChapter.id === chapter.id && !currentSubchapter
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
                    <article className="max-w-3xl mx-auto pb-20">
                        <h2 className="text-2xl font-bold mb-4">{displayTitle}</h2>
                        <MarkdownRenderer content={displayContent} />
                    </article>
                </div>

                {/* Notes Sidebar */}
                <div className={`border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6 flex flex-col h-full bg-background transition-all duration-300 ${isNotesPanelCollapsed ? 'w-auto lg:w-20' : 'w-full lg:w-[400px]'
                    }`}>
                    <NoteTaker
                        courseId={courseId}
                        chapterId={currentChapter.chapterId}
                        subchapterId={currentSubchapter?.subchapterId}
                        onCollapseChange={setIsNotesPanelCollapsed}
                    />
                </div>
            </div>
        </div>
    )
}
