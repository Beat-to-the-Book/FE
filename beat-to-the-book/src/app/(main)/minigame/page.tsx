// src/app/(main)/minigame/page.tsx
"use client";

import Game from "@/components/ThreeScene"; // 상대 경로는 실제 위치에 맞춰 조정

export default function MiniGamePage() {
	return (
		<div className='w-screen h-screen relative'>
			<Game />
		</div>
	);
}
