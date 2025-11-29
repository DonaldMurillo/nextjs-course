"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react"

interface CourseHeaderProps {
    courseId: string
    title: string
}

export function CourseHeader({ courseId, title }: CourseHeaderProps) {
    const router = useRouter()
    const courses = useLiveQuery(() => db.courses.toArray())
    const progress = useLiveQuery(() => db.progress.get(courseId), [courseId])

    const currentIndex = courses?.findIndex(c => c.id === courseId) ?? -1
    const prevCourse = currentIndex > 0 ? courses?.[currentIndex - 1] : null
    const nextCourse = currentIndex >= 0 && currentIndex < (courses?.length ?? 0) - 1 ? courses?.[currentIndex + 1] : null

    const toggleCompletion = async () => {
        if (progress) {
            await db.progress.update(courseId, { completed: !progress.completed })
        } else {
            await db.progress.add({
                id: courseId,
                completed: true,
                lastRead: Date.now()
            })
        }
    }

    return (
        <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <Button variant="ghost" size="icon">
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
                    className="gap-2"
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
                    disabled={!prevCourse}
                    onClick={() => prevCourse && router.push(`/course/${prevCourse.id}`)}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                </Button>
                <Button
                    size="sm"
                    disabled={!nextCourse}
                    onClick={() => nextCourse && router.push(`/course/${nextCourse.id}`)}
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    )
}
