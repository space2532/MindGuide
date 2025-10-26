require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const Conversation = require('./models/Conversation');

const app = express();
const PORT = process.env.PORT || 4000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// OpenAI Axios Instance
const openai = axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
});

const ROADMAP_QUESTIONS = [
    "현재 목표와 관련하여 어떤 상황에 계신가요? (예: 프로그래밍 초보, 관련 지식 없음)",
    "일주일에 투자할 수 있는 시간은 어느 정도인가요?",
    "투자할 수 있는 비용이 있나요? 있다면 어느 정도인가요?",
    "목표를 언제까지 달성하고 싶으신가요?",
    "이 목표를 달성하려는 주된 목적은 무엇인가요? (예: 취업, 사이드 프로젝트, 자기계발)"
];

// POST /message (Existing Endpoint)
app.post('/message', async (req, res) => {
    // ... (기존 코드와 동일, 변경 없음)
    let { conversationId, content, type } = req.body;

    try {
        let conversation;
        if (!conversationId) {
            const titleResponse = await openai.post('/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: `다음 대화의 주제를 5단어 이하의 짧고 명확한 제목으로 만들어줘: "${content}"` }],
            });
            const title = titleResponse.data.choices[0].message.content.trim();
            
            conversation = new Conversation({ 
                userId: 'user_123', 
                type, 
                title,
                messages: [{ sender: 'user', content }]
            });
        } else {
            conversation = await Conversation.findById(conversationId);
            if (!conversation) return res.status(404).json({ error: '대화를 찾을 수 없습니다.' });
            conversation.messages.push({ sender: 'user', content });
        }

        let aiResponseContent = '';

        if (conversation.type === '로드맵 생성') {
            const answeredQuestionsCount = conversation.roadmapInputs.length;
            
            if (conversation.roadmapState === 'not_started') {
                conversation.roadmapState = 'collecting_info';
                conversation.roadmapInputs.push({ question: "최종 목표", answer: content });
                aiResponseContent = ROADMAP_QUESTIONS[0];
                conversation.messages.push({ sender: 'AI', content: aiResponseContent });
            } else if (conversation.roadmapState === 'collecting_info') {
                const lastQuestion = ROADMAP_QUESTIONS[answeredQuestionsCount - 1] || conversation.roadmapInputs[answeredQuestionsCount -1].question;
                conversation.roadmapInputs.push({ question: lastQuestion, answer: content });

                if (answeredQuestionsCount < ROADMAP_QUESTIONS.length) {
                    aiResponseContent = ROADMAP_QUESTIONS[answeredQuestionsCount];
                    conversation.messages.push({ sender: 'AI', content: aiResponseContent });
                } else {
                    aiResponseContent = "모든 정보가 수집되었습니다. '로드맵 생성' 버튼을 눌러 전체 계획을 확인하세요.";
                    conversation.messages.push({ sender: 'AI', content: aiResponseContent });
                }
            } else {
                 const prompt = `사용자의 질문에 답변해줘: ${content}`;
                 const response = await openai.post('/chat/completions', { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }] });
                 aiResponseContent = response.data.choices[0].message.content.trim();
                 conversation.messages.push({ sender: 'AI', content: aiResponseContent });
            }
        } else { 
            const system_prompt = `
            너는 사용자가 자신의 생각이나 목표를 구체화하도록 돕는 전문 AI 멘토야. 너의 역할은 대화의 전체 맥락을 파악하고, 사용자의 최종 목표에 더 가까워질 수 있는 핵심적인 질문을 던지는 것이야.
            [규칙]
            1. 항상 전체 대화 내용을 처음부터 끝까지 파악하고, 사용자의 궁극적인 목표가 무엇인지 추론해.
            2. 절대로 단편적인 키워드나 마지막 답변에만 집중해서 질문하지 마.
            3. 대화의 목적은 '생각의 구체화'임을 잊지 말고, 항상 그 목적에 맞는 다음 질문을 딱 하나만 해줘.
            4. 답변은 다른 말 없이 질문으로만 간결하게 해줘.
            `;
            const history = conversation.messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.content
            }));
            const response = await openai.post('/chat/completions', { 
                model: 'gpt-3.5-turbo', 
                messages: [ { role: 'system', content: system_prompt }, ...history ] 
            });
            aiResponseContent = response.data.choices[0].message.content.trim();
            conversation.messages.push({ sender: 'AI', content: aiResponseContent });
        }
        await conversation.save();
        res.status(200).json({ 
            aiResponse: aiResponseContent, 
            conversationId: conversation._id,
            roadmapState: conversation.roadmapState 
        });
    } catch (error) {
        console.error('Error in /message:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: '메시지 처리 중 오류 발생' });
    }
});

// POST /conversation/summarize (Existing Endpoint)
app.post('/conversation/summarize', async (req, res) => {
    // ... (기존 코드와 동일, 변경 없음)
    const { conversationId } = req.body;
    if (!conversationId) return res.status(400).json({ error: 'conversationId가 필요합니다.' });

    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ error: '대화를 찾을 수 없습니다.' });

        const history = conversation.messages.map(m => `${m.sender}: ${m.content}`).join('\n');
        const prompt = `
            다음 대화 내용을 바탕으로 사용자의 고민을 체계적으로 정리해줘.
            아래 4가지 항목을 반드시 포함하여 마크다운 형식으로 작성해줘:
            ### 현재 상황
            - 사용자가 처한 상황을 객관적으로 1~2 문장으로 요약해줘.
            ### 문제 원인
            - 대화 내용에서 추론할 수 있는 근본적인 원인을 분석해줘.
            ### 핵심 요약
            - 전체 고민의 핵심을 한두 문장으로 요약해줘.
            ### 조언 및 목표 제안
            - 상황을 해결하기 위한 구체적인 조언과 앞으로 나아가야 할 목표를 제시해줘.
            --- 대화 내용 ---
            ${history}
        `;
        const response = await openai.post('/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });
        const summaryContent = response.data.choices[0].message.content.trim();
        conversation.summary = summaryContent;
        conversation.messages.push({ sender: 'AI', content: summaryContent });

        await conversation.save();
        res.status(200).json({ aiResponse: summaryContent });

    } catch (error) {
        console.error('Error in /conversation/summarize:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: '정리본 생성 중 오류 발생' });
    }
});

// POST /roadmap/generate (Existing Endpoint)
app.post('/roadmap/generate', async (req, res) => {
    // ... (기존 코드와 동일, 변경 없음)
    const { conversationId } = req.body;
    if (!conversationId) return res.status(400).json({ error: 'conversationId가 필요합니다.' });
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ error: '대화를 찾을 수 없습니다.' });
        const collectedInfo = conversation.roadmapInputs.map(item => `${item.question}: ${item.answer}`).join('\n');
        const prompt = `
            다음 정보를 바탕으로 사용자를 위한 로드맵을 생성해줘. 정보: ${collectedInfo}
            출력 형식은 반드시 아래 JSON 구조를 따라야 해:
            { "finalGoal": "최종 목표 요약", "intermediateGoals": [ { "goal": "중간 목표", "actions": [ { "action": "세부 행동" } ] } ] }
        `;
        const response = await openai.post('/chat/completions', {
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        });
        const roadmapData = JSON.parse(response.data.choices[0].message.content);
        conversation.roadmap = roadmapData;
        conversation.roadmapState = 'generation_complete';
        const aiResponseContent = "전체 로드맵이 생성되었습니다! 아래에서 계획을 확인하고 단계를 진행하세요.";
        conversation.messages.push({ sender: 'AI', content: aiResponseContent });
        await conversation.save();
        res.status(200).json({
            aiResponse: aiResponseContent,
            roadmap: conversation.roadmap,
            roadmapState: conversation.roadmapState
        });
    } catch (error) {
        console.error('Error in /roadmap/generate:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: '로드맵 생성 중 오류 발생' });
    }
});

// POST /roadmap/ai-help (Updated Endpoint)
app.post('/roadmap/ai-help', async (req, res) => {
    const { conversationId, currentGoal, currentAction } = req.body;
    if (!conversationId || !currentAction) return res.status(400).json({ error: '필수 정보가 부족합니다.' });

    try {
        const prompt = `
            사용자는 현재 "${currentGoal}"라는 중간 목표를 위해 "${currentAction}" 단계를 수행하고 있습니다.
            이 단계를 가장 효율적으로 완료하는 데 도움이 될 AI 도구들을 3개 비교/분석하고, 그중 가장 적합한 도구 1개를 추천해주세요.
            출력 형식은 반드시 아래의 JSON 구조를 따라야 합니다. 각 도구에 대한 정보와 함께, 해당 도구에서 바로 사용할 수 있는 구체적인 프롬프트도 각각 생성해주세요.
            {
              "ai_tools": [
                {
                  "name": "AI 도구 이름",
                  "url": "AI 도구 웹페이지 URL",
                  "specialization": "AI 특화 분야 (예: 텍스트 생성, 이미지 생성, 코드 분석 등)",
                  "cost": "이용 비용 (예: 무료, 또는 월 $20 등 구체적인 가격 정보)",
                  "prompt": "사용자의 현재 단계를 위한 맞춤형 프롬프트"
                }
              ],
              "recommendation": {
                "name": "추천하는 AI 도구 이름",
                "reason": "해당 AI를 추천하는 이유를 작업 효율, 비용, 특화 분야를 종합하여 2-3문장으로 구체적으로 작성"
              }
            }
        `;

        const response = await openai.post('/chat/completions', {
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" }
        });
        
        const helpData = JSON.parse(response.data.choices[0].message.content);
        
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
            conversation.messages.push({ sender: 'user', content: `'${currentAction}' 단계에 대한 AI 도움 요청` });
            await conversation.save();
        }

        res.status(200).json(helpData);

    } catch (error) {
        console.error('Error in /roadmap/ai-help:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'AI 도움 정보 생성 중 오류가 발생했습니다.' });
    }
});

// GET /conversations (Existing Endpoint)
app.get('/conversations', async (req, res) => {
    // ... (기존 코드와 동일, 변경 없음)
    try {
        const conversations = await Conversation.find({ userId: 'user_123' }).sort({ createdAt: -1 });
        res.status(200).json({ conversations });
    } catch (error) {
        res.status(500).json({ error: '대화 목록 조회 오류' });
    }
});

// GET /conversation/:id (Existing Endpoint)
app.get('/conversation/:id', async (req, res) => {
    // ... (기존 코드와 동일, 변경 없음)
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) return res.status(404).json({ error: '대화를 찾을 수 없습니다.' });
        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ error: '대화 조회 오류' });
    }
});

// --- New Endpoints for Conversation Management ---

// PUT /conversations/:id - Update conversation title
app.put('/conversations/:id', async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: '제목이 필요합니다.' });
    }
    try {
        const conversation = await Conversation.findByIdAndUpdate(
            req.params.id,
            { title },
            { new: true }
        );
        if (!conversation) {
            return res.status(404).json({ error: '대화를 찾을 수 없습니다.' });
        }
        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ error: '대화 제목 수정 중 오류 발생' });
    }
});

// DELETE /conversations/:id - Delete a conversation
app.delete('/conversations/:id', async (req, res) => {
    try {
        const conversation = await Conversation.findByIdAndDelete(req.params.id);
        if (!conversation) {
            return res.status(404).json({ error: '대화를 찾을 수 없습니다.' });
        }
        res.status(200).json({ message: '대화가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ error: '대화 삭제 중 오류 발생' });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

