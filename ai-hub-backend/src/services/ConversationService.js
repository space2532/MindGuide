const Conversation = require('../models/Conversation');
const PROMPTS = require('../prompts');

class ConversationService {
    constructor() {
        // 로드맵 질문들을 프롬프트 시스템에서 가져옵니다
        this.ROADMAP_QUESTIONS = [
            PROMPTS.roadmapQuestions.currentSituation,
            PROMPTS.roadmapQuestions.timeInvestment,
            PROMPTS.roadmapQuestions.costInvestment,
            PROMPTS.roadmapQuestions.targetDeadline,
            PROMPTS.roadmapQuestions.targetPurpose
        ];
    }

    /**
     * 새 대화 생성
     * @param {string} userId - 사용자 ID
     * @param {string} type - 대화 타입
     * @param {string} title - 대화 제목
     * @param {string} firstMessage - 첫 번째 메시지
     * @returns {Promise<Object>} 생성된 대화
     */
    async createConversation(userId, type, title, firstMessage) {
        const conversation = new Conversation({
            userId,
            type,
            title,
            messages: [{ sender: 'user', content: firstMessage }]
        });
        
        return await conversation.save();
    }

    /**
     * 대화 ID로 조회
     * @param {string} conversationId - 대화 ID
     * @returns {Promise<Object>} 대화 데이터
     */
    async findConversationById(conversationId) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throw new Error('대화를 찾을 수 없습니다.');
        }
        return conversation;
    }

    /**
     * 메시지 추가
     * @param {string} conversationId - 대화 ID
     * @param {string} sender - 발신자
     * @param {string} content - 메시지 내용
     * @returns {Promise<Object>} 업데이트된 대화
     */
    async addMessage(conversationId, sender, content) {
        const conversation = await this.findConversationById(conversationId);
        conversation.messages.push({ sender, content });
        return await conversation.save();
    }

    /**
     * 사용자의 모든 대화 조회
     * @param {string} userId - 사용자 ID
     * @returns {Promise<Array>} 대화 목록
     */
    async getUserConversations(userId) {
        return await Conversation.find({ userId }).sort({ createdAt: -1 });
    }

    /**
     * 대화 제목 업데이트
     * @param {string} conversationId - 대화 ID
     * @param {string} title - 새 제목
     * @returns {Promise<Object>} 업데이트된 대화
     */
    async updateConversationTitle(conversationId, title) {
        const conversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { title },
            { new: true }
        );
        if (!conversation) {
            throw new Error('대화를 찾을 수 없습니다.');
        }
        return conversation;
    }

    /**
     * 대화 삭제
     * @param {string} conversationId - 대화 ID
     * @returns {Promise<Object>} 삭제 결과
     */
    async deleteConversation(conversationId) {
        const conversation = await Conversation.findByIdAndDelete(conversationId);
        if (!conversation) {
            throw new Error('대화를 찾을 수 없습니다.');
        }
        return conversation;
    }

    /**
     * 요약 업데이트
     * @param {string} conversationId - 대화 ID
     * @param {string} summary - 요약 내용
     * @returns {Promise<Object>} 업데이트된 대화
     */
    async updateSummary(conversationId, summary) {
        const conversation = await this.findConversationById(conversationId);
        conversation.summary = summary;
        conversation.messages.push({ sender: 'AI', content: summary });
        return await conversation.save();
    }

    // 로드맵 관련 메서드들
    /**
     * 로드맵 수집 시작
     * @param {string} conversationId - 대화 ID
     * @param {string} goal - 목표
     * @returns {Promise<Object>} 업데이트된 대화
     */
    async startRoadmapCollection(conversationId, goal) {
        const conversation = await this.findConversationById(conversationId);
        conversation.roadmapState = 'collecting_info';
        conversation.roadmapInputs.push({ question: "최종 목표", answer: goal });
        return await conversation.save();
    }

    /**
     * 로드맵 입력 추가
     * @param {string} conversationId - 대화 ID
     * @param {string} question - 질문
     * @param {string} answer - 답변
     * @returns {Promise<Object>} 업데이트된 대화
     */
    async addRoadmapInput(conversationId, question, answer) {
        const conversation = await this.findConversationById(conversationId);
        conversation.roadmapInputs.push({ question, answer });
        return await conversation.save();
    }

    /**
     * 로드맵 데이터 업데이트
     * @param {string} conversationId - 대화 ID
     * @param {Object} roadmapData - 로드맵 데이터
     * @returns {Promise<Object>} 업데이트된 대화
     */
    async updateRoadmap(conversationId, roadmapData) {
        const conversation = await this.findConversationById(conversationId);
        conversation.roadmap = roadmapData;
        conversation.roadmapState = 'generation_complete';
        return await conversation.save();
    }

    /**
     * 로드맵 질문 가져오기
     * @param {number} index - 질문 인덱스
     * @returns {string|null} 질문 내용
     */
    getRoadmapQuestion(index) {
        return this.ROADMAP_QUESTIONS[index] || null;
    }

    /**
     * 로드맵 질문 개수
     * @returns {number} 질문 개수
     */
    getRoadmapQuestionsCount() {
        return this.ROADMAP_QUESTIONS.length;
    }

    /**
     * 로드맵 정보 수집 완료 여부
     * @param {number} roadmapInputsCount - 입력된 정보 개수
     * @returns {boolean} 완료 여부
     */
    isRoadmapInfoComplete(roadmapInputsCount) {
        return roadmapInputsCount >= this.ROADMAP_QUESTIONS.length;
    }
}

module.exports = ConversationService;
