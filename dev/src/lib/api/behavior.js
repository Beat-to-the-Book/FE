import { privateApi } from "./axios";

export const behaviorAPI = {
	log: (data) => {
		console.log("[BehaviorAPI] 사용자 행동 데이터 전송 요청:", data);
		return privateApi.post("/behavior/log", data);
	},
};
