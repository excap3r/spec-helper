import React from 'react';
import { Trash2, Plus } from 'lucide-react';

interface GlossaryEditorProps {
    items: string[];
    onChange: (items: string[]) => void;
}

export const GlossaryEditor: React.FC<GlossaryEditorProps> = ({ items, onChange }) => {
    const handleItemChange = (idx: number, field: 'term' | 'def', value: string) => {
        const newItems = [...items];
        const parts = newItems[idx].includes(':') ? newItems[idx].split(':') : [newItems[idx], ''];
        let term = parts[0];
        let def = parts.slice(1).join(':'); // Rejoin in case def has colons

        if (field === 'term') term = `**${value.replace(/\*\*/g, '')}**`;
        else def = value;

        newItems[idx] = `${term}: ${def}`;
        onChange(newItems);
    };

    const deleteItem = (idx: number) => {
        onChange(items.filter((_, i) => i !== idx));
    };

    const addItem = () => {
        onChange([...items, '**New Term**: Definition description here']);
    };

    return (
        <div className="space-y-3">
            {items.map((item, idx) => {
                const colonIndex = item.indexOf(':');
                const term = colonIndex > -1 ? item.slice(0, colonIndex).replace(/\*\*/g, '').trim() : item.replace(/\*\*/g, '').trim();
                // Only trim the leading space after colon, preserve trailing spaces for typing
                const rawDef = colonIndex > -1 ? item.slice(colonIndex + 1) : '';
                const def = rawDef.startsWith(' ') ? rawDef.slice(1) : rawDef;

                return (
                    <div key={idx} className="flex gap-2 items-start group animate-in slide-in-from-left-2 fade-in duration-300">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-slate-950 border border-slate-800 rounded-lg group-hover:border-indigo-500/50 transition-colors">
                            <div className="md:col-span-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Term</label>
                                <input
                                    className="w-full bg-transparent border-b border-slate-700 focus:border-indigo-500 outline-none text-slate-200 text-sm py-1 font-semibold"
                                    value={term}
                                    placeholder="Term name"
                                    onChange={(e) => handleItemChange(idx, 'term', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Definition</label>
                                {/* ZMĚNA: Použití textarea pro delší definice */}
                                <textarea
                                    className="w-full bg-transparent border-b border-slate-700 focus:border-slate-500 outline-none text-slate-300 text-sm py-1 resize-y min-h-[50px] overflow-hidden"
                                    rows={1}
                                    value={def}
                                    placeholder="Detailed definition description"
                                    onChange={(e) => handleItemChange(idx, 'def', e.target.value)}
                                    onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                                        // Auto-resize textarea
                                        e.currentTarget.style.height = 'auto';
                                        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                    }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => deleteItem(idx)}
                            className="p-3 mt-1 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Delete term"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                );
            })}
            <button
                onClick={addItem}
                className="w-full py-3 border border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-indigo-400 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
                <Plus size={16} /> Add Term to Glossary
            </button>
        </div>
    );
};
