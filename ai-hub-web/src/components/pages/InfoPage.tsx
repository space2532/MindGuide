import React from 'react';

interface InfoPageProps {
    onBack: () => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ onBack }) => (
    <div className="p-8 h-full">
        <button 
            onClick={onBack} 
            className="mb-4 font-semibold hover:underline text-blue-600"
        >
            &larr; 뒤로가기
        </button>
        <h1 className="text-3xl font-bold mb-4">정보</h1>
        <p className="text-gray-600">이곳에 정보 페이지 내용이 표시됩니다.</p>
    </div>
);

