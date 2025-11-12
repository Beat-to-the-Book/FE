import axios from "axios";

const API_BASE_URL = "http://43.203.132.110:8082/api";

const createApiInstance = (requiresAuth = false) => {
	const instance = axios.create({
		baseURL: API_BASE_URL,
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (requiresAuth) {
		instance.interceptors.request.use((config) => {
			const authStorage = localStorage.getItem("auth-storage");
			if (authStorage) {
				const { state } = JSON.parse(authStorage);
				if (state?.token) {
					config.headers.Authorization = `Bearer ${state.token}`;
				}
			}
			return config;
		});
	}

	return instance;
};

const publicApi = createApiInstance(false);
const privateApi = createApiInstance(true);

export { publicApi, privateApi };
