import axios from "axios";

// 기본 인스턴스 (토큰 불필요)
const publicApi = axios.create({
	baseURL: "http://localhost:8082/api",
	headers: {
		"Content-Type": "application/json",
	},
});

// 인증이 필요한 인스턴스
const privateApi = axios.create({
	baseURL: "http://localhost:8082/api",
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${JSON.parse(localStorage.getItem("auth-storage")).state.token}`,
	},
});

export { publicApi, privateApi };
