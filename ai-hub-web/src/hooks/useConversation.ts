import { useState, useCallback } from 'react';
import { Conversation, Message, Roadmap, RoadmapState, RoadmapStep, AiGuideData, DisplayedPrompt } from '../types';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const useConversation = () => {
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversationType, setConversationType] = useState<'고민 정리' | '로드맵 생성'>('고민 정리');
    const [messages, setMessages] = useState<Message[]>([]);
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [roadmapState, setRoadmapState] = useState<RoadmapState>('not_started');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [mainError, setMainError] = useState<string | null>(null);

    const newConversation = useCallback(() => {
        setConversationId(null);
        setMessages([]);
        setRoadmap(null);
        setRoadmapState('not_started');
        setMainError(null);
    }, []);

    const sendMessage = useCallback(async (messageContent: string) => {
        const userMessage: Message = { sender: 'user', content: messageContent };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setMainError(null);

        try {
            const res = await fetch(`${BASE_API_URL}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, content: messageContent, type: conversationType }),
            });

            if (!res.ok) throw new Error((await res.json()).error || '메시지 전송에 실패했습니다.');

            const data = await res.json();
            if (data.conversationId && !conversationId) setConversationId(data.conversationId);
            if (data.roadmapState) setRoadmapState(data.roadmapState);
            setMessages(prev => [...prev, { sender: 'AI', content: data.aiResponse }]);
        } catch (error) {
            setMessages(prev => prev.filter(msg => msg !== userMessage));
            setMainError(error instanceof Error ? error.message : '알 수 없는 오류');
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, conversationType]);

    const loadPastConversation = useCallback(async (id: string) => {
        setIsLoading(true);
        newConversation();

        try {
            const res = await fetch(`${BASE_API_URL}/conversation/${id}`);
            if (!res.ok) throw new Error('대화를 불러올 수 없습니다.');

            const data = await res.json();
            setConversationId(data._id);
            setConversationType(data.type);
            setMessages(data.messages);
            setRoadmap(data.roadmap || null);
            setRoadmapState(data.roadmapState || 'not_started');
        } catch (e) {
            console.error(e);
            setMainError(e instanceof Error ? e.message : '알 수 없는 오류');
        } finally {
            setIsLoading(false);
        }
    }, [newConversation]);

    return {
        conversationId,
        conversationType,
        setConversationType,
        messages,
        setMessages,
        roadmap,
        setRoadmap,
        roadmapState,
        setRoadmapState,
        isLoading,
        mainError,
        newConversation,
        sendMessage,
        loadPastConversation
    };
};

