# 독서 기록 API 명세서

## 📊 데이터베이스 테이블 구조

```sql
CREATE TABLE reading_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);
```

## 🔌 API 엔드포인트

### 1. 독서 기록 추가

**POST** `/reading/add`

**Request Body:**

```json
{
	"bookId": 1,
	"startDate": "2024-03-01",
	"endDate": "2024-03-15",
	"memo": "정말 재미있게 읽었습니다!"
}
```

**Response:**

```json
{
	"id": 1,
	"userId": 123,
	"bookId": 1,
	"startDate": "2024-03-01",
	"endDate": "2024-03-15",
	"memo": "정말 재미있게 읽었습니다!",
	"createdAt": "2024-03-20T10:00:00"
}
```

### 2. 독서 기록 수정

**PUT** `/reading/{readingId}`

**Request Body:**

```json
{
	"startDate": "2024-03-01",
	"endDate": "2024-03-20",
	"memo": "수정된 메모"
}
```

### 3. 독서 기록 삭제

**DELETE** `/reading/{readingId}`

### 4. 내 독서 기록 전체 조회

**GET** `/reading/my`

**Response:**

```json
[
	{
		"id": 1,
		"bookId": 1,
		"bookTitle": "클린 코드",
		"author": "로버트 C. 마틴",
		"frontCoverImageUrl": "https://...",
		"startDate": "2024-03-01",
		"endDate": "2024-03-15",
		"memo": "정말 재미있게 읽었습니다!",
		"createdAt": "2024-03-20T10:00:00"
	}
]
```

## 🔐 인증

모든 요청은 Authorization 헤더에 JWT 토큰 필요:

```
Authorization: Bearer {accessToken}
```
