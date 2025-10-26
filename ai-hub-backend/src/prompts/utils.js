/**
 * 프롬프트 개발 및 테스트 유틸리티
 * 프롬프트의 성능을 테스트하고 개선하기 위한 도구들
 */

const PROMPTS = require('./index');

class PromptTester {
    constructor() {
        this.testResults = [];
    }

    /**
     * 프롬프트 테스트 실행
     * 다양한 입력에 대해 프롬프트의 응답을 테스트합니다.
     * 
     * @param {string} promptType - 테스트할 프롬프트 타입
     * @param {Array} testCases - 테스트 케이스 배열
     * @returns {Array} 테스트 결과
     */
    async testPrompt(promptType, testCases) {
        console.log(`\n🧪 ${promptType} 프롬프트 테스트 시작...`);
        
        const results = [];
        
        for (const testCase of testCases) {
            try {
                const startTime = Date.now();
                const prompt = this.generatePrompt(promptType, testCase.input);
                const endTime = Date.now();
                
                const result = {
                    testCase: testCase.name,
                    input: testCase.input,
                    prompt: prompt,
                    generationTime: endTime - startTime,
                    success: true,
                    error: null
                };
                
                results.push(result);
                console.log(`✅ ${testCase.name}: 성공 (${result.generationTime}ms)`);
                
            } catch (error) {
                const result = {
                    testCase: testCase.name,
                    input: testCase.input,
                    prompt: null,
                    generationTime: 0,
                    success: false,
                    error: error.message
                };
                
                results.push(result);
                console.log(`❌ ${testCase.name}: 실패 - ${error.message}`);
            }
        }
        
        this.testResults.push({
            promptType,
            results,
            timestamp: new Date().toISOString()
        });
        
        return results;
    }

    /**
     * 프롬프트 생성
     * 프롬프트 타입과 입력에 따라 적절한 프롬프트를 생성합니다.
     * 
     * @param {string} promptType - 프롬프트 타입
     * @param {Object} input - 입력 데이터
     * @returns {string} 생성된 프롬프트
     */
    generatePrompt(promptType, input) {
        switch (promptType) {
            case 'generateTitle':
                return PROMPTS.generateTitle(input.content);
            
            case 'conversationMentor':
                return PROMPTS.conversationMentor();
            
            case 'generateRoadmap':
                return PROMPTS.generateRoadmap(input.collectedInfo);
            
            case 'generateSummary':
                return PROMPTS.generateSummary(input.conversationHistory);
            
            case 'generateAiHelp':
                return PROMPTS.generateAiHelp(input.currentGoal, input.currentAction);
            
            default:
                throw new Error(`알 수 없는 프롬프트 타입: ${promptType}`);
        }
    }

    /**
     * 테스트 결과 요약
     * 모든 테스트 결과를 요약하여 출력합니다.
     */
    summarizeResults() {
        console.log('\n📊 테스트 결과 요약');
        console.log('='.repeat(50));
        
        for (const test of this.testResults) {
            const successCount = test.results.filter(r => r.success).length;
            const totalCount = test.results.length;
            const avgTime = test.results
                .filter(r => r.success)
                .reduce((sum, r) => sum + r.generationTime, 0) / successCount || 0;
            
            console.log(`\n${test.promptType}:`);
            console.log(`  성공률: ${successCount}/${totalCount} (${(successCount/totalCount*100).toFixed(1)}%)`);
            console.log(`  평균 생성 시간: ${avgTime.toFixed(2)}ms`);
            
            if (successCount < totalCount) {
                console.log(`  실패한 테스트:`);
                test.results
                    .filter(r => !r.success)
                    .forEach(r => console.log(`    - ${r.testCase}: ${r.error}`));
            }
        }
    }

    /**
     * 프롬프트 성능 벤치마크
     * 프롬프트 생성 성능을 측정합니다.
     * 
     * @param {string} promptType - 벤치마크할 프롬프트 타입
     * @param {Object} input - 입력 데이터
     * @param {number} iterations - 반복 횟수
     * @returns {Object} 벤치마크 결과
     */
    benchmarkPrompt(promptType, input, iterations = 100) {
        console.log(`\n⚡ ${promptType} 프롬프트 벤치마크 (${iterations}회 반복)...`);
        
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const startTime = process.hrtime.bigint();
            this.generatePrompt(promptType, input);
            const endTime = process.hrtime.bigint();
            
            times.push(Number(endTime - startTime) / 1000000); // 나노초를 밀리초로 변환
        }
        
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        const result = {
            promptType,
            iterations,
            avgTime: avgTime.toFixed(3),
            minTime: minTime.toFixed(3),
            maxTime: maxTime.toFixed(3),
            times
        };
        
        console.log(`  평균: ${result.avgTime}ms`);
        console.log(`  최소: ${result.minTime}ms`);
        console.log(`  최대: ${result.maxTime}ms`);
        
        return result;
    }
}

/**
 * 프롬프트 템플릿 검증기
 * 프롬프트 템플릿의 유효성을 검증합니다.
 */
class PromptValidator {
    /**
     * 프롬프트 템플릿 검증
     * 모든 프롬프트 템플릿의 유효성을 검증합니다.
     * 
     * @returns {Object} 검증 결과
     */
    validateAll() {
        console.log('\n🔍 프롬프트 템플릿 검증 시작...');
        
        const results = {
            valid: [],
            invalid: [],
            warnings: []
        };
        
        // 각 프롬프트 함수 검증
        const promptFunctions = [
            'generateTitle',
            'conversationMentor',
            'generateRoadmap',
            'generateSummary',
            'generateAiHelp'
        ];
        
        for (const funcName of promptFunctions) {
            try {
                const func = PROMPTS[funcName];
                
                if (typeof func !== 'function') {
                    results.invalid.push({
                        function: funcName,
                        error: '함수가 아닙니다'
                    });
                    continue;
                }
                
                // 함수 실행 테스트
                if (funcName === 'conversationMentor') {
                    func();
                } else {
                    // 다른 함수들은 더미 데이터로 테스트
                    const dummyData = this.getDummyData(funcName);
                    func(dummyData);
                }
                
                results.valid.push(funcName);
                console.log(`✅ ${funcName}: 유효`);
                
            } catch (error) {
                results.invalid.push({
                    function: funcName,
                    error: error.message
                });
                console.log(`❌ ${funcName}: ${error.message}`);
            }
        }
        
        // 로드맵 질문 검증
        this.validateRoadmapQuestions(results);
        
        return results;
    }

    /**
     * 로드맵 질문 검증
     * 로드맵 질문들의 유효성을 검증합니다.
     * 
     * @param {Object} results - 검증 결과 객체
     */
    validateRoadmapQuestions(results) {
        const questions = PROMPTS.roadmapQuestions;
        
        if (!questions || typeof questions !== 'object') {
            results.invalid.push({
                function: 'roadmapQuestions',
                error: 'roadmapQuestions 객체가 없습니다'
            });
            return;
        }
        
        const requiredQuestions = [
            'currentSituation',
            'timeInvestment',
            'costInvestment',
            'targetDeadline',
            'targetPurpose'
        ];
        
        for (const questionKey of requiredQuestions) {
            if (!questions[questionKey] || typeof questions[questionKey] !== 'string') {
                results.invalid.push({
                    function: `roadmapQuestions.${questionKey}`,
                    error: '질문이 없거나 문자열이 아닙니다'
                });
            } else {
                results.valid.push(`roadmapQuestions.${questionKey}`);
            }
        }
    }

    /**
     * 더미 데이터 생성
     * 테스트용 더미 데이터를 생성합니다.
     * 
     * @param {string} funcName - 함수 이름
     * @returns {*} 더미 데이터
     */
    getDummyData(funcName) {
        switch (funcName) {
            case 'generateTitle':
                return { content: '프로그래밍을 배우고 싶어요' };
            
            case 'generateRoadmap':
                return { 
                    collectedInfo: '목표: 웹 개발자 되기\n시간: 주 10시간\n비용: 월 5만원' 
                };
            
            case 'generateSummary':
                return { 
                    conversationHistory: '사용자: 프로그래밍이 어려워요\nAI: 어떤 부분이 어려우신가요?' 
                };
            
            case 'generateAiHelp':
                return { 
                    currentGoal: '프론트엔드 개발 학습',
                    currentAction: 'React 기초 학습'
                };
            
            default:
                return {};
        }
    }
}

module.exports = {
    PromptTester,
    PromptValidator
};

