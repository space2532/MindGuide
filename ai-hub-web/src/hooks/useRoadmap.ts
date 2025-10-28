import React, { useState, useCallback } from 'react';
import { Roadmap, RoadmapStep, AiGuideData, DisplayedPrompt, Message, RoadmapState, ConversationType } from '../types';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const useRoadmap = () => {
    const [currentRoadmapStep, setCurrentRoadmapStep] = useState<RoadmapStep>({ goalIndex: 0, actionIndex: 0 });
    const [toggledStep, setToggledStep] = useState<string | null>(null);
    const [cachedAiGuides, setCachedAiGuides] = useState<Record<string, AiGuideData>>({});
    const [activatedSteps, setActivatedSteps] = useState<Set<string>>(new Set());
    const [isLoadingGuide, setIsLoadingGuide] = useState(false);
    const [displayedPrompt, setDisplayedPrompt] = useState<DisplayedPrompt | null>(null);

    const handleShowAiGuide = useCallback(async (stepKey: string, conversationId: string | null, roadmap: Roadmap | null) => {
        setToggledStep(stepKey);
        if (cachedAiGuides[stepKey]) return;

        setIsLoadingGuide(true);
        setDisplayedPrompt(null);
        const [goalIndex, actionIndex] = stepKey.split('-').map(Number);

        try {
            if (!conversationId || !roadmap) return;
            const goal = roadmap.intermediateGoals[goalIndex];
            const action = goal.actions[actionIndex];
            const res = await fetch(`${BASE_API_URL}/roadmap/ai-help`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, currentGoal: goal.goal, currentAction: action.action })
            });
            if (!res.ok) throw new Error('AI 가이드 정보를 가져오지 못했습니다.');
            const data = await res.json();
            setCachedAiGuides(prev => ({...prev, [stepKey]: data}));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingGuide(false);
        }
    }, [cachedAiGuides]);

    const handleRoadmapProgress = useCallback((roadmap: Roadmap | null) => {
        if (!roadmap) return;
        setToggledStep(null);
        setDisplayedPrompt(null);
        setCurrentRoadmapStep(prev => {
            let { goalIndex, actionIndex } = prev;
            if (actionIndex < roadmap.intermediateGoals[goalIndex].actions.length - 1) {
                actionIndex++;
            } else if (goalIndex < roadmap.intermediateGoals.length - 1) { 
                goalIndex++; 
                actionIndex = 0; 
            } else { 
                alert("모든 로드맵을 완료했습니다!"); 
                return prev; 
            }
            return { goalIndex, actionIndex };
        });
    }, []);

    const handleActionButtonClick = useCallback(async (
        conversationId: string | null,
        isLoading: boolean,
        conversationType: ConversationType,
        roadmapState: RoadmapState,
        roadmap: Roadmap | null,
        setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
        setRoadmap: React.Dispatch<React.SetStateAction<Roadmap | null>>,
        setRoadmapState: React.Dispatch<React.SetStateAction<RoadmapState>>
    ) => {
        if (conversationType === '로드맵 생성' && roadmapState === 'generation_complete' && roadmap) {
            const stepKey = `${currentRoadmapStep.goalIndex}-${currentRoadmapStep.actionIndex}`;
            setActivatedSteps(prev => new Set(prev).add(stepKey));
            handleShowAiGuide(stepKey, conversationId, roadmap);
            return;
        }
        if (!conversationId || isLoading) return;

        try {
            const endpoint = conversationType === '로드맵 생성' ? 'roadmap/generate' : 'conversation/summarize';
            const res = await fetch(`${BASE_API_URL}/${endpoint}`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ conversationId }) 
            });
            if (!res.ok) throw new Error((await res.json()).error || '작업 수행에 실패했습니다.');
            const data = await res.json();
            if (data.roadmap) setRoadmap(data.roadmap);
            if (data.roadmapState) setRoadmapState(data.roadmapState);
            setMessages(prev => [...prev, { sender: 'AI', content: data.aiResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'AI', content: `오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` }]);
        }
    }, [currentRoadmapStep, handleShowAiGuide]);

    return {
        currentRoadmapStep,
        setCurrentRoadmapStep,
        toggledStep,
        setToggledStep,
        cachedAiGuides,
        setCachedAiGuides,
        activatedSteps,
        setActivatedSteps,
        isLoadingGuide,
        displayedPrompt,
        setDisplayedPrompt,
        handleShowAiGuide,
        handleRoadmapProgress,
        handleActionButtonClick
    };
};
