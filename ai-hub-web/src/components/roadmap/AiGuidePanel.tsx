import React from 'react';
import { AiGuideData, DisplayedPrompt } from '../../types';

interface AiGuidePanelProps {
    data: AiGuideData | null;
    isLoading: boolean;
    onShowPrompt: (aiName: string, prompt: string) => void;
    displayedPrompt: DisplayedPrompt | null;
}

export const AiGuidePanel: React.FC<AiGuidePanelProps> = ({ 
    data, 
    isLoading, 
    onShowPrompt, 
    displayedPrompt 
}) => (
    <div className="w-full lg:w-1/2 h-full border-l border-gray-200 flex flex-col p-6 bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-800 mb-6 shrink-0">AI 비교/선택 가이드</h2>
        <div className="flex-1 overflow-y-auto">
            {isLoading && (
                <div className="flex items-center justify-center h-full">
                    <p>AI 추천 정보를 불러오는 중입니다...</p>
                </div>
            )}
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
                                        <td className="p-3">
                                            <a 
                                                href={tool.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="font-bold text-blue-600 hover:underline"
                                            >
                                                {tool.name}
                                            </a>
                                        </td>
                                        <td className="p-3 text-gray-700">{tool.specialization}</td>
                                        <td className="p-3 text-gray-700">{tool.cost}</td>
                                        <td className="p-3">
                                            <button 
                                                onClick={() => onShowPrompt(tool.name, tool.prompt)} 
                                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs font-semibold"
                                            >
                                                보기
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <h3 className="font-bold text-lg mb-2 text-blue-800">
                            ⭐ 추천 AI: {data.recommendation.name}
                        </h3>
                        <p className="text-gray-800 leading-relaxed">{data.recommendation.reason}</p>
                    </div>
                    {displayedPrompt && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                            <h4 className="font-bold text-md mb-2">{displayedPrompt.aiName}의 추천 프롬프트:</h4>
                            <p className="text-sm font-mono whitespace-pre-wrap bg-gray-200 p-3 rounded">
                                {displayedPrompt.prompt}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
);

