# 🧍‍♂️ Re:balance — 웹캠 기반 거북목 교정 서비스

> **비인지형 자세 교정 솔루션** — 업무 흐름을 방해하지 않으면서, 브라우저 안에서 실시간으로 거북목과 어깨 불균형을 측정·교정하는 웹 서비스입니다.

거북목 예방의 시작은 정확한 상태 확인부터. 웹캠으로 촬영한 영상은 **서버로 전송되지 않고 브라우저 안에서 즉시 분석된 뒤 휘발**되며, 분석된 수치 데이터만 기록됩니다.

<br>

## 📑 목차

- [소개](#-소개)
- [주요 기능](#-주요-기능)
- [동작 원리 (AI 분석 로직)](#-동작-원리-ai-분석-로직)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [프로젝트 구조](#-프로젝트-구조)
- [데이터베이스 설계](#-데이터베이스-설계)
- [API 명세](#-api-명세)
- [화면 구성 (라우팅)](#-화면-구성-라우팅)
- [설치 및 실행](#-설치-및-실행)
- [환경 변수](#-환경-변수)

<br>

## 🎯 소개

장시간 컴퓨터·스마트폰 사용으로 인한 **거북목(Forward Head Posture)** 과 **어깨 불균형**은 현대인의 만성적인 문제입니다. Re:balance는 별도의 장비 없이 **노트북 웹캠만으로** 사용자의 자세를 실시간으로 감지하고, 나쁜 자세가 습관이 되기 전에 알림과 스트레칭으로 교정을 유도합니다.

핵심 컨셉은 **"비인지형(non-intrusive) 모니터링"** 입니다. 사용자가 측정을 위해 매번 신경 쓸 필요 없이, 백그라운드에서 일정 주기로 자세를 점검하고 임계치를 넘으면 알림을 보냅니다.

### 핵심 가치

| 가치 | 설명 |
|------|------|
| 🔒 **프라이버시 우선** | 영상은 브라우저 내에서만 처리되고 서버로 전송되지 않으며 즉시 파기됩니다. |
| 🤖 **온디바이스 AI** | MediaPipe / TensorFlow.js 기반으로 모든 자세 분석이 클라이언트(브라우저)에서 수행됩니다. |
| 📊 **데이터 기반 교정** | 측정된 자세 점수·각도를 누적해 주간 통계와 대시보드로 시각화합니다. |
| 🎮 **즐거운 교정** | Teachable Machine 기반 자세 인식으로, 게임처럼 동작을 따라 하며 스트레칭합니다. |

<br>

## ✨ 주요 기능

### 1. 정자세 기준값 등록 (Initial Setup)
사용자마다 체형과 카메라 거리가 다르므로, 최초 1회 **개인 맞춤 기준값(baseline)** 을 등록합니다. 양 어깨 너비, 어깨–코 사이 거리, 어깨 수평 차이를 측정해 저장하고, 이후 모니터링은 이 기준값 대비 변화율로 자세 이상을 판단합니다.

### 2. 정면 / 측면 자세 진단 (Diagnosis)
- **정면 측정**: 양 어깨의 좌우 높이 차이로 어깨 **기울기·불균형**을 분석합니다.
- **측면 측정**: 귀–어깨를 잇는 선과 수직축의 각도로 **거북목 정도(목 각도)** 를 측정합니다.
- 5초 카운트다운 후 캡처되며, 결과는 `정상 / 주의 / 거북목 위험(불균형)` 3단계로 진단됩니다.

### 3. 실시간 자세 모니터링 (Team Monitor)
백그라운드 스케줄러가 **10분 측정 → 30분 휴식** 주기로 자세를 점검합니다. 측정 중 기준값 대비 10% 이상 벗어나면 `주의` 상태로 전환되며, 10분마다 측정 데이터를 서버에 저장합니다. **Picture-in-Picture(PiP)** 기능으로 다른 작업 중에도 자세 상태를 작은 창으로 확인할 수 있습니다.

### 4. 스트레칭 가이드 (Stretch)
Teachable Machine으로 학습된 포즈 인식 모델을 사용해, 사용자가 **목 스트레칭·옆구리 스트레칭** 동작을 올바르게 수행하는지 실시간으로 확인합니다. 정확한 자세를 3초간 유지하면 다음 동작으로 넘어가며, 정해진 횟수를 모두 완료하면 자동으로 모니터링 화면으로 이동합니다.

### 5. 스트레칭 알림 (Notification)
브라우저 알림(Web Notification API)을 통해 지정된 오전·오후 시간에 **스트레칭 리마인더**를 전송합니다. 알림을 클릭하면 곧바로 모니터링 페이지로 이동합니다.

### 6. 성장 대시보드 (Dashboard)
`recharts` 기반 그래프로 **주간 평균 자세 점수, 평균 목 각도, 측정 횟수**를 시각화하고, 데이터에 따라 동적으로 생성되는 AI 인사이트 멘트를 제공합니다.

### 7. 회원 / 인증 (Auth)
JWT 기반 인증을 지원하며, 일반 회원가입·로그인과 소셜 로그인을 모두 처리합니다. 비밀번호는 `bcrypt`로 해싱되어 저장됩니다. **비회원도 측정 가능**하며, 비회원 측정 결과는 로컬스토리지에 임시 저장됩니다.

<br>

## 🧠 동작 원리 (AI 분석 로직)

모든 자세 분석은 **브라우저에서 실행되는 MediaPipe Pose** 모델이 추출한 33개 신체 랜드마크 좌표를 기반으로 계산됩니다.

### 거북목(목 각도) 측정 — 측면
귀(landmark)와 어깨(landmark)의 좌표 차이로 수직축 대비 각도를 계산합니다.

```js
// 수직선 대비 목 각도 계산
const deltaX = Math.abs(shoulder.x - ear.x);
const deltaY = Math.abs(shoulder.y - ear.y);
const angle = Math.atan2(deltaX, deltaY) * (180 / Math.PI);
```

| 각도 | 진단 |
|------|------|
| `< 15°` | 🟢 정상 |
| `15° ~ 17°` | 🟡 주의 |
| `> 17°` | 🔴 거북목 위험 |

### 어깨 불균형 측정 — 정면
양 어깨(좌: 11번, 우: 12번 랜드마크)의 좌표 차이로 수평 대비 기울기를 계산합니다.

```js
const dx = Math.abs(leftShoulder.x - rightShoulder.x);
const dy = Math.abs(leftShoulder.y - rightShoulder.y);
const angle = Math.atan2(dy, dx) * (180 / Math.PI);
```

| 각도 | 진단 |
|------|------|
| `≤ 2°` | 🟢 정상 |
| `2° ~ 5°` | 🟡 주의 |
| `> 5°` | 🔴 불균형 |

### 거리 기반 개인 맞춤 판정
모니터링 단계에서는 절대 각도가 아니라, 등록된 기준값 대비 **양 어깨 너비**와 **어깨–코 거리**의 변화율을 사용합니다. 어느 한 지표라도 기준값에서 **10% 이상 벗어나면** `주의` 상태로 전환되어, 카메라와의 거리·체형 차이에 영향을 덜 받는 견고한 판정이 가능합니다.

<br>

## 🛠 기술 스택

### Frontend
| 분류 | 기술 |
|------|------|
| 코어 | React 19, Vite |
| 라우팅 | React Router DOM v7 |
| AI / 포즈 인식 | MediaPipe Pose, TensorFlow.js, Teachable Machine Pose |
| 시각화 | Recharts |
| 통신 | Axios |
| 아이콘 | React Icons |

### Backend
| 분류 | 기술 |
|------|------|
| 런타임 / 프레임워크 | Node.js, Express 5 |
| ORM / DB | Sequelize, MySQL |
| 인증 | JSON Web Token (JWT), bcrypt |
| 파일 업로드 | Multer |
| 기타 | CORS, dotenv |

<br>

## 🏗 시스템 아키텍처

```
┌─────────────────────────────────────────────┐
│                  Browser (Client)             │
│                                               │
│   Webcam ──▶ MediaPipe Pose / Teachable      │
│              Machine (온디바이스 AI 분석)       │
│                    │                          │
│              분석된 수치 데이터만 추출           │
│                    │ (영상은 즉시 파기)         │
│         React (Vite) + React Router           │
└────────────────────┼──────────────────────────┘
                     │  /api/* (Vite Proxy)
                     ▼
┌─────────────────────────────────────────────┐
│           Backend — Express (port 3000)       │
│   Routes → Controllers → Services             │
│   JWT 인증 미들웨어 / Multer 업로드            │
└────────────────────┼──────────────────────────┘
                     │  Sequelize ORM
                     ▼
┌─────────────────────────────────────────────┐
│                   MySQL Database              │
└─────────────────────────────────────────────┘
```

- 프론트엔드(개발 서버 `:5173`)는 Vite 프록시를 통해 `/api/*` 요청을 백엔드(`:3000`)로 전달합니다.
- **모든 AI 연산은 클라이언트에서 수행**되며, 서버는 분석 결과 데이터의 저장·조회·통계만 담당합니다.

<br>

## 📂 프로젝트 구조

```
balance/
├── Backend/
│   └── src/
│       ├── app.js                 # Express 앱 설정 (미들웨어, 라우트 등록)
│       ├── server.js              # 서버 진입점 (DB 연결 후 listen)
│       ├── config/
│       │   ├── database.js        # Sequelize-MySQL 연결
│       │   ├── jwt.js             # JWT 발급/검증
│       │   └── multer.js          # 이미지 업로드 설정
│       ├── middlewares/
│       │   ├── auth.middleware.js # JWT 인증 미들웨어
│       │   └── error.middleware.js
│       ├── models/                # Sequelize 모델 (User, Session, PostureData ...)
│       ├── routes/                # API 라우트 정의
│       ├── controllers/           # 요청 처리
│       └── services/              # 비즈니스 로직
│
└── Frontend/
    ├── public/images/             # 자세 가이드 / 스트레칭 이미지
    └── src/
        ├── App.jsx                # 라우터 및 전역 레이아웃
        ├── ai/                    # 포즈 분석 로직
        │   ├── mediapipe.js       # MediaPipe 초기화
        │   ├── poseAnalyzer.js    # 측면(목 각도) 분석
        │   ├── frontPoseAnalyzer.js  # 정면(어깨) 분석
        │   └── setupposeAnalyzer.js  # 거리 기반 기준값 분석
        ├── hooks/                 # 커스텀 훅 (감지/진단/알림/스케줄)
        ├── api/poseApi.js         # 백엔드 통신
        ├── components/            # WebcamView, Navbar, Footer
        └── pages/                 # 화면 컴포넌트
```

<br>

## 🗄 데이터베이스 설계

| 모델 (테이블) | 설명 | 주요 컬럼 |
|---------------|------|-----------|
| **User** (`user_table`) | 회원 정보 + 개인 기준값 | `login_id`, `email`, `password`, `provider`, `base_shoulder_width`, `base_neck_dist`, `base_shoulder_diff` |
| **Session** (`sessions_table`) | 측정 세션 | `start_time`, `end_time`, `upright_posture_photo`, `random_photo` |
| **PostureData** (`posture_data_table`) | 세션별 자세 측정 기록 | `neck_angle`, `shoulder_angle`, `posture_score`, `alarm_message` |
| **StretchingLog** (`stretching_logs_table`) | 스트레칭 수행 기록 | `target_part`, `duration`, `description` |
| **Posture** (`postures`) | 정면/측면 진단 결과 | `type`(FRONT/SIDE), `neck_angle`, `shoulder_angle`, `status` |
| **StretchingPlan** (`stretching_plans`) | 스트레칭 계획/완료 여부 | `plan_date`, `stretching_id`, `is_completed` |
| **AiReport** (`ai_reports`) | AI 분석 리포트 | `report_text`, `prescription_text`, `score` |

**관계**: `User 1 : N Session`, `Session 1 : N PostureData`, `Session 1 : N StretchingLog`

<br>

## 🔌 API 명세

모든 보호된 엔드포인트는 헤더에 `Authorization: Bearer <JWT>` 가 필요합니다.

### 인증 — `/api/auth`
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/register` | 회원가입 |
| POST | `/login` | 로그인 (JWT 발급) |
| POST | `/social` | 소셜 로그인 |

### 세션 — `/api/sessions`
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/start` | 측정 세션 시작 🔒 |
| PATCH | `/:session_id/end` | 세션 종료 🔒 |
| POST | `/:session_id/photo` | 기준/랜덤 자세 사진 업로드 🔒 |

### 자세 — `/api/posture`
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/log` | 측정 데이터 저장 🔒 |
| GET | `/session/:session_id` | 세션별 측정 데이터 조회 🔒 |
| POST | `/baseline` | 개인 기준값 저장 🔒 |

### 스트레칭 — `/api/stretching`
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/` | 스트레칭 기록 저장 🔒 |
| GET | `/session/:session_id` | 세션별 스트레칭 기록 조회 🔒 |

### 통계 — `/api/stats`
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/weekly` | 주간 통계 (평균 점수/각도/측정수) 🔒 |
| GET | `/monthly` | 월간 통계 🔒 |

### 관리자 — `/api/admin`
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/stretching` | 스트레칭 이미지 등록 🔒 |
| DELETE | `/stretching/:filename` | 스트레칭 이미지 삭제 🔒 |

<br>

## 🧭 화면 구성 (라우팅)

| 경로 | 화면 | 설명 |
|------|------|------|
| `/` | Landing | 서비스 소개 / 진입 |
| `/login` | Login | 로그인 / 회원가입 |
| `/initialsetuppage` | Initial Setup | 정자세 기준값 등록 |
| `/front-capture` | Front Capture | 정면(어깨) 측정 |
| `/side-capture` | Side Capture | 측면(목 각도) 측정 |
| `/diagnosis` | Diagnosis | 진단 결과 표시 |
| `/team-monitor` | Team Monitor | 실시간 자세 모니터링 |
| `/stretch` | Stretch | 스트레칭 가이드 |
| `/dashboard` | Dashboard | 주간 통계 대시보드 |
| `/mypage` | My Page | 마이페이지 |
| `/setting` | Setting | 알림·계정 설정 |

> UI는 **모바일 프레임(최대 520px)** 에 맞춰 설계되어 모바일/데스크톱 모두에서 일관된 경험을 제공합니다.

<br>

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18+
- MySQL 8+

### 1. 백엔드 실행
```bash
cd Backend
npm install

# .env 파일 생성 (아래 환경 변수 참고)

npm run dev      # nodemon 개발 모드
# 또는
npm start        # 프로덕션 모드
# → http://localhost:3000
```

### 2. 프론트엔드 실행
```bash
cd Frontend
npm install
npm run dev
# → http://localhost:5173
```

> Vite 프록시 설정으로 `/api` 요청은 자동으로 백엔드(`:3000`)로 전달됩니다.

### 빌드
```bash
cd Frontend
npm run build    # dist/ 생성
npm run preview  # 빌드 결과 미리보기
```

<br>

## 🔑 환경 변수

`Backend/.env` 파일에 다음 값을 설정합니다.

```env
# 서버
PORT=3000
CLIENT_URL=http://localhost:5173

# 데이터베이스 (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rebalance
DB_USER=root
DB_PASS=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

<br>

## 🔐 개인정보 보호 원칙

Re:balance는 **영상 즉시 파기 원칙**을 따릅니다.

- 웹캠 영상은 브라우저 내에서만 처리되며 **서버로 전송되지 않습니다.**
- AI 분석이 끝나면 영상 프레임은 즉시 파기되고, **각도·점수 등 수치 데이터만** 기록됩니다.
- 비밀번호는 `bcrypt`로 단방향 해싱되어 저장됩니다.

<br>

---

<div align="center">

**Re:balance** — 당신의 하루를 지키는 바른 자세 🧍‍♀️

</div>
