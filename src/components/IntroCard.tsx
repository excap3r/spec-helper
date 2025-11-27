import { FileText } from 'lucide-react';

// Markdown renderer with support for headers, lists, and inline formatting
const renderMarkdownContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    const renderInlineMarkdown = (text: string) => {
        const parts: React.ReactNode[] = [];
        let remaining = text;
        let keyIdx = 0;

        while (remaining.length > 0) {
            // Check for inline code first
            const codeMatch = remaining.match(/`([^`]+)`/);
            const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
            
            // Find which comes first
            const codeIdx = codeMatch?.index ?? Infinity;
            const boldIdx = boldMatch?.index ?? Infinity;
            
            if (codeIdx < boldIdx && codeMatch && codeMatch.index !== undefined) {
                if (codeMatch.index > 0) {
                    parts.push(<span key={keyIdx++}>{remaining.slice(0, codeMatch.index)}</span>);
                }
                parts.push(
                    <code key={keyIdx++} className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono">
                        {codeMatch[1]}
                    </code>
                );
                remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
            } else if (boldMatch && boldMatch.index !== undefined) {
                if (boldMatch.index > 0) {
                    parts.push(<span key={keyIdx++}>{remaining.slice(0, boldMatch.index)}</span>);
                }
                parts.push(<strong key={keyIdx++} className="text-slate-100 font-semibold">{boldMatch[1]}</strong>);
                remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
            } else {
                parts.push(<span key={keyIdx++}>{remaining}</span>);
                break;
            }
        }
        return parts;
    };

    lines.forEach((line, idx) => {
        // H3 headers
        if (line.startsWith('### ')) {
            elements.push(
                <h3 key={idx} className="text-base font-bold text-slate-100 mt-4 mb-2">
                    {line.replace('### ', '')}
                </h3>
            );
            return;
        }

        // H4 headers
        if (line.startsWith('#### ')) {
            elements.push(
                <h4 key={idx} className="text-sm font-semibold text-slate-200 mt-3 mb-1">
                    {line.replace('#### ', '')}
                </h4>
            );
            return;
        }

        // List items: - text
        if (line.match(/^\s*-\s+/)) {
            const content = line.replace(/^\s*-\s+/, '');
            const indent = line.match(/^(\s*)/)?.[1].length || 0;
            elements.push(
                <div key={idx} className="flex items-start gap-2" style={{ marginLeft: `${Math.min(indent, 4) * 8}px` }}>
                    <span className="text-indigo-400 mt-0.5">•</span>
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
                    <span className="text-indigo-400 mt-0.5 text-sm font-medium min-w-[20px]">{num}.</span>
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

export const IntroCard = ({ content }: { content: string }) => (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 rounded-xl p-6 mb-6 shadow-lg">
        <h3 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center gap-2">
            <FileText size={18} /> Overview
        </h3>
        <div className="text-slate-300 leading-relaxed space-y-1">
            {renderMarkdownContent(content)}
        </div>
    </div>
);
