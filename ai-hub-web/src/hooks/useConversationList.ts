import { useState, useCallback } from 'react';
import { Conversation, Roadmap, RoadmapStep } from '../types';

const BASE_API_URL = 'http://localhost:4000';

export const useConversationList = () => {
    const [pastConversations, setPastConversations] = useState<Conversation[]>([]);
    const [editingConvId, setEditingConvId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');

    const fetchPastConversations = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_API_URL}/conversations`);
            if (!res.ok) throw new Error('대화 목록을 불러올 수 없습니다.');
            const data = await res.json();
            setPastConversations(data.conversations || []);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const deleteConversation = useCallback(async (id: string) => {
        if (!window.confirm("정말로 이 대화를 삭제하시겠습니까?")) return;
        
        try {
            const res = await fetch(`${BASE_API_URL}/conversations/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("삭제에 실패했습니다.");
            setPastConversations(prev => prev.filter(c => c._id !== id));
        } catch (error) {
            console.error("Delete failed:", error);
        }
    }, []);

    const updateConversationTitle = useCallback(async (id: string) => {
        if (!editingTitle.trim()) {
            setEditingConvId(null);
            return;
        }

        try {
            const res = await fetch(`${BASE_API_URL}/conversations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editingTitle })
            });
            if (!res.ok) throw new Error("제목 수정에 실패했습니다.");
            setPastConversations(prev => prev.map(c => c._id === id ? { ...c, title: editingTitle } : c));
            setEditingConvId(null);
            setEditingTitle('');
        } catch (error) {
            console.error("Update title failed:", error);
        }
    }, [editingTitle]);

    return {
        pastConversations,
        editingConvId,
        editingTitle,
        setEditingConvId,
        setEditingTitle,
        fetchPastConversations,
        deleteConversation,
        updateConversationTitle
    };
};

