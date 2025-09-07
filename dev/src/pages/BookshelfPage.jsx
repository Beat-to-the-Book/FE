import { useState, useMemo, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import { DoubleSide } from "three";

const FLOOR_MIN = 1;
const FLOOR_MAX = 3; // 선반 3단
const SHELF_WIDTH = 6; // Shelf width
const SHELF_HALF = SHELF_WIDTH / 2;
const SHELF_MARGIN_X = 0.4; // 기둥 여유
const X_MIN = -SHELF_HALF + SHELF_MARGIN_X; // 좌측 경계
const X_MAX = SHELF_HALF - SHELF_MARGIN_X; // 우측 경계
// 장식/책 Z 영역 분리
const DECOR_Z_MIN = -0.35;
const DECOR_Z_MAX = -0.05;
const BOOK_BASE_Z = 0.1;
const BOOK_ACTIVE_Z = 0.28;

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function getShelfY(floor) {
	return floor === 1 ? 0.35 : floor === 2 ? 1.35 : 2.35;
}

function Shelf({ width = 6, depth = 1.0, y = 0 }) {
	return (
		<mesh position={[0, y, 0]} receiveShadow castShadow>
			<boxGeometry args={[width, 0.2, depth]} />
			<meshStandardMaterial color='#c8a87a' />
		</mesh>
	);
}

function Bookcase() {
	return (
		<group>
			{/* 뒤판 */}
			<mesh position={[0, 1.2, -0.55]} receiveShadow>
				<boxGeometry args={[6.2, 2.6, 0.1]} />
				<meshStandardMaterial color='#e7d7bd' side={DoubleSide} />
			</mesh>
			{/* 좌우 기둥 */}
			<mesh position={[-3.1, 1.2, 0]} castShadow>
				<boxGeometry args={[0.2, 2.6, 1.2]} />
				<meshStandardMaterial color='#b78d5b' />
			</mesh>
			<mesh position={[3.1, 1.2, 0]} castShadow>
				<boxGeometry args={[0.2, 2.6, 1.2]} />
				<meshStandardMaterial color='#b78d5b' />
			</mesh>
			{/* 선반 3단 (깊이 증가) */}
			<Shelf y={0.2} depth={1.0} />
			<Shelf y={1.2} depth={1.0} />
			<Shelf y={2.2} depth={1.0} />
		</group>
	);
}

function Decoration({
	id,
	color = "#ff7eb3",
	position = [0, 1.25, -0.2],
	rotationY = 0,
	fixedY,
	onDragEnd,
	onSelect,
	isSelected,
}) {
	const dragging = useRef(false);

	return (
		<mesh
			position={position}
			rotation={[0, rotationY, 0]}
			castShadow
			onPointerDown={(e) => {
				dragging.current = true;
				e.stopPropagation();
			}}
			onPointerUp={(e) => {
				dragging.current = false;
				onDragEnd?.(e.object.position.toArray());
			}}
			onClick={(e) => {
				e.stopPropagation();
				onSelect?.(id);
			}}
			onPointerMove={(e) => {
				if (!dragging.current) return;
				// x, z 이동 + 클램프, y는 선반 높이로 스냅 (장식은 뒤쪽 Z 대역 고정)
				e.object.position.x = clamp(e.object.position.x + e.delta[0] * 0.01, X_MIN, X_MAX);
				e.object.position.z = clamp(
					e.object.position.z + e.delta[1] * 0.01,
					DECOR_Z_MIN,
					DECOR_Z_MAX
				);
				if (typeof fixedY === "number") {
					e.object.position.y = fixedY;
				}
			}}
		>
			<icosahedronGeometry args={[0.15, 0]} />
			<meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
			{isSelected && (
				<group position={[0, 0.35, 0]}>
					{/* 2D 화살표 (아래로 향함) */}
					<mesh rotation={[0, 0, Math.PI]}>
						<planeGeometry args={[0.15, 0.2]} />
						<meshStandardMaterial color='#ff6b6b' transparent opacity={0.8} side={DoubleSide} />
					</mesh>
					{/* 화살표 윤곽선 */}
					<mesh rotation={[0, 0, Math.PI]}>
						<planeGeometry args={[0.16, 0.21]} />
						<meshStandardMaterial color='#ffffff' transparent opacity={0.9} side={DoubleSide} />
					</mesh>
				</group>
			)}
		</mesh>
	);
}

export default function BookshelfPage() {
	const [floor, setFloor] = useState(1); // 보기+배치 선반
	const [selectedDeco, setSelectedDeco] = useState(1); // 1/2/3
	const [decorsByFloor, setDecorsByFloor] = useState(() => {
		try {
			const raw = localStorage.getItem("bookshelf-decor-v1");
			if (raw) return JSON.parse(raw);
		} catch {}
		return { 1: [], 2: [], 3: [] };
	});
	const [activeId, setActiveId] = useState(null);
	const [showHelp, setShowHelp] = useState(false);

	// 책(Mock) 데이터: 추후 rental/purchase 연동 교체
	const [books] = useState([
		{ id: "b1", title: "대여 A", type: "rental", color: "#ffd166" },
		{ id: "b2", title: "구매 B", type: "purchase", color: "#06d6a0" },
		{ id: "b3", title: "구매 C", type: "purchase", color: "#118ab2" },
		{ id: "b4", title: "대여 D", type: "rental", color: "#ef476f" },
	]);

	// MiniGamePage 비율(1.5:1:0.2)을 축소 적용 + 90도 회전 후 가로 길이(BOOK_DEPTH) 기준 간격
	const BOOK_HEIGHT = 0.6;
	const BOOK_DEPTH = 0.4; // 90도 회전 후 가로 길이가 됨
	const BOOK_WIDTH = 0.08;
	const BOOK_GAP = 0.12; // BOOK_DEPTH 기준으로 조정
	const MAX_BOOKS_PER_SHELF = Math.floor(
		(SHELF_WIDTH - SHELF_MARGIN_X * 2 + BOOK_GAP) / (BOOK_DEPTH + BOOK_GAP)
	);

	const booksLaidOut = useMemo(() => {
		let results = [];
		let fl = 1;
		let idx = 0;
		const totalWidth = MAX_BOOKS_PER_SHELF * BOOK_DEPTH + (MAX_BOOKS_PER_SHELF - 1) * BOOK_GAP;
		const startX = -totalWidth / 2;
		books.forEach((bk) => {
			const y = getShelfY(fl) + BOOK_HEIGHT / 2;
			const x = startX + idx * (BOOK_DEPTH + BOOK_GAP) + BOOK_DEPTH / 2;
			results.push({ ...bk, position: [x, y, BOOK_BASE_Z], floor: fl });
			idx++;
			if (idx >= MAX_BOOKS_PER_SHELF) {
				idx = 0;
				fl = Math.min(fl + 1, FLOOR_MAX);
			}
		});
		return results;
	}, [books]);

	const [activeBookId, setActiveBookId] = useState(null);

	useEffect(() => {
		localStorage.setItem("bookshelf-decor-v1", JSON.stringify(decorsByFloor));
	}, [decorsByFloor]);

	const canUp = floor < FLOOR_MAX;
	const canDown = floor > FLOOR_MIN;

	const shelfY = useMemo(() => getShelfY(floor), [floor]);
	const floorLabel = useMemo(() => `${floor}층 선반`, [floor]);

	// 키보드 이동(방향키), Shift+위/아래 수직 이동 (장식 전용)
	const KEY_STEP = 0.1;
	useEffect(() => {
		function onKeyDown(e) {
			if (!activeId) return;
			const tag = (e.target?.tagName || "").toLowerCase();
			if (["input", "textarea", "select"].includes(tag) || e.isComposing) return;

			let dx = 0,
				dy = 0,
				dz = 0;
			if (e.key === "ArrowLeft") dx = -KEY_STEP;
			else if (e.key === "ArrowRight") dx = KEY_STEP;
			else if (e.key === "ArrowUp") dz = -KEY_STEP;
			else if (e.key === "ArrowDown") dz = KEY_STEP;
			else return;

			if (e.shiftKey) {
				// Shift + 위/아래: 수직 이동, Z 이동은 무시
				dy = e.key === "ArrowUp" ? KEY_STEP : e.key === "ArrowDown" ? -KEY_STEP : 0;
				dz = 0;
			}

			e.preventDefault();
			setDecorsByFloor((prev) => {
				const list = prev[floor] || [];
				return {
					...prev,
					[floor]: list.map((item) => {
						if (item.id !== activeId) return item;
						const [x, y, z] = item.position;
						const nx = clamp(x + dx, X_MIN, X_MAX);
						const ny = clamp(y + dy, shelfY, shelfY + 0.7);
						const nz = clamp(z + dz, DECOR_Z_MIN, DECOR_Z_MAX);
						return { ...item, position: [nx, ny, nz] };
					}),
				};
			});
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [activeId, floor, shelfY, setDecorsByFloor]);

	return (
		<div className='w-full h-[calc(100vh-64px)] bg-[#f9f6f1] relative'>
			{/* 상단 층 표시 + 네비게이션 */}
			<div className='absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2'>
				<button
					onClick={() => canDown && setFloor((f) => Math.max(FLOOR_MIN, f - 1))}
					className={`px-3 py-1 rounded-full text-sm ${
						canDown ? "bg-white hover:bg-gray-100" : "bg-gray-200 text-gray-400 cursor-not-allowed"
					}`}
				>
					아래
				</button>
				<div className='px-4 py-1 rounded-full bg-white text-gray-700 shadow'>{floorLabel}</div>
				<button
					onClick={() => canUp && setFloor((f) => Math.min(FLOOR_MAX, f + 1))}
					className={`px-3 py-1 rounded-full text-sm ${
						canUp ? "bg-white hover:bg-gray-100" : "bg-gray-200 text-gray-400 cursor-not-allowed"
					}`}
				>
					위
				</button>
				<div className='ml-2'>
					<button
						className='w-7 h-7 rounded-full bg-white shadow text-gray-700 hover:bg-gray-100'
						onClick={() => setShowHelp((v) => !v)}
					>
						?
					</button>
				</div>
			</div>

			{/* 도움말 */}
			{showHelp && (
				<div className='absolute top-14 left-1/2 -translate-x-1/2 z-10 w-[340px] p-3 bg-white rounded-lg shadow text-xs text-gray-700'>
					<div className='font-semibold mb-1'>조작 방법</div>
					<ul className='list-disc pl-4 space-y-1'>
						<li>드래그: X/Z 이동 (장식은 뒤쪽 영역만)</li>
						<li>방향키: X/Z 이동</li>
						<li>Shift + 방향키(위/아래): Y(위/아래) 이동</li>
						<li>층 전환: 카메라와 배치 선반이 함께 바뀝니다</li>
					</ul>
				</div>
			)}

			{/* 3D 뷰 */}
			<Canvas
				shadows
				camera={{ position: [3.6, shelfY + 0.8, 5.2], fov: 45 }}
				onPointerMissed={() => setActiveId(null)}
			>
				<ambientLight intensity={0.6} />
				<directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
				<Stage intensity={0.5} environment={null} adjustCamera={false}>
					<Bookcase />
					{/* 모든 선반의 장식 렌더 (뒤쪽 Z 대역) */}
					{[1, 2, 3].flatMap((fl) =>
						(decorsByFloor[fl] || []).map((d) => (
							<Decoration
								key={`${fl}-${d.id}`}
								id={d.id}
								color={d.color}
								position={d.position}
								rotationY={d.rotationY || 0}
								fixedY={d.position?.[1]}
								onSelect={(id) => setActiveId(id)}
								isSelected={activeId === d.id}
								onDragEnd={(pos) => {
									const snapped = [
										clamp(pos[0], X_MIN, X_MAX),
										d.position?.[1] ?? getShelfY(fl),
										clamp(pos[2], DECOR_Z_MIN, DECOR_Z_MAX),
									];
									setDecorsByFloor((prev) => ({
										...prev,
										[fl]: prev[fl].map((x) => (x.id === d.id ? { ...x, position: snapped } : x)),
									}));
								}}
							/>
						))
					)}

					{/* 책 렌더 (MiniGamePage 비율 적용, 표지가 보이도록 Y 90도 회전) */}
					{booksLaidOut.map((bk) => (
						<mesh
							key={bk.id}
							position={[
								bk.position[0],
								bk.position[1],
								activeBookId === bk.id ? BOOK_ACTIVE_Z : BOOK_BASE_Z,
							]}
							rotation={[0, Math.PI / 2, 0]}
							scale={activeBookId === bk.id ? 1.15 : 1}
							castShadow
							onClick={(e) => {
								e.stopPropagation();
								setActiveBookId((cur) => (cur === bk.id ? null : bk.id));
							}}
						>
							<boxGeometry args={[BOOK_WIDTH, BOOK_HEIGHT, BOOK_DEPTH]} />
							<meshStandardMaterial color={bk.color} />
						</mesh>
					))}
				</Stage>
				<OrbitControls
					enablePan={false}
					minDistance={5.2}
					maxDistance={7}
					minPolarAngle={0.95}
					maxPolarAngle={1.3}
					minAzimuthAngle={-0.6}
					maxAzimuthAngle={0.6}
					enableDamping
					dampingFactor={0.08}
					target={[0, shelfY, 0]}
					// 가시성 문제 해결: 카메라가 너무 가까이 가지 않도록 제한
				/>
			</Canvas>

			{/* 장식 선택 (MVP: 더미 버튼) */}
			<div className='absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white/80 rounded-full px-3 py-2 shadow'>
				<button
					className={`px-3 py-1 rounded-full text-sm ${
						selectedDeco === 1 ? "bg-pink-400 text-white" : "bg-pink-200 hover:bg-pink-300"
					}`}
					onClick={() => setSelectedDeco(1)}
				>
					1번 장식
				</button>
				<button
					className={`px-3 py-1 rounded-full text-sm ${
						selectedDeco === 2 ? "bg-blue-400 text-white" : "bg-blue-200 hover:bg-blue-300"
					}`}
					onClick={() => setSelectedDeco(2)}
				>
					2번 장식
				</button>
				<button
					className={`px-3 py-1 rounded-full text-sm ${
						selectedDeco === 3 ? "bg-green-400 text-white" : "bg-green-200 hover:bg-green-300"
					}`}
					onClick={() => setSelectedDeco(3)}
				>
					3번 장식
				</button>
				<button
					className='px-3 py-1 rounded-full text-sm bg-amber-200 hover:bg-amber-300'
					onClick={() => {
						const id = Date.now();
						const color =
							selectedDeco === 1 ? "#ff7eb3" : selectedDeco === 2 ? "#7ec8ff" : "#8affc1";
						const y = getShelfY(floor);
						setDecorsByFloor((prev) => ({
							...prev,
							[floor]: [
								...(prev[floor] || []),
								{
									id,
									type: selectedDeco,
									color,
									position: [0, y, (DECOR_Z_MIN + DECOR_Z_MAX) / 2],
									rotationY: 0,
								},
							],
						}));
					}}
				>
					배치하기
				</button>
			</div>

			{/* 선택한 장식 컨트롤 */}
			{activeId && (
				<div className='absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white rounded-full px-3 py-2 shadow'>
					<button
						className='px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200'
						onClick={() => {
							setDecorsByFloor((prev) => ({
								...prev,
								[floor]: prev[floor].map((x) =>
									x.id === activeId ? { ...x, rotationY: (x.rotationY || 0) - Math.PI / 8 } : x
								),
							}));
						}}
					>
						왼쪽 회전
					</button>
					<button
						className='px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200'
						onClick={() => {
							setDecorsByFloor((prev) => ({
								...prev,
								[floor]: prev[floor].map((x) =>
									x.id === activeId ? { ...x, rotationY: (x.rotationY || 0) + Math.PI / 8 } : x
								),
							}));
						}}
					>
						오른쪽 회전
					</button>
					<button
						className='px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200'
						onClick={() => {
							setDecorsByFloor((prev) => ({
								...prev,
								[floor]: prev[floor].map((x) =>
									x.id === activeId
										? { ...x, position: [X_MIN, getShelfY(floor), (DECOR_Z_MIN + DECOR_Z_MAX) / 2] }
										: x
								),
							}));
						}}
					>
						좌정렬
					</button>
					<button
						className='px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200'
						onClick={() => {
							setDecorsByFloor((prev) => ({
								...prev,
								[floor]: prev[floor].map((x) =>
									x.id === activeId
										? { ...x, position: [0, getShelfY(floor), (DECOR_Z_MIN + DECOR_Z_MAX) / 2] }
										: x
								),
							}));
						}}
					>
						가운데
					</button>
					<button
						className='px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200'
						onClick={() => {
							setDecorsByFloor((prev) => ({
								...prev,
								[floor]: prev[floor].map((x) =>
									x.id === activeId
										? { ...x, position: [X_MAX, getShelfY(floor), (DECOR_Z_MIN + DECOR_Z_MAX) / 2] }
										: x
								),
							}));
						}}
					>
						우정렬
					</button>
					<button
						className='px-3 py-1 rounded-full text-sm bg-red-200 hover:bg-red-300'
						onClick={() => {
							setDecorsByFloor((prev) => ({
								...prev,
								[floor]: prev[floor].filter((x) => x.id !== activeId),
							}));
							setActiveId(null);
						}}
					>
						삭제
					</button>
				</div>
			)}
		</div>
	);
}
