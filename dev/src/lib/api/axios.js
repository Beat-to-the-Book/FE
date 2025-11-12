import axios from "axios";

const DEFAULT_LOCAL_API_URL = "http://localhost:8082/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_LOCAL_API_URL;

const shouldEnableLocalFallback = API_BASE_URL !== DEFAULT_LOCAL_API_URL;

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

	instance.interceptors.response.use(
		(response) => response,
		async (error) => {
			const config = error.config;

			const shouldRetryWithLocal =
				shouldEnableLocalFallback &&
				config &&
				!config.__retriedWithLocal &&
				(!error.response || error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED");

			if (shouldRetryWithLocal) {
				console.warn("[Axios] 기본 API에 연결하지 못했습니다. localhost로 재시도합니다.");
				config.__retriedWithLocal = true;
				config.baseURL = DEFAULT_LOCAL_API_URL;
				instance.defaults.baseURL = DEFAULT_LOCAL_API_URL;
				return instance(config);
			}

			return Promise.reject(error);
		}
	);

	return instance;
};

const publicApi = createApiInstance(false);
const privateApi = createApiInstance(true);

export { publicApi, privateApi };
