"use client"

import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { useParams, useSearchParams } from "next/navigation"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { Skeleton } from "@/components/ui/skeleton"
import { NoteTaker } from "@/components/NoteTaker"
import { CourseHeader } from "@/components/CourseHeader"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"

export default function CoursePage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const courseId = params.id as string
    const chapterId = searchParams.get('chapter')

    const [isNotesPanelCollapsed, setIsNotesPanelCollapsed] = useState(false)

    const course = useLiveQuery(() => db.courses.get(courseId), [courseId])
    const chapters = useLiveQuery(
        () => db.chapters.where('courseId').equals(courseId).sortBy('order'),
        [courseId]
    )
    const progress = useLiveQuery(() => db.progress.toArray(), [])

    // Get current chapter or first chapter
    const currentChapter = chapters?.find(c => c.chapterId === chapterId) || chapters?.[0]

    const isChapterComplete = (chapId: string) => {
        return progress?.some(p => p.chapterId === chapId && p.completed) ?? false
    }

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
                title={course.title}
            />

            <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
                {/* Chapter Sidebar */}
                <div className="w-full lg:w-64 flex-shrink-0 overflow-y-auto">
                    <h3 className="font-semibold mb-4">Chapters</h3>
                    <div className="space-y-2">
                        {chapters.map((chapter) => (
                            <Link
                                key={chapter.id}
                                href={`/course/${courseId}?chapter=${chapter.chapterId}`}
                                className="block"
                            >
                                <Card className={`cursor-pointer transition-all hover:shadow-md ${currentChapter.id === chapter.id ? 'border-primary bg-primary/5' : ''
                                    }`}>
                                    <CardContent className="p-3 flex items-start gap-2">
                                        {isChapterComplete(chapter.chapterId) ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium line-clamp-2">{chapter.title}</p>
                                            <p className="text-xs text-muted-foreground">Chapter {chapter.order}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto pr-4">
                    <article className="max-w-3xl mx-auto pb-20">
                        <h2 className="text-2xl font-bold mb-4">{currentChapter.title}</h2>
                        <MarkdownRenderer content={currentChapter.content} />
                    </article>
                </div>

                {/* Notes Sidebar */}
                <div className={`border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6 flex flex-col h-full bg-background transition-all duration-300 ${isNotesPanelCollapsed ? 'w-auto lg:w-20' : 'w-full lg:w-[400px]'
                    }`}>
                    <NoteTaker
                        courseId={courseId}
                        chapterId={currentChapter.chapterId}
                        onCollapseChange={setIsNotesPanelCollapsed}
                    />
                </div>
            </div>
        </div>
    )
}
