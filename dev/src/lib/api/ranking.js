import { privateApi } from "./axios";

export const rankingAPI = {
	getPointsRanking: ({ year, month }) =>
		privateApi.get("/ranking/points", {
			params: { year, month },
		}),
	getBooksRanking: ({ year, month }) =>
		privateApi.get("/ranking/books", {
			params: { year, month },
		}),
};
