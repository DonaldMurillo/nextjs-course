"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { useParams } from "next/navigation"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { Skeleton } from "@/components/ui/skeleton"
import { NoteTaker } from "@/components/NoteTaker"
import { CourseHeader } from "@/components/CourseHeader"

export default function CoursePage() {
    const params = useParams()
    const id = params.id as string

    const course = useLiveQuery(() => db.courses.get(id), [id])

    if (!course) {
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
            <CourseHeader courseId={id} title={course.title} />

            <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
                {/* Main Content */}
                <div className="flex-1 overflow-y-auto pr-4">
                    <article className="max-w-3xl mx-auto pb-20">
                        {course.description && (
                            <p className="text-xl text-muted-foreground mb-8 border-b pb-8">
                                {course.description}
                            </p>
                        )}
                        <MarkdownRenderer content={course.content} />
                    </article>
                </div>

                {/* Notes Sidebar */}
                <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6 flex flex-col h-full bg-background">
                    <NoteTaker courseId={id} />
                </div>
            </div>
        </div>
    )
}
