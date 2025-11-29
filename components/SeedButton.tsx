"use client"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { Database } from "lucide-react"
import { useState } from "react"
// Actually, I'll just use window.alert or console.log since I haven't installed a toast library yet.
// Wait, I can use a simple state to show "Seeded!" text.

export function SeedButton() {
    const [loading, setLoading] = useState(false)

    const handleSeed = async () => {
        setLoading(true)
        try {
            const existing = await db.courses.get('nextjs-fundamentals')
            if (existing) {
                alert("Course 'Next.js Fundamentals' already exists.")
                setLoading(false)
                return
            }

            await db.courses.add({
                id: 'nextjs-fundamentals',
                title: 'Next.js Fundamentals',
                description: 'Learn the basics of Next.js 14+, including App Router, Server Components, and more.',
                content: `# Next.js Fundamentals

Welcome to the Next.js Fundamentals course!

## What you will learn
- App Router
- Server Components
- Data Fetching
- Styling

## Getting Started
Next.js is a React framework for building full-stack web applications.
        `,
                createdAt: Date.now(),
            })
            alert("Database seeded successfully! Reloading...")
            window.location.reload()
        } catch (error) {
            console.error("Failed to seed database:", error)
            alert("Failed to seed database.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button variant="outline" onClick={handleSeed} disabled={loading}>
            <Database className="mr-2 h-4 w-4" />
            {loading ? "Seeding..." : "Seed Database"}
        </Button>
    )
}
