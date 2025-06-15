# Dimiplan 관리자 패널

Dimiplan 백엔드 시스템을 위한 포괄적인 Angular 기반 관리자 인터페이스입니다. Material Design 3 테마를 적용한 현대적인 관리자 패널로, 시스템 모니터링, 데이터베이스 관리, 로그 분석, API 문서화 등의 기능을 제공합니다.

## 주요 기능

### 🏠 대시보드
- **실시간 시스템 모니터링**: 서버 가동시간, 메모리 사용량, CPU 사용률, 플랫폼 정보, Node.js 버전 등 실시간 표시
- **AI 사용량 추적**: AI API 크레딧 및 사용량 통계, 사용량 추세 시각화
- **사용자 통계**: 총 사용자 수, 활성 사용자(30일), 최근 신규 사용자 등록 현황
- **빠른 작업**: 로그, 데이터베이스, API 문서로의 편리한 탐색
- **시각화**: 메모리 및 CPU 사용률 진행 막대, 환경별 상태 배지

### 🗄️ 데이터베이스 관리
- **테이블 브라우저**: 행 개수와 함께 모든 데이터베이스 테이블 목록 표시
- **스키마 뷰어**: 테이블 구조(컬럼명, 데이터 타입, 키 정보, Nullable 여부) 상세 표시
- **대화형 데이터 탐색**: 페이지네이션(25, 50, 100, 200개 레코드)으로 테이블 데이터 탐색
- **데이터 내보내기**: 테이블 데이터를 CSV 형식으로 다운로드
- **컬럼 정보 시각화**: 데이터 타입별 색상 구분, 키 타입별 아이콘 표시(PRI, UNI, MUL)
- **tooltips**: 긴 데이터는 툴팁으로 전체 내용 확인 가능

### 📋 로그 관리
- **로그 파일 브라우저**: 파일 크기와 수정 날짜와 함께 사용 가능한 모든 로그 파일 목록
- **실시간 로그 뷰어**: 선택한 로그 파일의 내용을 실시간으로 표시
- **로그 레벨 필터링**: 로그 레벨별 필터링(error, warn, info, verbose)
- **구문 강조**: 로그 레벨별 색상 구분, 타임스탬프 파싱
- **다운로드**: 완전한 로그 파일 로컬 다운로드
- **사용자 친화적 표시**: 파일 크기를 B, KB, MB, GB 단위로 자동 포맷팅

### 📚 API 문서
- **자동 JSDoc 문서화**: JSDoc 주석 기반 API 문서 자동 생성 및 파싱
- **대화형 문서 탐색**: 경로, 메서드, 설명으로 API 엔드포인트 검색
- **파일별 필터링**: API 엔드포인트를 파일별로 그룹화하여 탐색
- **복잡한 반환값 처리**: 중첩된 객체 및 배열 구조를 그룹화하여 표시
- **cURL 예제**: 각 엔드포인트에 대한 즉시 사용 가능한 cURL 명령어 생성 및 클립보드 복사
- **문서 내보내기**: API 문서를 Markdown 형식으로 내보내기
- **실시간 재생성**: 요청 시 JSDoc 문서 재생성
- **HTTP 메서드별 색상 구분**: GET, POST, PUT, DELETE 메서드별 시각적 구분

## 기술 스택

### 핵심 프레임워크
- **Angular 20.0.3** (최신 버전, Standalone 컴포넌트 사용)
- **Angular Material 20.0.3** (Material Design 3 테마)
- **RxJS 7.8.2** (반응형 프로그래밍)

### UI/스타일링
- **Tailwind CSS 3.4.17** (유틸리티 우선 스타일링)
- **Material Design 3** 색상 시스템 및 타이포그래피
- **PostCSS & Autoprefixer** (CSS 처리)
- **완전 반응형 디자인**: 모바일 친화적 레이아웃

### 개발 도구 및 언어
- **TypeScript 5.8.3** (강타입 시스템)
- **Jasmine & Karma** (단위 테스트)
- **Angular CLI 20.0.2** (개발 도구)

### 아키텍처 패턴
- **모던 Angular 패턴**: Standalone 컴포넌트, 함수형 인터셉터
- **의존성 주입**: 서비스 기반 아키텍처
- **타입 안전성**: 모든 API 응답에 대한 TypeScript 인터페이스

## 설치 및 실행

### 사전 요구사항
- Node.js 18+ 
- npm 또는 yarn
- Angular CLI 20+

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm start
# 또는
ng serve
```

개발 서버가 실행되면 브라우저에서 `http://localhost:4200/`로 접속하세요.

### 빌드
```bash
npm run build
# 또는
ng build
```

빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

### 테스트
```bash
npm test
# 또는
ng test
```

## 인증 및 보안

### Google OAuth 인증
- **Google 계정 연동**: Google OAuth를 통한 안전한 관리자 인증
- **강제 로그인**: 401 에러 발생 시 자동으로 로그인 모달 표시
- **세션 유지**: 쿠키 기반 세션 관리 (`withCredentials: true`)
- **자동 리다이렉트**: 인증 후 관리자 패널로 자동 복귀

### 보안 기능
- **HTTP 인터셉터**: 모든 API 요청에 자동 크리덴셜 첨부
- **401 에러 자동 처리**: 인증 실패 시 자동 로그인 프로세스
- **CORS 지원**: 도메인 간 쿠키 세션 상태 유지
- **타입 안전성**: TypeScript를 통한 컴파일 타임 보안

## 설정

### 백엔드 API 연결
기본적으로 `https://api-dev.dimiplan.com`에 연결됩니다. 다른 API 서버를 사용하려면 `src/app/services/admin.service.ts`에서 `API_BASE_URL`을 수정하세요.

### 테마 설정
- **다크/라이트 모드**: 사용자가 토글 버튼으로 테마 전환 가능
- **테마 지속성**: localStorage를 통한 테마 설정 저장 및 복원
- **Material Design 3**: 최신 Material Design 가이드라인 및 색상 토큰 적용
- **완전 반응형**: 모바일과 데스크톱에서 최적화된 레이아웃

## 프로젝트 구조

```
src/app/
├── components/              # 주요 컴포넌트
│   ├── dashboard/          # 대시보드 (시스템 상태, 사용자 통계, AI 사용량)
│   ├── database/           # 데이터베이스 관리 (테이블 탐색, 데이터 뷰어)
│   ├── logs/              # 로그 관리 (파일 브라우저, 로그 뷰어)
│   ├── api-docs/          # API 문서 (자동 생성, 검색, 내보내기)
│   └── login-modal/       # 로그인 모달 (Google OAuth)
├── services/              # 서비스 레이어
│   ├── admin.service.ts   # 관리자 API 통합 서비스
│   └── auth-modal.service.ts  # 인증 모달 관리 서비스
├── interceptors/          # HTTP 인터셉터
│   └── auth.interceptor.ts    # 인증 및 CORS 처리
├── styles/               # 전역 스타일
│   ├── material-tokens.scss   # Material Design 3 토큰
│   └── material-you-theme.scss # Material You 테마
├── app.config.ts         # 애플리케이션 설정
├── app.routes.ts         # 라우팅 설정
├── app.ts               # 메인 애플리케이션 컴포넌트
└── app.html             # 애플리케이션 템플릿
```

## API 엔드포인트

관리자 패널에서 사용하는 주요 API 엔드포인트:

- `GET /system-status` - 시스템 상태 정보
- `GET /stats/users` - 사용자 통계
- `GET /ai-usage` - AI 사용량 통계
- `GET /logs` - 로그 파일 목록
- `GET /logs/{filename}` - 특정 로그 파일 내용
- `GET /database/tables` - 데이터베이스 테이블 목록
- `GET /database/tables/{tableName}` - 테이블 데이터 및 스키마
- `GET /docs` - API 문서
- `POST /docs/regenerate` - API 문서 재생성

## 개발 특징

### 모던 Angular 패턴
- **Standalone 컴포넌트**: `@Component` 데코레이터에서 imports 직접 관리
- **함수형 인터셉터**: 클래스 기반이 아닌 함수형 HTTP 인터셉터 사용
- **의존성 주입**: `inject()` 함수를 통한 현대적 DI 패턴

### 사용자 경험 최적화
- **로딩 상태**: 모든 비동기 작업에 대한 로딩 인디케이터
- **에러 처리**: 사용자 친화적 에러 메시지 및 자동 복구
- **반응형 피드백**: 성공/실패에 대한 즉각적인 시각적 피드백
- **키보드 네비게이션**: 접근성을 위한 키보드 지원

### 성능 최적화
- **지연 로딩**: 라우트별 컴포넌트 분할
- **메모리 관리**: 컴포넌트 생명주기에 따른 구독 해제
- **효율적인 렌더링**: Angular의 OnPush 변경 감지 전략 활용

이 관리자 패널은 Dimiplan 백엔드 시스템의 포괄적인 모니터링, 디버깅, 관리를 위한 원스톱 솔루션으로 설계되어 있습니다.