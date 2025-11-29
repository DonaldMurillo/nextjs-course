"use client"

import { useState, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import type { AvailableCourse } from "@/lib/courseLibrary"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings, Library, Download, Trash2, Loader2 } from "lucide-react"

export function SettingsMenu() {
    const [showLibrary, setShowLibrary] = useState(false)
    const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([])
    const [loading, setLoading] = useState(false)
    const [importing, setImporting] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const importedCourses = useLiveQuery(() => db.courses.toArray())

    useEffect(() => {
        if (showLibrary) {
            loadAvailableCourses()
        }
    }, [showLibrary])

    const loadAvailableCourses = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/courses/available')
            const courses = await response.json()
            setAvailableCourses(courses)
        } catch (error) {
            console.error('Failed to load courses:', error)
        } finally {
            setLoading(false)
        }
    }

    const importCourse = async (course: AvailableCourse) => {
        setImporting(course.id)
        try {
            // Add course metadata
            await db.courses.add({
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
                prerequisites: course.prerequisites
            })

            // Add all parts
            if (course.parts) {
                for (const part of course.parts) {
                    await db.parts.add({
                        id: `${course.id}-${part.id}`,
                        courseId: course.id,
                        partId: part.id,
                        title: part.title,
                        order: part.order
                    })
                }
            }

            // Add all chapters and their subchapters
            for (const chapter of course.chaptersContent) {
                await db.chapters.add({
                    id: `${course.id}-${chapter.id}`,
                    courseId: course.id,
                    chapterId: chapter.id,
                    partId: chapter.partId,
                    title: chapter.title,
                    content: chapter.content,
                    order: chapter.order,
                    createdAt: Date.now()
                })

                // Add subchapters
                if (chapter.subchapters) {
                    for (const subchapter of chapter.subchapters) {
                        await db.subchapters.add({
                            id: `${course.id}-${chapter.id}-${subchapter.id}`,
                            courseId: course.id,
                            chapterId: chapter.id,
                            subchapterId: subchapter.id,
                            title: subchapter.title,
                            content: subchapter.content,
                            order: subchapter.order,
                            createdAt: Date.now()
                        })
                    }
                }
            }
        } catch (error) {
            console.error('Failed to import course:', error)
            alert('Failed to import course. It may already exist.')
        } finally {
            setImporting(null)
        }
    }

    const importAllCourses = async () => {
        setLoading(true)
        for (const course of availableCourses) {
            const exists = importedCourses?.some(c => c.id === course.id)
            if (!exists) {
                await importCourse(course)
            }
        }
        setLoading(false)
    }

    const deleteCourse = async (courseId: string) => {
        await db.courses.delete(courseId)
        await db.parts.where('courseId').equals(courseId).delete()
        await db.chapters.where('courseId').equals(courseId).delete()
        await db.subchapters.where('courseId').equals(courseId).delete()
        await db.progress.where('courseId').equals(courseId).delete()
        await db.notes.where('courseId').equals(courseId).delete()
        setDeleteConfirm(null)
    }

    const isCourseImported = (courseId: string) => {
        return importedCourses?.some(c => c.id === courseId) ?? false
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">User</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                user@courseapp.com
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowLibrary(true)}>
                        <Library className="mr-2 h-4 w-4" />
                        <span>Course Library</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Course Library</DialogTitle>
                        <DialogDescription>
                            Import courses from the library or manage your existing courses
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {loading && (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {!loading && availableCourses.length > 0 && (
                            <>
                                <div className="flex justify-end">
                                    <Button onClick={importAllCourses} size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Import All
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {availableCourses.map((course) => {
                                        const imported = isCourseImported(course.id)
                                        return (
                                            <div
                                                key={course.id}
                                                className="flex items-start justify-between p-4 border rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{course.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {course.description}
                                                    </p>
                                                    {course.author && (
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            By {course.author}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    {imported ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled
                                                                className="text-green-600"
                                                            >
                                                                Imported
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setDeleteConfirm(course.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => importCourse(course)}
                                                            disabled={importing === course.id}
                                                        >
                                                            {importing === course.id ? (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Download className="mr-2 h-4 w-4" />
                                                            )}
                                                            Import
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        )}

                        {!loading && availableCourses.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No courses available in the library
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Course</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this course? This will also delete all progress and notes associated with it.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteConfirm && deleteCourse(deleteConfirm)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
