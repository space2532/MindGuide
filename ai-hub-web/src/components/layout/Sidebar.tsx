import React, { useState, useRef, useEffect } from 'react';
import { EllipsisVerticalIcon } from '../icons';
import { Conversation } from '../../types';

interface ConversationItemMenuProps {
    convId: string;
    onEdit: () => void;
    onDelete: () => void;
    isLastFive: boolean;
}

const ConversationItemMenu: React.FC<ConversationItemMenuProps> = ({ 
    convId, 
    onEdit, 
    onDelete, 
    isLastFive 
}) => {
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
    
    const checkPositionAndOpen = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            if (rect.bottom > viewportHeight - 150) {
                 setIsOpen(true);
            }
        }
        setIsOpen(prev => !prev);
    }
    
    const menuPositionClass = isLastFive ? 'bottom-full mb-1' : 'top-full mt-1';

    return (
        <div ref={menuRef} className="relative shrink-0">
            <button 
                ref={buttonRef} 
                onClick={checkPositionAndOpen} 
                className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200"
            >
                <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
            {isOpen && (
                <div className={`absolute right-0 w-40 bg-white border rounded-lg shadow-xl z-20 ${menuPositionClass}`}>
                    <button 
                        onClick={() => { onEdit(); setIsOpen(false); }} 
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                        대화 제목 수정
                    </button>
                    <button 
                        onClick={() => { onDelete(); setIsOpen(false); }} 
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        대화 삭제
                    </button>
                </div>
            )}
        </div>
    );
};

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
    pastConversations: Conversation[];
    editingConvId: string | null;
    editingTitle: string;
    setEditingConvId: (id: string | null) => void;
    setEditingTitle: (title: string) => void;
    onNewConversation: () => void;
    onLoadPastConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
    onUpdateConversationTitle: (id: string) => void;
    onShowProjectModal: () => void;
    onShowSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    pastConversations,
    editingConvId,
    editingTitle,
    setEditingConvId,
    setEditingTitle,
    onNewConversation,
    onLoadPastConversation,
    onDeleteConversation,
    onUpdateConversationTitle,
    onShowProjectModal,
    onShowSettings
}) => (
    <div className={`z-40 flex flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-20'}`}>
        <div className="flex flex-col h-full w-full">
            <div className="p-4 shrink-0">
                <div className="flex flex-col space-y-2">
                    <button 
                        onClick={() => setIsSidebarOpen(prev => !prev)} 
                        className="flex items-center p-2 rounded-lg hover:bg-gray-100 space-x-4"
                    >
                        <img src="/메뉴.png" alt="메뉴" className="w-6 h-6 shrink-0" />
                        {isSidebarOpen && <span className="font-semibold whitespace-nowrap">메뉴</span>}
                    </button>
                    <button 
                        onClick={onNewConversation} 
                        className="flex items-center p-2 rounded-lg hover:bg-gray-100 space-x-4"
                    >
                        <img src="/말풍선.png" alt="대화" className="w-6 h-6 shrink-0" />
                        {isSidebarOpen && <span className="font-semibold whitespace-nowrap">새 대화</span>}
                    </button>
                    <button 
                        onClick={onShowProjectModal} 
                        className="flex items-center p-2 rounded-lg hover:bg-gray-100 space-x-4"
                    >
                        <img src="/상자.png" alt="파일" className="w-6 h-6 shrink-0" />
                        {isSidebarOpen && <span className="font-semibold whitespace-nowrap">프로젝트 관리</span>}
                    </button>
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
                                            onBlur={() => onUpdateConversationTitle(conv._id)}
                                            onKeyDown={(e) => e.key === 'Enter' && onUpdateConversationTitle(conv._id)}
                                            className="flex-grow text-left p-2 rounded-lg bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            autoFocus
                                        />
                                    ) : (
                                        <button 
                                            onClick={() => onLoadPastConversation(conv._id)} 
                                            className="flex-grow text-left p-2 truncate text-sm flex items-center gap-2"
                                        >
                                            <span>{conv.type === '로드맵 생성' ? '🚀' : '💭'}</span>
                                            <span className="truncate">{conv.title}</span>
                                        </button>
                                    )}
                                    <ConversationItemMenu
                                        convId={conv._id}
                                        onEdit={() => { setEditingConvId(conv._id); setEditingTitle(conv.title); }}
                                        onDelete={() => onDeleteConversation(conv._id)}
                                        isLastFive={index >= arr.length - 5}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {!isSidebarOpen && <div className="flex-grow"></div>}
            
            <div className="p-4 shrink-0">
                <button 
                    onClick={onShowSettings} 
                    className="flex items-center p-2 rounded-lg hover:bg-gray-100 space-x-4 w-full"
                >
                    <img src="/설정.png" alt="설정" className="w-6 h-6 shrink-0" />
                    {isSidebarOpen && <span className="font-semibold whitespace-nowrap">설정</span>}
                </button>
            </div>
        </div>
    </div>
);

