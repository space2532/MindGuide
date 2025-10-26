const express = require('express');
const ConversationController = require('../controllers/ConversationController');
const RoadmapController = require('../controllers/RoadmapController');

class ConversationRouter {
    constructor(conversationController) {
        this.router = express.Router();
        this.conversationController = conversationController;
        this.setupRoutes();
    }

    setupRoutes() {
        // 메시지 전송
        this.router.post('/message', (req, res) => 
            this.conversationController.sendMessage(req, res)
        );

        // 대화 목록 조회
        this.router.get('/conversations', (req, res) => 
            this.conversationController.getConversations(req, res)
        );

        // 특정 대화 조회
        this.router.get('/conversation/:id', (req, res) => 
            this.conversationController.getConversation(req, res)
        );

        // 대화 제목 수정
        this.router.put('/conversations/:id', (req, res) => 
            this.conversationController.updateConversation(req, res)
        );

        // 대화 삭제
        this.router.delete('/conversations/:id', (req, res) => 
            this.conversationController.deleteConversation(req, res)
        );

        // 대화 요약
        this.router.post('/conversation/summarize', (req, res) => 
            this.conversationController.summarizeConversation(req, res)
        );
    }

    getRouter() {
        return this.router;
    }
}

module.exports = ConversationRouter;

