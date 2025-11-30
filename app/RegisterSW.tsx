'use client'

import { useEffect } from 'react'

// Get the base path for static assets
const getBasePath = () => {
    if (typeof window !== "undefined") {
        const pathname = window.location.pathname
        if (pathname.startsWith("/nextjs-course")) {
            return "/nextjs-course"
        }
    }
    return ""
}

export default function RegisterSW() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            const basePath = getBasePath()
            navigator.serviceWorker
                .register(`${basePath}/sw.js`)
                .then((registration) => {
                    console.log('Service Worker registered with scope:', registration.scope)
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error)
                })
        }
    }, [])

    return null
}
