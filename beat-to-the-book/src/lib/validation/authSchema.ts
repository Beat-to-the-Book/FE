import { z } from "zod";

// 회원가입 스키마
export const signupSchema = z.object({
	userId: z
		.string()
		.min(3, "아이디는 최소 3자 이상이어야 합니다.")
		.max(20, "아이디는 최대 20자까지 가능합니다.")
		.regex(
			/^[a-zA-Z0-9!@#$%^&*]+$/,
			"아이디는 영문자, 숫자, 특수문자(!@#$%^&*)만 사용 가능합니다."
		),
	username: z
		.string()
		.min(1, "이름을 입력해주세요.")
		.regex(/^[가-힣a-zA-Z]+$/, "이름은 한글 또는 영문자만 사용 가능합니다."),
	email: z.string().email("유효한 이메일을 입력해주세요."),
	password: z
		.string()
		.min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
		.regex(/[a-zA-Z]/, "비밀번호는 영문자를 포함해야 합니다.")
		.regex(/[0-9]/, "비밀번호는 숫자를 포함해야 합니다."),
	role: z
		.enum(["manager", "user"], { message: "역할은 manager 또는 user여야 합니다." })
		.default("user"),
});

// 로그인 스키마
export const signinSchema = z.object({
	userId: z.string().min(1, "아이디를 입력해주세요."),
	password: z.string().min(1, "비밀번호를 입력해주세요."),
});

// TypeScript 타입 추론
export type SignupFormData = z.infer<typeof signupSchema>;
export type SigninFormData = z.infer<typeof signinSchema>;
