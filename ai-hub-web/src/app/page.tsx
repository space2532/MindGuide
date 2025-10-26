'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// --- Type Definitions ---
interface Message { sender: 'user' | 'AI'; content: string; }
interface ActionItem { action: string; completed: boolean; }
interface IntermediateGoal { goal: string; actions: ActionItem[]; }
interface Roadmap { finalGoal: string; intermediateGoals: IntermediateGoal[]; }
interface Conversation { _id: string; title: string; type: string; roadmapState?: RoadmapState; roadmap?: Roadmap; }
interface AiTool { name: string; url: string; specialization: string; cost: string; prompt: string; }
interface AiGuideData { ai_tools: AiTool[]; recommendation: { name: string; reason: string; }; }
type Page = 'chat' | 'info' | 'settings';
type ConversationType = '고민 정리' | '로드맵 생성';
type RoadmapState = 'not_started' | 'collecting_info' | 'generation_complete';

// --- UI Icon Components ---
const SendIcon = ({ className }: { className?: string }) => (<svg className={className} fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.8-5.5 34 1.4z"/></svg>);
const TimesIcon = ({ className }: { className?: string }) => (<svg className={className} fill="currentColor" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>);
const ChevronRightIcon = ({ className }: { className?: string }) => (<svg className={className} fill="currentColor" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg"><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>);
const ChevronLeftIcon = ({ className }: { className?: string }) => (<svg className={className} fill="currentColor" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg"><path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>);
const EllipsisVerticalIcon = ({ className }: { className?: string }) => (<svg className={className} fill="currentColor" viewBox="0 0 128 512" xmlns="http://www.w3.org/2000/svg"><path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"/></svg>);

// --- Reusable UI Components ---
const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}><div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center p-4 border-b"><h2 className="text-lg font-bold">{title}</h2><button onClick={onClose} className="text-gray-500 hover:text-black"><TimesIcon className="w-5 h-5" /></button></div><div className="p-6">{children}</div></div></div>);
const InfoPage = ({ onBack }: { onBack: () => void }) => (<div className="p-8 h-full"><button onClick={onBack} className="mb-4 font-semibold hover:underline text-blue-600">&larr; 뒤로가기</button><h1 className="text-3xl font-bold mb-4">정보</h1><p className="text-gray-600">이곳에 정보 페이지 내용이 표시됩니다.</p></div>);
const SettingsPage = ({ onBack }: { onBack: () => void }) => (<div className="p-8 h-full"><button onClick={onBack} className="mb-4 font-semibold hover:underline text-blue-600">&larr; 뒤로가기</button><h1 className="text-3xl font-bold mb-4">설정</h1><p className="text-gray-600">이곳에 설정 페이지 내용이 표시됩니다.</p></div>);
const ChatInputForm = React.memo(({ onSendMessage, isLoading, isDisabled, placeholder }: { onSendMessage: (msg: string) => void; isLoading: boolean; isDisabled: boolean; placeholder: string; }) => { const [input, setInput] = useState(''); const handleFormSubmit = (e: React.FormEvent) => { e.preventDefault(); const msg = input.trim(); if (msg) { onSendMessage(msg); setInput(''); } }; const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }; return (<form onSubmit={handleFormSubmit} className="relative"><textarea className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition-colors resize-none" rows={1} placeholder={placeholder} value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading || isDisabled} onKeyDown={handleKeyDown} /><button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black disabled:text-gray-300" disabled={!input.trim() || isLoading || isDisabled}><SendIcon className="w-6 h-6"/></button></form>); });
ChatInputForm.displayName = 'ChatInputForm';

// --- Modified Component: AI Guide Panel ---
const AiGuidePanel = ({ data, isLoading, onShowPrompt, displayedPrompt }: { data: AiGuideData | null; isLoading: boolean; onShowPrompt: (aiName: string, prompt: string) => void; displayedPrompt: { aiName: string; prompt: string } | null; }) => (
    <div className="w-full lg:w-1/2 h-full border-l border-gray-200 flex flex-col p-6 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-800 mb-6 shrink-0">AI 비교/선택 가이드</h2>
        <div className="flex-1 overflow-y-auto">
            {isLoading && <div className="flex items-center justify-center h-full"><p>AI 추천 정보를 불러오는 중입니다...</p></div>}
            {!isLoading && data && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100/70">
                                <tr>
                                    <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">AI 이름</th>
                                    <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">특화 분야</th>
                                    <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">비용</th>
                                    <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">추천 프롬프트</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.ai_tools.map(tool => (
                                    <tr key={tool.name} className="border-t last:border-b-0">
                                        <td className="p-3"><a href={tool.url} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">{tool.name}</a></td>
                                        <td className="p-3 text-gray-700">{tool.specialization}</td>
                                        <td className="p-3 text-gray-700">{tool.cost}</td>
                                        <td className="p-3"><button onClick={() => onShowPrompt(tool.name, tool.prompt)} className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs font-semibold">보기</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <h3 className="font-bold text-lg mb-2 text-blue-800">⭐ 추천 AI: {data.recommendation.name}</h3>
                        <p className="text-gray-800 leading-relaxed">{data.recommendation.reason}</p>
                    </div>
                    {displayedPrompt && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                            <h4 className="font-bold text-md mb-2">{displayedPrompt.aiName}의 추천 프롬프트:</h4>
                            <p className="text-sm font-mono whitespace-pre-wrap bg-gray-200 p-3 rounded">{displayedPrompt.prompt}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
);

// --- Main Page Component ---
export default function Home() {
    // State
    const [currentPage, setCurrentPage] = useState<Page>('chat');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversationType, setConversationType] = useState<ConversationType>('고민 정리');
    const [messages, setMessages] = useState<Message[]>([]);
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [roadmapState, setRoadmapState] = useState<RoadmapState>('not_started');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [pastConversations, setPastConversations] = useState<Conversation[]>([]);
    const [mainError, setMainError] = useState<string | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [currentRoadmapStep, setCurrentRoadmapStep] = useState({ goalIndex: 0, actionIndex: 0 });
    // AI Guide State
    const [toggledStep, setToggledStep] = useState<string | null>(null);
    const [cachedAiGuides, setCachedAiGuides] = useState<Record<string, AiGuideData>>({});
    const [activatedSteps, setActivatedSteps] = useState<Set<string>>(new Set());
    const [isLoadingGuide, setIsLoadingGuide] = useState(false);
    const [displayedPrompt, setDisplayedPrompt] = useState<{aiName: string; prompt: string} | null>(null);
    // Conversation Edit State
    const [editingConvId, setEditingConvId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const BASE_API_URL = 'http://localhost:4000';

    // Effects
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    useEffect(() => { if (isSidebarOpen) fetchPastConversations(); }, [isSidebarOpen]);

    // Functions
    const newConversation = useCallback(() => {
        setConversationId(null); setMessages([]); setRoadmap(null);
        setRoadmapState('not_started'); setMainError(null); setCurrentPage('chat');
        setCurrentRoadmapStep({ goalIndex: 0, actionIndex: 0 });
        setToggledStep(null); setCachedAiGuides({}); setActivatedSteps(new Set()); setDisplayedPrompt(null);
    }, []);

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

    const loadPastConversation = useCallback(async (id: string) => { 
        setIsLoading(true); 
        newConversation();
        try { 
            const res = await fetch(`${BASE_API_URL}/conversation/${id}`); 
            if (!res.ok) throw new Error('대화를 불러올 수 없습니다.'); 
            const data = await res.json(); 
            setConversationId(data._id); setConversationType(data.type); setMessages(data.messages); 
            setRoadmap(data.roadmap || null); setRoadmapState(data.roadmapState || 'not_started'); 
            setIsSidebarOpen(false); 
        } catch(e) { 
            console.error(e); setMainError(e instanceof Error ? e.message : '알 수 없는 오류'); 
        } finally { 
            setIsLoading(false); 
        } 
    }, [newConversation]);

    const sendMessage = useCallback(async (messageContent: string) => {  
        const userMessage: Message = { sender: 'user', content: messageContent };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true); setMainError(null);
        try {
            const res = await fetch(`${BASE_API_URL}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId, content: messageContent, type: conversationType }),
            });
            if (!res.ok) throw new Error((await res.json()).error || '메시지 전송에 실패했습니다.');
            const data = await res.json();
            if (data.conversationId && !conversationId) setConversationId(data.conversationId);
            if(data.roadmapState) setRoadmapState(data.roadmapState);
            setMessages(prev => [...prev, { sender: 'AI', content: data.aiResponse }]);
            if (!conversationId) fetchPastConversations();
        } catch (error) {
            setMessages(prev => prev.filter(msg => msg !== userMessage));
            setMainError(error instanceof Error ? error.message : '알 수 없는 오류');
        } finally {
            setIsLoading(false);
        } 
    }, [conversationId, conversationType, fetchPastConversations]);

    const handleShowAiGuide = useCallback(async (stepKey: string) => {
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
    }, [conversationId, roadmap, cachedAiGuides]);

    const handleActionButtonClick = useCallback(async () => {
        if (conversationType === '로드맵 생성' && roadmapState === 'generation_complete' && roadmap) {
            const stepKey = `${currentRoadmapStep.goalIndex}-${currentRoadmapStep.actionIndex}`;
            setActivatedSteps(prev => new Set(prev).add(stepKey));
            handleShowAiGuide(stepKey);
            return;
        }
        if (!conversationId || isLoading) return;
        setIsLoading(true);
        try {
            const endpoint = conversationType === '로드맵 생성' ? 'roadmap/generate' : 'conversation/summarize';
            const res = await fetch(`${BASE_API_URL}/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId }) });
            if (!res.ok) throw new Error((await res.json()).error || '작업 수행에 실패했습니다.');
            const data = await res.json();
            if (data.roadmap) setRoadmap(data.roadmap);
            if (data.roadmapState) setRoadmapState(data.roadmapState);
            setMessages(prev => [...prev, { sender: 'AI', content: data.aiResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'AI', content: `오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` }]);
        } finally { setIsLoading(false); }
    }, [conversationId, isLoading, conversationType, roadmapState, roadmap, currentRoadmapStep, handleShowAiGuide]);
    
    const handleRoadmapProgress = useCallback(() => {
        if (!roadmap) return;
        setToggledStep(null);
        setDisplayedPrompt(null);
        setCurrentRoadmapStep(prev => {
            let { goalIndex, actionIndex } = prev;
            if (actionIndex < roadmap.intermediateGoals[goalIndex].actions.length - 1) actionIndex++;
            else if (goalIndex < roadmap.intermediateGoals.length - 1) { goalIndex++; actionIndex = 0; } 
            else { alert("모든 로드맵을 완료했습니다!"); return prev; }
            return { goalIndex, actionIndex };
        }); 
    }, [roadmap]);

    const handleDeleteConversation = async (id: string) => {
        if (!window.confirm("정말로 이 대화를 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`${BASE_API_URL}/conversations/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("삭제에 실패했습니다.");
            setPastConversations(prev => prev.filter(c => c._id !== id));
            if (conversationId === id) newConversation();
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const handleUpdateConversationTitle = async (id: string) => {
        if (!editingTitle.trim()) {
            setEditingConvId(null);
            return;
        };
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
    };

    const renderActionButton = () => {  
        if (!conversationId) return null;
        let buttonText: string | null = null;
        let disabled = isLoading;

        if (conversationType === '고민 정리') {
            buttonText = "정리본 생성";
        } else if (conversationType === '로드맵 생성') {
            if (roadmapState === 'collecting_info') {
                buttonText = "로드맵 생성";
                const lastMessage = messages[messages.length - 1];
                disabled = isLoading || !lastMessage?.content.includes("모든 정보가 수집되었습니다");
            } else if (roadmapState === 'generation_complete') {
                buttonText = "AI 도움 받기";
            }
        }
        
        if (!buttonText) return null;
        return (<button onClick={handleActionButtonClick} disabled={disabled} className="ml-2 px-4 py-2 bg-black text-white rounded-lg font-semibold disabled:bg-gray-300 hover:bg-gray-800 transition-colors shrink-0">{buttonText}</button>);
    };
    
    return (
        <div className="flex h-screen bg-white font-sans text-gray-800 overflow-hidden">
            {/* Sidebar */}
            <div className={`z-40 flex flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-20'}`}>
                <div className="flex flex-col h-full w-full">
                    <div className="p-4 shrink-0">
                        <div className="flex flex-col space-y-2">
                            <button onClick={() => setIsSidebarOpen(prev => !prev)} className="flex items-center p-2 rounded-lg hover:bg-gray-100 space-x-4"><img src="/메뉴.png" alt="메뉴" className="w-6 h-6 shrink-0" />{isSidebarOpen && <span className="font-semibold whitespace-nowrap">메뉴</span>}</button>
                            <button onClick={newConversation} className="flex items-center p-2 rounded-lg hover:bg-gray-100 space-x-4"><img src="/말풍선.png" alt="대화" className="w-6 h-6 shrink-0" />{isSidebarOpen && <span className="font-semibold whitespace-nowrap">새 대화</span>}</button>
                            <button onClick={() => setShowProjectModal(true)} className="flex items-center p-2 rounded-lg hover:bg-gray-100 space-x-4"><img src="/상자.png" alt="파일" className="w-6 h-6 shrink-0" />{isSidebarOpen && <span className="font-semibold whitespace-nowrap">프로젝트 관리</span>}</button>
                        </div>
                    </div>
                    
                    {isSidebarOpen && (
                        <div className="flex-grow pt-4 border-t overflow-y-auto">
                            <div className="px-4">
                                <h2 className="text-sm font-bold text-gray-500 px-2 mb-2">대화 기록</h2>
                                <div className="space-y-1">
                                    {pastConversations.map((conv, index, arr) => (
                                        <div key={conv._id} className="group relative rounded-lg hover:bg-gray-100 flex items-center">
                                            {editingConvId === conv._id ? (
                                                    <input
                                                    type="text"
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    onBlur={() => handleUpdateConversationTitle(conv._id)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateConversationTitle(conv._id)}
                                                    className="flex-grow text-left p-2 rounded-lg bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    autoFocus
                                                />
                                            ) : (
                                                <button onClick={() => loadPastConversation(conv._id)} className="flex-grow text-left p-2 truncate text-sm flex items-center gap-2">
                                                    <span>{conv.type === '로드맵 생성' ? '🚀' : '💭'}</span>
                                                    <span className="truncate">{conv.title}</span>
                                                </button>
                                            )}
                                            <ConversationItemMenu
                                                convId={conv._id}
                                                onEdit={() => { setEditingConvId(conv._id); setEditingTitle(conv.title); }}
                                                onDelete={() => handleDeleteConversation(conv._id)}
                                                isLastFive={index >= arr.length - 5}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {!isSidebarOpen && <div className="flex-grow"></div>}
                    
                    <div className="p-4 shrink-0"><button onClick={() => setCurrentPage('settings')} className="flex items-center p-2 rounded-lg hover:bg-gray-100 space-x-4 w-full"><img src="/설정.png" alt="설정" className="w-6 h-6 shrink-0" />{isSidebarOpen && <span className="font-semibold whitespace-nowrap">설정</span>}</button></div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen bg-gray-50">
                <header className="shrink-0 w-full bg-white p-4 flex justify-between items-center border-b border-gray-200">
                     <h1 className="text-xl font-bold">MindGuide</h1>
                     <div className="flex items-center space-x-4"><button className="font-semibold hover:underline text-sm">Log in</button><span className="text-gray-300">|</span><button className="font-semibold hover:underline text-sm">Sign up</button></div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    <div className={`relative h-full transition-all duration-300 ease-in-out ${toggledStep ? 'w-full lg:w-1/2' : 'w-full'}`}>
                        <div className="absolute inset-0 overflow-y-auto">
                            <div className="w-full max-w-2xl mx-auto flex flex-col min-h-full p-4">
                                {roadmapState === 'generation_complete' && roadmap ? (
                                    <div className="flex-1 space-y-4">
                                        <h2 className="text-2xl font-bold">🚀 {roadmap.finalGoal}</h2>
                                        {roadmap.intermediateGoals.map((goal, gIndex) => (
                                            <div key={gIndex} className={`p-4 rounded-lg transition-all ${gIndex === currentRoadmapStep.goalIndex ? 'bg-blue-50 border-2 border-blue-400' : 'bg-white border'}`}>
                                                <h3 className="font-bold text-lg mb-2">{gIndex + 1}. {goal.goal}</h3>
                                                <ul className="space-y-1">
                                                    {goal.actions.map((action, aIndex) => {
                                                        const stepKey = `${gIndex}-${aIndex}`;
                                                        const isToggled = toggledStep === stepKey;
                                                        return (
                                                            <li key={aIndex} className={`flex items-center justify-between p-2 rounded ${gIndex === currentRoadmapStep.goalIndex && aIndex === currentRoadmapStep.actionIndex ? 'bg-blue-100' : 'bg-gray-50'}`}>
                                                                <span className="font-semibold">{action.action}</span>
                                                                <button 
                                                                    onClick={() => isToggled ? setToggledStep(null) : handleShowAiGuide(stepKey)} 
                                                                    disabled={!activatedSteps.has(stepKey)}
                                                                    title="AI 도움 받기" 
                                                                    className="p-1 rounded-full text-gray-400 disabled:text-gray-300 enabled:hover:text-blue-600 enabled:hover:bg-blue-100"
                                                                >
                                                                    {isToggled ? <ChevronLeftIcon className="w-5 h-5"/> : <ChevronRightIcon className="w-5 h-5"/>}
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div ref={chatContainerRef} className="flex-1 flex flex-col space-y-6 py-4">
                                        {messages.length === 0 && !isLoading && (
                                            <div className="flex-1 flex items-center justify-center">
                                                <div className="text-center">
                                                    <h2 className="text-5xl font-bold mb-6">{conversationType === '로드맵 생성' ? "What is your goal?" : "What is your concern?"}</h2>
                                                    <div className="flex justify-center gap-4">
                                                        <button onClick={() => setCurrentPage('info')} className="p-4 bg-blue-100/60 rounded-lg hover:bg-blue-100 transition-colors"><img src="/정보.png" alt="정보" width={64} height={64} /></button>
                                                        <button onClick={() => setShowLanguageModal(true)} className="p-4 bg-blue-100/60 rounded-lg hover:bg-blue-100 transition-colors"><img src="/언어.png" alt="언어" width={64} height={64} /></button>
                                                        <button onClick={() => setConversationType(p => p === '로드맵 생성' ? '고민 정리' : '로드맵 생성')} className={`p-4 rounded-lg transition-colors ${conversationType === '로드맵 생성' ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-blue-100/60 hover:bg-blue-100'}`}><img src="/로드맵.png" alt="로드맵" width={64} height={64} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {mainError && <div className="p-4 bg-red-100 text-red-800 rounded-lg"><h3 className="font-bold">오류</h3><p>{mainError}</p></div>}
                                        {messages.map((msg, index) => (
                                            <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`p-4 rounded-xl max-w-[80%] ${msg.sender === 'user' ? 'bg-black text-white' : 'bg-white border'}`}><p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} /></div></div>
                                        ))}
                                        {isLoading && <div className="flex justify-start"><div className="p-4 rounded-xl max-w-[80%] bg-white border"><div className="flex items-center space-x-2"><span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span><span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span><span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></span></div></div></div>}
                                    </div>
                                )}
                                <div className="mt-auto pt-4 flex items-center">
                                <div className="flex-grow">
                                        {roadmapState !== 'generation_complete' ? (
                                            <ChatInputForm 
                                                onSendMessage={sendMessage}
                                                isLoading={isLoading}
                                                isDisabled={!!mainError}
                                                placeholder={conversationType === '로드맵 생성' ? '목표를 알려주세요...' : '고민을 알려주세요...'}
                                            />
                                        ): (
                                            <button onClick={handleRoadmapProgress} className="w-full p-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800">
                                                { roadmap && currentRoadmapStep.actionIndex < roadmap.intermediateGoals[currentRoadmapStep.goalIndex].actions.length - 1 ? '다음 단계로' : '다음 목표로'}
                                            </button>
                                        )}
                                    </div>
                                    {renderActionButton()}
                                </div>
                            </div>
                        </div>
                    </div>
                    {toggledStep && <AiGuidePanel data={cachedAiGuides[toggledStep]} isLoading={isLoadingGuide} onShowPrompt={(aiName, prompt) => setDisplayedPrompt({aiName, prompt})} displayedPrompt={displayedPrompt} />}
                </div>
            </main>
            
            {showProjectModal && <Modal title="프로젝트 관리" onClose={() => setShowProjectModal(false)}><p>프로젝트 관리 기능은 현재 준비 중입니다.</p></Modal>}
            {showLanguageModal && <Modal title="언어 설정" onClose={() => setShowLanguageModal(false)}><div className="w-64 flex flex-col space-y-2"><button className="w-full text-left p-2 rounded-lg hover:bg-gray-100">English</button><button className="w-full text-left p-2 rounded-lg hover:bg-gray-100">한국어</button><button className="w-full text-left p-2 rounded-lg hover:bg-gray-100">日本語</button></div></Modal>}
        </div>
    );
}

const ConversationItemMenu = ({ convId, onEdit, onDelete, isLastFive }: { convId: string; onEdit: () => void; onDelete: () => void; isLastFive: boolean; }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    // Check if the button is near the bottom of the viewport
    const checkPositionAndOpen = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            // If the button is in the bottom ~150px of the viewport, consider it "last"
            if (rect.bottom > viewportHeight - 150) {
                 setIsOpen(true); // Let's just use the isLastFive logic for now as it's more stable
            }
        }
        setIsOpen(prev => !prev);
    }
    
    const menuPositionClass = isLastFive ? 'bottom-full mb-1' : 'top-full mt-1';

    return (
        <div ref={menuRef} className="relative shrink-0">
            <button ref={buttonRef} onClick={checkPositionAndOpen} className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200">
                <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
            {isOpen && (
                <div className={`absolute right-0 w-40 bg-white border rounded-lg shadow-xl z-20 ${menuPositionClass}`}>
                    <button onClick={() => { onEdit(); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">대화 제목 수정</button>
                    <button onClick={() => { onDelete(); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">대화 삭제</button>
                </div>
            )}
        </div>
    );
};

