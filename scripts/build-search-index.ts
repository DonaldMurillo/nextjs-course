import * as fs from 'fs'
import * as path from 'path'

interface CourseMetadata {
    id: string
    title: string
    description: string
    chapters: {
        id: string
        title: string
        subchapters?: {
            id: string
            title: string
        }[]
    }[]
}

async function buildSearchIndex() {
    // Dynamic import for pagefind (ESM module)
    const pagefind = await import('pagefind')
    const { createIndex } = pagefind

    const contentDir = path.join(process.cwd(), 'content', 'courses')
    const outputDir = path.join(process.cwd(), 'public', 'pagefind')

    console.log('🔍 Building PageFind search index...')

    // Create the pagefind index
    const { index } = await createIndex({})

    if (!index) {
        console.error('Failed to create index')
        process.exit(1)
    }

    // Get all courses
    const courseDirs = fs.readdirSync(contentDir).filter(dir => 
        fs.statSync(path.join(contentDir, dir)).isDirectory()
    )

    for (const courseDir of courseDirs) {
        const coursePath = path.join(contentDir, courseDir)
        const metadataPath = path.join(coursePath, 'metadata.json')

        if (!fs.existsSync(metadataPath)) continue

        const metadata: CourseMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
        const chaptersDir = path.join(coursePath, 'chapters')

        // Index the course itself
        await index.addCustomRecord({
            url: `/course/${metadata.id}`,
            content: `${metadata.title} ${metadata.description}`,
            language: 'en',
            meta: {
                title: metadata.title,
                type: 'course',
                courseId: metadata.id,
                courseTitle: metadata.title,
                description: metadata.description
            }
        })

        console.log(`  📚 Indexed course: ${metadata.title}`)

        // Index chapters and subchapters
        if (fs.existsSync(chaptersDir)) {
            const chapterFiles = fs.readdirSync(chaptersDir)
                .filter(f => f.endsWith('.md'))
                .sort()

            for (const chapterFile of chapterFiles) {
                const chapterPath = path.join(chaptersDir, chapterFile)
                const content = fs.readFileSync(chapterPath, 'utf-8')
                const chapterId = chapterFile.replace('.md', '')

                // Find chapter metadata
                const chapterMeta = metadata.chapters.find(c => c.id === chapterId)
                
                // Check if it's a subchapter (has a dot like 03.1)
                const isSubchapter = chapterId.includes('.')
                
                if (isSubchapter) {
                    // Extract parent chapter number (e.g., "05.3-navigation" -> "05")
                    const parentChapterNum = chapterId.split('.')[0].padStart(2, '0')
                    // Find the parent chapter that starts with this number
                    const parentChapter = metadata.chapters.find(c => c.id.startsWith(parentChapterNum + '-'))
                    const subchapterMeta = parentChapter?.subchapters?.find(s => s.id === chapterId)

                    // Extract title from content if not in metadata
                    let title = subchapterMeta?.title || ''
                    if (!title) {
                        const titleMatch = content.match(/^#\s+(.+)$/m)
                        title = titleMatch ? titleMatch[1] : chapterId
                    }

                    await index.addCustomRecord({
                        url: `/course/${metadata.id}?chapter=${parentChapter?.id || parentChapterNum}&subchapter=${chapterId}`,
                        content: `${title} ${content}`,
                        language: 'en',
                        meta: {
                            title: title,
                            type: 'subchapter',
                            courseId: metadata.id,
                            courseTitle: metadata.title,
                            chapterId: parentChapter?.id || parentChapterNum,
                            chapterTitle: parentChapter?.title || '',
                            subchapterId: chapterId
                        }
                    })

                    console.log(`    📄 Indexed subchapter: ${title}`)
                } else {
                    // Regular chapter
                    let title = chapterMeta?.title || ''
                    if (!title) {
                        const titleMatch = content.match(/^#\s+(.+)$/m)
                        title = titleMatch ? titleMatch[1] : chapterId
                    }

                    await index.addCustomRecord({
                        url: `/course/${metadata.id}?chapter=${chapterId}`,
                        content: `${title} ${content}`,
                        language: 'en',
                        meta: {
                            title: title,
                            type: 'chapter',
                            courseId: metadata.id,
                            courseTitle: metadata.title,
                            chapterId: chapterId
                        }
                    })

                    console.log(`    📖 Indexed chapter: ${title}`)
                }
            }
        }
    }

    // Write the index files to the public directory
    console.log('\n📁 Writing search index to public/pagefind...')
    
    const { files } = await index.getFiles()
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
    }

    for (const file of files) {
        const filePath = path.join(outputDir, file.path)
        const fileDir = path.dirname(filePath)
        
        if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true })
        }
        
        fs.writeFileSync(filePath, file.content)
    }

    console.log(`\n✅ Search index built successfully!`)
    console.log(`   Output: ${outputDir}`)
}

buildSearchIndex().catch(console.error)
