const express = require('express');
const RoadmapController = require('../controllers/RoadmapController');

class RoadmapRouter {
    constructor(roadmapController) {
        this.router = express.Router();
        this.roadmapController = roadmapController;
        this.setupRoutes();
    }

    setupRoutes() {
        // 로드맵 생성
        this.router.post('/roadmap/generate', (req, res) => 
            this.roadmapController.generateRoadmap(req, res)
        );

        // AI 도움 받기
        this.router.post('/roadmap/ai-help', (req, res) => 
            this.roadmapController.getAiHelp(req, res)
        );
    }

    getRouter() {
        return this.router;
    }
}

module.exports = RoadmapRouter;

