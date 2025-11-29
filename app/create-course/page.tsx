"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Construction } from "lucide-react"

export default function CreateCoursePage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-2xl">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="pl-0 hover:bg-accent transition-colors cursor-pointer">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Courses
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="h-5 w-5" />
                        Create Course - Coming Soon
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        The course creation feature is being redesigned to support multi-chapter courses.
                    </p>
                    <p className="text-muted-foreground mt-4">
                        For now, please add courses by creating markdown files in the{" "}
                        <code className="bg-muted px-1 py-0.5 rounded">content/courses/</code> directory
                        and importing them via the Settings menu (click the avatar).
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
