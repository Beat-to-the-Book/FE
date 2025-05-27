import { privateApi } from "./axios";

export const recommendAPI = {
	getRecommendations: (data) => privateApi.post("/recommend", data),

	logBehavior: (data) => privateApi.post("/behavior/log", data),
};
