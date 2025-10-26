// Type Definitions
export interface Message {
    sender: 'user' | 'AI';
    content: string;
}

export interface ActionItem {
    action: string;
    completed: boolean;
}

export interface IntermediateGoal {
    goal: string;
    actions: ActionItem[];
}

export interface Roadmap {
    finalGoal: string;
    intermediateGoals: IntermediateGoal[];
}

export interface Conversation {
    _id: string;
    title: string;
    type: string;
    roadmapState?: RoadmapState;
    roadmap?: Roadmap;
}

export interface AiTool {
    name: string;
    url: string;
    specialization: string;
    cost: string;
    prompt: string;
}

export interface AiGuideData {
    ai_tools: AiTool[];
    recommendation: {
        name: string;
        reason: string;
    };
}

export type Page = 'chat' | 'info' | 'settings';
export type ConversationType = '고민 정리' | '로드맵 생성';
export type RoadmapState = 'not_started' | 'collecting_info' | 'generation_complete';

export interface RoadmapStep {
    goalIndex: number;
    actionIndex: number;
}

export interface DisplayedPrompt {
    aiName: string;
    prompt: string;
}

