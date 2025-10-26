class RoadmapService {
    constructor(conversationService, openaiService) {
        this.conversationService = conversationService;
        this.openaiService = openaiService;
    }

    async processRoadmapMessage(conversationId, content) {
        const conversation = await this.conversationService.findConversationById(conversationId);
        
        if (conversation.roadmapState === 'not_started') {
            return await this.startRoadmapCollection(conversationId, content);
        } else if (conversation.roadmapState === 'collecting_info') {
            return await this.collectRoadmapInfo(conversationId, content);
        } else {
            return await this.handleRoadmapQuestion(conversationId, content);
        }
    }

    async startRoadmapCollection(conversationId, goal) {
        await this.conversationService.startRoadmapCollection(conversationId, goal);
        const firstQuestion = this.conversationService.getRoadmapQuestion(0);
        
        await this.conversationService.addMessage(conversationId, 'AI', firstQuestion);
        
        return {
            aiResponse: firstQuestion,
            roadmapState: 'collecting_info'
        };
    }

    async collectRoadmapInfo(conversationId, answer) {
        const conversation = await this.conversationService.findConversationById(conversationId);
        const answeredQuestionsCount = conversation.roadmapInputs.length;
        const lastQuestion = this.conversationService.getRoadmapQuestion(answeredQuestionsCount - 1) || 
                           conversation.roadmapInputs[answeredQuestionsCount - 1].question;
        
        await this.conversationService.addRoadmapInput(conversationId, lastQuestion, answer);

        if (this.conversationService.isRoadmapInfoComplete(answeredQuestionsCount)) {
            const completionMessage = "모든 정보가 수집되었습니다. '로드맵 생성' 버튼을 눌러 전체 계획을 확인하세요.";
            await this.conversationService.addMessage(conversationId, 'AI', completionMessage);
            
            return {
                aiResponse: completionMessage,
                roadmapState: 'collecting_info'
            };
        } else {
            const nextQuestion = this.conversationService.getRoadmapQuestion(answeredQuestionsCount);
            await this.conversationService.addMessage(conversationId, 'AI', nextQuestion);
            
            return {
                aiResponse: nextQuestion,
                roadmapState: 'collecting_info'
            };
        }
    }

    async handleRoadmapQuestion(conversationId, content) {
        const prompt = `사용자의 질문에 답변해줘: ${content}`;
        const aiResponse = await this.openaiService.generateResponse([
            { role: 'user', content: prompt }
        ]);
        
        await this.conversationService.addMessage(conversationId, 'AI', aiResponse);
        
        return {
            aiResponse,
            roadmapState: 'generation_complete'
        };
    }

    async generateRoadmap(conversationId) {
        const conversation = await this.conversationService.findConversationById(conversationId);
        const collectedInfo = conversation.roadmapInputs
            .map(item => `${item.question}: ${item.answer}`)
            .join('\n');
        
        const roadmapData = await this.openaiService.generateRoadmap(collectedInfo);
        await this.conversationService.updateRoadmap(conversationId, roadmapData);
        
        const completionMessage = "전체 로드맵이 생성되었습니다! 아래에서 계획을 확인하고 단계를 진행하세요.";
        await this.conversationService.addMessage(conversationId, 'AI', completionMessage);
        
        return {
            aiResponse: completionMessage,
            roadmap: roadmapData,
            roadmapState: 'generation_complete'
        };
    }

    async generateAiHelp(conversationId, currentGoal, currentAction) {
        const helpData = await this.openaiService.generateAiHelp(currentGoal, currentAction);
        
        // 대화 기록에 AI 도움 요청 추가
        await this.conversationService.addMessage(
            conversationId, 
            'user', 
            `'${currentAction}' 단계에 대한 AI 도움 요청`
        );
        
        return helpData;
    }
}

module.exports = RoadmapService;

