/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: "#023430", // 진한 청록색
					light: "#00ED64", // 밝은 라임색
					dark: "#001E2B", // 진한 네이비
				},
				secondary: {
					DEFAULT: "#00ED64", // 강조색
					light: "#4DFF9D", // 밝은 버전
					dark: "#00C853", // 어두운 버전
				},
			},
		},
	},
	plugins: [],
};
