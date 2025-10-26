require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Services
const OpenAIService = require('./services/OpenAIService');
const ConversationService = require('./services/ConversationService');
const RoadmapService = require('./services/RoadmapService');

// Controllers
const ConversationController = require('./controllers/ConversationController');
const RoadmapController = require('./controllers/RoadmapController');

// Routers
const ConversationRouter = require('./routes/ConversationRouter');
const RoadmapRouter = require('./routes/RoadmapRouter');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            connected: mongoose.connection.readyState === 1
        },
        environment: process.env.NODE_ENV || 'development'
    });
});

// Initialize Services
const openaiService = new OpenAIService(process.env.OPENAI_API_KEY);
const conversationService = new ConversationService();
const roadmapService = new RoadmapService(conversationService, openaiService);

// Initialize Controllers
const conversationController = new ConversationController(
    conversationService, 
    openaiService, 
    roadmapService
);
const roadmapController = new RoadmapController(roadmapService);

// Initialize Routers
const conversationRouter = new ConversationRouter(conversationController);
const roadmapRouter = new RoadmapRouter(roadmapController);

// Use Routers
app.use('/', conversationRouter.getRouter());
app.use('/', roadmapRouter.getRouter());

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
});

