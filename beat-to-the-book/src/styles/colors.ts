// src/styles/colors.ts
export const colors = {
	springGreen: "#00ED64",
	forestGreen: "#00684A",
	everGreen: "#023430",
	stateBlue: "#001E2B",
	lightGray: "#F5F7FA",
	gray: "#ADB9BB",
} as const;

export type ColorKey = keyof typeof colors;
