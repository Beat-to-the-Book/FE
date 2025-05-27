import { privateApi } from "./axios";

export const behaviorAPI = {
	log: (data) => privateApi.post("/behavior/log", data),
};
