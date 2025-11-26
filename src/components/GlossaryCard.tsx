import { Database } from 'lucide-react';

export const GlossaryCard = ({ items }: { items: string[] }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
            <Database size={18} /> Glossary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item, i) => {
                const [term, ...defParts] = item.includes(':') ? item.split(':') : [item];
                const def = defParts.join(':').trim();
                return (
                    <div key={i} className="text-sm p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                        <span className="text-slate-200 font-bold">{term.replace(/\*\*/g, '').trim()}:</span>
                        <span className="text-slate-400 block mt-1">{def}</span>
                    </div>
                );
            })}
        </div>
    </div>
);
