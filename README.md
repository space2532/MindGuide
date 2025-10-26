# AI Hub - 객체 지향 프로그래밍 아키텍처

이 프로젝트는 객체 지향 프로그래밍 원칙에 따라 기능별로 파일을 나누어 구성된 AI 기반 대화 및 로드맵 생성 애플리케이션입니다.

## 📁 프로젝트 구조

```
ai-hub-backend/
├── src/
│   ├── controllers/          # 컨트롤러 레이어
│   │   ├── ConversationController.js
│   │   └── RoadmapController.js
│   ├── services/            # 서비스 레이어
│   │   ├── OpenAIService.js
│   │   ├── ConversationService.js
│   │   └── RoadmapService.js
│   ├── routes/              # 라우터 레이어
│   │   ├── ConversationRouter.js
│   │   └── RoadmapRouter.js
│   ├── models/              # 데이터 모델
│   │   └── Conversation.js
│   └── server.js            # 메인 서버 파일
├── package.json
└── README.md

ai-hub-web/
├── src/
│   ├── app/                 # Next.js 앱 라우터
│   │   ├── page.tsx         # 메인 페이지
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/          # React 컴포넌트
│   │   ├── common/         # 공통 컴포넌트
│   │   │   ├── Modal.tsx
│   │   │   └── ChatInputForm.tsx
│   │   ├── pages/          # 페이지 컴포넌트
│   │   │   ├── InfoPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── layout/         # 레이아웃 컴포넌트
│   │   │   └── Sidebar.tsx
│   │   ├── roadmap/        # 로드맵 관련 컴포넌트
│   │   │   └── AiGuidePanel.tsx
│   │   └── icons/          # 아이콘 컴포넌트
│   │       └── index.tsx
│   ├── hooks/              # 커스텀 훅
│   │   ├── useConversation.ts
│   │   ├── useConversationList.ts
│   │   └── useRoadmap.ts
│   └── types/              # TypeScript 타입 정의
│       └── index.ts
├── package.json
└── README.md
```

## 🏗️ 아키텍처 설계 원칙

### 백엔드 (Node.js + Express)

#### 1. 서비스 레이어 (Services)
- **OpenAIService**: OpenAI API와의 통신을 담당
- **ConversationService**: 대화 데이터 관리 및 CRUD 작업
- **RoadmapService**: 로드맵 생성 및 관리 로직

#### 2. 컨트롤러 레이어 (Controllers)
- **ConversationController**: 대화 관련 HTTP 요청 처리
- **RoadmapController**: 로드맵 관련 HTTP 요청 처리

#### 3. 라우터 레이어 (Routers)
- **ConversationRouter**: 대화 관련 라우트 정의
- **RoadmapRouter**: 로드맵 관련 라우트 정의

### 프론트엔드 (Next.js + React + TypeScript)

#### 1. 컴포넌트 기반 설계
- **공통 컴포넌트**: 재사용 가능한 UI 컴포넌트
- **페이지 컴포넌트**: 각 페이지별 전용 컴포넌트
- **레이아웃 컴포넌트**: 전체 레이아웃 관리
- **기능별 컴포넌트**: 특정 기능에 특화된 컴포넌트

#### 2. 커스텀 훅 (Custom Hooks)
- **useConversation**: 대화 상태 및 로직 관리
- **useConversationList**: 대화 목록 관리
- **useRoadmap**: 로드맵 상태 및 로직 관리

#### 3. 타입 시스템
- TypeScript를 활용한 강타입 시스템
- 인터페이스와 타입 별칭을 통한 타입 안정성

## 🚀 주요 기능

### 백엔드 API
- **POST /message**: 메시지 전송 및 AI 응답
- **GET /conversations**: 대화 목록 조회
- **GET /conversation/:id**: 특정 대화 조회
- **PUT /conversations/:id**: 대화 제목 수정
- **DELETE /conversations/:id**: 대화 삭제
- **POST /conversation/summarize**: 대화 요약 생성
- **POST /roadmap/generate**: 로드맵 생성
- **POST /roadmap/ai-help**: AI 도움 정보 제공

### 프론트엔드 기능
- **대화 인터페이스**: 실시간 채팅 UI
- **로드맵 시각화**: 단계별 로드맵 표시
- **AI 가이드 패널**: AI 도구 추천 및 프롬프트 제공
- **대화 관리**: 대화 목록, 편집, 삭제
- **반응형 디자인**: 다양한 화면 크기 지원

## 🛠️ 설치 및 실행

### 백엔드 실행
```bash
cd ai-hub-backend
npm install
npm run dev
```

### 프론트엔드 실행
```bash
cd ai-hub-web
npm install
npm run dev
```

## 📋 환경 변수 설정

백엔드 `.env` 파일에 다음 변수들을 설정해야 합니다:
```
MONGO_URI=mongodb://localhost:27017/ai-hub
OPENAI_API_KEY=your_openai_api_key
PORT=4000
```

## 🎯 객체 지향 프로그래밍 원칙 적용

### 1. 단일 책임 원칙 (SRP)
- 각 클래스와 함수는 하나의 책임만 가짐
- 서비스, 컨트롤러, 라우터가 명확히 분리됨

### 2. 개방-폐쇄 원칙 (OCP)
- 새로운 기능 추가 시 기존 코드 수정 없이 확장 가능
- 인터페이스 기반 설계로 유연성 확보

### 3. 의존성 역전 원칙 (DIP)
- 고수준 모듈이 저수준 모듈에 의존하지 않음
- 의존성 주입을 통한 느슨한 결합

### 4. 인터페이스 분리 원칙 (ISP)
- 클라이언트가 사용하지 않는 인터페이스에 의존하지 않음
- 필요한 기능만 노출하는 인터페이스 설계

## 🔧 기술 스택

### 백엔드
- **Node.js**: JavaScript 런타임
- **Express.js**: 웹 프레임워크
- **MongoDB**: NoSQL 데이터베이스
- **Mongoose**: MongoDB ODM
- **Axios**: HTTP 클라이언트

### 프론트엔드
- **Next.js**: React 프레임워크
- **React**: UI 라이브러리
- **TypeScript**: 정적 타입 언어
- **Tailwind CSS**: CSS 프레임워크

## 📈 확장 가능성

이 아키텍처는 다음과 같은 확장이 용이합니다:
- 새로운 AI 서비스 추가
- 추가적인 대화 타입 지원
- 사용자 인증 시스템 통합
- 실시간 알림 기능
- 다국어 지원

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request