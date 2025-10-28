# 책장 데이터 포맷 요약

## 📤 프론트엔드 → 백엔드 전송 데이터

### 저장/업데이트 요청 (POST/PUT /api/bookshelf)

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

**필드 설명:**

- `decorations`: 층별(1~7) 장식품 배열
- `id`: 타임스탬프 (밀리초)
- `type`: 1(구체) / 2(피규어) / 3(별)
- `color`: Hex 색상 코드
- `position`: [x, y, z] 3D 좌표
- `rotationX/Y/Z`: 라디안 단위 회전값

---

## 📥 백엔드 → 프론트엔드 응답 데이터

### 조회 응답 (GET /api/bookshelf)

```json
{
	"userId": 1,
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
			},
			{
				"id": 1672531201000,
				"type": 2,
				"color": "#7ec8ff",
				"position": [1.2, 0.35, -0.1],
				"rotationX": 0,
				"rotationY": 1.5708,
				"rotationZ": 0
			}
		],
		"2": [
			{
				"id": 1672531202000,
				"type": 3,
				"color": "#8affc1",
				"position": [-0.8, 1.35, 0.15],
				"rotationX": 0.3927,
				"rotationY": 0,
				"rotationZ": 0
			}
		],
		"3": [],
		"4": [],
		"5": [],
		"6": [],
		"7": []
	},
	"createdAt": "2024-01-01T00:00:00Z",
	"updatedAt": "2024-01-01T12:30:00Z"
}
```

**추가 필드:**

- `userId`: 사용자 ID
- `createdAt`: 최초 생성 시간 (ISO 8601)
- `updatedAt`: 마지막 수정 시간 (ISO 8601)

---

## 🔢 좌표 제약 조건

### Position (위치)

```javascript
{
  x: -2.8 ~ 2.8,      // 선반 좌우 범위
  y: 0.35 ~ 6.95,     // 1층(0.35) ~ 7층(6.35) + 여유(0.7)
  z: -0.35 ~ 0.35     // 선반 앞뒤 범위 (장식은 뒤쪽만)
}
```

### 층별 Y 좌표

```javascript
{
  1층: 0.35,
  2층: 1.35,
  3층: 2.35,
  4층: 3.35,
  5층: 4.35,
  6층: 5.35,
  7층: 6.35
}
```

---

## 🎨 장식품 타입 & 색상

| Type | 이름   | 기본 색상 | 모양        |
| ---- | ------ | --------- | ----------- |
| 1    | 구체   | `#ff7eb3` | 이십면체    |
| 2    | 피규어 | `#7ec8ff` | 캐릭터 모양 |
| 3    | 별     | `#8affc1` | 팔면체      |

---

## ⚠️ 에러 응답

### 404 Not Found (데이터 없음)

```json
{
	"error": "BOOKSHELF_NOT_FOUND",
	"message": "책장 데이터를 찾을 수 없습니다."
}
```

### 400 Bad Request (잘못된 요청)

```json
{
	"error": "INVALID_REQUEST",
	"message": "잘못된 요청 데이터입니다."
}
```

### 401 Unauthorized (인증 실패)

```json
{
	"error": "UNAUTHORIZED",
	"message": "인증에 실패했습니다."
}
```

---

## 💡 TypeScript 인터페이스

```typescript
// 장식품 하나
interface Decoration {
	id: number; // 타임스탬프 (밀리초)
	type: 1 | 2 | 3; // 장식 타입
	color: string; // Hex 색상
	position: [number, number, number]; // [x, y, z]
	rotationX: number; // 라디안
	rotationY: number; // 라디안
	rotationZ: number; // 라디안
}

// 층별 장식품
interface DecorationsByFloor {
	1: Decoration[];
	2: Decoration[];
	3: Decoration[];
	4: Decoration[];
	5: Decoration[];
	6: Decoration[];
	7: Decoration[];
}

// API 요청 바디
interface BookshelfSaveRequest {
	decorations: DecorationsByFloor;
}

// API 응답
interface BookshelfResponse {
	userId: number;
	decorations: DecorationsByFloor;
	createdAt: string; // ISO 8601
	updatedAt: string; // ISO 8601
}
```

---

## 📝 실제 사용 예시

### 1. 빈 책장 (초기 상태)

```json
{
	"decorations": {
		"1": [],
		"2": [],
		"3": [],
		"4": [],
		"5": [],
		"6": [],
		"7": []
	}
}
```

### 2. 1층에 구체 1개 배치

```json
{
	"decorations": {
		"1": [
			{
				"id": 1704067200000,
				"type": 1,
				"color": "#ff7eb3",
				"position": [0, 0.35, -0.2],
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

### 3. 여러 층에 다양한 장식 배치

```json
{
	"decorations": {
		"1": [
			{
				"id": 1704067200000,
				"type": 1,
				"color": "#ff7eb3",
				"position": [-1.5, 0.35, -0.25],
				"rotationX": 0,
				"rotationY": 0,
				"rotationZ": 0
			},
			{
				"id": 1704067201000,
				"type": 2,
				"color": "#7ec8ff",
				"position": [1.2, 0.5, -0.15],
				"rotationX": 0,
				"rotationY": 1.5708,
				"rotationZ": 0
			}
		],
		"2": [],
		"3": [
			{
				"id": 1704067202000,
				"type": 3,
				"color": "#8affc1",
				"position": [0, 2.6, 0],
				"rotationX": 0.7854,
				"rotationY": 0.7854,
				"rotationZ": 0
			}
		],
		"4": [],
		"5": [],
		"6": [],
		"7": []
	}
}
```
