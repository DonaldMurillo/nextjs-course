"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { useCourseSync } from "@/hooks/useCourseSync"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, RefreshCw } from "lucide-react"

export default function Home() {
  const { syncing, newCoursesImported, coursesUpdated, syncCourses } = useCourseSync()
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
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">My Courses</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {syncing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing courses...
              </span>
            ) : (
              "Manage and learn from your courses"
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => syncCourses()}
          disabled={syncing}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          Sync
        </Button>
      </div>

      {/* Sync notification */}
      {(newCoursesImported > 0 || coursesUpdated > 0) && !syncing && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            {newCoursesImported > 0 && `${newCoursesImported} new course${newCoursesImported > 1 ? "s" : ""} imported. `}
            {coursesUpdated > 0 && `${coursesUpdated} course${coursesUpdated > 1 ? "s" : ""} updated.`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">

          {/* Continue Learning Card */}
          {continueLearningCourse && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/3 h-32 sm:h-auto bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                  <div className="text-white text-5xl sm:text-6xl font-bold opacity-20">📚</div>
                </div>
                <div className="p-4 sm:p-6 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Continue Learning</p>
                  <h2 className="text-lg sm:text-2xl font-bold mb-2 line-clamp-2">{continueLearningCourse.title}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{continueLearningCourse.description}</p>
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <Progress value={continueProgress} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{continueProgress}%</span>
                  </div>
                  <Link href={`/course/${continueLearningCourse.id}`}>
                    <Button size="sm" className="sm:size-default">{continueProgress > 0 ? 'Continue Lesson' : 'Start Learning'}</Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* All Courses Grid */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">All My Courses</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6">
              {courses?.map((course) => {
                const courseProgress = getCourseProgress(course.id)
                return (
                  <Link key={course.id} href={`/course/${course.id}`}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-none shadow-sm bg-card overflow-hidden group">
                      <div className="h-28 sm:h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center group-hover:from-slate-200 group-hover:to-slate-300 dark:group-hover:from-slate-700 dark:group-hover:to-slate-800 transition-all">
                        <div className="text-4xl sm:text-6xl opacity-30">📖</div>
                      </div>
                      <CardHeader className="p-3 sm:p-6 pb-2">
                        <CardTitle className="text-base sm:text-lg line-clamp-1">{course.title}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm line-clamp-2">
                          {course.description || "No description provided."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-6 pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{courseProgress}%</span>
                          </div>
                          <Progress value={courseProgress} className="h-1.5" />
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 sm:p-6 pt-0">
                        <Button className="w-full hover:bg-primary/90 transition-colors cursor-pointer text-xs sm:text-sm" variant="secondary" size="sm">
                          {courseProgress === 100 ? 'Review Course' : courseProgress > 0 ? 'Continue' : 'Start Course'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                )
              })}

              {courses?.length === 0 && (
                <div className="col-span-full text-center py-8 sm:py-12 border-2 border-dashed rounded-lg px-4">
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">No courses yet. Import courses from the library or create your own.</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Click the avatar in the header to access the Course Library</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - stays at bottom on mobile, right side on desktop */}
        <div className="space-y-6 lg:col-span-1">
          {/* Overall Progress */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">Courses Completed</span>
                <span className="text-lg sm:text-xl font-bold">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-3 sm:pt-4">
                <span className="text-xs sm:text-sm text-muted-foreground">Courses in Progress</span>
                <span className="text-lg sm:text-xl font-bold">{stats.inProgress}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-3 sm:pt-4">
                <span className="text-xs sm:text-sm text-muted-foreground">Total Courses</span>
                <span className="text-lg sm:text-xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
