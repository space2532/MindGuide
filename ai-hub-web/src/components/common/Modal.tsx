import React from 'react';
import { TimesIcon } from '../icons';

interface ModalProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-bold">{title}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-black">
                    <TimesIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

