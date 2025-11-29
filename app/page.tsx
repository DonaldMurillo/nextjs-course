"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, BookOpen } from "lucide-react"

export default function Home() {
  const courses = useLiveQuery(() => db.courses.toArray())

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Link href="/create-course">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <Link key={course.id} href={`/course/${course.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>
                  Created on {new Date(course.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {course.description}
                </p>
                <div className="mt-4 flex items-center text-primary">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Start Learning</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {courses?.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            <p>No courses found. Create your first course to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
