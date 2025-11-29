"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function Home() {
  const courses = useLiveQuery(() => db.courses.orderBy('order').toArray())
  const chapters = useLiveQuery(() => db.chapters.toArray())
  const subchapters = useLiveQuery(() => db.subchapters.toArray())
  const progress = useLiveQuery(() => db.progress.toArray())

  // Calculate progress for a specific course
  const getCourseProgress = (courseId: string) => {
    const courseChapters = chapters?.filter(c => c.courseId === courseId) || []
    const courseSubchapters = subchapters?.filter(s => s.courseId === courseId) || []

    // Total items = chapters + subchapters
    const totalItems = courseChapters.length + courseSubchapters.length
    if (totalItems === 0) return 0

    // Count completed items
    const completedChapters = progress?.filter(p =>
      p.courseId === courseId && !p.subchapterId && p.completed
    ).length || 0

    const completedSubchapters = progress?.filter(p =>
      p.courseId === courseId && p.subchapterId && p.completed
    ).length || 0

    const completedItems = completedChapters + completedSubchapters
    return Math.round((completedItems / totalItems) * 100)
  }

  // Calculate overall stats
  const getOverallStats = () => {
    if (!courses) return { completed: 0, inProgress: 0, total: 0 }

    let completed = 0
    let inProgress = 0

    for (const course of courses) {
      const progressPercent = getCourseProgress(course.id)
      if (progressPercent === 100) {
        completed++
      } else if (progressPercent > 0) {
        inProgress++
      }
    }

    return { completed, inProgress, total: courses.length }
  }

  const stats = getOverallStats()

  // Find the course to continue (most recently accessed or first with progress < 100%)
  const getContinueLearningCourse = () => {
    if (!courses || courses.length === 0) return null

    // Find the course with most recent progress that isn't complete
    const courseProgress = courses.map(course => ({
      course,
      progress: getCourseProgress(course.id),
      lastRead: progress?.filter(p => p.courseId === course.id)
        .reduce((max, p) => Math.max(max, p.lastRead || 0), 0) || 0
    }))

    // Prefer courses in progress, sorted by last read
    const inProgressCourses = courseProgress
      .filter(cp => cp.progress > 0 && cp.progress < 100)
      .sort((a, b) => b.lastRead - a.lastRead)

    if (inProgressCourses.length > 0) {
      return inProgressCourses[0].course
    }

    // Fall back to first incomplete course
    const incompleteCourse = courseProgress.find(cp => cp.progress < 100)
    return incompleteCourse?.course || courses[0]
  }

  const continueLearningCourse = getContinueLearningCourse()
  const continueProgress = continueLearningCourse ? getCourseProgress(continueLearningCourse.id) : 0

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Courses</h1>
          <p className="text-muted-foreground">Manage and learn from your courses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">

          {/* Continue Learning Card */}
          {continueLearningCourse && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-sm">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 h-48 md:h-auto bg-gradient-to-br from-blue-400 to-indigo-600 rounded-t-xl md:rounded-l-xl md:rounded-tr-none flex items-center justify-center">
                  <div className="text-white text-6xl font-bold opacity-20">📚</div>
                </div>
                <div className="p-6 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Continue Learning</p>
                  <h2 className="text-2xl font-bold mb-2">{continueLearningCourse.title}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{continueLearningCourse.description}</p>
                  <div className="flex items-center gap-4 mb-6">
                    <Progress value={continueProgress} className="h-2" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{continueProgress}% complete</span>
                  </div>
                  <Link href={`/course/${continueLearningCourse.id}`}>
                    <Button>{continueProgress > 0 ? 'Continue Lesson' : 'Start Learning'}</Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* All Courses Grid */}
          <div>
            <h2 className="text-xl font-bold mb-4">All My Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses?.map((course) => {
                const courseProgress = getCourseProgress(course.id)
                return (
                  <Link key={course.id} href={`/course/${course.id}`}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-none shadow-sm bg-card overflow-hidden group">
                      <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center group-hover:from-slate-200 group-hover:to-slate-300 dark:group-hover:from-slate-700 dark:group-hover:to-slate-800 transition-all">
                        <div className="text-6xl opacity-30">📖</div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {course.description || "No description provided."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{courseProgress}%</span>
                          </div>
                          <Progress value={courseProgress} className="h-1.5" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full hover:bg-primary/90 transition-colors cursor-pointer" variant="secondary">
                          {courseProgress === 100 ? 'Review Course' : courseProgress > 0 ? 'Continue' : 'Start Course'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                )
              })}

              {courses?.length === 0 && (
                <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">No courses yet. Import courses from the library or create your own.</p>
                  <p className="text-sm text-muted-foreground">Click the avatar in the header to access the Course Library</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Courses Completed</span>
                <span className="text-xl font-bold">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-sm text-muted-foreground">Courses in Progress</span>
                <span className="text-xl font-bold">{stats.inProgress}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-sm text-muted-foreground">Total Courses</span>
                <span className="text-xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
