const mongoose = require('mongoose');

// --- 답변 저장을 위한 스키마 ---
const roadmapInputSchema = new mongoose.Schema({
    question: String,
    answer: String,
}, { _id: false });

// --- 세부 행동 항목을 위한 스키마 ---
// 요구사항에 따라 duration 필드 제거
const actionItemSchema = new mongoose.Schema({
    action: String,
    completed: { type: Boolean, default: false }
}, { _id: false });

// --- 중간 목표를 위한 스키마 ---
const intermediateGoalSchema = new mongoose.Schema({
    goal: String,
    actions: [actionItemSchema],
}, { _id: false });

// --- 전체 로드맵 구조를 위한 스키마 ---
const roadmapSchema = new mongoose.Schema({
    finalGoal: String,
    intermediateGoals: [intermediateGoalSchema],
}, { _id: false });


const conversationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, default: '새로운 대화' },
    type: { type: String, required: true, enum: ['고민 정리', '로드맵 생성'] },
    messages: [{
        sender: { type: String, required: true, enum: ['user', 'AI'] },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    }],
    summary: { type: String, default: null },
    
    // --- 로드맵 관련 필드 ---
    roadmapState: {
        type: String,
        enum: ['not_started', 'collecting_info', 'generation_complete'],
        default: 'not_started'
    },
    roadmapInputs: [roadmapInputSchema],
    roadmap: roadmapSchema,

    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Conversation', conversationSchema);
