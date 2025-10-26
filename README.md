🚀 MindGuide (마인가이드)

MindGuide는 사용자의 복잡한 고민을 정리하고, 명확한 목표 달성을 위한 맞춤형 로드맵을 생성해주는 AI 기반 웹 애플리케이션입니다.

✨ 주요 기능

이 프로젝트는 두 가지 핵심 모드를 제공합니다.

1. 💭 고민 정리 모드

AI 챗봇 상담: 사용자가 자유롭게 자신의 생각이나 고민을 입력하면, AI가 대화를 이끌며 생각을 명확히 하도록 돕습니다.

정리본 생성: 대화 내용을 바탕으로 '정리본 생성' 버튼을 누르면, AI가 현재 상황, 문제 원인, 핵심 요약, 조언 등을 포함한 요약 리포트를 생성합니다.

2. 🚀 로드맵 생성 모드

다단계 정보 수집: 사용자의 최종 목표, 투자 가능 시간, 예산 등을 AI가 순차적으로 질문하여 구체적인 계획 수립에 필요한 정보를 수집합니다.

맞춤형 로드맵 생성: 수집된 정보를 바탕으로, 사용자의 목표를 달성하기 위한 '중간 목표'와 '세부 행동 단계'로 구성된 체계적인 로드맵을 생성합니다.

AI 비교/선택 가이드:

로드맵의 각 '세부 행동 단계'마다 'AI 도움 받기' 기능이 활성화됩니다.

버튼 클릭 시, 해당 단계를 수행하는 데 가장 도움이 되는 AI 도구 목록(URL, 특화 분야, 비용 정보 포함)과 추천 사유가 포함된 가이드 패널이 나타납니다.

사용자는 가이드 내에서 AI별 '추천 프롬프트'를 바로 확인하고 활용할 수 있습니다.

3. 📒 대화 관리

대화 기록: '고민 정리'와 '로드맵 생성'을 포함한 모든 지난 대화 목록을 사이드바에서 확인할 수 있습니다.

유형 구분: 각 대화가 '고민 정리'(💭)인지 '로드맵 생성'(🚀)인지 아이콘으로 쉽게 구분할 수 있습니다.

수정 및 삭제: 각 대화 항목의 메뉴(…) 버튼을 통해 대화 제목을 수정하거나 대화를 영구적으로 삭제할 수 있습니다.

🛠️ 기술 스택

프론트엔드: React (Next.js), TypeScript, Tailwind CSS

백엔드: Node.js, Express

데이터베이스: MongoDB, Mongoose

AI: OpenAI API (GPT-4o, GPT-3.5-Turbo)

기타: dotenv (환경 변수 관리)

🏁 시작하기

이 프로젝트를 로컬 환경에서 실행하는 방법입니다.

1. 사전 준비

Node.js (v18 이상 권장)

MongoDB (로컬 설치)

npm 또는 yarn

OpenAI API 키

2. 설치 및 실행

1. 백엔드 (Node.js / Express)

프로젝트 루트 디렉토리( server.js 파일이 있는 곳)에서 다음을 실행합니다.

# 1. 필요한 패키지 설치
npm install

# 2. .env 파일 생성 및 설정
# (제공해주신 .env 파일을 기반으로 작성)


.env 파일에 아래와 같이 MongoDB 접속 URI와 OpenAI API 키를 입력합니다.

# MongoDB Database
MONGO_URI="mongodb://localhost:27017/mindguide-db"

# OpenAI API Key
OPENAI_API_KEY="sk-..."


# 3. (별도의 터미널) MongoDB 서버 실행
# 사용자님께서 말씀하신 방식대로 로컬 MongoDB 서버를 먼저 실행합니다.
mongod

# 4. 백엔드 서버 실행
node server.js
# 또는 nodemon을 설치했다면: nodemon server.js


서버가 http://localhost:4000 (또는 지정된 포트)에서 실행됩니다.

2. 프론트엔드 (React / Next.js)

프론트엔드 디렉토리(page.tsx 파일이 있는 곳)로 이동하여 다음을 실행합니다.

# 1. 필요한 패키지 설치
npm install

# 2. 프론트엔드 개발 서버 실행
npm run dev


애플리케이션이 http://localhost:3000 에서 열립니다.

📌 API 엔드포인트

POST /message: 새 메시지를 전송하고 AI 응답을 받습니다.

POST /conversation/summarize: '고민 정리' 대화의 요약본을 생성합니다.

POST /roadmap/generate: '로드맵 생성'을 위한 정보를 바탕으로 로드맵을 생성합니다.

POST /roadmap/ai-help: 특정 로드맵 단계에 대한 'AI 도움 가이드' 정보를 요청합니다.

GET /conversations: 모든 대화 목록을 조회합니다.

GET /conversation/:id: 특정 대화의 상세 내용을 불러옵니다.

PUT /conversations/:id: 대화 제목을 수정합니다.

DELETE /conversations/:id: 대화를 삭제합니다.