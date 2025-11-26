import React, { useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
    children: React.ReactNode;
    title: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, children, title }) => {
    // Disable body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900 z-10">
                    <div>
                        <h3 className="text-xl font-bold text-slate-100">{title}</h3>
                        <p className="text-xs text-slate-500 mt-1">Make changes in the interactive editor.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
                    {children}
                </div>
                {onSave && (
                    <div className="p-4 border-t border-slate-800 flex justify-end">
                        <button
                            onClick={onSave}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2 text-sm"
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
