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
			animation: {
				gradient: "gradient 15s ease infinite",
				"gradient-shine": "gradient-shine 3s ease-in-out infinite",
				float: "float 6s ease-in-out infinite",
				"float-delay": "float 6s ease-in-out 2s infinite",
				"float-delay-2": "float 6s ease-in-out 4s infinite",
				"slide-up": "slideUp 0.5s ease-out",
				"slide-up-delay": "slideUp 0.5s ease-out 0.2s",
				"slide-up-delay-2": "slideUp 0.5s ease-out 0.4s",
				"fade-in": "fadeIn 0.5s ease-out",
				"spin-slow": "spin 20s linear infinite",
				"pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
			},
			keyframes: {
				gradient: {
					"0%, 100%": {
						"background-size": "400% 400%",
						"background-position": "0% 50%",
					},
					"50%": {
						"background-size": "400% 400%",
						"background-position": "100% 50%",
					},
				},
				"gradient-shine": {
					"0%": {
						"background-position": "0% 50%",
					},
					"50%": {
						"background-position": "100% 50%",
					},
					"100%": {
						"background-position": "0% 50%",
					},
				},
				float: {
					"0%, 100%": {
						transform: "translateY(0) rotate(0deg)",
					},
					"50%": {
						transform: "translateY(-20px) rotate(5deg)",
					},
				},
				slideUp: {
					"0%": {
						opacity: "0",
						transform: "translateY(20px)",
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)",
					},
				},
				fadeIn: {
					"0%": {
						opacity: "0",
					},
					"100%": {
						opacity: "1",
					},
				},
			},
		},
	},
	plugins: [],
};
