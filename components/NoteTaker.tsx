"use client"

import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, StickyNote } from "lucide-react"

interface NoteTakerProps {
    courseId: string
    chapterId?: string
    subchapterId?: string
    onCollapseChange?: (collapsed: boolean) => void
}

export function NoteTaker({ courseId, chapterId, subchapterId, onCollapseChange }: NoteTakerProps) {
    const notes = useLiveQuery(
        () => {
            let query = db.notes.where('courseId').equals(courseId)
            if (chapterId) {
                query = query.and(note => note.chapterId === chapterId)
                if (subchapterId) {
                    return query.and(note => note.subchapterId === subchapterId).reverse().sortBy('createdAt')
                }
                return query.and(note => !note.subchapterId).reverse().sortBy('createdAt')
            }
            return query.reverse().sortBy('createdAt')
        },
        [courseId, chapterId, subchapterId]
    )

    const chapters = useLiveQuery(
        () => db.chapters.where('courseId').equals(courseId).toArray(),
        [courseId]
    )

    const subchapters = useLiveQuery(
        () => db.subchapters.where('courseId').equals(courseId).toArray(),
        [courseId]
    )

    const [isAdding, setIsAdding] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [newContent, setNewContent] = useState("")
    const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)

    // Notify parent when collapse state changes
    const handlePanelToggle = () => {
        const newState = !isPanelCollapsed
        setIsPanelCollapsed(newState)
        onCollapseChange?.(newState)
    }

    const handleAddNote = async () => {
        if (!newTitle.trim()) return

        await db.notes.add({
            id: crypto.randomUUID(),
            courseId,
            chapterId,
            subchapterId,
            title: newTitle,
            content: newContent,
            createdAt: Date.now(),
        })

        setNewTitle("")
        setNewContent("")
        setIsAdding(false)
    }

    const toggleNoteExpansion = (noteId: string) => {
        setExpandedNotes(prev => {
            const newSet = new Set(prev)
            if (newSet.has(noteId)) {
                newSet.delete(noteId)
            } else {
                newSet.add(noteId)
            }
            return newSet
        })
    }

    const handleDeleteNote = async (id: string) => {
        await db.notes.delete(id)
        setExpandedNotes(prev => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
        })
    }

    const getNoteContext = (note: any) => {
        if (chapterId) return null // Don't show context if we're already in a specific chapter view

        const noteChapter = chapters?.find(c => c.chapterId === note.chapterId)
        const noteSubchapter = subchapters?.find(s => s.subchapterId === note.subchapterId && s.chapterId === note.chapterId)

        if (noteSubchapter) {
            return `${noteChapter?.title || ''} > ${noteSubchapter.title}`
        }
        return noteChapter?.title || ''
    }

    return (
        <div className={`h-full flex flex-col transition-all duration-300 ${isPanelCollapsed ? 'w-auto' : 'w-full'}`}>
            <div className="flex justify-between items-center mb-4">
                {!isPanelCollapsed && (
                    <div className="flex items-center gap-2">
                        <StickyNote className="h-5 w-5" />
                        <h3 className="font-semibold text-lg">Notes</h3>
                    </div>
                )}
                <div className="flex gap-2">
                    {!isPanelCollapsed && (
                        <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
                            <Plus className="h-4 w-4 mr-1" />
                            New Note
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handlePanelToggle}
                        title={isPanelCollapsed ? "Expand notes" : "Collapse notes"}
                    >
                        {isPanelCollapsed ? (
                            <div className="flex items-center gap-1">
                                <StickyNote className="h-4 w-4" />
                                <ChevronLeft className="h-4 w-4" />
                            </div>
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {!isPanelCollapsed && (
                <>
                    {isAdding && (
                        <Card>
                            <CardContent className="p-4 space-y-3">
                                <Input
                                    placeholder="Note Title"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                />
                                <Textarea
                                    placeholder="Write your note here..."
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    className="min-h-[100px]"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleAddNote}>
                                        <Save className="h-4 w-4 mr-1" />
                                        Save Note
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {notes?.length === 0 && !isAdding && (
                            <p className="text-muted-foreground text-sm text-center py-8">
                                No notes yet. Click "New Note" to add one.
                            </p>
                        )}

                        {notes?.map((note) => {
                            const isExpanded = expandedNotes.has(note.id)
                            const context = getNoteContext(note)

                            return (
                                <Card key={note.id} className="relative group">
                                    <CardHeader
                                        className="p-4 pb-2 cursor-pointer hover:bg-accent/50 transition-colors"
                                        onClick={() => toggleNoteExpansion(note.id)}
                                    >
                                        <div className="flex items-center justify-between pr-6">
                                            <div className="space-y-1">
                                                {context && (
                                                    <p className="text-xs text-muted-foreground font-medium">
                                                        {context}
                                                    </p>
                                                )}
                                                <CardTitle className="text-base font-medium">
                                                    {note.title}
                                                </CardTitle>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteNote(note.id)
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </CardHeader>
                                    {isExpanded && (
                                        <CardContent className="p-4 pt-0">
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {note.content}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2 text-right">
                                                {new Date(note.createdAt).toLocaleDateString()}
                                            </p>
                                        </CardContent>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}
