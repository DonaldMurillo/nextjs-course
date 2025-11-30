"use client"

import { useEffect, useState, useCallback } from "react"
import { db } from "@/lib/db"
import type { AvailableCourse } from "@/lib/courseLibrary"

interface SyncStatus {
  syncing: boolean
  lastSynced: number | null
  newCoursesImported: number
  coursesUpdated: number
  error: string | null
}

export function useCourseSync() {
  const [status, setStatus] = useState<SyncStatus>({
    syncing: false,
    lastSynced: null,
    newCoursesImported: 0,
    coursesUpdated: 0,
    error: null,
  })

  const importCourse = useCallback(async (course: AvailableCourse) => {
    // Add course metadata
    await db.courses.put({
      id: course.id,
      title: course.title,
      description: course.description,
      createdAt: Date.now(),
      order: course.order,
      author: course.author,
      version: course.version,
      nextjsVersion: course.nextjsVersion,
      tags: course.tags,
      difficulty: course.difficulty,
      estimatedHours: course.estimatedHours,
      prerequisites: course.prerequisites,
    })

    // Add all parts
    if (course.parts) {
      for (const part of course.parts) {
        await db.parts.put({
          id: `${course.id}-${part.id}`,
          courseId: course.id,
          partId: part.id,
          title: part.title,
          order: part.order,
        })
      }
    }

    // Add all chapters and their subchapters
    for (const chapter of course.chaptersContent) {
      await db.chapters.put({
        id: `${course.id}-${chapter.id}`,
        courseId: course.id,
        chapterId: chapter.id,
        partId: chapter.partId,
        title: chapter.title,
        content: chapter.content,
        order: chapter.order,
        createdAt: Date.now(),
      })

      // Add subchapters
      if (chapter.subchapters) {
        for (const subchapter of chapter.subchapters) {
          await db.subchapters.put({
            id: `${course.id}-${chapter.id}-${subchapter.id}`,
            courseId: course.id,
            chapterId: chapter.id,
            subchapterId: subchapter.id,
            title: subchapter.title,
            content: subchapter.content,
            order: subchapter.order,
            createdAt: Date.now(),
          })
        }
      }
    }
  }, [])

  const syncCourses = useCallback(async () => {
    setStatus((prev) => ({ ...prev, syncing: true, error: null }))

    try {
      // Fetch available courses from the API
      const response = await fetch("/api/courses/available")
      if (!response.ok) {
        throw new Error("Failed to fetch available courses")
      }
      const availableCourses: AvailableCourse[] = await response.json()

      // Get currently imported courses
      const importedCourses = await db.courses.toArray()
      const importedCourseIds = new Set(importedCourses.map((c) => c.id))
      const importedVersions = new Map(
        importedCourses.map((c) => [c.id, c.version])
      )

      let newCoursesImported = 0
      let coursesUpdated = 0

      for (const course of availableCourses) {
        const isImported = importedCourseIds.has(course.id)
        const currentVersion = importedVersions.get(course.id)
        const hasNewVersion = course.version && course.version !== currentVersion

        if (!isImported) {
          // Import new course
          await importCourse(course)
          newCoursesImported++
        } else if (hasNewVersion) {
          // Update existing course with new version
          // First, remove old chapters and subchapters (but keep progress and notes)
          await db.chapters.where("courseId").equals(course.id).delete()
          await db.subchapters.where("courseId").equals(course.id).delete()
          await db.parts.where("courseId").equals(course.id).delete()

          // Re-import the updated course
          await importCourse(course)
          coursesUpdated++
        }
      }

      // Clean up courses that no longer exist in the library
      const availableCourseIds = new Set(availableCourses.map((c) => c.id))
      for (const importedCourse of importedCourses) {
        if (!availableCourseIds.has(importedCourse.id)) {
          // Course was removed from the library - optionally remove it
          // For now, we keep it to preserve user progress
          // Uncomment below to auto-remove:
          // await db.courses.delete(importedCourse.id)
          // await db.chapters.where("courseId").equals(importedCourse.id).delete()
          // await db.subchapters.where("courseId").equals(importedCourse.id).delete()
          // await db.parts.where("courseId").equals(importedCourse.id).delete()
        }
      }

      setStatus({
        syncing: false,
        lastSynced: Date.now(),
        newCoursesImported,
        coursesUpdated,
        error: null,
      })
    } catch (error) {
      console.error("Course sync error:", error)
      setStatus((prev) => ({
        ...prev,
        syncing: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }))
    }
  }, [importCourse])

  // Auto-sync on mount
  useEffect(() => {
    syncCourses()
  }, [syncCourses])

  return { ...status, syncCourses }
}
