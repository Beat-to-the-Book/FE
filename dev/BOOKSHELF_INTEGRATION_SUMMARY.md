# 📚 책장 백엔드 연동 구현 완료

## ✅ 구현 내용

### 1. **API 모듈 생성** (`src/lib/api/bookshelf.js`)

- `getBookshelfData()`: 책장 데이터 조회
- `saveBookshelfData(data)`: 책장 데이터 생성
- `updateBookshelfData(data)`: 책장 데이터 업데이트

### 2. **Zustand Store 생성** (`src/lib/store/bookshelfStore.js`)

- 상태 관리: `decorsByFloor`, `isLoading`, `error`, `lastSaved`
- 메서드:
  - `loadBookshelfData()`: 백엔드에서 데이터 로드
  - `saveBookshelfData()`: 백엔드에 데이터 저장
  - `setDecorsByFloor()`: 전체 장식품 배치 업데이트
  - `updateFloorDecorations()`: 특정 층 장식품 업데이트
  - `clearError()`: 에러 초기화

### 3. **BookshelfPage 컴포넌트 수정**

- ✅ localStorage 제거 → Zustand Store 사용
- ✅ 컴포넌트 마운트 시 백엔드에서 데이터 로드
- ✅ 2초 디바운스 자동 저장 기능
- ✅ 수동 저장 버튼 추가
- ✅ 저장 상태 표시 (저장 중, 저장 완료, 저장 실패)
- ✅ 에러 메시지 표시

### 4. **API 명세서 작성**

- `BOOKSHELF_API_SPEC.md`: 상세 API 문서
- `BOOKSHELF_DATA_FORMAT.md`: 데이터 포맷 요약

---

## 📡 API 엔드포인트

| Method | Endpoint         | 설명                 | 인증        |
| ------ | ---------------- | -------------------- | ----------- |
| GET    | `/api/bookshelf` | 책장 데이터 조회     | ✅ Required |
| POST   | `/api/bookshelf` | 책장 데이터 생성     | ✅ Required |
| PUT    | `/api/bookshelf` | 책장 데이터 업데이트 | ✅ Required |

---

## 📤 전송 데이터 포맷

```json
{
	"decorations": {
		"1": [
			{
				"id": 1672531200000,
				"type": 1,
				"color": "#ff7eb3",
				"position": [0.5, 0.35, -0.2],
				"rotationX": 0,
				"rotationY": 0,
				"rotationZ": 0
			}
		],
		"2": [],
		"3": [],
		"4": [],
		"5": [],
		"6": [],
		"7": []
	}
}
```

### 필드 설명

- **decorations**: 객체, 1~7층 키를 가지며 각 층은 장식품 배열
- **id**: number, 타임스탬프 (밀리초, `Date.now()`)
- **type**: 1 | 2 | 3 (1: 구체, 2: 피규어, 3: 별)
- **color**: string, Hex 색상 코드 (예: `"#ff7eb3"`)
- **position**: [number, number, number], [x, y, z] 3D 좌표
- **rotationX/Y/Z**: number, 라디안 단위 회전값

---

## 📥 응답 데이터 포맷

```json
{
  "userId": 1,
  "decorations": {
    "1": [...],
    "2": [...],
    "3": [...],
    "4": [...],
    "5": [...],
    "6": [...],
    "7": [...]
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T12:30:00Z"
}
```

### 추가 필드

- **userId**: number, 사용자 ID
- **createdAt**: string (ISO 8601), 최초 생성 시간
- **updatedAt**: string (ISO 8601), 마지막 수정 시간

---

## 🔢 좌표 제약 조건

### Position (위치)

```javascript
{
  x: -2.8 ~ 2.8,      // 선반 좌우 범위
  y: 0.35 ~ 6.95,     // 1층(0.35) ~ 7층(6.35) + 여유(0.7)
  z: -0.35 ~ 0.35     // 선반 앞뒤 (장식은 뒤쪽만)
}
```

### 층별 Y 좌표 기준

| 층  | Y 좌표 |
| --- | ------ |
| 1층 | 0.35   |
| 2층 | 1.35   |
| 3층 | 2.35   |
| 4층 | 3.35   |
| 5층 | 4.35   |
| 6층 | 5.35   |
| 7층 | 6.35   |

---

## 🎨 장식품 타입

| Type | 이름   | 기본 색상 | 설명                            |
| ---- | ------ | --------- | ------------------------------- |
| 1    | 구체   | `#ff7eb3` | 이십면체 모양                   |
| 2    | 피규어 | `#7ec8ff` | 캐릭터 모양 (몸통+머리+팔+다리) |
| 3    | 별     | `#8affc1` | 팔면체 모양                     |

---

## 🔄 동작 흐름

### 1. **페이지 로드**

```
사용자가 BookshelfPage 접속
  ↓
useEffect 실행
  ↓
loadBookshelfData() 호출
  ↓
GET /api/bookshelf
  ↓
← 200 OK: decorsByFloor 상태 업데이트
← 404 Not Found: 기본값 (빈 배열) 사용
```

### 2. **장식품 배치/이동**

```
사용자가 장식품 배치 또는 이동
  ↓
decorsByFloor 상태 변경
  ↓
useEffect (디바운스) 트리거
  ↓
2초 대기
  ↓
saveBookshelfData() 자동 호출
  ↓
PUT /api/bookshelf
  ↓
← 200 OK: "저장 완료" 메시지 표시
← 400/500: "저장 실패" 메시지 표시
```

### 3. **수동 저장**

```
사용자가 "저장하기" 버튼 클릭
  ↓
handleSave() 호출
  ↓
saveBookshelfData() 즉시 실행
  ↓
PUT /api/bookshelf
  ↓
← 200 OK: "저장 완료" 메시지 표시
```

---

## 🛠️ 백엔드 구현 체크리스트

### ✅ 필수 구현 사항

- [ ] `GET /api/bookshelf` 엔드포인트 구현
- [ ] `POST /api/bookshelf` 엔드포인트 구현
- [ ] `PUT /api/bookshelf` 엔드포인트 구현
- [ ] JWT 토큰 인증 미들웨어 적용
- [ ] 사용자별 데이터 격리 (userId 기반)

### ✅ 데이터베이스 스키마

```sql
CREATE TABLE bookshelf (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  decorations JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY (user_id)
);
```

### ✅ 권장 검증 사항

- [ ] `decorations` 객체가 1~7층 키를 모두 포함하는지 검증
- [ ] 각 층의 장식품 배열이 올바른 구조인지 검증
- [ ] `type`이 1, 2, 3 중 하나인지 검증
- [ ] `position` 배열이 길이 3인지 검증
- [ ] 좌표 범위 검증 (x: -2.8~2.8, y: 0.35~6.95, z: -0.35~0.35)

---

## 🧪 테스트 방법

### 프론트엔드 테스트

1. 브라우저에서 BookshelfPage 접속
2. 개발자 도구 Network 탭 열기
3. 장식품 배치 후 2초 대기
4. `PUT /api/bookshelf` 요청 확인
5. 페이지 새로고침 후 장식품 유지 확인

### API 테스트 (curl)

```bash
# 1. 책장 데이터 조회
curl -X GET http://localhost:8082/api/bookshelf \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. 책장 데이터 저장
curl -X POST http://localhost:8082/api/bookshelf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decorations": {
      "1": [{
        "id": 1704067200000,
        "type": 1,
        "color": "#ff7eb3",
        "position": [0, 0.35, -0.2],
        "rotationX": 0,
        "rotationY": 0,
        "rotationZ": 0
      }],
      "2": [], "3": [], "4": [], "5": [], "6": [], "7": []
    }
  }'

# 3. 책장 데이터 업데이트
curl -X PUT http://localhost:8082/api/bookshelf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "decorations": {
      "1": [{
        "id": 1704067200000,
        "type": 2,
        "color": "#7ec8ff",
        "position": [1.5, 0.5, -0.1],
        "rotationX": 0,
        "rotationY": 1.5708,
        "rotationZ": 0
      }],
      "2": [], "3": [], "4": [], "5": [], "6": [], "7": []
    }
  }'
```

---

## ⚠️ 주의사항

1. **인증 토큰 필수**: 모든 API 요청에 `Authorization: Bearer {token}` 헤더 필요
2. **CORS 설정**: 백엔드에서 프론트엔드 도메인 허용 필요
3. **JSON 구조**: `decorations` 객체는 반드시 1~7층 키를 모두 포함해야 함
4. **좌표 검증**: 백엔드에서 좌표 범위 검증 권장
5. **에러 처리**: 404 (데이터 없음)는 정상 상황으로 처리 (기본값 사용)

---

## 📁 파일 구조

```
src/
├── lib/
│   ├── api/
│   │   ├── bookshelf.js                    # 책장 API 함수
│   │   ├── BOOKSHELF_API_SPEC.md          # API 상세 명세서
│   │   └── BOOKSHELF_DATA_FORMAT.md       # 데이터 포맷 요약
│   └── store/
│       └── bookshelfStore.js               # Zustand Store
└── pages/
    └── BookshelfPage.jsx                   # 책장 페이지 (수정됨)

BOOKSHELF_INTEGRATION_SUMMARY.md            # 통합 요약 (이 파일)
```

---

## 🚀 다음 단계

### 백엔드 팀

1. API 엔드포인트 3개 구현
2. 데이터베이스 테이블 생성
3. JWT 인증 미들웨어 적용
4. 데이터 검증 로직 추가
5. 프론트엔드에 API 주소 공유

### 프론트엔드 팀

1. `axios.js`에서 `baseURL` 확인 (현재: `http://localhost:8082/api`)
2. 백엔드 API 준비되면 통합 테스트
3. 에러 케이스 처리 확인
4. 사용자 피드백에 따른 UI/UX 개선

---

## 📞 문의사항

데이터 포맷이나 API 명세에 대한 질문이 있으면:

- `BOOKSHELF_API_SPEC.md` 참고
- `BOOKSHELF_DATA_FORMAT.md` 참고
