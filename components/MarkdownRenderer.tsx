import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("prose prose-slate dark:prose-invert max-w-none",
            // Heading styles
            "prose-headings:scroll-mt-20",
            // Inline code styles - remove backticks
            "prose-code:before:content-none prose-code:after:content-none",
            // Table styles
            "prose-table:border-collapse prose-table:w-full",
            "prose-th:border prose-th:border-slate-300 prose-th:dark:border-slate-600 prose-th:px-4 prose-th:py-2 prose-th:bg-slate-100 prose-th:dark:bg-slate-800",
            "prose-td:border prose-td:border-slate-300 prose-td:dark:border-slate-600 prose-td:px-4 prose-td:py-2",
            // Link styles
            "prose-a:text-blue-600 prose-a:dark:text-blue-400",
            className
        )}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
