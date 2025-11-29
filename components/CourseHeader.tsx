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
        <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="hover:bg-accent">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold truncate max-w-[300px] md:max-w-[600px]">
                    {title}
                </h1>
            </div>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleCompletion}
                    className="gap-2 hover:bg-accent transition-colors cursor-pointer"
                >
                    {progress?.completed ? (
                        <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Completed
                        </>
                    ) : (
                        <>
                            <Circle className="h-4 w-4" />
                            Mark Complete
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={!prevItem}
                    onClick={() => prevItem && navigateTo(prevItem)}
                    className="hover:bg-accent transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                </Button>
                <Button
                    size="sm"
                    disabled={!nextItem}
                    onClick={() => nextItem && navigateTo(nextItem)}
                    className="hover:bg-primary/90 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    )
}
