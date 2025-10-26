'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Types
import { Page, ConversationType } from '../types';

// Components
import { Modal } from '../components/common/Modal';
import { ChatInputForm } from '../components/common/ChatInputForm';
import { InfoPage } from '../components/pages/InfoPage';
import { SettingsPage } from '../components/pages/SettingsPage';
import { AiGuidePanel } from '../components/roadmap/AiGuidePanel';
import { Sidebar } from '../components/layout/Sidebar';

// Hooks
import { useConversation } from '../hooks/useConversation';
import { useConversationList } from '../hooks/useConversationList';
import { useRoadmap } from '../hooks/useRoadmap';

// Icons
import { ChevronRightIcon, ChevronLeftIcon } from '../components/icons';

// --- Main Page Component ---
export default function Home() {
    // State
    const [currentPage, setCurrentPage] = useState<Page>('chat');
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Custom Hooks
    const conversation = useConversation();
    const conversationList = useConversationList();
    const roadmap = useRoadmap();

    // Effects
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation.messages, conversation.isLoading]);

    useEffect(() => { 
        if (isSidebarOpen) conversationList.fetchPastConversations(); 
    }, [isSidebarOpen, conversationList.fetchPastConversations]);

    // Functions
    const newConversation = useCallback(() => {
        conversation.newConversation();
        roadmap.setCurrentRoadmapStep({ goalIndex: 0, actionIndex: 0 });
        roadmap.setToggledStep(null);
        roadmap.setCachedAiGuides({});
        roadmap.setActivatedSteps(new Set());
        roadmap.setDisplayedPrompt(null);
        setCurrentPage('chat');
    }, [conversation.newConversation, roadmap]);

    const loadPastConversation = useCallback(async (id: string) => { 
        await conversation.loadPastConversation(id);
            setIsSidebarOpen(false); 
    }, [conversation.loadPastConversation]);

    const handleShowAiGuide = useCallback(async (stepKey: string) => {
        await roadmap.handleShowAiGuide(stepKey, conversation.conversationId, conversation.roadmap);
    }, [roadmap.handleShowAiGuide, conversation.conversationId, conversation.roadmap]);

    const handleActionButtonClick = useCallback(async () => {
        await roadmap.handleActionButtonClick(
            conversation.conversationId,
            conversation.isLoading,
            conversation.conversationType,
            conversation.roadmapState,
            conversation.roadmap,
            conversation.setMessages,
            conversation.setRoadmap,
            conversation.setRoadmapState
        );
    }, [roadmap.handleActionButtonClick, conversation]);
    
    const handleRoadmapProgress = useCallback(() => {
        roadmap.handleRoadmapProgress(conversation.roadmap);
    }, [roadmap.handleRoadmapProgress, conversation.roadmap]);

    const handleDeleteConversation = useCallback(async (id: string) => {
        await conversationList.deleteConversation(id);
        if (conversation.conversationId === id) newConversation();
    }, [conversationList.deleteConversation, conversation.conversationId, newConversation]);

    const handleUpdateConversationTitle = useCallback(async (id: string) => {
        await conversationList.updateConversationTitle(id);
    }, [conversationList.updateConversationTitle]);

    const renderActionButton = () => {  
        if (!conversation.conversationId) return null;
        let buttonText: string | null = null;
        let disabled = conversation.isLoading;

        if (conversation.conversationType === '고민 정리') {
            buttonText = "정리본 생성";
        } else if (conversation.conversationType === '로드맵 생성') {
            if (conversation.roadmapState === 'collecting_info') {
                buttonText = "로드맵 생성";
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                disabled = conversation.isLoading || !lastMessage?.content.includes("모든 정보가 수집되었습니다");
            } else if (conversation.roadmapState === 'generation_complete') {
                buttonText = "AI 도움 받기";
            }
        }
        
        if (!buttonText) return null;
        return (
            <button 
                onClick={handleActionButtonClick} 
                disabled={disabled} 
                className="ml-2 px-4 py-2 bg-black text-white rounded-lg font-semibold disabled:bg-gray-300 hover:bg-gray-800 transition-colors shrink-0"
            >
                {buttonText}
            </button>
        );
    };
    
    return (
        <div className="flex h-screen bg-white font-sans text-gray-800 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                pastConversations={conversationList.pastConversations}
                editingConvId={conversationList.editingConvId}
                editingTitle={conversationList.editingTitle}
                setEditingConvId={conversationList.setEditingConvId}
                setEditingTitle={conversationList.setEditingTitle}
                onNewConversation={newConversation}
                onLoadPastConversation={loadPastConversation}
                onDeleteConversation={handleDeleteConversation}
                onUpdateConversationTitle={handleUpdateConversationTitle}
                onShowProjectModal={() => setShowProjectModal(true)}
                onShowSettings={() => setCurrentPage('settings')}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen bg-gray-50">
                <header className="shrink-0 w-full bg-white p-4 flex justify-between items-center border-b border-gray-200">
                     <h1 className="text-xl font-bold">MindGuide</h1>
                     <div className="flex items-center space-x-4">
                         <button className="font-semibold hover:underline text-sm">Log in</button>
                         <span className="text-gray-300">|</span>
                         <button className="font-semibold hover:underline text-sm">Sign up</button>
                     </div>
                </header>

                {currentPage === 'info' ? (
                    <InfoPage onBack={() => setCurrentPage('chat')} />
                ) : currentPage === 'settings' ? (
                    <SettingsPage onBack={() => setCurrentPage('chat')} />
                ) : (
                <div className="flex-1 flex overflow-hidden">
                        <div className={`relative h-full transition-all duration-300 ease-in-out ${roadmap.toggledStep ? 'w-full lg:w-1/2' : 'w-full'}`}>
                        <div className="absolute inset-0 overflow-y-auto">
                            <div className="w-full max-w-2xl mx-auto flex flex-col min-h-full p-4">
                                    {conversation.roadmapState === 'generation_complete' && conversation.roadmap ? (
                                    <div className="flex-1 space-y-4">
                                            <h2 className="text-2xl font-bold">🚀 {conversation.roadmap.finalGoal}</h2>
                                            {conversation.roadmap.intermediateGoals.map((goal, gIndex) => (
                                                <div key={gIndex} className={`p-4 rounded-lg transition-all ${gIndex === roadmap.currentRoadmapStep.goalIndex ? 'bg-blue-50 border-2 border-blue-400' : 'bg-white border'}`}>
                                                <h3 className="font-bold text-lg mb-2">{gIndex + 1}. {goal.goal}</h3>
                                                <ul className="space-y-1">
                                                    {goal.actions.map((action, aIndex) => {
                                                        const stepKey = `${gIndex}-${aIndex}`;
                                                            const isToggled = roadmap.toggledStep === stepKey;
                                                        return (
                                                                <li key={aIndex} className={`flex items-center justify-between p-2 rounded ${gIndex === roadmap.currentRoadmapStep.goalIndex && aIndex === roadmap.currentRoadmapStep.actionIndex ? 'bg-blue-100' : 'bg-gray-50'}`}>
                                                                <span className="font-semibold">{action.action}</span>
                                                                <button 
                                                                        onClick={() => isToggled ? roadmap.setToggledStep(null) : handleShowAiGuide(stepKey)} 
                                                                        disabled={!roadmap.activatedSteps.has(stepKey)}
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
                                            {conversation.messages.length === 0 && !conversation.isLoading && (
                                            <div className="flex-1 flex items-center justify-center">
                                                <div className="text-center">
                                                        <h2 className="text-5xl font-bold mb-6">{conversation.conversationType === '로드맵 생성' ? "What is your goal?" : "What is your concern?"}</h2>
                                                    <div className="flex justify-center gap-4">
                                                        <button onClick={() => setCurrentPage('info')} className="p-4 bg-blue-100/60 rounded-lg hover:bg-blue-100 transition-colors"><img src="/정보.png" alt="정보" width={64} height={64} /></button>
                                                        <button onClick={() => setShowLanguageModal(true)} className="p-4 bg-blue-100/60 rounded-lg hover:bg-blue-100 transition-colors"><img src="/언어.png" alt="언어" width={64} height={64} /></button>
                                                            <button onClick={() => conversation.setConversationType(p => p === '로드맵 생성' ? '고민 정리' : '로드맵 생성')} className={`p-4 rounded-lg transition-colors ${conversation.conversationType === '로드맵 생성' ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-blue-100/60 hover:bg-blue-100'}`}><img src="/로드맵.png" alt="로드맵" width={64} height={64} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {conversation.mainError && <div className="p-4 bg-red-100 text-red-800 rounded-lg"><h3 className="font-bold">오류</h3><p>{conversation.mainError}</p></div>}
                                            {conversation.messages.map((msg, index) => (
                                                <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`p-4 rounded-xl max-w-[80%] ${msg.sender === 'user' ? 'bg-black text-white' : 'bg-white border'}`}>
                                                        <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
                                                    </div>
                                                </div>
                                            ))}
                                            {conversation.isLoading && (
                                                <div className="flex justify-start">
                                                    <div className="p-4 rounded-xl max-w-[80%] bg-white border">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                                            <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                                            <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="mt-auto pt-4 flex items-center">
                                <div className="flex-grow">
                                            {conversation.roadmapState !== 'generation_complete' ? (
                                            <ChatInputForm 
                                                    onSendMessage={conversation.sendMessage}
                                                    isLoading={conversation.isLoading}
                                                    isDisabled={!!conversation.mainError}
                                                    placeholder={conversation.conversationType === '로드맵 생성' ? '목표를 알려주세요...' : '고민을 알려주세요...'}
                                            />
                                        ): (
                                            <button onClick={handleRoadmapProgress} className="w-full p-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800">
                                                    { conversation.roadmap && roadmap.currentRoadmapStep.actionIndex < conversation.roadmap.intermediateGoals[roadmap.currentRoadmapStep.goalIndex].actions.length - 1 ? '다음 단계로' : '다음 목표로'}
                                            </button>
                                        )}
                                    </div>
                                    {renderActionButton()}
                                </div>
                            </div>
                        </div>
                    </div>
                        {roadmap.toggledStep && (
                            <AiGuidePanel 
                                data={roadmap.cachedAiGuides[roadmap.toggledStep]} 
                                isLoading={roadmap.isLoadingGuide} 
                                onShowPrompt={(aiName, prompt) => roadmap.setDisplayedPrompt({aiName, prompt})} 
                                displayedPrompt={roadmap.displayedPrompt} 
                            />
                        )}
                </div>
                )}
            </main>
            
            {showProjectModal && (
                <Modal title="프로젝트 관리" onClose={() => setShowProjectModal(false)}>
                    <p>프로젝트 관리 기능은 현재 준비 중입니다.</p>
                </Modal>
            )}
            {showLanguageModal && (
                <Modal title="언어 설정" onClose={() => setShowLanguageModal(false)}>
                    <div className="w-64 flex flex-col space-y-2">
                        <button className="w-full text-left p-2 rounded-lg hover:bg-gray-100">English</button>
                        <button className="w-full text-left p-2 rounded-lg hover:bg-gray-100">한국어</button>
                        <button className="w-full text-left p-2 rounded-lg hover:bg-gray-100">日本語</button>
        </div>
                </Modal>
            )}
        </div>
    );
}

