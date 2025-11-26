import { useState, useEffect, useRef } from 'react';
import { Copy, CheckCircle2, Layers, ArrowLeft, Edit3, Save, X } from 'lucide-react';
import type { DesignSection } from '../types';
import { serializeDesignDocument } from '../utils/design';
import { DesignCard } from './DesignCard';
import { IntroCard } from './IntroCard';
import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import php from 'highlight.js/lib/languages/php';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import bash from 'highlight.js/lib/languages/bash';
import python from 'highlight.js/lib/languages/python';
import yaml from 'highlight.js/lib/languages/yaml';
import graphql from 'highlight.js/lib/languages/graphql';
import markdown from 'highlight.js/lib/languages/markdown';

// Register languages
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('json', json);
hljs.registerLanguage('php', php);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('graphql', graphql);
hljs.registerLanguage('gql', graphql);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);

interface DesignPageProps {
    activeView: 'board' | 'raw';
    rawText: string;
    sections: DesignSection[];
    onRawTextChange: (text: string) => void;
    onSectionsChange: (sections: DesignSection[]) => void;
}

// Check if a line looks like ASCII art
const isAsciiArtLine = (line: string): boolean => {
    const asciiChars = /[│├└─┌┐┘┴┬┤┼╔╗╚╝║═╠╣╦╩╬|+\-\\\/\[\]<>↓↑→←]/;
    const boxChars = line.match(asciiChars);
    // Line has multiple box-drawing chars or starts with common diagram patterns
    return (boxChars && boxChars.length > 0 && (
        line.includes('│') || 
        line.includes('|') || 
        line.includes('├') || 
        line.includes('└') ||
        line.includes('┌') ||
        line.includes('↓') ||
        line.includes('+--') ||
        line.includes('---') ||
        /^\s*[\[\(]/.test(line) && /[\]\)]/.test(line) // [Box] or (Box) patterns
    )) || false;
};

// Highlight ASCII art with colors
const highlightAsciiLine = (line: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        
        // Box drawing characters - cyan
        if (/[│├└─┌┐┘┴┬┤┼╔╗╚╝║═╠╣╦╩╬┃┏┓┗┛┣┫┳┻╋]/.test(char)) {
            parts.push(<span key={i} className="text-cyan-400">{char}</span>);
            i++;
        }
        // Arrows - yellow/amber
        else if (/[↓↑→←▼▲►◄<>]/.test(char)) {
            parts.push(<span key={i} className="text-amber-400">{char}</span>);
            i++;
        }
        // Pipe and plus for ASCII boxes - cyan
        else if (char === '|' || char === '+') {
            parts.push(<span key={i} className="text-cyan-400">{char}</span>);
            i++;
        }
        // Dashes (horizontal lines) - cyan but dimmer
        else if (char === '-' && (line[i-1] === '-' || line[i+1] === '-' || line[i-1] === '+' || line[i+1] === '+')) {
            parts.push(<span key={i} className="text-cyan-500">{char}</span>);
            i++;
        }
        // Square brackets for boxes - purple
        else if (char === '[' || char === ']') {
            parts.push(<span key={i} className="text-purple-400">{char}</span>);
            i++;
        }
        // Parentheses - purple
        else if (char === '(' || char === ')') {
            parts.push(<span key={i} className="text-purple-400">{char}</span>);
            i++;
        }
        // Text content - find word boundaries
        else if (/[a-zA-Z0-9]/.test(char)) {
            let word = '';
            while (i < line.length && /[a-zA-Z0-9_.]/.test(line[i])) {
                word += line[i];
                i++;
            }
            parts.push(<span key={`word-${i}`} className="text-slate-200">{word}</span>);
        }
        // Whitespace and other
        else {
            parts.push(<span key={i} className="text-slate-400">{char}</span>);
            i++;
        }
    }
    
    return <>{parts}</>;
};

// Markdown renderer for detail view
const renderMarkdownContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let inAsciiArt = false;
    let asciiLines: string[] = [];

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

    let codeLanguage = '';
    
    lines.forEach((line, idx) => {
        // Code block start/end
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                const codeContent = codeLines.join('\n');
                // Check if code block contains ASCII art diagram
                const hasAsciiArt = codeLines.some(l => isAsciiArtLine(l));
                
                if (hasAsciiArt) {
                    elements.push(
                        <div key={idx} className="my-4 p-4 bg-gradient-to-br from-slate-950 to-slate-900 rounded-lg border border-indigo-500/30 overflow-x-auto shadow-lg">
                            <pre 
                                className="text-sm leading-[1.4] whitespace-pre"
                                style={{ fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", Consolas, monospace' }}
                            >
                                {codeLines.map((codeLine, lineIdx) => (
                                    <div key={lineIdx}>
                                        {highlightAsciiLine(codeLine)}
                                    </div>
                                ))}
                            </pre>
                        </div>
                    );
                } else {
                    // Try to highlight with language
                    let highlightedCode = codeContent;
                    let isHighlighted = false;
                    
                    if (codeLanguage && hljs.getLanguage(codeLanguage)) {
                        try {
                            highlightedCode = hljs.highlight(codeContent, { language: codeLanguage }).value;
                            isHighlighted = true;
                        } catch {
                            // Fallback to plain text
                        }
                    }
                    
                    elements.push(
                        <div key={idx} className="my-3 rounded-lg overflow-hidden border border-slate-800">
                            {codeLanguage && (
                                <div className="bg-slate-800 px-3 py-1 text-xs text-slate-400 font-mono border-b border-slate-700">
                                    {codeLanguage}
                                </div>
                            )}
                            <pre className="bg-slate-950 p-4 text-sm font-mono overflow-x-auto">
                                {isHighlighted ? (
                                    <code 
                                        className="hljs"
                                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                                    />
                                ) : (
                                    <code className="text-slate-300">{codeContent}</code>
                                )}
                            </pre>
                        </div>
                    );
                }
                codeLines = [];
                codeLanguage = '';
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
                codeLanguage = line.trim().replace('```', '').trim();
            }
            return;
        }

        if (inCodeBlock) {
            codeLines.push(line);
            return;
        }

        // ASCII art diagram detection
        const looksLikeAscii = isAsciiArtLine(line);
        
        if (looksLikeAscii && !inAsciiArt) {
            // Start of ASCII art block
            inAsciiArt = true;
            asciiLines = [line];
            return;
        }
        
        if (inAsciiArt) {
            if (looksLikeAscii || line.trim() === '' || /^\s{2,}/.test(line)) {
                // Continue ASCII art (including empty lines and indented text within)
                asciiLines.push(line);
                return;
            } else {
                // End of ASCII art block
                elements.push(
                    <div key={`ascii-${idx}`} className="my-4 p-4 bg-slate-950 rounded-lg border border-slate-700 overflow-x-auto">
                        <pre className="font-mono text-sm text-emerald-400 leading-relaxed whitespace-pre">
                            {asciiLines.join('\n')}
                        </pre>
                    </div>
                );
                asciiLines = [];
                inAsciiArt = false;
                // Continue processing current line below
            }
        }

        // H3 headers
        if (line.startsWith('### ')) {
            elements.push(
                <h3 key={idx} className="text-lg font-bold text-slate-100 mt-6 mb-3 border-b border-slate-800 pb-2">
                    {line.replace('### ', '')}
                </h3>
            );
            return;
        }

        // H4 headers
        if (line.startsWith('#### ')) {
            elements.push(
                <h4 key={idx} className="text-md font-semibold text-slate-200 mt-4 mb-2">
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
                    <span className="text-indigo-400 mt-1">•</span>
                    <span className="text-slate-300">{renderInlineMarkdown(content)}</span>
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
                    <span className="text-slate-300">{renderInlineMarkdown(content)}</span>
                </div>
            );
            return;
        }

        // Empty line
        if (!line.trim()) {
            elements.push(<div key={idx} className="h-3" />);
            return;
        }

        // Regular paragraph
        elements.push(<p key={idx} className="text-slate-300 leading-relaxed">{renderInlineMarkdown(line)}</p>);
    });

    // Handle any remaining ASCII art at end of content
    if (inAsciiArt && asciiLines.length > 0) {
        elements.push(
            <div key="ascii-final" className="my-4 p-4 bg-slate-950 rounded-lg border border-slate-700 overflow-x-auto">
                <pre className="font-mono text-sm text-emerald-400 leading-relaxed whitespace-pre">
                    {asciiLines.join('\n')}
                </pre>
            </div>
        );
    }

    return elements;
};

export const DesignPage = ({ activeView, rawText, sections, onRawTextChange, onSectionsChange }: DesignPageProps) => {
    const [selectedSection, setSelectedSection] = useState<DesignSection | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<{ title: string; content: string }>({ title: '', content: '' });
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);
    const savedScrollPosition = useRef<number>(0);

    // Reset scroll when entering detail view
    useEffect(() => {
        if (selectedSection) {
            window.scrollTo(0, 0);
        }
    }, [selectedSection]);

    const handleSectionClick = (section: DesignSection) => {
        // Save current scroll position before navigating to detail
        savedScrollPosition.current = window.scrollY;
        setSelectedSection(section);
        setIsEditing(false);
    };

    const handleStartEdit = () => {
        if (!selectedSection) return;
        setEditForm({
            title: selectedSection.title,
            content: selectedSection.content || ''
        });
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (!selectedSection) return;
        const newSections = sections.map(s =>
            s === selectedSection ? { ...s, title: editForm.title, content: editForm.content } : s
        );
        onSectionsChange(newSections);
        onRawTextChange(serializeDesignDocument(newSections));
        // Update selected section reference
        setSelectedSection({ ...selectedSection, title: editForm.title, content: editForm.content });
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleBack = () => {
        setSelectedSection(null);
        setIsEditing(false);
        // Restore scroll position after state update
        setTimeout(() => {
            window.scrollTo(0, savedScrollPosition.current);
        }, 0);
    };

    const handleCopy = () => {
        const text = serializeDesignDocument(sections);
        const tempElement = document.createElement('textarea');
        tempElement.value = text;
        document.body.appendChild(tempElement);
        tempElement.select();
        document.execCommand('copy');
        document.body.removeChild(tempElement);
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 2000);
    };

    const overviewSection = sections.find(s => s.type === 'overview');
    const otherSections = sections.filter(s => s.type !== 'overview');

    // Show raw view if explicitly selected OR if content is empty
    if (activeView === 'raw' || !rawText.trim()) {
        return (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-inner">
                    <textarea
                        className="w-full h-[80vh] bg-transparent text-slate-300 font-mono text-sm focus:outline-none resize-none"
                        value={rawText}
                        onChange={(e) => onRawTextChange(e.target.value)}
                        placeholder="Paste your design.md content here..."
                    />
                </div>
            </div>
        );
    }

    // Detail view for selected section
    if (selectedSection) {
        return (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to sections</span>
                    </button>
                    {isEditing && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancelEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors text-sm"
                            >
                                <X size={16} />
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm"
                            >
                                <Save size={16} />
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    {isEditing ? (
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Section Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Content (Markdown)</label>
                                <textarea
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-indigo-500 focus:outline-none min-h-[60vh] font-mono text-sm resize-y"
                                    value={editForm.content}
                                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 border-b border-slate-800 bg-slate-800/50 relative">
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={handleStartEdit}
                                        className="p-2 bg-slate-900 hover:bg-slate-700 text-indigo-400 rounded-full border border-indigo-500/30 transition-colors"
                                        title="Edit section"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-100 pr-12">{selectedSection.title}</h2>
                                <span className="text-xs uppercase font-bold text-indigo-400 mt-1">{selectedSection.type}</span>
                            </div>
                            <div className="p-6 space-y-2 min-h-[60vh]">
                                {selectedSection.content && renderMarkdownContent(selectedSection.content)}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Overview */}
            {overviewSection && (
                <div onClick={() => handleSectionClick(overviewSection)} className="cursor-pointer hover:ring-1 hover:ring-indigo-500/50 rounded-xl transition-all">
                    <IntroCard content={overviewSection.content || ''} />
                </div>
            )}

            {/* Stats */}
            <div className="flex gap-4 flex-wrap">
                <div className="px-4 py-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-slate-400 text-sm">Sections: <strong className="text-white">{sections.length}</strong></span>
                </div>
                <div className="px-4 py-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-400 text-sm">Code Blocks: <strong className="text-white">
                        {sections.reduce((acc, s) => acc + (s.codeBlocks?.length || 0), 0)}
                    </strong></span>
                </div>
                <button
                    onClick={handleCopy}
                    className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors text-sm font-medium"
                >
                    {showCopyFeedback ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    {showCopyFeedback ? 'Copied!' : 'Copy All'}
                </button>
            </div>

            {/* Design Sections Grid */}
            <div>
                <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                    <Layers className="text-purple-500" size={24} />
                    Design Sections
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                    {otherSections.map((section, idx) => (
                        <DesignCard
                            key={idx}
                            section={section}
                            onClick={() => handleSectionClick(section)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
