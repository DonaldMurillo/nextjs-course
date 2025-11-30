import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
    content: string;
    className?: string;
    highlightText?: string;
}

// Escape special regex characters
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Highlight text in the DOM after render
function highlightTextInElement(element: HTMLElement, searchText: string): void {
    if (!searchText.trim()) return;

    const words = searchText.trim().split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return;

    const pattern = new RegExp(`(${words.map(escapeRegExp).join('|')})`, 'gi');
    
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
    );

    const textNodes: Text[] = [];
    let node;
    while ((node = walker.nextNode())) {
        // Skip text nodes inside code blocks, pre elements, and existing marks
        const parent = node.parentElement;
        if (parent && !parent.closest('code') && !parent.closest('pre') && parent.tagName !== 'MARK') {
            textNodes.push(node as Text);
        }
    }

    let firstHighlight: HTMLElement | null = null;

    textNodes.forEach((textNode) => {
        const text = textNode.textContent || '';
        if (!pattern.test(text)) return;
        
        // Reset regex lastIndex
        pattern.lastIndex = 0;
        
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;
        
        while ((match = pattern.exec(text)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                fragment.appendChild(
                    document.createTextNode(text.slice(lastIndex, match.index))
                );
            }
            
            // Add highlighted match
            const mark = document.createElement('mark');
            mark.className = 'bg-yellow-200 dark:bg-yellow-800 rounded px-0.5';
            mark.textContent = match[0];
            fragment.appendChild(mark);
            
            if (!firstHighlight) {
                firstHighlight = mark;
            }
            
            lastIndex = pattern.lastIndex;
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        
        textNode.parentNode?.replaceChild(fragment, textNode);
    });

    // Scroll to first highlight after a brief delay
    if (firstHighlight) {
        setTimeout(() => {
            firstHighlight?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

export function MarkdownRenderer({ content, className, highlightText }: MarkdownRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (containerRef.current && highlightText) {
            highlightTextInElement(containerRef.current, highlightText);
        }
    }, [content, highlightText]);

    return (
        <div 
            ref={containerRef}
            className={cn("prose prose-slate dark:prose-invert max-w-none",
            // Heading styles
            "prose-headings:scroll-mt-20",
            // Inline code styles - remove backticks
            "prose-code:before:content-none prose-code:after:content-none",
            // Table styles - responsive with horizontal scroll container
            "prose-table:border-collapse prose-table:w-full prose-table:text-sm prose-table:min-w-0",
            "prose-th:border prose-th:border-slate-300 prose-th:dark:border-slate-600 prose-th:px-2 prose-th:sm:px-4 prose-th:py-2 prose-th:bg-slate-100 prose-th:dark:bg-slate-800 prose-th:text-xs prose-th:sm:text-sm prose-th:min-w-[60px]",
            "prose-td:border prose-td:border-slate-300 prose-td:dark:border-slate-600 prose-td:px-2 prose-td:sm:px-4 prose-td:py-2 prose-td:text-xs prose-td:sm:text-sm prose-td:min-w-[60px]",
            // Link styles
            "prose-a:text-blue-600 prose-a:dark:text-blue-400",
            // Code block styles - ensure proper containment
            "prose-pre:overflow-x-auto prose-pre:max-w-full",
            className
        )}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    table: ({ children }) => (
                        <div className="overflow-x-auto w-full">
                            <table>{children}</table>
                        </div>
                    ),
                    pre: ({ children }) => (
                        <pre className="overflow-x-auto">{children}</pre>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
