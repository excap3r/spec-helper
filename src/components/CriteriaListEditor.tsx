import React from 'react';
import { Plus } from 'lucide-react';
import { CriterionRowBuilder } from './CriterionRowBuilder';

interface CriteriaListEditorProps {
    criteria: string[];
    onChange: (c: string[]) => void;
}

export const CriteriaListEditor: React.FC<CriteriaListEditorProps> = ({ criteria, onChange }) => {
    const handleChange = (idx: number, val: string) => {
        const newC = [...criteria];
        newC[idx] = val;
        onChange(newC);
    };

    const handleDelete = (idx: number) => {
        onChange(criteria.filter((_, i) => i !== idx));
    };

    const addCriterion = () => {
        // Default template for new criteria
        onChange([...criteria, 'WHEN user clicks, THE System SHALL display message "OK"']);
    };

    return (
        <div className="space-y-3">
            {criteria.map((c, idx) => (
                <CriterionRowBuilder
                    key={idx}
                    value={c}
                    onChange={(val) => handleChange(idx, val)}
                    onDelete={() => handleDelete(idx)}
                />
            ))}

            <button
                onClick={addCriterion}
                className="w-full py-3 border border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-emerald-400 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
                <Plus size={16} /> Add Acceptance Criterion
            </button>
        </div>
    );
};
