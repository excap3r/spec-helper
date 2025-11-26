import { useState, useRef, useEffect } from 'react';
import { ListTodo, Copy, CheckCircle2, Circle, Search, ArrowLeft, Edit3, Save, X } from 'lucide-react';
import type { TaskSection, Section } from '../types';
import { serializeTasksDocument } from '../utils/tasks';
import { serializeDocument } from '../utils/document';
import { TaskCard } from './TaskCard';
import { Modal } from './Modal';
import { CriteriaListEditor } from './CriteriaListEditor';
import { highlightSyntax } from '../utils/gherkin';

interface TasksPageProps {
    activeView: 'board' | 'raw';
    rawText: string;
    sections: TaskSection[];
    onRawTextChange: (text: string) => void;
    onSectionsChange: (sections: TaskSection[]) => void;
    requirementSections?: Section[];
    onRequirementSectionsChange?: (sections: Section[]) => void;
    onRequirementRawTextChange?: (text: string) => void;
}

interface EditingTask {
    sectionIdx: number;
    taskId: string;
    subtaskId?: string;
}

interface SelectedRequirement {
    section: Section;
    returnTo: EditingTask | null;
}

export const TasksPage = ({ activeView, rawText, sections, onRawTextChange, onSectionsChange, requirementSections, onRequirementSectionsChange, onRequirementRawTextChange }: TasksPageProps) => {
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);
    const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
    const [editForm, setEditForm] = useState<{ title: string; description: string; optional: boolean }>({ title: '', description: '', optional: false });
    const [selectedRequirement, setSelectedRequirement] = useState<SelectedRequirement | null>(null);
    const [isEditingReq, setIsEditingReq] = useState(false);
    const [reqEditForm, setReqEditForm] = useState<{ title: string; userStory: string; criteria: string[] }>({ title: '', userStory: '', criteria: [] });
    const [showAllRequirements, setShowAllRequirements] = useState(false);
    const savedScrollPosition = useRef<number>(0);

    // Reset scroll when entering detail view
    useEffect(() => {
        if (selectedRequirement) {
            window.scrollTo(0, 0);
        }
    }, [selectedRequirement]);

    const handleToggleTask = (sectionIdx: number, taskId: string) => {
        const newSections = sections.map((section, sIdx) => {
            if (sIdx !== sectionIdx) return section;
            return {
                ...section,
                tasks: section.tasks.map(task =>
                    task.id === taskId ? { ...task, completed: !task.completed } : task
                )
            };
        });
        onSectionsChange(newSections);
        onRawTextChange(serializeTasksDocument(newSections));
    };

    const handleToggleSubtask = (sectionIdx: number, taskId: string, subtaskId: string) => {
        const newSections = sections.map((section, sIdx) => {
            if (sIdx !== sectionIdx) return section;
            return {
                ...section,
                tasks: section.tasks.map(task => {
                    if (task.id !== taskId) return task;
                    return {
                        ...task,
                        subtasks: task.subtasks?.map(st =>
                            st.id === subtaskId ? { ...st, completed: !st.completed } : st
                        )
                    };
                })
            };
        });
        onSectionsChange(newSections);
        onRawTextChange(serializeTasksDocument(newSections));
    };

    const handleEditTask = (sectionIdx: number, taskId: string, subtaskId?: string) => {
        const section = sections[sectionIdx];
        const task = section.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Helper to ensure each line has bullet prefix for display
        const formatDescriptionForEdit = (desc: string) => {
            if (!desc) return '';
            return desc.split('\n').map(line => {
                const trimmed = line.trim();
                if (!trimmed) return '';
                return trimmed.startsWith('- ') ? trimmed : `- ${trimmed}`;
            }).filter(Boolean).join('\n');
        };

        if (subtaskId) {
            const subtask = task.subtasks?.find(st => st.id === subtaskId);
            if (subtask) {
                setEditForm({ title: subtask.title, description: formatDescriptionForEdit(subtask.description), optional: subtask.optional || false });
                setEditingTask({ sectionIdx, taskId, subtaskId });
            }
        } else {
            setEditForm({ title: task.title, description: formatDescriptionForEdit(task.description), optional: task.optional || false });
            setEditingTask({ sectionIdx, taskId });
        }
    };

    const handleSaveEdit = () => {
        if (!editingTask) return;

        const newSections = sections.map((section, sIdx) => {
            if (sIdx !== editingTask.sectionIdx) return section;
            return {
                ...section,
                tasks: section.tasks.map(task => {
                    if (task.id !== editingTask.taskId) return task;
                    
                    if (editingTask.subtaskId) {
                        return {
                            ...task,
                            subtasks: task.subtasks?.map(st =>
                                st.id === editingTask.subtaskId
                                    ? { ...st, title: editForm.title, description: editForm.description, optional: editForm.optional }
                                    : st
                            )
                        };
                    }
                    
                    return { ...task, title: editForm.title, description: editForm.description, optional: editForm.optional };
                })
            };
        });

        onSectionsChange(newSections);
        onRawTextChange(serializeTasksDocument(newSections));
        setEditingTask(null);
    };

    const handleDeleteTask = (sectionIdx: number, taskId: string) => {
        const newSections = sections.map((section, sIdx) => {
            if (sIdx !== sectionIdx) return section;
            return {
                ...section,
                tasks: section.tasks.filter(task => task.id !== taskId)
            };
        });
        onSectionsChange(newSections);
        onRawTextChange(serializeTasksDocument(newSections));
    };

    const handleDeleteSubtask = (sectionIdx: number, taskId: string, subtaskId: string) => {
        const newSections = sections.map((section, sIdx) => {
            if (sIdx !== sectionIdx) return section;
            return {
                ...section,
                tasks: section.tasks.map(task => {
                    if (task.id !== taskId) return task;
                    return {
                        ...task,
                        subtasks: task.subtasks?.filter(st => st.id !== subtaskId)
                    };
                })
            };
        });
        onSectionsChange(newSections);
        onRawTextChange(serializeTasksDocument(newSections));
    };

    const handleRequirementClick = (reqId: string) => {
        if (!requirementSections) return;
        
        // Handle "All" - show all requirements list
        if (reqId.toLowerCase() === 'all') {
            setShowAllRequirements(true);
            return;
        }
        
        // Find requirement by ID
        const reqSection = requirementSections.find(s => 
            s.type === 'requirement' && s.data?.id === reqId
        );
        
        if (reqSection) {
            savedScrollPosition.current = window.scrollY;
            setSelectedRequirement({ section: reqSection, returnTo: editingTask });
            setEditingTask(null);
            setIsEditingReq(false);
        }
    };

    const handleStartEditReq = () => {
        if (!selectedRequirement?.section.data) return;
        setReqEditForm({
            title: selectedRequirement.section.data.title,
            userStory: selectedRequirement.section.data.userStory,
            criteria: [...selectedRequirement.section.data.acceptanceCriteria]
        });
        setIsEditingReq(true);
    };

    const handleSaveRequirement = () => {
        if (!selectedRequirement || !requirementSections || !onRequirementSectionsChange || !onRequirementRawTextChange) return;

        const newSections = requirementSections.map(s => {
            if (s.type === 'requirement' && s.data?.id === selectedRequirement.section.data?.id) {
                return {
                    ...s,
                    title: reqEditForm.title,
                    data: {
                        ...s.data!,
                        id: s.data!.id,
                        title: reqEditForm.title,
                        userStory: reqEditForm.userStory,
                        acceptanceCriteria: reqEditForm.criteria
                    }
                };
            }
            return s;
        }) as Section[];

        onRequirementSectionsChange(newSections);
        onRequirementRawTextChange(serializeDocument(newSections));
        
        // Update selected requirement reference
        const updatedSection = newSections.find(s => s.data?.id === selectedRequirement.section.data?.id);
        if (updatedSection) {
            setSelectedRequirement({ ...selectedRequirement, section: updatedSection as Section });
        }
        setIsEditingReq(false);
    };

    const handleBackFromRequirement = () => {
        setSelectedRequirement(null);
        setIsEditingReq(false);
        setTimeout(() => {
            window.scrollTo(0, savedScrollPosition.current);
        }, 0);
    };

    const handleCopy = () => {
        const tempElement = document.createElement('textarea');
        tempElement.value = rawText;
        document.body.appendChild(tempElement);
        tempElement.select();
        document.execCommand('copy');
        document.body.removeChild(tempElement);
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 2000);
    };

    const allTasks = sections.flatMap(s => s.tasks);
    const completedTasks = allTasks.filter(t => t.completed).length;
    const totalTasks = allTasks.length;

    const allSubtasks = allTasks.flatMap(t => t.subtasks || []);
    const completedSubtasks = allSubtasks.filter(s => s.completed).length;
    const totalSubtasks = allSubtasks.length;

    // Show raw view if explicitly selected OR if content is empty
    if (activeView === 'raw' || !rawText.trim()) {
        return (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-inner">
                    <textarea
                        className="w-full h-[80vh] bg-transparent text-slate-300 font-mono text-sm focus:outline-none resize-none"
                        value={rawText}
                        onChange={(e) => onRawTextChange(e.target.value)}
                        placeholder="Paste your tasks.md content here..."
                    />
                </div>
            </div>
        );
    }

    // Requirement detail view
    if (selectedRequirement) {
        const req = selectedRequirement.section.data!;
        return (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleBackFromRequirement}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to tasks</span>
                    </button>
                    {isEditingReq && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditingReq(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors text-sm"
                            >
                                <X size={16} />
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRequirement}
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
                    {isEditingReq ? (
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                                    value={reqEditForm.title}
                                    onChange={(e) => setReqEditForm({ ...reqEditForm, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Search size={12} /> User Story
                                </label>
                                <textarea
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-amber-600/50 focus:outline-none min-h-[80px] text-sm resize-y"
                                    value={reqEditForm.userStory}
                                    onChange={(e) => setReqEditForm({ ...reqEditForm, userStory: e.target.value })}
                                    placeholder="As a user, I want..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <CheckCircle2 size={12} /> Acceptance Criteria
                                </label>
                                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                                    <CriteriaListEditor
                                        criteria={reqEditForm.criteria}
                                        onChange={(c) => setReqEditForm({ ...reqEditForm, criteria: c })}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 border-b border-slate-800 bg-slate-800/50 relative">
                                <div className="absolute top-4 right-4">
                                    <button
                                        onClick={handleStartEditReq}
                                        className="p-2 bg-slate-900 hover:bg-slate-700 text-indigo-400 rounded-full border border-indigo-500/30 transition-colors"
                                        title="Edit requirement"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs px-2 py-1 bg-indigo-900/30 text-indigo-400 rounded font-mono">
                                        Req {req.id}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-100 pr-12">
                                    {req.title.replace(/^Requirement\s+\d+(\.\d+)?\s*[-:.]?\s*/i, '')}
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* User Story */}
                                <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Search size={14} className="text-amber-500" />
                                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">User Story</span>
                                    </div>
                                    <p className="text-slate-300 italic">"{req.userStory}"</p>
                                </div>

                                {/* Acceptance Criteria */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                                            Acceptance Criteria ({req.acceptanceCriteria.length})
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {req.acceptanceCriteria.map((criterion, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                                <span className="text-indigo-400 font-mono text-sm min-w-[24px]">{idx + 1}.</span>
                                                <div className="text-slate-300 text-sm leading-relaxed">
                                                    {highlightSyntax(criterion)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats */}
            <div className="flex gap-4 flex-wrap items-center">
                <div className="px-4 py-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-slate-400 text-sm">
                        Tasks: <strong className="text-white">{completedTasks}/{totalTasks}</strong>
                    </span>
                </div>
                <div className="px-4 py-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-3">
                    <Circle size={16} className="text-indigo-500" />
                    <span className="text-slate-400 text-sm">
                        Subtasks: <strong className="text-white">{completedSubtasks}/{totalSubtasks}</strong>
                    </span>
                </div>

                {/* Progress bar */}
                <div className="flex-1 max-w-xs">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
                            style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleCopy}
                    className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors text-sm font-medium"
                >
                    {showCopyFeedback ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    {showCopyFeedback ? 'Copied!' : 'Copy All'}
                </button>
            </div>

            {/* Task Sections */}
            {sections.map((section, sectionIdx) => (
                <div key={sectionIdx}>
                    <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                        <ListTodo className="text-amber-500" size={24} />
                        {section.title}
                    </h2>
                    <div className="space-y-3">
                        {section.tasks.map((task, taskIdx) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                index={taskIdx + 1}
                                onToggle={() => handleToggleTask(sectionIdx, task.id)}
                                onSubtaskToggle={(subtaskId) => handleToggleSubtask(sectionIdx, task.id, subtaskId)}
                                onEdit={() => handleEditTask(sectionIdx, task.id)}
                                onEditSubtask={(subtaskId) => handleEditTask(sectionIdx, task.id, subtaskId)}
                                onDelete={() => handleDeleteTask(sectionIdx, task.id)}
                                onDeleteSubtask={(subtaskId) => handleDeleteSubtask(sectionIdx, task.id, subtaskId)}
                                onRequirementClick={handleRequirementClick}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                onSave={handleSaveEdit}
                title={`Edit: ${editForm.title || 'Task'}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                        <input
                            type="text"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                        <textarea
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-indigo-500 focus:outline-none min-h-[150px] text-sm resize-y"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Task description..."
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="optional"
                            checked={editForm.optional}
                            onChange={(e) => setEditForm({ ...editForm, optional: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                        />
                        <label htmlFor="optional" className="text-sm text-slate-400">Mark as optional</label>
                    </div>
                </div>
            </Modal>

            {/* All Requirements Modal */}
            <Modal
                isOpen={showAllRequirements}
                onClose={() => setShowAllRequirements(false)}
                onSave={undefined}
                title="All Requirements"
            >
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {requirementSections?.filter(s => s.type === 'requirement' && s.data).map((section) => (
                        <button
                            key={section.data!.id}
                            onClick={() => {
                                setShowAllRequirements(false);
                                savedScrollPosition.current = window.scrollY;
                                setSelectedRequirement({ section, returnTo: null });
                            }}
                            className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-900/30 text-indigo-400 rounded">
                                    {section.data!.id}
                                </span>
                                <span className="text-slate-200 font-medium text-sm">
                                    {section.data!.title.replace(/^Requirement\s+\d+(\.\d+)?\s*[-:.]?\s*/i, '')}
                                </span>
                            </div>
                            {section.data!.userStory && (
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{section.data!.userStory}</p>
                            )}
                        </button>
                    ))}
                    {(!requirementSections || requirementSections.filter(s => s.type === 'requirement').length === 0) && (
                        <p className="text-slate-500 text-sm text-center py-4">
                            No requirements found. Load requirements.md in the Requirements page.
                        </p>
                    )}
                </div>
            </Modal>
        </div>
    );
};
