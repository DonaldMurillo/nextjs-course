"use client"

import { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save } from "lucide-react"

interface NoteTakerProps {
    courseId: string
    chapterId?: string
}

export function NoteTaker({ courseId, chapterId }: NoteTakerProps) {
    const notes = useLiveQuery(
        () => {
            let query = db.notes.where('courseId').equals(courseId)
            if (chapterId) {
                return query.and(note => note.chapterId === chapterId).reverse().sortBy('createdAt')
            }
            return query.reverse().sortBy('createdAt')
        },
        [courseId, chapterId]
    )

    const [isAdding, setIsAdding] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [newContent, setNewContent] = useState("")

    const handleAddNote = async () => {
        if (!newTitle.trim()) return

        await db.notes.add({
            id: crypto.randomUUID(),
            courseId,
            chapterId,
            title: newTitle,
            content: newContent,
            createdAt: Date.now(),
        })

        setNewTitle("")
        setNewContent("")
        setIsAdding(false)
    }

    const handleDeleteNote = async (id: string) => {
        await db.notes.delete(id)
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Notes</h3>
                <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
                    <Plus className="h-4 w-4 mr-1" />
                    New Note
                </Button>
            </div>

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

                {notes?.map((note) => (
                    <Card key={note.id} className="relative group">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base font-medium pr-6">
                                {note.title}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                onClick={() => handleDeleteNote(note.id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                                {note.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2 text-right">
                                {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
