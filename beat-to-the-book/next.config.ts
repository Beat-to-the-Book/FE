import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		domains: [
			"image.aladin.co.kr",
			// 필요하다면 다른 호스트도 여기에 추가
		],
		// Next.js 13+ 로 remotePatterns를 쓰고 싶다면:
		// remotePatterns: [
		//   {
		//     protocol: 'https',
		//     hostname: 'image.aladin.co.kr',
		//     port: '',
		//     pathname: '/**',
		//   },
		// ],
	},
};

export default nextConfig;
