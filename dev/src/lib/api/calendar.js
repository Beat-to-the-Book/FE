import { privateApi } from "./axios";

export const calendarAPI = {
	create: (data) =>
		privateApi.post("/calendar", {
			bookId: Number(data.bookId),
			startDate: data.startDate,
			endDate: data.endDate,
			memo: data.memo,
		}),

	get: (calendarId) => privateApi.get(`/calendar/${calendarId}`),

	getAll: () => privateApi.get("/calendar"),

	getByMonth: (year, month) =>
		privateApi.get("/calendar/month", {
			params: {
				year,
				month: typeof month === "string" ? month : String(month).padStart(2, "0"),
			},
		}),

	update: (calendarId, data) =>
		privateApi.put(`/calendar/${calendarId}`, {
			startDate: data.startDate,
			endDate: data.endDate,
			memo: data.memo,
		}),

	remove: (calendarId) => privateApi.delete(`/calendar/${calendarId}`),
};


