import { useState } from 'react';
import { Edit3, Search, CheckCircle2, Copy, Check } from 'lucide-react';
import type { Requirement } from '../types';
import { highlightSyntax } from '../utils/gherkin';

const serializeRequirement = (req: Requirement): string => {
    let output = `### ${req.title}\n\n`;
    output += `**User Story:** ${req.userStory}\n\n`;
    output += `#### Acceptance Criteria\n\n`;
    req.acceptanceCriteria.forEach((ac, i) => {
        output += `${i + 1}. ${ac}\n`;
    });
    return output.trim();
};

export const RequirementCard = ({ req, onClick }: { req: Requirement, onClick: () => void }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        const text = serializeRequirement(req);
        const tempElement = document.createElement('textarea');
        tempElement.value = text;
        document.body.appendChild(tempElement);
        tempElement.select();
        document.execCommand('copy');
        document.body.removeChild(tempElement);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            onClick={onClick}
            className="group relative bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all duration-300 rounded-xl overflow-hidden shadow-md hover:shadow-indigo-500/10 cursor-pointer flex flex-col h-full"
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

        <div className="p-5 border-b border-slate-700/50 bg-slate-800/80">
            <h4 className="text-md font-bold text-slate-100 pr-6">{req.title}</h4>
        </div>

        <div className="p-5 flex-1 flex flex-col gap-4">
            <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-3">
                <div className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Search size={10} /> User Story
                </div>
                <p className="text-sm text-slate-300 italic">"{req.userStory}"</p>
            </div>

            <div className="flex-1">
                <div className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Acceptance Criteria
                </div>
                <ul className="space-y-3">
                    {req.acceptanceCriteria.map((ac, i) => (
                        <li key={i} className="text-xs md:text-sm text-slate-400 leading-relaxed pl-2 border-l-2 border-slate-700">
                            {highlightSyntax(ac)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
    );
};
