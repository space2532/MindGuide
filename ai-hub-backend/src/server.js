require('dotenv').config(); // Should be the very first line

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Needed if using explicit path for dotenv

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
const dbUri = process.env.MONGO_URI; // Store in a variable first
console.log('Attempting to connect with MONGO_URI:', dbUri); // Log the variable

// Exit if URI is not defined
if (!dbUri) {
    console.error('❌ FATAL ERROR: MONGO_URI environment variable is not defined! Check your .env file.');
    process.exit(1); // Exit the application
}

// Connect using the variable that holds the URI
// Ensure the variable name passed here matches the one checked above (dbUri)
mongoose.connect(dbUri) // <-- Corrected to use the variable `dbUri` which holds process.env.MONGO_URI
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        // Optional: Exit if connection fails on startup
        // process.exit(1);
    });

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            connected: mongoose.connection.readyState === 1 // 1 means connected
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

// Use Routers (Ensure correct paths if controllers handle base paths)
app.use('/', conversationRouter.getRouter()); // Assuming router handles '/conversations', '/conversation/:id' etc.
app.use('/', roadmapRouter.getRouter());    // Assuming router handles '/roadmap/generate', '/roadmap/ai-help' etc.

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
});

