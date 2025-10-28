# 책장 API 명세서

## 개요

사용자의 책장 장식품 배치 정보를 저장하고 조회하는 API입니다.

---

## 1. 책장 데이터 조회

### `GET /api/bookshelf`

사용자의 책장 장식품 배치 정보를 조회합니다.

#### Request Headers

```http
Authorization: Bearer {token}
```

#### Response (200 OK)

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
				"rotationY": 1.5707963267948966,
				"rotationZ": 0
			}
		],
		"2": [
			{
				"id": 1672531202000,
				"type": 3,
				"color": "#8affc1",
				"position": [-0.8, 1.35, 0.15],
				"rotationX": 0.39269908169872414,
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

#### Response (404 Not Found)

```json
{
	"error": "BOOKSHELF_NOT_FOUND",
	"message": "책장 데이터를 찾을 수 없습니다."
}
```

---

## 2. 책장 데이터 저장 (최초 생성)

### `POST /api/bookshelf`

사용자의 책장 장식품 배치 정보를 최초 생성합니다.

#### Request Headers

```http
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body

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

#### Response (201 Created)

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
			}
		],
		"2": [],
		"3": [],
		"4": [],
		"5": [],
		"6": [],
		"7": []
	},
	"createdAt": "2024-01-01T00:00:00Z",
	"updatedAt": "2024-01-01T00:00:00Z"
}
```

---

## 3. 책장 데이터 업데이트

### `PUT /api/bookshelf`

사용자의 책장 장식품 배치 정보를 업데이트합니다.

#### Request Headers

```http
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body

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
			},
			{
				"id": 1672531203000,
				"type": 2,
				"color": "#7ec8ff",
				"position": [-1.5, 0.45, 0.1],
				"rotationX": 0,
				"rotationY": 3.141592653589793,
				"rotationZ": 0
			}
		],
		"2": [
			{
				"id": 1672531202000,
				"type": 3,
				"color": "#8affc1",
				"position": [-0.8, 1.35, 0.15],
				"rotationX": 0.39269908169872414,
				"rotationY": 0,
				"rotationZ": 0
			}
		],
		"3": [],
		"4": [],
		"5": [],
		"6": [],
		"7": []
	}
}
```

#### Response (200 OK)

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
				"id": 1672531203000,
				"type": 2,
				"color": "#7ec8ff",
				"position": [-1.5, 0.45, 0.1],
				"rotationX": 0,
				"rotationY": 3.141592653589793,
				"rotationZ": 0
			}
		],
		"2": [
			{
				"id": 1672531202000,
				"type": 3,
				"color": "#8affc1",
				"position": [-0.8, 1.35, 0.15],
				"rotationX": 0.39269908169872414,
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
	"updatedAt": "2024-01-01T12:35:00Z"
}
```

---

## 데이터 구조 설명

### Bookshelf 객체

| 필드          | 타입              | 설명                          |
| ------------- | ----------------- | ----------------------------- |
| `userId`      | number            | 사용자 ID                     |
| `decorations` | object            | 층별 장식품 배치 정보 (1~7층) |
| `createdAt`   | string (ISO 8601) | 생성 시간                     |
| `updatedAt`   | string (ISO 8601) | 마지막 수정 시간              |

### Decorations 객체

7개의 층(1~7)을 키로 가지며, 각 층은 장식품 배열을 값으로 가집니다.

```typescript
{
  "1": Decoration[],  // 1층 장식품들
  "2": Decoration[],  // 2층 장식품들
  "3": Decoration[],  // 3층 장식품들
  "4": Decoration[],  // 4층 장식품들
  "5": Decoration[],  // 5층 장식품들
  "6": Decoration[],  // 6층 장식품들
  "7": Decoration[]   // 7층 장식품들
}
```

### Decoration 객체

| 필드        | 타입      | 설명                                    | 예시                 |
| ----------- | --------- | --------------------------------------- | -------------------- |
| `id`        | number    | 장식품 고유 ID (타임스탬프)             | `1672531200000`      |
| `type`      | number    | 장식품 타입 (1: 구체, 2: 피규어, 3: 별) | `1`, `2`, `3`        |
| `color`     | string    | 장식품 색상 (hex 코드)                  | `"#ff7eb3"`          |
| `position`  | number[3] | 3D 좌표 [x, y, z]                       | `[0.5, 0.35, -0.2]`  |
| `rotationX` | number    | X축 회전 (라디안)                       | `0`                  |
| `rotationY` | number    | Y축 회전 (라디안)                       | `1.5707963267948966` |
| `rotationZ` | number    | Z축 회전 (라디안)                       | `0`                  |

### 좌표 및 회전 제약 조건

#### Position (위치)

- **X축**: `-2.8` ~ `2.8` (선반 좌우 경계)
- **Y축**: 층별 선반 높이 기준 (1층: 0.35, 2층: 1.35, ..., 7층: 6.35)
  - 각 층에서 수직 이동 가능 범위: `shelfY` ~ `shelfY + 0.7`
- **Z축**: `-0.35` ~ `0.35` (선반 앞뒤 영역, 장식품은 뒤쪽만 사용)

#### Rotation (회전)

- **라디안 단위** 사용
- 각 축 별로 제한 없음 (자유 회전)
- 일반적으로 `Math.PI / 8` (22.5도) 단위로 회전

#### Type (장식품 타입)

- `1`: 구체 (icosahedron) - 기본 장식
- `2`: 피규어 - 캐릭터 모양
- `3`: 별 (octahedron) - 별 모양

#### Color (색상)

- 타입별 기본 색상:
  - 타입 1: `#ff7eb3` (분홍)
  - 타입 2: `#7ec8ff` (파랑)
  - 타입 3: `#8affc1` (초록)

---

## 에러 코드

| HTTP Status | Error Code              | 설명                       |
| ----------- | ----------------------- | -------------------------- |
| 400         | `INVALID_REQUEST`       | 잘못된 요청 데이터         |
| 401         | `UNAUTHORIZED`          | 인증 실패                  |
| 404         | `BOOKSHELF_NOT_FOUND`   | 책장 데이터를 찾을 수 없음 |
| 500         | `INTERNAL_SERVER_ERROR` | 서버 내부 오류             |

---

## 사용 예시

### 프론트엔드에서 데이터 저장

```javascript
import { bookshelfAPI } from "@/lib/api/bookshelf";

// 장식품 배치 후 저장
const saveDecorations = async (decorsByFloor) => {
	try {
		const response = await bookshelfAPI.updateBookshelfData({
			decorations: decorsByFloor,
		});
		console.log("저장 완료:", response.data);
	} catch (error) {
		console.error("저장 실패:", error);
	}
};
```

### 프론트엔드에서 데이터 로드

```javascript
import { bookshelfAPI } from "@/lib/api/bookshelf";

// 페이지 로드 시 책장 데이터 가져오기
const loadDecorations = async () => {
	try {
		const response = await bookshelfAPI.getBookshelfData();
		const decorsByFloor = response.data.decorations;
		console.log("로드 완료:", decorsByFloor);
		return decorsByFloor;
	} catch (error) {
		if (error.response?.status === 404) {
			// 데이터가 없으면 기본값 사용
			return {
				1: [],
				2: [],
				3: [],
				4: [],
				5: [],
				6: [],
				7: [],
			};
		}
		console.error("로드 실패:", error);
	}
};
```

---

## 주의사항

1. **인증 필수**: 모든 API는 `Authorization` 헤더에 Bearer 토큰이 필요합니다.
2. **자동 저장**: 프론트엔드에서 2초 디바운스로 자동 저장됩니다.
3. **데이터 구조**: `decorations` 객체는 반드시 1~7층 키를 모두 포함해야 합니다.
4. **좌표 제약**: 백엔드에서 좌표 범위 검증을 수행하는 것을 권장합니다.
5. **타임스탬프 ID**: 장식품 ID는 프론트엔드에서 `Date.now()`로 생성합니다.
