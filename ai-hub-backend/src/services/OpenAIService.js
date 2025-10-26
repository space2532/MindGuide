const axios = require('axios');
const PROMPTS = require('../prompts');

class OpenAIService {
    constructor(apiKey) {
        this.openai = axios.create({
            baseURL: 'https://api.openai.com/v1',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
    }

    /**
     * 대화 제목 생성
     * 사용자의 첫 번째 메시지를 바탕으로 대화의 주제를 파악하여 제목을 생성합니다.
     * 
     * @param {string} content - 사용자가 입력한 첫 번째 메시지
     * @returns {Promise<string>} 생성된 제목
     */
    async generateTitle(content) {
        try {
            const response = await this.openai.post('/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [{ 
                    role: 'user', 
                    content: PROMPTS.generateTitle(content)
                }],
            });
            return response.data.choices[0].message.content.trim();
        } catch (error) {
            throw new Error(`제목 생성 실패: ${error.message}`);
        }
    }

    /**
     * AI 응답 생성
     * 대화 히스토리와 시스템 프롬프트를 바탕으로 AI 응답을 생성합니다.
     * 
     * @param {Array} messages - 대화 히스토리
     * @param {string} systemPrompt - 시스템 프롬프트 (선택사항)
     * @returns {Promise<string>} AI 응답
     */
    async generateResponse(messages, systemPrompt = null) {
        try {
            const requestMessages = systemPrompt 
                ? [{ role: 'system', content: systemPrompt }, ...messages]
                : messages;

            const response = await this.openai.post('/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: requestMessages
            });
            return response.data.choices[0].message.content.trim();
        } catch (error) {
            throw new Error(`응답 생성 실패: ${error.message}`);
        }
    }

    /**
     * 로드맵 생성
     * 사용자로부터 수집된 정보를 바탕으로 체계적인 로드맵을 생성합니다.
     * 
     * @param {string} collectedInfo - 수집된 사용자 정보
     * @returns {Promise<Object>} 생성된 로드맵 데이터
     */
    async generateRoadmap(collectedInfo) {
        try {
            const response = await this.openai.post('/chat/completions', {
                model: 'gpt-4o',
                messages: [{ role: 'user', content: PROMPTS.generateRoadmap(collectedInfo) }],
                response_format: { type: "json_object" }
            });
            
            return JSON.parse(response.data.choices[0].message.content);
        } catch (error) {
            throw new Error(`로드맵 생성 실패: ${error.message}`);
        }
    }

    /**
     * 대화 요약 생성
     * 대화 내용을 바탕으로 사용자의 고민을 체계적으로 정리합니다.
     * 
     * @param {string} conversationHistory - 대화 내용 전체
     * @returns {Promise<string>} 생성된 요약
     */
    async generateSummary(conversationHistory) {
        try {
            const response = await this.openai.post('/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: PROMPTS.generateSummary(conversationHistory) }],
            });
            
            return response.data.choices[0].message.content.trim();
        } catch (error) {
            throw new Error(`요약 생성 실패: ${error.message}`);
        }
    }

    /**
     * AI 도구 추천 정보 생성
     * 사용자의 현재 목표와 수행 중인 단계에 맞는 AI 도구를 추천합니다.
     * 
     * @param {string} currentGoal - 현재 진행 중인 중간 목표
     * @param {string} currentAction - 현재 수행 중인 세부 행동
     * @returns {Promise<Object>} AI 도구 추천 정보
     */
    async generateAiHelp(currentGoal, currentAction) {
        try {
            const response = await this.openai.post('/chat/completions', {
                model: 'gpt-4o',
                messages: [{ role: 'user', content: PROMPTS.generateAiHelp(currentGoal, currentAction) }],
                response_format: { type: "json_object" }
            });
            
            return JSON.parse(response.data.choices[0].message.content);
        } catch (error) {
            throw new Error(`AI 도움 정보 생성 실패: ${error.message}`);
        }
    }
}

module.exports = OpenAIService;
