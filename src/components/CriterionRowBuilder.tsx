import { useState, useEffect } from 'react';
import { Trash2, Code, ArrowRight, ChevronDown, Settings2 } from 'lucide-react';
import type { GherkinParts } from '../types';
import { KEYWORDS } from '../constants';
import { parseGherkinSentence } from '../utils/gherkin';

// Parse actor and action from text like "System SHALL do something"
const parseActorAction = (text: string): { actor: string; actionType: string; actionText: string } => {
    const actionMatch = text.match(/^(.*?)\b(SHALL|SHOULD|MUST|WILL)\b\s*(.*)/i);
    if (actionMatch) {
        return {
            actor: actionMatch[1].trim(),
            actionType: actionMatch[2].toUpperCase(),
            actionText: actionMatch[3].trim()
        };
    }
    return { actor: '', actionType: 'SHALL', actionText: text };
};

const buildSentence = (parts: GherkinParts, actor: string, actionType: string, actionText: string): string => {
    if (!parts.isStructured) return parts.original;

    let output = '';

    // 1. Condition Block
    if (parts.conditionText.length > 0) {
        output += `${parts.conditionType} ${parts.conditionText}`;
    }

    // 2. Actor + Action
    const actorPart = actor ? `${actor} ` : '';
    const actionPart = `${actorPart}${actionType} ${actionText}`;

    if (actionPart.trim().length > 0) {
        if (parts.conditionText.length > 0) {
            output += `, `;
        }
        if (parts.actorPrefix) {
            output += `${parts.actorPrefix} ${actionPart}`;
        } else {
            output += actionPart;
        }
    }

    return output;
};

export const CriterionRowBuilder = ({
    value,
    onChange,
    onDelete
}: {
    value: string;
    onChange: (val: string) => void;
    onDelete: () => void;
}) => {
    const [parts, setParts] = useState<GherkinParts>(parseGherkinSentence(value));
    const [actor, setActor] = useState('');
    const [actionType, setActionType] = useState('SHALL');
    const [actionText, setActionText] = useState('');

    useEffect(() => {
        const newParts = parseGherkinSentence(value);
        setParts(newParts);
        const parsed = parseActorAction(newParts.actorAndAction);
        setActor(parsed.actor);
        setActionType(parsed.actionType);
        setActionText(parsed.actionText);
    }, [value]);

    const updatePart = (field: keyof GherkinParts, val: string) => {
        const newParts = { ...parts, [field]: val };
        setParts(newParts);
        onChange(buildSentence(newParts, actor, actionType, actionText));
    };

    const updateActor = (val: string) => {
        setActor(val);
        onChange(buildSentence(parts, val, actionType, actionText));
    };

    const updateActionType = (val: string) => {
        setActionType(val);
        onChange(buildSentence(parts, actor, val, actionText));
    };

    const updateActionText = (val: string) => {
        setActionText(val);
        onChange(buildSentence(parts, actor, actionType, val));
    };

    const toggleStructure = () => {
        const newVal = !parts.isStructured;

        if (newVal) {
            const freshParse = parseGherkinSentence(parts.original);
            const parsed = parseActorAction(freshParse.actorAndAction);
            setParts({ ...freshParse, isStructured: true });
            setActor(parsed.actor);
            setActionType(parsed.actionType);
            setActionText(parsed.actionText);
            onChange(buildSentence({ ...freshParse, isStructured: true }, parsed.actor, parsed.actionType, parsed.actionText));
        } else {
            const currentFullSentence = buildSentence(parts, actor, actionType, actionText);
            setParts({ ...parts, isStructured: false, original: currentFullSentence });
            onChange(currentFullSentence);
        }
    };

    if (!parts.isStructured) {
        return (
            <div className="flex gap-2 items-start animate-in fade-in">
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Free Text Criterion</label>
                        <button onClick={toggleStructure} className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                            <Settings2 size={10} /> Switch to Builder
                        </button>
                    </div>
                    <textarea
                        className="w-full bg-transparent border border-slate-700/50 rounded-md p-2 text-slate-300 text-sm focus:outline-none resize-y min-h-[80px]"
                        value={parts.original}
                        onChange={(e) => updatePart('original', e.target.value)}
                    />
                </div>
                <button onClick={onDelete} className="p-3 mt-1 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg" title="Delete criterion">
                    <Trash2 size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-2 items-start group animate-in slide-in-from-left-2 fade-in duration-300">
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 group-hover:border-indigo-500/30 transition-all shadow-sm">

                {/* Header */}
                <div className="flex justify-between items-center px-2 py-1 mb-1 border-b border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Gherkin Sentence Builder</span>
                    <button onClick={toggleStructure} className="text-[10px] text-slate-500 hover:text-indigo-400 flex items-center gap-1">
                        <Code size={10} /> Switch to Free Text
                    </button>
                </div>

                <div className="flex flex-col gap-2 p-1">

                    {/* CONDITION BLOCK */}
                    <div className="flex items-center bg-purple-900/10 rounded border border-purple-500/20 overflow-hidden w-full">
                        <div className="relative flex-shrink-0">
                            <select
                                className="appearance-none bg-purple-900/20 text-purple-400 font-bold text-xs py-2 pl-2 pr-6 outline-none cursor-pointer hover:bg-purple-900/30 transition-colors"
                                value={parts.conditionType}
                                onChange={(e) => updatePart('conditionType', e.target.value)}
                                title="Condition type"
                            >
                                {KEYWORDS.condition.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                            <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
                        </div>
                        <input
                            className="flex-1 bg-transparent border-l border-purple-500/20 text-slate-300 text-sm py-1 px-2 outline-none placeholder-purple-500/30 w-full"
                            placeholder="event occurs / user performs action..."
                            value={parts.conditionText}
                            onChange={(e) => updatePart('conditionText', e.target.value)}
                            title="Condition description"
                        />
                    </div>

                    <div className="text-[10px] font-bold text-slate-700 flex items-center gap-2">
                        <ArrowRight size={10} /> ACTOR & EXPECTED ACTION
                    </div>

                    {/* ACTOR + ACTION ROW */}
                    <div className="flex items-center bg-emerald-900/10 rounded border border-emerald-500/20 overflow-hidden w-full">
                        {/* THE prefix dropdown */}
                        <div className="relative flex-shrink-0">
                            <select
                                className="appearance-none bg-blue-900/20 text-blue-400 font-bold text-xs py-2 pl-2 pr-5 outline-none cursor-pointer hover:bg-blue-900/30 transition-colors border-r border-blue-500/20"
                                value={parts.actorPrefix}
                                onChange={(e) => updatePart('actorPrefix', e.target.value)}
                                title="Prefix"
                            >
                                {KEYWORDS.entity.map(k => <option key={k} value={k}>{k}</option>)}
                                <option value="">—</option>
                            </select>
                            <ChevronDown size={8} className="absolute right-0.5 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                        </div>

                        {/* Actor input */}
                        <input
                            className="w-32 bg-transparent border-r border-emerald-500/20 text-slate-300 text-sm py-1 px-2 outline-none placeholder-slate-600"
                            placeholder="Actor..."
                            value={actor}
                            onChange={(e) => updateActor(e.target.value)}
                            title="Actor name"
                        />

                        {/* Action type dropdown (SHALL/MUST/SHOULD) */}
                        <div className="relative flex-shrink-0">
                            <select
                                className="appearance-none bg-emerald-900/20 text-emerald-400 font-bold text-xs py-2 pl-2 pr-6 outline-none cursor-pointer hover:bg-emerald-900/30 transition-colors border-r border-emerald-500/20"
                                value={actionType}
                                onChange={(e) => updateActionType(e.target.value)}
                                title="Action type"
                            >
                                {KEYWORDS.action.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                            <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
                        </div>

                        {/* Action text input */}
                        <input
                            className="flex-1 bg-transparent text-slate-300 text-sm py-1 px-2 outline-none placeholder-emerald-500/30 w-full"
                            placeholder="perform action..."
                            value={actionText}
                            onChange={(e) => updateActionText(e.target.value)}
                            title="Action description"
                        />
                    </div>

                </div>
            </div>
            <button onClick={onDelete} className="p-3 mt-3 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Delete criterion">
                <Trash2 size={16} />
            </button>
        </div>
    );
};
