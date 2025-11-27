import { useState } from 'react';
import { Edit3, Copy, Check, Code, FileText } from 'lucide-react';
import type { DesignSection } from '../types';

const getIconForType = (type: DesignSection['type']) => {
    switch (type) {
        case 'overview': return FileText;
        case 'architecture': return Code;
        case 'component': return Code;
        default: return FileText;
    }
};

const getColorForType = (type: DesignSection['type']) => {
    switch (type) {
        case 'overview': return 'indigo';
        case 'architecture': return 'purple';
        case 'component': return 'emerald';
        case 'schema': return 'amber';
        case 'error-handling': return 'red';
        case 'testing': return 'cyan';
        default: return 'slate';
    }
};

// Simple markdown renderer for preview
const renderMarkdownContent = (content: string, maxLines?: number) => {
    const lines = content.split('\n');
    const displayLines = maxLines ? lines.slice(0, maxLines) : lines;
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];

    const renderInlineMarkdown = (text: string) => {
        const parts: React.ReactNode[] = [];
        let remaining = text;
        let keyIdx = 0;

        while (remaining.length > 0) {
            const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
            if (boldMatch && boldMatch.index !== undefined) {
                if (boldMatch.index > 0) {
                    parts.push(<span key={keyIdx++}>{remaining.slice(0, boldMatch.index)}</span>);
                }
                parts.push(<strong key={keyIdx++} className="text-slate-200 font-semibold">{boldMatch[1]}</strong>);
                remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
            } else {
                parts.push(<span key={keyIdx++}>{remaining}</span>);
                break;
            }
        }
        return parts;
    };

    displayLines.forEach((line, idx) => {
        // Code block start/end
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                elements.push(
                    <pre key={idx} className="bg-slate-900 rounded p-2 text-xs font-mono text-slate-400 overflow-x-auto my-2">
                        <code>{codeLines.join('\n')}</code>
                    </pre>
                );
                codeLines = [];
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
            }
            return;
        }

        if (inCodeBlock) {
            codeLines.push(line);
            return;
        }

        // H3 headers
        if (line.startsWith('### ')) {
            elements.push(
                <h5 key={idx} className="text-slate-200 font-semibold mt-3 mb-1">
                    {line.replace('### ', '')}
                </h5>
            );
            return;
        }

        // List items: - text
        if (line.match(/^\s*-\s+/)) {
            const content = line.replace(/^\s*-\s+/, '');
            elements.push(
                <div key={idx} className="flex items-start gap-2 ml-2">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span>{renderInlineMarkdown(content)}</span>
                </div>
            );
            return;
        }

        // Numbered list: 1. text
        if (line.match(/^\s*\d+\.\s+/)) {
            const content = line.replace(/^\s*\d+\.\s+/, '');
            const num = line.match(/^\s*(\d+)\./)?.[1];
            elements.push(
                <div key={idx} className="flex items-start gap-2 ml-2">
                    <span className="text-slate-500 mt-0.5 text-xs">{num}.</span>
                    <span>{renderInlineMarkdown(content)}</span>
                </div>
            );
            return;
        }

        // Empty line
        if (!line.trim()) {
            elements.push(<div key={idx} className="h-2" />);
            return;
        }

        // Regular paragraph
        elements.push(<p key={idx}>{renderInlineMarkdown(line)}</p>);
    });

    return elements;
};

export const DesignCard = ({ section, onClick }: { section: DesignSection; onClick: () => void }) => {
    const [copied, setCopied] = useState(false);
    const Icon = getIconForType(section.type);
    const color = getColorForType(section.type);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        const text = `## ${section.title}\n\n${section.content || ''}`;
        const tempElement = document.createElement('textarea');
        tempElement.value = text;
        document.body.appendChild(tempElement);
        tempElement.select();
        document.execCommand('copy');
        document.body.removeChild(tempElement);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const codeBlockCount = section.codeBlocks?.length || 0;

    return (
        <div
            onClick={onClick}
            className="group relative bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all duration-300 rounded-xl overflow-hidden shadow-md hover:shadow-indigo-500/10 cursor-pointer flex flex-col"
        >
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                    onClick={handleCopy}
                    className="bg-slate-900 p-2 rounded-full text-slate-400 hover:text-emerald-400 shadow-sm border border-slate-700 hover:border-emerald-500/30 transition-colors"
                    title="Copy to clipboard"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <div className="bg-slate-900 p-2 rounded-full text-indigo-400 shadow-sm border border-indigo-500/30">
                    <Edit3 size={14} />
                </div>
            </div>

            <div className={`p-4 border-b border-slate-700/50 bg-${color}-900/10`}>
                <div className="flex items-center gap-2">
                    <Icon size={16} className={`text-${color}-400`} />
                    <h4 className="text-md font-bold text-slate-100 pr-6">{section.title}</h4>
                </div>
                <span className={`text-[10px] uppercase font-bold text-${color}-500 mt-1`}>{section.type}</span>
            </div>

            <div className="p-4 flex-1">
                <div className="text-sm text-slate-400 space-y-1">
                    {section.content && renderMarkdownContent(section.content, 15)}
                </div>
                {codeBlockCount > 0 && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                        <Code size={12} />
                        <span>{codeBlockCount} code block{codeBlockCount > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
