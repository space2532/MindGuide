class RoadmapController {
    constructor(roadmapService) {
        this.roadmapService = roadmapService;
    }

    async generateRoadmap(req, res) {
        try {
            const { conversationId } = req.body;
            if (!conversationId) {
                return res.status(400).json({ error: 'conversationId가 필요합니다.' });
            }

            const result = await this.roadmapService.generateRoadmap(conversationId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in generateRoadmap:', error.message);
            res.status(500).json({ error: '로드맵 생성 중 오류 발생' });
        }
    }

    async getAiHelp(req, res) {
        try {
            const { conversationId, currentGoal, currentAction } = req.body;
            if (!conversationId || !currentAction) {
                return res.status(400).json({ error: '필수 정보가 부족합니다.' });
            }

            const helpData = await this.roadmapService.generateAiHelp(
                conversationId, 
                currentGoal, 
                currentAction
            );
            
            res.status(200).json(helpData);
        } catch (error) {
            console.error('Error in getAiHelp:', error.message);
            res.status(500).json({ error: 'AI 도움 정보 생성 중 오류가 발생했습니다.' });
        }
    }
}

module.exports = RoadmapController;

