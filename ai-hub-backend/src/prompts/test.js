/**
 * 프롬프트 개발 테스트 스크립트
 * 프롬프트의 성능과 품질을 테스트하기 위한 스크립트
 */

const { PromptTester, PromptValidator } = require('./utils');

// 테스트 케이스 정의
const TEST_CASES = {
    generateTitle: [
        {
            name: '프로그래밍 학습',
            input: { content: '프로그래밍을 배우고 싶어요' }
        },
        {
            name: '취업 준비',
            input: { content: '개발자로 취업하고 싶은데 어떻게 준비해야 할까요?' }
        },
        {
            name: '프로젝트 계획',
            input: { content: '웹사이트를 만들어보고 싶어요' }
        }
    ],
    
    generateRoadmap: [
        {
            name: '웹 개발자 로드맵',
            input: {
                collectedInfo: `최종 목표: 웹 개발자 되기
현재 상황: 프로그래밍 초보
투자 시간: 주 10시간
투자 비용: 월 5만원
목표 기한: 6개월
목적: 취업`
            }
        },
        {
            name: '데이터 사이언티스트 로드맵',
            input: {
                collectedInfo: `최종 목표: 데이터 사이언티스트 되기
현재 상황: 통계학 전공
투자 시간: 주 15시간
투자 비용: 월 10만원
목표 기한: 1년
목적: 전환`
            }
        }
    ],
    
    generateSummary: [
        {
            name: '프로그래밍 고민',
            input: {
                conversationHistory: `사용자: 프로그래밍을 배우고 싶은데 어디서부터 시작해야 할지 모르겠어요
AI: 어떤 종류의 프로그래밍에 관심이 있으신가요?
사용자: 웹사이트를 만들고 싶어요
AI: 웹 개발을 위해서는 HTML, CSS, JavaScript를 먼저 배우는 것이 좋습니다`
            }
        },
        {
            name: '취업 준비 고민',
            input: {
                conversationHistory: `사용자: 개발자로 취업하고 싶은데 포트폴리오가 없어요
AI: 어떤 프로젝트를 만들어보고 싶으신가요?
사용자: 간단한 웹사이트라도 만들어보고 싶어요
AI: 좋은 시작이네요. 먼저 간단한 개인 웹사이트부터 만들어보는 것은 어떨까요?`
            }
        }
    ],
    
    generateAiHelp: [
        {
            name: 'React 학습 도움',
            input: {
                currentGoal: '프론트엔드 개발 학습',
                currentAction: 'React 기초 학습'
            }
        },
        {
            name: '포트폴리오 제작 도움',
            input: {
                currentGoal: '포트폴리오 웹사이트 제작',
                currentAction: '디자인 및 레이아웃 구성'
            }
        }
    ]
};

/**
 * 프롬프트 테스트 실행
 */
async function runPromptTests() {
    console.log('🚀 프롬프트 개발 테스트 시작');
    console.log('='.repeat(50));
    
    const tester = new PromptTester();
    
    // 각 프롬프트 타입별 테스트 실행
    for (const [promptType, testCases] of Object.entries(TEST_CASES)) {
        await tester.testPrompt(promptType, testCases);
    }
    
    // 테스트 결과 요약
    tester.summarizeResults();
    
    // 벤치마크 테스트
    console.log('\n⚡ 성능 벤치마크 테스트');
    console.log('='.repeat(50));
    
    const benchmarkData = {
        generateTitle: { content: '프로그래밍을 배우고 싶어요' },
        conversationMentor: {},
        generateRoadmap: { 
            collectedInfo: '목표: 웹 개발자 되기\n시간: 주 10시간\n비용: 월 5만원' 
        },
        generateSummary: { 
            conversationHistory: '사용자: 프로그래밍이 어려워요\nAI: 어떤 부분이 어려우신가요?' 
        },
        generateAiHelp: { 
            currentGoal: '프론트엔드 개발 학습',
            currentAction: 'React 기초 학습'
        }
    };
    
    for (const [promptType, input] of Object.entries(benchmarkData)) {
        tester.benchmarkPrompt(promptType, input, 50);
    }
}

/**
 * 프롬프트 검증 실행
 */
function runPromptValidation() {
    console.log('\n🔍 프롬프트 템플릿 검증');
    console.log('='.repeat(50));
    
    const validator = new PromptValidator();
    const results = validator.validateAll();
    
    console.log('\n📊 검증 결과:');
    console.log(`✅ 유효한 프롬프트: ${results.valid.length}개`);
    console.log(`❌ 유효하지 않은 프롬프트: ${results.invalid.length}개`);
    
    if (results.invalid.length > 0) {
        console.log('\n❌ 유효하지 않은 프롬프트:');
        results.invalid.forEach(item => {
            console.log(`  - ${item.function}: ${item.error}`);
        });
    }
    
    if (results.warnings.length > 0) {
        console.log('\n⚠️ 경고:');
        results.warnings.forEach(warning => {
            console.log(`  - ${warning}`);
        });
    }
}

/**
 * 프롬프트 품질 분석
 */
function analyzePromptQuality() {
    console.log('\n📈 프롬프트 품질 분석');
    console.log('='.repeat(50));
    
    const PROMPTS = require('./index');
    
    const analysis = {
        totalPrompts: 0,
        averageLength: 0,
        longestPrompt: { name: '', length: 0 },
        shortestPrompt: { name: '', length: Infinity },
        promptsWithGuidelines: 0,
        promptsWithExamples: 0
    };
    
    const promptFunctions = [
        'generateTitle',
        'conversationMentor',
        'generateRoadmap',
        'generateSummary',
        'generateAiHelp'
    ];
    
    for (const funcName of promptFunctions) {
        const func = PROMPTS[funcName];
        if (typeof func === 'function') {
            analysis.totalPrompts++;
            
            let promptText = '';
            if (funcName === 'conversationMentor') {
                promptText = func();
            } else {
                // 더미 데이터로 프롬프트 생성
                const dummyData = getDummyData(funcName);
                promptText = func(dummyData);
            }
            
            const length = promptText.length;
            analysis.averageLength += length;
            
            if (length > analysis.longestPrompt.length) {
                analysis.longestPrompt = { name: funcName, length };
            }
            
            if (length < analysis.shortestPrompt.length) {
                analysis.shortestPrompt = { name: funcName, length };
            }
            
            // 가이드라인 포함 여부 확인
            if (promptText.includes('가이드') || promptText.includes('규칙') || promptText.includes('주의사항')) {
                analysis.promptsWithGuidelines++;
            }
            
            // 예시 포함 여부 확인
            if (promptText.includes('예:') || promptText.includes('예시') || promptText.includes('예를 들어')) {
                analysis.promptsWithExamples++;
            }
        }
    }
    
    analysis.averageLength = Math.round(analysis.averageLength / analysis.totalPrompts);
    
    console.log(`총 프롬프트 수: ${analysis.totalPrompts}`);
    console.log(`평균 길이: ${analysis.averageLength}자`);
    console.log(`가장 긴 프롬프트: ${analysis.longestPrompt.name} (${analysis.longestPrompt.length}자)`);
    console.log(`가장 짧은 프롬프트: ${analysis.shortestPrompt.name} (${analysis.shortestPrompt.length}자)`);
    console.log(`가이드라인 포함: ${analysis.promptsWithGuidelines}/${analysis.totalPrompts}`);
    console.log(`예시 포함: ${analysis.promptsWithExamples}/${analysis.totalPrompts}`);
}

/**
 * 더미 데이터 생성 헬퍼 함수
 */
function getDummyData(funcName) {
    switch (funcName) {
        case 'generateTitle':
            return '프로그래밍을 배우고 싶어요';
        
        case 'generateRoadmap':
            return '목표: 웹 개발자 되기\n시간: 주 10시간\n비용: 월 5만원';
        
        case 'generateSummary':
            return '사용자: 프로그래밍이 어려워요\nAI: 어떤 부분이 어려우신가요?';
        
        case 'generateAiHelp':
            return '프론트엔드 개발 학습';
        
        default:
            return '';
    }
}

// 메인 실행 함수
async function main() {
    try {
        // 프롬프트 검증
        runPromptValidation();
        
        // 프롬프트 품질 분석
        analyzePromptQuality();
        
        // 프롬프트 테스트
        await runPromptTests();
        
        console.log('\n🎉 모든 테스트가 완료되었습니다!');
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류 발생:', error.message);
        process.exit(1);
    }
}

// 스크립트가 직접 실행될 때만 테스트 실행
if (require.main === module) {
    main();
}

module.exports = {
    runPromptTests,
    runPromptValidation,
    analyzePromptQuality,
    TEST_CASES
};

