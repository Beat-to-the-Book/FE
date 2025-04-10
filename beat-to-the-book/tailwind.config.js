/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{js,ts,jsx,tsx}", // src 내 모든 파일 포함
	],
	theme: {
		extend: {
			colors: {
				springGreen: "#00ED64",
				forestGreen: "#00684A",
				everGreen: "#023430",
				stateBlue: "#001E2B",
				lightGray: "#F5F7FA",
				gray: "#ADB9BB",
			},
		},
	},
	plugins: [],
};
