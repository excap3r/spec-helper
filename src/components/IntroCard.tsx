import { FileText } from 'lucide-react';

// Simple markdown renderer
const renderMarkdownLine = (line: string, idx: number) => {
    // Bold text: **text**
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
                parts.push(<strong key={keyIdx++} className="text-slate-100 font-semibold">{boldMatch[1]}</strong>);
                remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
            } else {
                parts.push(<span key={keyIdx++}>{remaining}</span>);
                break;
            }
        }
        return parts;
    };

    // List items: - text
    if (line.match(/^\s*-\s+/)) {
        const content = line.replace(/^\s*-\s+/, '');
        return (
            <div key={idx} className="flex items-start gap-2 ml-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>{renderInlineMarkdown(content)}</span>
            </div>
        );
    }

    // Empty line
    if (!line.trim()) {
        return <div key={idx} className="h-3" />;
    }

    // Regular paragraph
    return <p key={idx}>{renderInlineMarkdown(line)}</p>;
};

export const IntroCard = ({ content }: { content: string }) => (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 rounded-xl p-6 mb-6 shadow-lg">
        <h3 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center gap-2">
            <FileText size={18} /> Overview
        </h3>
        <div className="text-slate-300 leading-relaxed space-y-1">
            {content.split('\n').map((line, idx) => renderMarkdownLine(line, idx))}
        </div>
    </div>
);
