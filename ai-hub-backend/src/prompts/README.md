# 프롬프트 개발 시스템

AI Hub의 프롬프트 시스템은 체계적이고 확장 가능한 구조로 설계되었습니다. 각 프롬프트는 특정 기능에 최적화되어 있으며, 개발과 테스트가 용이하도록 구성되어 있습니다.

## 📁 프롬프트 시스템 구조

```
src/prompts/
├── index.js          # 메인 프롬프트 템플릿 모음
├── utils.js          # 프롬프트 테스트 및 검증 유틸리티
├── test.js           # 프롬프트 테스트 스크립트
└── README.md         # 프롬프트 개발 가이드
```

## 🎯 프롬프트 종류

### 1. 대화 제목 생성 (`generateTitle`)
- **목적**: 사용자 입력을 바탕으로 대화의 주제를 파악하여 간결한 제목 생성
- **입력**: 사용자의 첫 번째 메시지
- **출력**: 5단어 이하의 명확한 제목

### 2. 고민 정리 멘토 (`conversationMentor`)
- **목적**: 사용자의 고민을 구체화하도록 돕는 AI 멘토 역할
- **특징**: 전체 대화 맥락 파악, 핵심 질문 제시, 공감적 톤 유지
- **규칙**: 질문으로만 답변, 구체적이고 실행 가능한 질문 구성

### 3. 로드맵 생성 (`generateRoadmap`)
- **목적**: 사용자 정보를 바탕으로 체계적인 학습/목표 달성 로드맵 생성
- **입력**: 목표, 시간, 비용, 기한, 목적 등 수집된 정보
- **출력**: JSON 형태의 구조화된 로드맵 (최종목표, 중간목표, 세부행동)

### 4. 대화 요약 (`generateSummary`)
- **목적**: 대화 내용을 체계적으로 정리하여 사용자의 고민을 분석
- **구조**: 현재 상황, 문제 원인, 핵심 요약, 조언 및 목표 제안
- **형식**: 마크다운 형식의 구조화된 요약

### 5. AI 도구 추천 (`generateAiHelp`)
- **목적**: 사용자의 현재 목표와 수행 단계에 맞는 AI 도구 추천
- **기준**: 작업 효율성, 비용 효율성, 사용자 친화성, 특화 분야
- **출력**: JSON 형태의 도구 정보 및 맞춤형 프롬프트

### 6. 로드맵 질문 (`roadmapQuestions`)
- **목적**: 로드맵 생성에 필요한 사용자 정보 수집
- **질문들**:
  - 현재 상황 파악
  - 시간 투자 가능량
  - 비용 투자 가능량
  - 목표 달성 기한
  - 목표 달성 목적

## 🛠️ 프롬프트 개발 가이드

### 새로운 프롬프트 추가하기

1. **`index.js`에 프롬프트 함수 추가**:
```javascript
/**
 * 새로운 프롬프트 설명
 * @param {string} input - 입력 매개변수 설명
 * @returns {string} 생성된 프롬프트
 */
newPrompt: (input) => {
    return `
    프롬프트 내용...
    `.trim();
}
```

2. **테스트 케이스 추가** (`test.js`):
```javascript
newPrompt: [
    {
        name: '테스트 케이스 이름',
        input: { /* 입력 데이터 */ }
    }
]
```

3. **유틸리티 함수 업데이트** (`utils.js`):
- `generatePrompt()` 함수에 새로운 케이스 추가
- `getDummyData()` 함수에 더미 데이터 추가

### 프롬프트 품질 기준

1. **명확성**: 프롬프트의 목적과 요구사항이 명확해야 함
2. **구체성**: 구체적이고 실행 가능한 지시사항 포함
3. **일관성**: 일관된 톤과 스타일 유지
4. **완전성**: 필요한 모든 정보와 가이드라인 포함
5. **확장성**: 다양한 상황에 적용 가능하도록 설계

### 프롬프트 최적화 팁

1. **가이드라인 포함**: 명확한 규칙과 가이드라인 제공
2. **예시 제공**: 구체적인 예시를 통한 이해도 향상
3. **출력 형식 명시**: JSON, 마크다운 등 명확한 출력 형식 지정
4. **에러 처리**: 예상치 못한 입력에 대한 처리 방법 명시
5. **컨텍스트 고려**: 사용자의 상황과 수준을 고려한 프롬프트 작성

## 🧪 테스트 및 검증

### 프롬프트 테스트 실행

```bash
# 프롬프트 테스트 실행
node src/prompts/test.js

# 특정 프롬프트만 테스트
node -e "
const { PromptTester } = require('./src/prompts/utils');
const tester = new PromptTester();
tester.testPrompt('generateTitle', [
    { name: '테스트', input: { content: '프로그래밍 학습' } }
]);
"
```

### 프롬프트 검증

```bash
# 프롬프트 템플릿 검증
node -e "
const { PromptValidator } = require('./src/prompts/utils');
const validator = new PromptValidator();
validator.validateAll();
"
```

### 성능 벤치마크

```bash
# 프롬프트 성능 측정
node -e "
const { PromptTester } = require('./src/prompts/utils');
const tester = new PromptTester();
tester.benchmarkPrompt('generateTitle', { content: '테스트' }, 100);
"
```

## 📊 프롬프트 모니터링

### 성능 지표

1. **응답 시간**: 프롬프트 생성 및 처리 시간
2. **성공률**: 프롬프트 실행 성공 비율
3. **품질 점수**: 출력 품질 평가
4. **사용자 만족도**: 사용자 피드백 기반 평가

### 로깅 및 분석

```javascript
// 프롬프트 사용 로깅
const logPromptUsage = (promptType, input, output, performance) => {
    console.log({
        timestamp: new Date().toISOString(),
        promptType,
        inputLength: JSON.stringify(input).length,
        outputLength: output.length,
        performance,
        success: true
    });
};
```

## 🔧 프롬프트 버전 관리

### 버전 관리 전략

1. **시맨틱 버저닝**: Major.Minor.Patch 형식 사용
2. **변경 로그**: 각 버전별 변경사항 기록
3. **호환성**: 하위 호환성 유지
4. **롤백**: 문제 발생 시 이전 버전으로 롤백 가능

### 프롬프트 A/B 테스트

```javascript
// A/B 테스트 프롬프트
const abTestPrompt = (promptType, input, variant = 'A') => {
    const prompts = {
        A: PROMPTS[promptType](input),
        B: PROMPTS[`${promptType}B`](input) // 변형 프롬프트
    };
    
    return prompts[variant];
};
```

## 🚀 프롬프트 배포

### 배포 프로세스

1. **개발**: 로컬에서 프롬프트 개발 및 테스트
2. **검증**: 자동화된 테스트 및 검증 실행
3. **스테이징**: 스테이징 환경에서 실제 데이터로 테스트
4. **프로덕션**: 프로덕션 환경에 배포
5. **모니터링**: 배포 후 성능 및 품질 모니터링

### 환경별 설정

```javascript
// 환경별 프롬프트 설정
const getPromptConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    
    return {
        development: {
            verbose: true,
            debugMode: true,
            testData: true
        },
        production: {
            verbose: false,
            debugMode: false,
            testData: false
        }
    }[env];
};
```

## 📚 추가 리소스

- [OpenAI API 문서](https://platform.openai.com/docs)
- [프롬프트 엔지니어링 가이드](https://platform.openai.com/docs/guides/prompt-engineering)
- [AI 모델 성능 최적화](https://platform.openai.com/docs/guides/performance-best-practices)

## 🤝 기여하기

프롬프트 시스템 개선에 기여하고 싶으시다면:

1. 이슈 리포트 생성
2. 개선 제안 제출
3. 새로운 프롬프트 템플릿 추가
4. 테스트 케이스 보완
5. 문서화 개선

---

**참고**: 프롬프트 개발 시 항상 사용자 경험과 AI 모델의 한계를 고려하여 설계하시기 바랍니다.

