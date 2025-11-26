import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Copy, Check, Edit3, Trash2 } from 'lucide-react';
import type { Task } from '../types';

export const TaskCard = ({
    task,
    index,
    onToggle,
    onSubtaskToggle,
    onEdit,
    onEditSubtask,
    onDelete,
    onDeleteSubtask,
    onRequirementClick
}: {
    task: Task;
    index: number;
    onToggle: () => void;
    onSubtaskToggle: (subtaskId: string) => void;
    onEdit?: () => void;
    onEditSubtask?: (subtaskId: string) => void;
    onDelete?: () => void;
    onDeleteSubtask?: (subtaskId: string) => void;
    onRequirementClick?: (reqId: string) => void;
}) => {
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const [expanded, setExpanded] = useState(hasSubtasks); // Default open if has subtasks
    const [copied, setCopied] = useState(false);
    const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        let text = `${index}. ${task.title}\n`;
        if (task.description) text += `   ${task.description}\n`;
        if (task.subtasks) {
            task.subtasks.forEach((st, i) => {
                text += `   ${index}.${i + 1} [${st.completed ? 'x' : ' '}] ${st.title}\n`;
            });
        }
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
        <div className={`rounded-xl overflow-hidden ${task.optional ? 'bg-slate-900/50 border border-slate-700/50 opacity-70' : 'bg-slate-800 border border-slate-700'}`}>
            <div
                className="p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-750 transition-colors"
                onClick={() => hasSubtasks && setExpanded(!expanded)}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    className="mt-0.5 flex-shrink-0"
                >
                    {task.completed ? (
                        <CheckCircle2 size={20} className={task.optional ? 'text-slate-500' : 'text-emerald-500'} />
                    ) : (
                        <Circle size={20} className={task.optional ? 'text-slate-600 hover:text-slate-400' : 'text-slate-500 hover:text-indigo-400'} />
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        {hasSubtasks && (
                            <span className="text-slate-500">
                                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </span>
                        )}
                        <span className={`font-medium ${task.completed ? 'text-slate-500 line-through' : task.optional ? 'text-slate-400' : 'text-slate-200'}`}>
                            {index}. {task.title}
                        </span>
                        {task.optional && (
                            <span className="text-[9px] px-1 py-0.5 bg-slate-700/50 text-slate-500 rounded italic">
                                optional
                            </span>
                        )}
                    </div>

                    {task.description && (
                        <div className="text-sm text-slate-400 mt-1 ml-6 space-y-1">
                            {task.description.split('\n').map((line, i) => (
                                <p key={i} className="flex items-start gap-2">
                                    <span className="text-slate-600">•</span>
                                    <span>{line.replace(/^- /, '')}</span>
                                </p>
                            ))}
                        </div>
                    )}

                    {hasSubtasks && (
                        <div className="flex items-center gap-2 mt-2 ml-6">
                            <div className="h-1.5 flex-1 max-w-32 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all"
                                    style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-slate-500">
                                {completedSubtasks}/{totalSubtasks}
                            </span>
                        </div>
                    )}

                    {task.requirements && task.requirements.length > 0 && (
                        <div className="flex gap-1 mt-2 ml-6 flex-wrap">
                            {task.requirements.map((req, i) => {
                                const isAll = req.toLowerCase() === 'all';
                                return (
                                    <button
                                        key={i}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRequirementClick?.(req);
                                        }}
                                        className={`text-[10px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                            isAll 
                                                ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-800/50 hover:text-amber-300'
                                                : 'bg-indigo-900/30 text-indigo-400 hover:bg-indigo-800/50 hover:text-indigo-300'
                                        }`}
                                    >
                                        {isAll ? 'All Requirements' : `Req ${req}`}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {onEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-2 text-slate-500 hover:text-indigo-400 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Edit task"
                    >
                        <Edit3 size={14} />
                    </button>
                )}
                <button
                    onClick={handleCopy}
                    className="p-2 text-slate-500 hover:text-emerald-400 rounded-lg hover:bg-slate-700 transition-colors"
                    title="Copy task"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Delete task"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {expanded && hasSubtasks && (
                <div className="border-t border-slate-700 bg-slate-850 p-3 space-y-2">
                    {task.subtasks?.map((subtask, subIdx) => (
                        <div
                            key={subtask.id}
                            className={`flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors ${subtask.optional ? 'opacity-70' : ''}`}
                        >
                            <button
                                onClick={() => onSubtaskToggle(subtask.id)}
                                className="mt-0.5 flex-shrink-0"
                            >
                                {subtask.completed ? (
                                    <CheckCircle2 size={16} className={subtask.optional ? 'text-slate-500' : 'text-emerald-500'} />
                                ) : (
                                    <Circle size={16} className={subtask.optional ? 'text-slate-600 hover:text-slate-400' : 'text-slate-500 hover:text-indigo-400'} />
                                )}
                            </button>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm ${subtask.completed ? 'text-slate-500 line-through' : subtask.optional ? 'text-slate-400' : 'text-slate-300'}`}>
                                        {index}.{subIdx + 1} {subtask.title}
                                    </span>
                                    {subtask.optional && (
                                        <span className="text-[8px] px-1 py-0.5 bg-slate-700/50 text-slate-500 rounded italic">
                                            optional
                                        </span>
                                    )}
                                </div>
                                {subtask.description && (
                                    <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                                        {subtask.description.split('\n').map((line, i) => (
                                            <p key={i} className="flex items-start gap-1.5">
                                                <span className="text-slate-600">•</span>
                                                <span>{line.replace(/^- /, '')}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                                {subtask.requirements && subtask.requirements.length > 0 && (
                                    <div className="flex gap-1 mt-1 flex-wrap">
                                        {subtask.requirements.map((req, i) => {
                                            const isAll = req.toLowerCase() === 'all';
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRequirementClick?.(req);
                                                    }}
                                                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                                        isAll 
                                                            ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-800/50 hover:text-amber-300'
                                                            : 'bg-indigo-900/30 text-indigo-400 hover:bg-indigo-800/50 hover:text-indigo-300'
                                                    }`}
                                                >
                                                    {isAll ? 'All Requirements' : `Req ${req}`}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            {onEditSubtask && (
                                <button
                                    onClick={() => onEditSubtask(subtask.id)}
                                    className="p-1 text-slate-600 hover:text-indigo-400 rounded hover:bg-slate-700 transition-colors"
                                    title="Edit subtask"
                                >
                                    <Edit3 size={12} />
                                </button>
                            )}
                            {onDeleteSubtask && (
                                <button
                                    onClick={() => onDeleteSubtask(subtask.id)}
                                    className="p-1 text-slate-600 hover:text-red-400 rounded hover:bg-slate-700 transition-colors"
                                    title="Delete subtask"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};