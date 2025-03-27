// src/lib/api/mockBooks.ts
export interface Book {
	id: number;
	title: string;
	author: string;
	genre: string;
	intro: string;
	price: number;
	publisher: string;
	publishYear: string;
	coverImage?: string;
}

export const mockBooks: Book[] = [
	{
		id: 1,
		title: "예약판매 온전한 결핍 2",
		author: "김바림",
		genre: "로맨스",
		intro:
			"STORY 열일곱, 온주영의 목표는 하나였다. 좋은 대학에 가서 낡고 좁은 집에서 벗어나는 것. 그런 온주영 앞에 고태열이 나타났다. 불량해 보이는 태도와 다르게 꿈을 말하는 그의 눈에는 자신감이 가득했다. 태열의 곁에서라면 주영 역시 하고 싶은 일을 찾아볼 수 있을 것 같았다. 설렘과 기대도 잠시, 유일한 보호자인 엄마가 쓰러지고 주영 앞에 존재를 몰랐던 친부, 서재건이 나타난다. 건설사 대표인 친부의 집에서 경제적인 풍족을 누리지만 그럴수록 태열과의 물리적, 심리적 거리는 점점 멀어진다. 주영은 혼외자인 자신을 못마땅하게 여기는 친할머니의 압박을 이기지 못해 태열에게 이별을 고한다. 서른둘, 서주영으로 성공적인 커리어를 이어가던 주영은 카페 프랜차이즈 대표가 된 태열과 재회한다. 집안이 맺어 준 약혼자와의 결혼을 앞두고 있지만, 여전히 자신을 온주영으로 보는 그에게 흔들리는데….",
		price: 14850.0,
		publisher: "출판사 없음",
		publishYear: "출판일 없음",
		coverImage: "https://via.placeholder.com/300x400?text=Book+Cover", // 테스트용 이미지
	},
	{
		id: 2,
		title: "가상의 책",
		author: "홍길동",
		genre: "판타지",
		intro: "가상의 세계에서 펼쳐지는 모험 이야기.",
		price: 12000.0,
		publisher: "가상 출판사",
		publishYear: "2023",
		coverImage: "https://via.placeholder.com/300x400?text=Another+Book",
	},
];
