import api from "./axios";

export const recommendAPI = {
	getRecommendations: () => api.post("/recommend"),

	logBehavior: (data) => api.post("/behavior/log", data),
};
