const PROMPTS = require('../prompts');

class ConversationController {
    constructor(conversationService, openaiService, roadmapService) {
        this.conversationService = conversationService;
        this.openaiService = openaiService;
        this.roadmapService = roadmapService;
    }

    /**
     * 메시지 전송 및 AI 응답 처리
     * 사용자 메시지를 받아 적절한 AI 응답을 생성하고 대화를 저장합니다.
     * 
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     */
    async sendMessage(req, res) {
        try {
            const { conversationId, content, type } = req.body;
            const userId = 'user_123'; // 실제로는 인증에서 가져와야 함

            let conversation;
            let aiResponseContent;
            let roadmapState = 'not_started';

            if (!conversationId) {
                // 새 대화 생성
                const title = await this.openaiService.generateTitle(content);
                conversation = await this.conversationService.createConversation(userId, type, title, content);
            } else {
                conversation = await this.conversationService.findConversationById(conversationId);
                await this.conversationService.addMessage(conversationId, 'user', content);
            }

            if (conversation.type === '로드맵 생성') {
                const result = await this.roadmapService.processRoadmapMessage(conversation._id, content);
                aiResponseContent = result.aiResponse;
                roadmapState = result.roadmapState;
            } else {
                // 고민 정리 모드 - 프롬프트 시스템 사용
                const systemPrompt = PROMPTS.conversationMentor();
                
                const history = conversation.messages.map(m => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.content
                }));
                
                aiResponseContent = await this.openaiService.generateResponse(history, systemPrompt);
                await this.conversationService.addMessage(conversation._id, 'AI', aiResponseContent);
            }

            res.status(200).json({
                aiResponse: aiResponseContent,
                conversationId: conversation._id,
                roadmapState
            });
        } catch (error) {
            console.error('Error in sendMessage:', error.message);
            res.status(500).json({ error: '메시지 처리 중 오류 발생' });
        }
    }

    async getConversations(req, res) {
        try {
            const userId = 'user_123'; // 실제로는 인증에서 가져와야 함
            const conversations = await this.conversationService.getUserConversations(userId);
            res.status(200).json({ conversations });
        } catch (error) {
            console.error('Error in getConversations:', error.message);
            res.status(500).json({ error: '대화 목록 조회 오류' });
        }
    }

    async getConversation(req, res) {
        try {
            const conversation = await this.conversationService.findConversationById(req.params.id);
            res.status(200).json(conversation);
        } catch (error) {
            console.error('Error in getConversation:', error.message);
            res.status(500).json({ error: '대화 조회 오류' });
        }
    }

    async updateConversation(req, res) {
        try {
            const { title } = req.body;
            if (!title) {
                return res.status(400).json({ error: '제목이 필요합니다.' });
            }

            const conversation = await this.conversationService.updateConversationTitle(
                req.params.id, 
                title
            );
            res.status(200).json(conversation);
        } catch (error) {
            console.error('Error in updateConversation:', error.message);
            res.status(500).json({ error: '대화 제목 수정 중 오류 발생' });
        }
    }

    async deleteConversation(req, res) {
        try {
            await this.conversationService.deleteConversation(req.params.id);
            res.status(200).json({ message: '대화가 성공적으로 삭제되었습니다.' });
        } catch (error) {
            console.error('Error in deleteConversation:', error.message);
            res.status(500).json({ error: '대화 삭제 중 오류 발생' });
        }
    }

    async summarizeConversation(req, res) {
        try {
            const { conversationId } = req.body;
            if (!conversationId) {
                return res.status(400).json({ error: 'conversationId가 필요합니다.' });
            }

            const conversation = await this.conversationService.findConversationById(conversationId);
            const history = conversation.messages
                .map(m => `${m.sender}: ${m.content}`)
                .join('\n');
            
            const summaryContent = await this.openaiService.generateSummary(history);
            await this.conversationService.updateSummary(conversationId, summaryContent);

            res.status(200).json({ aiResponse: summaryContent });
        } catch (error) {
            console.error('Error in summarizeConversation:', error.message);
            res.status(500).json({ error: '정리본 생성 중 오류 발생' });
        }
    }
}

module.exports = ConversationController;
