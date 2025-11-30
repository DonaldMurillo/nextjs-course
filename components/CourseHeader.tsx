"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLiveQuery } from "dexie-react-hooks"
import { db, type Chapter, type Subchapter } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react"

interface CourseHeaderProps {
    courseId: string
    chapterId: string
    subchapterId?: string
    title: string
}

type NavigationItem = {
    type: 'chapter' | 'subchapter'
    chapterId: string
    subchapterId?: string
    title: string
}

export function CourseHeader({ courseId, chapterId, subchapterId, title }: CourseHeaderProps) {
    const router = useRouter()
    const chapters = useLiveQuery(
        () => db.chapters.where('courseId').equals(courseId).sortBy('order'),
        [courseId]
    )
    const subchapters = useLiveQuery(
        () => db.subchapters.where('courseId').equals(courseId).sortBy('order'),
        [courseId]
    )

    // Build flat navigation list: chapter -> subchapters -> next chapter -> subchapters...
    const navigationItems: NavigationItem[] = []
    if (chapters && subchapters) {
        for (const chapter of chapters) {
            navigationItems.push({
                type: 'chapter',
                chapterId: chapter.chapterId,
                title: chapter.title
            })
            const chapterSubchapters = subchapters
                .filter(s => s.chapterId === chapter.chapterId)
                .sort((a, b) => a.order - b.order)
            for (const sub of chapterSubchapters) {
                navigationItems.push({
                    type: 'subchapter',
                    chapterId: chapter.chapterId,
                    subchapterId: sub.subchapterId,
                    title: sub.title
                })
            }
        }
    }

    // Find current position in navigation
    const currentIndex = navigationItems.findIndex(item =>
        item.chapterId === chapterId &&
        (subchapterId ? item.subchapterId === subchapterId : item.type === 'chapter')
    )

    const prevItem = currentIndex > 0 ? navigationItems[currentIndex - 1] : null
    const nextItem = currentIndex >= 0 && currentIndex < navigationItems.length - 1
        ? navigationItems[currentIndex + 1]
        : null

    const progressId = subchapterId
        ? `${courseId}-${chapterId}-${subchapterId}`
        : `${courseId}-${chapterId}`

    const progress = useLiveQuery(
        () => db.progress.get(progressId),
        [progressId]
    )

    const toggleCompletion = async () => {
        if (progress) {
            await db.progress.update(progressId, { completed: !progress.completed })
        } else {
            await db.progress.add({
                id: progressId,
                courseId,
                chapterId,
                subchapterId,
                completed: true,
                lastRead: Date.now()
            })
        }
    }

    const navigateTo = (item: NavigationItem) => {
        if (item.type === 'subchapter') {
            router.push(`/course/${courseId}?chapter=${item.chapterId}&subchapter=${item.subchapterId}`)
        } else {
            router.push(`/course/${courseId}?chapter=${item.chapterId}`)
        }
    }

    return (
        <div className="border-b pb-3 sm:pb-4 mb-4 sm:mb-6">
            {/* Top row: Back button and title */}
            <div className="flex items-center gap-2 sm:gap-4 mb-3">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="hover:bg-accent h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-base sm:text-xl font-bold truncate flex-1">
                    {title}
                </h1>
            </div>
            
            {/* Bottom row: Action buttons - responsive layout */}
            <div className="flex flex-wrap items-center gap-2 pl-0 sm:pl-12">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleCompletion}
                    className="gap-1.5 sm:gap-2 hover:bg-accent transition-colors cursor-pointer text-xs sm:text-sm h-8 sm:h-9"
                >
                    {progress?.completed ? (
                        <>
                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                            <span className="hidden xs:inline">Completed</span>
                            <span className="xs:hidden">Done</span>
                        </>
                    ) : (
                        <>
                            <Circle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Mark Complete</span>
                            <span className="xs:hidden">Complete</span>
                        </>
                    )}
                </Button>

                <div className="flex gap-1.5 sm:gap-2 ml-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!prevItem}
                        onClick={() => prevItem && navigateTo(prevItem)}
                        className="hover:bg-accent transition-colors cursor-pointer disabled:cursor-not-allowed h-8 sm:h-9 px-2 sm:px-3"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Prev</span>
                    </Button>
                    <Button
                        size="sm"
                        disabled={!nextItem}
                        onClick={() => nextItem && navigateTo(nextItem)}
                        className="hover:bg-primary/90 transition-colors cursor-pointer disabled:cursor-not-allowed h-8 sm:h-9 px-2 sm:px-3"
                    >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
