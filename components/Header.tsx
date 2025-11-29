"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { SettingsMenu } from "@/components/SettingsMenu"
import { Moon, Sun, BookOpen } from "lucide-react"

export function Header() {
    const { theme, setTheme } = useTheme()

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <BookOpen className="h-6 w-6" />
                    <span>CourseApp</span>
                </Link>

                <nav className="flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/create-course" className="text-sm font-medium hover:text-primary transition-colors">
                        Create Course
                    </Link>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <SettingsMenu />
                </nav>
            </div>
        </header>
    )
}
