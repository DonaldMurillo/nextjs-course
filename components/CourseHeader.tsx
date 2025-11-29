"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react"

interface CourseHeaderProps {
    courseId: string
    chapterId: string
    title: string
}

export function CourseHeader({ courseId, chapterId, title }: CourseHeaderProps) {
    const router = useRouter()
    const chapters = useLiveQuery(
        () => db.chapters.where('courseId').equals(courseId).sortBy('order'),
        [courseId]
    )
    const progress = useLiveQuery(
        () => db.progress.get(`${courseId}-${chapterId}`),
        [courseId, chapterId]
    )

    const currentIndex = chapters?.findIndex(c => c.chapterId === chapterId) ?? -1
    const prevChapter = currentIndex > 0 ? chapters?.[currentIndex - 1] : null
    const nextChapter = currentIndex >= 0 && currentIndex < (chapters?.length ?? 0) - 1 ? chapters?.[currentIndex + 1] : null

    const toggleCompletion = async () => {
        const progressId = `${courseId}-${chapterId}`
        if (progress) {
            await db.progress.update(progressId, { completed: !progress.completed })
        } else {
            await db.progress.add({
                id: progressId,
                courseId,
                chapterId,
                completed: true,
                lastRead: Date.now()
            })
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
                    disabled={!prevChapter}
                    onClick={() => prevChapter && router.push(`/course/${courseId}?chapter=${prevChapter.chapterId}`)}
                    className="hover:bg-accent transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                </Button>
                <Button
                    size="sm"
                    disabled={!nextChapter}
                    onClick={() => nextChapter && router.push(`/course/${courseId}?chapter=${nextChapter.chapterId}`)}
                    className="hover:bg-primary/90 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    )
}
