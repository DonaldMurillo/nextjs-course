"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { useParams } from "next/navigation"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

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
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="pl-0">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Courses
                    </Button>
                </Link>
            </div>

            <article>
                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                {course.description && (
                    <p className="text-xl text-muted-foreground mb-8 border-b pb-8">
                        {course.description}
                    </p>
                )}

                <MarkdownRenderer content={course.content} />
            </article>
        </div>
    )
}
