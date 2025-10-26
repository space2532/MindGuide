import React, { useState } from 'react';
import { SendIcon } from '../icons';

interface ChatInputFormProps {
    onSendMessage: (msg: string) => void;
    isLoading: boolean;
    isDisabled: boolean;
    placeholder: string;
}

export const ChatInputForm: React.FC<ChatInputFormProps> = React.memo(({ 
    onSendMessage, 
    isLoading, 
    isDisabled, 
    placeholder 
}) => {
    const [input, setInput] = useState('');

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const msg = input.trim();
        if (msg) {
            onSendMessage(msg);
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
        }
    };

    return (
        <form onSubmit={handleFormSubmit} className="relative">
            <textarea
                className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors resize-none"
                rows={1}
                placeholder={placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || isDisabled}
                onKeyDown={handleKeyDown}
            />
            <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black disabled:text-gray-300"
                disabled={!input.trim() || isLoading || isDisabled}
            >
                <SendIcon className="w-6 h-6"/>
            </button>
        </form>
    );
});

ChatInputForm.displayName = 'ChatInputForm';

