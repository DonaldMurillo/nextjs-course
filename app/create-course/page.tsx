"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateCoursePage() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !content) return

        setIsSubmitting(true)
        try {
            const id = crypto.randomUUID()
            await db.courses.add({
                id,
                title,
                description,
                content,
                createdAt: Date.now(),
            })
            router.push("/")
        } catch (error) {
            console.error("Failed to create course:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-2xl">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="pl-0">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Courses
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Course</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Course Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Introduction to Next.js"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief summary of the course..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Course Content (Markdown)</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="# Introduction\n\nWelcome to this course..."
                                className="font-mono min-h-[300px]"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Course"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
