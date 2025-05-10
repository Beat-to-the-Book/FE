// src/lib/api/game.ts
import api from "./axios";

// TODO: 게임 점수 API 문서 확인 후 수정

export async function submitScore(score: number) {
	const res = await api.post("/game/score", { score });
	return res.data; // { highScore: number, rank: ... }
}

export async function fetchHighScore() {
	const res = await api.get<{ highScore: number }>("/game/highscore");
	return res.data.highScore;
}
