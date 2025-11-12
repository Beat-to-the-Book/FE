import { useMemo, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

const DEFAULT_COLOR_HEX = "#f5f5f0";
const DEFAULT_COLOR_TEXTURE =
	"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'><rect width='1' height='1' fill='%23f5f5f0'/></svg>";

const BookModel = ({ front, back, left }) => {
	const textures = useLoader(THREE.TextureLoader, [
		front || DEFAULT_COLOR_TEXTURE,
		back || DEFAULT_COLOR_TEXTURE,
		left || DEFAULT_COLOR_TEXTURE,
	]);

	const materials = useMemo(() => {
		const [frontTexture, backTexture, leftTexture] = textures;

		return [
			new THREE.MeshStandardMaterial({
				color: DEFAULT_COLOR_HEX,
				roughness: 0.7,
				metalness: 0.05,
			}), // +X (right)
			new THREE.MeshStandardMaterial({
				map: leftTexture,
				roughness: 0.6,
				metalness: 0.1,
			}), // -X (left/spine)
			new THREE.MeshStandardMaterial({ color: DEFAULT_COLOR_HEX }), // +Y (top)
			new THREE.MeshStandardMaterial({ color: DEFAULT_COLOR_HEX }), // -Y (bottom)
			new THREE.MeshStandardMaterial({
				map: frontTexture,
				roughness: 0.5,
				metalness: 0.1,
			}), // +Z (front cover)
			new THREE.MeshStandardMaterial({
				map: backTexture,
				roughness: 0.6,
				metalness: 0.1,
			}), // -Z (back cover)
		];
	}, [textures]);

	return (
		<mesh rotation={[0, Math.PI / 6, 0]} castShadow receiveShadow material={materials}>
			<boxGeometry args={[2.4, 3.5, 0.6]} />
		</mesh>
	);
};

const Book3DPreviewModal = ({ isOpen, onClose, images }) => {
	if (!isOpen) return null;

	const { front, back, left } = images;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-5 py-8'>
			<div className='relative w-full max-w-5xl bg-white border border-primary/20 rounded-[28px] shadow-[0_28px_65px_-22px_rgba(15,23,42,0.6)] overflow-hidden'>
				<div className='pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(60%_80%_at_60%_0%,rgba(255,255,255,0.85)_0%,rgba(209,233,255,0.4)_40%,transparent_85%)]'></div>
				<button
					type='button'
					onClick={onClose}
					className='absolute top-5 right-5 z-30 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/90 text-primary-dark hover:text-primary hover:bg-white shadow-lg border border-primary/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
					aria-label='미리보기 닫기'
				>
					<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='1.7'
							d='M6 18L18 6M6 6l12 12'
						/>
					</svg>
				</button>
				<div className='relative z-10 bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-6 border-b border-primary-dark/30 shadow-inner'>
					<div className='flex items-center gap-3 text-white/80 text-xs font-semibold uppercase tracking-widest mb-2'>
						<span className='inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/40 bg-white/10 text-white'>
							3D
						</span>
						<span>Interactive Preview</span>
					</div>
					<h2 className='text-2xl font-semibold'>3D 도서 미리보기</h2>
					<p className='text-sm text-white/80 mt-2'>
						마우스로 드래그 및 스크롤 확대/축소로 다양한 각도에서 책을 둘러보세요.
					</p>
				</div>
				<div className='relative h-[500px] bg-gradient-to-br from-white via-blue-50/70 to-blue-100/60'>
					<div className='absolute inset-0 pointer-events-none bg-[linear-gradient(140deg,rgba(59,130,246,0.18)_0%,transparent_58%),radial-gradient(55%_70%_at_62%_18%,rgba(59,130,246,0.16)_0%,transparent_80%)]'></div>
					<Suspense
						fallback={
							<div className='h-full flex flex-col items-center justify-center gap-3 text-primary-dark/80 text-sm'>
								<div className='w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin'></div>
								로딩 중입니다...
							</div>
						}
					>
						<Canvas
							camera={{ position: [0.11, -0.7, 6.26], fov: 40 }}
							shadows
							gl={{ antialias: true, alpha: true }}
						>
							<color attach='background' args={["transparent"]} />
							<fog attach='fog' args={["#f1f5f9", 18, 32]} />
							<ambientLight intensity={0.6} color='#f0f9ff' />
							<directionalLight position={[7, 8, 4]} intensity={0.85} color='#fefce8' castShadow />
							<spotLight
								position={[-4, 7.5, -5]}
								intensity={0.45}
								angle={0.9}
								penumbra={0.4}
								color='#bfdbfe'
							/>
							<pointLight position={[0.6, 3.5, 1.8]} intensity={0.5} color='#fde68a' />
							<pointLight position={[-1, 2.5, -2]} intensity={0.25} color='#60a5fa' />
							<BookModel front={front} back={back} left={left} />
							<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
								<planeGeometry args={[20, 20]} />
								<meshStandardMaterial color='#f1f5f9' metalness={0.08} roughness={0.88} />
							</mesh>
							<OrbitControls
								enablePan={false}
								maxDistance={11}
								minDistance={4.2}
								target={[0, 0, 0]}
							/>
						</Canvas>
					</Suspense>
				</div>
				<div className='relative z-10 px-8 py-5 bg-white/90 backdrop-blur border-t border-primary/10 text-gray-700 flex flex-wrap gap-4 items-center justify-between'>
					<div className='flex items-center gap-3 text-sm'>
						<span className='inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20'>
							<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='1.5'
									d='M12 6v12m6-6H6'
								/>
							</svg>
						</span>
						<div>
							<p className='font-medium text-gray-900'>인터랙티브 체험</p>
							<p className='text-xs text-gray-500'>
								실제 책을 손에 든 듯한 매끄러운 회전과 확대 기능
							</p>
						</div>
					</div>
					<div className='flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/30 rounded-full px-4 py-2'>
						<span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse'></span>
						<span>3D 뷰어 활성화</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Book3DPreviewModal;
