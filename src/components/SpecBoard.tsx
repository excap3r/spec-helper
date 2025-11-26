import { useState, useEffect } from 'react';
import {
    Layout,
    Copy,
    Database,
    Search,
    CheckCircle2,
    Code,
    FileText,
    Layers,
    ListTodo
} from 'lucide-react';
import type { Section, DesignSection, TaskSection } from '../types';
import { parseDocument, serializeDocument } from '../utils/document';
import { parseDesignDocument } from '../utils/design';
import { parseTasksDocument } from '../utils/tasks';
import { GlossaryEditor } from './GlossaryEditor';
import { CriteriaListEditor } from './CriteriaListEditor';
import { Modal } from './Modal';
import { GlossaryCard } from './GlossaryCard';
import { IntroCard } from './IntroCard';
import { RequirementCard } from './RequirementCard';
import { DesignPage } from './DesignPage';
import { TasksPage } from './TasksPage';

type PageType = 'requirements' | 'design' | 'tasks';
type ViewType = 'board' | 'raw';

export default function SpecBoard() {
    const [activePage, setActivePage] = useState<PageType>('requirements');
    const [activeView, setActiveView] = useState<ViewType>('raw');
    
    // Requirements state
    const [rawText, setRawText] = useState('');
    const [sections, setSections] = useState<Section[]>([]);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);

    // Design state
    const [designRawText, setDesignRawText] = useState('');
    const [designSections, setDesignSections] = useState<DesignSection[]>([]);

    // Tasks state
    const [tasksRawText, setTasksRawText] = useState('');
    const [tasksSections, setTasksSections] = useState<TaskSection[]>([]);

    useEffect(() => {
        setSections(parseDocument(rawText));
    }, [rawText]);

    useEffect(() => {
        setDesignSections(parseDesignDocument(designRawText));
    }, [designRawText]);

    useEffect(() => {
        setTasksSections(parseTasksDocument(tasksRawText));
    }, [tasksRawText]);

    const handleEditClick = (section: Section) => {
        setEditingSection(section);
        if (section.type === 'requirement' && section.data) {
            setEditForm({ title: section.title, userStory: section.data.userStory, criteria: [...section.data.acceptanceCriteria] });
        } else if (section.type === 'intro') {
            setEditForm({ title: section.title, content: section.content });
        } else if (section.type === 'glossary') {
            setEditForm({ title: section.title, items: [...(section.items || [])] });
        }
    };

    const handleSaveEdit = () => {
        if (!editingSection) return;
        const newSections = sections.map(s => {
            if (s === editingSection) {
                if (s.type === 'requirement' && s.data) {
                    return { ...s, title: editForm.title, data: { ...s.data, title: editForm.title, userStory: editForm.userStory, acceptanceCriteria: editForm.criteria } };
                } else if (s.type === 'intro') {
                    return { ...s, title: editForm.title, content: editForm.content };
                } else if (s.type === 'glossary') {
                    return { ...s, title: editForm.title, items: editForm.items };
                }
            }
            return s;
        });
        setSections(newSections);
        setRawText(serializeDocument(newSections));
        setEditingSection(null);
    };

    const handleCopy = () => {
        const text = serializeDocument(sections);
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
                <div className="max-w-[1600px] mx-auto flex items-center">
                    {/* Logo - Left */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Layout size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">SpecBoard</h1>
                            <p className="text-xs text-slate-500">Requirements Visualization & Editing</p>
                        </div>
                    </div>

                    {/* Page Navigation - Center */}
                    <div className="flex-1 flex justify-center">
                        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                            <button onClick={() => setActivePage('requirements')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activePage === 'requirements' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                                <FileText size={14} /> Requirements
                            </button>
                            <button onClick={() => setActivePage('design')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activePage === 'design' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                                <Layers size={14} /> Design
                            </button>
                            <button onClick={() => setActivePage('tasks')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activePage === 'tasks' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                                <ListTodo size={14} /> Tasks
                            </button>
                        </div>
                    </div>

                    {/* View Toggle - Right */}
                    <div className="hidden md:flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                        <button onClick={() => setActiveView('board')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeView === 'board' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                            <Layout size={14} className="inline mr-2" /> Board
                        </button>
                        <button onClick={() => setActiveView('raw')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeView === 'raw' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                            <Code size={14} className="inline mr-2" /> Raw
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-[1600px] mx-auto">
                {activePage === 'requirements' && (activeView === 'raw' || !rawText.trim() ? (
                    <div className="max-w-4xl mx-auto animate-in fade-in">
                        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                            <textarea className="w-full h-[80vh] bg-transparent text-slate-300 font-mono text-sm focus:outline-none resize-none" value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="Paste your requirements.md content here..." />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in">
                        <div>
                            {sections.filter(s => s.type === 'intro').map((s, i) => (
                                <div key={i} onClick={() => handleEditClick(s)} className="cursor-pointer hover:ring-1 hover:ring-indigo-500/50 rounded-xl transition-all">
                                    <IntroCard content={s.content || ''} />
                                </div>
                            ))}
                            <div className="flex gap-4 mt-6 flex-wrap">
                                <div className="px-4 py-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <span className="text-slate-400 text-sm">Requirements: <strong className="text-white">{sections.filter(s => s.type === 'requirement').length}</strong></span>
                                </div>
                                <div className="px-4 py-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-slate-400 text-sm">Total Criteria: <strong className="text-white">{sections.reduce((acc, curr) => acc + (curr.data?.acceptanceCriteria.length || 0), 0)}</strong></span>
                                </div>
                                <button onClick={handleCopy} className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-sm font-medium">
                                    {showCopyFeedback ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                    {showCopyFeedback ? 'Copied!' : 'Copy All'}
                                </button>
                            </div>
                        </div>
                        <div>
                            {sections.filter(s => s.type === 'glossary').map((s, i) => (
                                <div key={i} onClick={() => handleEditClick(s)} className="cursor-pointer hover:ring-1 hover:ring-indigo-500/50 rounded-xl transition-all">
                                    <GlossaryCard items={s.items || []} />
                                </div>
                            ))}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                                <Database className="text-indigo-500" size={24} /> System Specifications
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                                {sections.filter(s => s.type === 'requirement' && s.data).map((section, idx) => (
                                    <RequirementCard key={idx} req={section.data!} onClick={() => handleEditClick(section)} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                {activePage === 'design' && (
                    <DesignPage
                        activeView={activeView}
                        rawText={designRawText}
                        sections={designSections}
                        onRawTextChange={setDesignRawText}
                        onSectionsChange={setDesignSections}
                    />
                )}
                {activePage === 'tasks' && (
                    <TasksPage
                        activeView={activeView}
                        rawText={tasksRawText}
                        sections={tasksSections}
                        onRawTextChange={setTasksRawText}
                        onSectionsChange={setTasksSections}
                        requirementSections={sections}
                        onRequirementSectionsChange={setSections}
                        onRequirementRawTextChange={setRawText}
                    />
                )}
            </main>

            <Modal isOpen={!!editingSection} onClose={() => setEditingSection(null)} onSave={handleSaveEdit} title={`Edit: ${editingSection?.title || 'Section'}`}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                        <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-indigo-500 focus:outline-none font-medium" value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                    </div>
                    {editingSection?.type === 'requirement' && (
                        <>
                            <div>
                                <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2"><Search size={12} /> User Story</label>
                                <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-amber-600/50 focus:outline-none min-h-[100px] text-sm resize-y" value={editForm.userStory || ''} onChange={(e) => setEditForm({ ...editForm, userStory: e.target.value })} placeholder="As a user, I want..." />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2"><CheckCircle2 size={12} /> Acceptance Criteria Builder</label>
                                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                                    <CriteriaListEditor criteria={editForm.criteria || []} onChange={(c) => setEditForm({ ...editForm, criteria: c })} />
                                </div>
                            </div>
                        </>
                    )}
                    {editingSection?.type === 'glossary' && (
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Terms & Definitions</label>
                            <GlossaryEditor items={editForm.items || []} onChange={(items) => setEditForm({ ...editForm, items })} />
                        </div>
                    )}
                    {editingSection?.type === 'intro' && (
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Introduction Content</label>
                            <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-indigo-500 focus:outline-none min-h-[300px] text-sm resize-y" value={editForm.content || ''} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
