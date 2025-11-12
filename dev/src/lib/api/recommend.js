import { privateApi } from "./axios";

export const recommendAPI = {
	getRecommendations: (data) => privateApi.post("/recommend", data),
	getRecommendationReasons: (data = {}) => privateApi.post("/recommend/reason", data),
	logBehavior: (data) => privateApi.post("/behavior/log", data),
};
