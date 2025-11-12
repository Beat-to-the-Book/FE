import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import { DoubleSide, TextureLoader } from "three";
import * as THREE from "three";
import { pointsAPI } from "../lib/api/points";
import { bookAPI } from "../lib/api/book";
import { bookshelfAPI } from "../lib/api/bookshelf";
import useBookshelfStore from "../lib/store/bookshelfStore";

const FLOOR_MIN = 1;
const FLOOR_MAX = 7; // 선반 7단
const SHELF_WIDTH = 6; // Shelf width
const SHELF_HALF = SHELF_WIDTH / 2;
const SHELF_MARGIN_X = 0.2; // 기둥 여유 (줄여서 더 넓게)
const X_MIN = -SHELF_HALF + SHELF_MARGIN_X; // 좌측 경계
const X_MAX = SHELF_HALF - SHELF_MARGIN_X; // 우측 경계
// 장식/책 Z 영역 분리
const DECOR_Z_MIN = -0.35;
const DECOR_Z_MAX = 0.35;
const BOOK_BASE_Z = 0.05;
const BOOK_ACTIVE_Z = 0.28;

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

function getShelfY(floor) {
	// 7층 선반: 1층(0.35), 2층(1.35), 3층(2.35), 4층(3.35), 5층(4.35), 6층(5.35), 7층(6.35)
	return 0.35 + (floor - 1) * 1.0;
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
			{/* 뒤판 (7층 높이에 맞게 확장) */}
			<mesh position={[0, 3.2, -0.55]} receiveShadow>
				<boxGeometry args={[6.2, 6.6, 0.1]} />
				<meshStandardMaterial color='#e7d7bd' side={DoubleSide} />
			</mesh>
			{/* 좌우 기둥 (7층 높이에 맞게 확장) */}
			<mesh position={[-3.1, 3.2, 0]} castShadow>
				<boxGeometry args={[0.2, 6.6, 1.2]} />
				<meshStandardMaterial color='#b78d5b' />
			</mesh>
			<mesh position={[3.1, 3.2, 0]} castShadow>
				<boxGeometry args={[0.2, 6.6, 1.2]} />
				<meshStandardMaterial color='#b78d5b' />
			</mesh>
			{/* 선반 7단 */}
			<Shelf y={0.2} depth={1.0} />
			<Shelf y={1.2} depth={1.0} />
			<Shelf y={2.2} depth={1.0} />
			<Shelf y={3.2} depth={1.0} />
			<Shelf y={4.2} depth={1.0} />
			<Shelf y={5.2} depth={1.0} />
			<Shelf y={6.2} depth={1.0} />
		</group>
	);
}

function Book({ book, position, isActive, onClick }) {
	const BOOK_HEIGHT = 0.6;
	const BOOK_DEPTH = 0.4;
	const BOOK_WIDTH = 0.08;

	// 표지 이미지 텍스처 (useLoader는 조건부로 사용 불가하므로 useState로 처리)
	const [textures, setTextures] = useState({ front: null, back: null, spine: null });

	useEffect(() => {
		const loader = new TextureLoader();
		const loadPromises = [];

		if (book.frontCoverImageUrl) {
			loadPromises.push(
				loader
					.loadAsync(book.frontCoverImageUrl)
					.then((tex) => ({ type: "front", texture: tex }))
					.catch(() => null)
			);
		}
		if (book.backCoverImageUrl) {
			loadPromises.push(
				loader
					.loadAsync(book.backCoverImageUrl)
					.then((tex) => ({ type: "back", texture: tex }))
					.catch(() => null)
			);
		}
		if (book.leftCoverImageUrl) {
			loadPromises.push(
				loader
					.loadAsync(book.leftCoverImageUrl)
					.then((tex) => ({ type: "spine", texture: tex }))
					.catch(() => null)
			);
		}

		Promise.all(loadPromises).then((results) => {
			const newTextures = { front: null, back: null, spine: null };
			results.forEach((result) => {
				if (result) {
					newTextures[result.type] = result.texture;
				}
			});
			setTextures(newTextures);
		});
	}, [book.frontCoverImageUrl, book.backCoverImageUrl, book.leftCoverImageUrl]);

	// 6개 면에 대한 재질 배열 (순서: +X, -X, +Y, -Y, +Z, -Z)
	const materials = useMemo(() => {
		return [
			// +X: 뒤
			textures.back
				? new THREE.MeshStandardMaterial({ map: textures.back })
				: new THREE.MeshStandardMaterial({ color: book.color || "#8b4513" }),
			// -X: 앞
			textures.front
				? new THREE.MeshStandardMaterial({ map: textures.front })
				: new THREE.MeshStandardMaterial({ color: book.color || "#8b4513" }),
			// +Y: 위
			new THREE.MeshStandardMaterial({ color: "#ffffff" }),
			// -Y: 아래
			new THREE.MeshStandardMaterial({ color: "#ffffff" }),
			// +Z: 오른쪽
			new THREE.MeshStandardMaterial({ color: "#fffef0" }),
			// -Z: 왼쪽 (책등)
			textures.spine
				? new THREE.MeshStandardMaterial({ map: textures.spine })
				: new THREE.MeshStandardMaterial({ color: book.color || "#8b4513" }),
		];
	}, [textures, book.color]);

	return (
		<mesh
			position={position}
			rotation={[0, Math.PI / 2, 0]}
			scale={isActive ? 1.15 : 1}
			castShadow
			material={materials}
			onPointerEnter={(e) => {
				e.stopPropagation();
			}}
			onPointerLeave={(e) => {
				e.stopPropagation();
			}}
			onClick={(e) => {
				e.stopPropagation();
				onClick?.();
			}}
		>
			<boxGeometry args={[BOOK_WIDTH, BOOK_HEIGHT, BOOK_DEPTH]} />
		</mesh>
	);
}

function Decoration({
	id,
	type = 1,
	color = "#ff7eb3",
	position = [0, 1.25, -0.2],
	rotationX = 0,
	rotationY = 0,
	rotationZ = 0,
	fixedY,
	onDragEnd,
	onSelect,
	isSelected,
}) {
	const isPointerDown = useRef(false);
	const hasMoved = useRef(false);

	// 장식 타입별 모양 렌더링
	const renderDecoration = () => {
		switch (type) {
			case 1:
				// 1번: 기존 구체
				return (
					<>
						<icosahedronGeometry args={[0.15, 0]} />
						<meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
					</>
				);
			case 2:
				// 2번: 피규어 (간단한 캐릭터 모양)
				return (
					<group>
						{/* 몸통 */}
						<mesh position={[0, 0.1, 0]}>
							<cylinderGeometry args={[0.08, 0.1, 0.2, 8]} />
							<meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
						</mesh>
						{/* 머리 */}
						<mesh position={[0, 0.25, 0]}>
							<sphereGeometry args={[0.08, 8, 6]} />
							<meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
						</mesh>
						{/* 팔 */}
						<mesh position={[-0.12, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
							<cylinderGeometry args={[0.03, 0.03, 0.15, 6]} />
							<meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
						</mesh>
						<mesh position={[0.12, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
							<cylinderGeometry args={[0.03, 0.03, 0.15, 6]} />
							<meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
						</mesh>
						{/* 다리 */}
						<mesh position={[-0.05, -0.05, 0]}>
							<cylinderGeometry args={[0.03, 0.03, 0.15, 6]} />
							<meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
						</mesh>
						<mesh position={[0.05, -0.05, 0]}>
							<cylinderGeometry args={[0.03, 0.03, 0.15, 6]} />
							<meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
						</mesh>
					</group>
				);
			case 3:
				// 3번: 별 모양
				return (
					<>
						<octahedronGeometry args={[0.15, 0]} />
						<meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
					</>
				);
			default:
				return (
					<>
						<icosahedronGeometry args={[0.15, 0]} />
						<meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
					</>
				);
		}
	};

	return (
		<mesh
			position={position}
			rotation={[rotationX, rotationY, rotationZ]}
			castShadow
			onPointerEnter={(e) => {
				e.stopPropagation();
			}}
			onPointerLeave={(e) => {
				e.stopPropagation();
			}}
			onPointerDown={(e) => {
				// 마우스/터치를 누른 경우에만 드래그를 시작 가능 상태로 전환
				isPointerDown.current = true;
				hasMoved.current = false;
				e.stopPropagation();
			}}
			onPointerUp={(e) => {
				if (isPointerDown.current && hasMoved.current) {
					// 드래그 종료
					onDragEnd?.(e.object.position.toArray());
				} else {
					// 클릭 처리
					e.stopPropagation();
					onSelect?.(id);
				}
				isPointerDown.current = false;
				hasMoved.current = false;
			}}
			onClick={(e) => {
				// 클릭 이벤트도 추가로 처리 (드래그가 아닌 경우)
				if (!hasMoved.current) {
					e.stopPropagation();
					onSelect?.(id);
				}
			}}
			onPointerMove={(e) => {
				// 마우스 버튼이 눌려있지 않으면 무시 (호버만으로는 드래그 시작 금지)
				if (!isPointerDown.current) return;
				hasMoved.current = true;
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
			{renderDecoration()}
			{isSelected && (
				<group position={[0, 0.35, 0]}>
					{/* 화살표 모양 (아래로 향함) */}
					<mesh rotation={[0, 0, Math.PI]}>
						<coneGeometry args={[0.08, 0.15, 3]} />
						<meshStandardMaterial color='#ff6b6b' transparent opacity={0.9} side={DoubleSide} />
					</mesh>
					{/* 화살표 줄기 */}
					<mesh position={[0, 0.05, 0]}>
						<cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
						<meshStandardMaterial color='#ff6b6b' transparent opacity={0.9} />
					</mesh>
				</group>
			)}
		</mesh>
	);
}

export default function BookshelfPage() {
	const [floor, setFloor] = useState(1); // 보기+배치 선반
	const [selectedDeco, setSelectedDeco] = useState(1); // 1/2/3

	// Zustand Store 사용
	const {
		decorsByFloor,
		setDecorsByFloor,
		updateFloorDecorations,
		loadBookshelfData,
		saveBookshelfData,
		isLoading: bookshelfLoading,
		error: bookshelfError,
		lastSaved,
	} = useBookshelfStore();

	const [activeId, setActiveId] = useState(null);
	const [showHelp, setShowHelp] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveMessage, setSaveMessage] = useState("");
	const [decorationCounts, setDecorationCounts] = useState({ 1: 0, 2: 0, 3: 0 });
	const [decorationCountsLoading, setDecorationCountsLoading] = useState(true);
	const [isBuying, setIsBuying] = useState(false);
	const [buyError, setBuyError] = useState("");

	// 책 데이터: API에서 로드
	const [books, setBooks] = useState([]);
	const [booksLoading, setBooksLoading] = useState(true);

	// 포인트 관련 상태
	const [points, setPoints] = useState(0);
	const [pointsLoading, setPointsLoading] = useState(true);

	// 장식품 가격
	const DECO_PRICES = {
		1: 10, // 1번 장식
		2: 20, // 피규어
		3: 10, // 별 장식
	};

	const loadBooks = useCallback(async () => {
		setBooksLoading(true);
		try {
			const response = await pointsAPI.getMyBooks();
			const ownedBooks = Array.isArray(response.data) ? response.data : [];
			const normalized = await Promise.all(
				ownedBooks.map(async (book) => {
					const bookId = book.bookId || book.id;
					if (!bookId) {
						return {
							...book,
							id: bookId,
							bookId,
							title: book.title || book.bookTitle,
							color: book.color || "#8b4513",
						};
					}

					const hasCover = Boolean(
						book.frontCoverImageUrl || book.backCoverImageUrl || book.leftCoverImageUrl
					);
					if (hasCover) {
						return {
							...book,
							id: bookId,
							bookId,
							title: book.bookTitle || book.title,
							color: book.color || "#8b4513",
						};
					}

					try {
						const detail = await bookAPI.getById(bookId);
						const detailData = detail.data || {};
						return {
							...book,
							id: bookId,
							bookId,
							title: book.bookTitle || book.title || detailData.title,
							frontCoverImageUrl: detailData.frontCoverImageUrl || book.frontCoverImageUrl,
							backCoverImageUrl: detailData.backCoverImageUrl || book.backCoverImageUrl,
							leftCoverImageUrl: detailData.leftCoverImageUrl || book.leftCoverImageUrl,
							author: detailData.author || book.author,
							publisher: detailData.publisher || book.publisher,
							color: book.color || "#8b4513",
						};
					} catch (error) {
						console.error(`책 ${bookId} 정보 가져오기 실패:`, error);
						return {
							...book,
							id: bookId,
							bookId,
							title: book.bookTitle || book.title,
							color: book.color || "#8b4513",
						};
					}
				})
			);
			setBooks(normalized);
		} catch (error) {
			console.error("책 데이터 로드 실패:", error);
		} finally {
			setBooksLoading(false);
		}
	}, []);

	// 포인트 새로고침 함수
	const refreshPoints = useCallback(async () => {
		setPointsLoading(true);
		try {
			const response = await pointsAPI.getMyPoints();
			setPoints(response.data.totalPoints || 0);
		} catch (error) {
			console.error("포인트 조회 실패:", error);
		} finally {
			setPointsLoading(false);
		}
	}, []);

	const refreshDecorationCounts = useCallback(async () => {
		setDecorationCountsLoading(true);
		try {
			const response = await bookshelfAPI.getDecorationCounts();
			const counts = response.data?.decorationCounts || {};
			setDecorationCounts({
				1: counts["1"] ?? counts[1] ?? 0,
				2: counts["2"] ?? counts[2] ?? 0,
				3: counts["3"] ?? counts[3] ?? 0,
			});
		} catch (error) {
			console.error("장식품 보유 수량 조회 실패:", error);
		} finally {
			setDecorationCountsLoading(false);
		}
	}, []);

	// 컴포넌트 마운트 시 책장 데이터와 책 데이터 로드
	useEffect(() => {
		loadBookshelfData();
		loadBooks();
		refreshPoints();
		refreshDecorationCounts();
	}, [loadBookshelfData, loadBooks, refreshPoints, refreshDecorationCounts]);

	const handleBuyDecoration = async (decorationType) => {
		const price = DECO_PRICES[decorationType];
		if (pointsLoading) {
			return;
		}
		if ((points ?? 0) < price) {
			alert(`포인트가 부족합니다. 필요한 포인트: ${price}P`);
			return;
		}
		setBuyError("");
		setIsBuying(true);
		try {
			const response = await bookshelfAPI.buyDecoration(decorationType);
			const data = response.data || {};
			setDecorationCounts((prev) => ({
				...prev,
				[decorationType]: data.totalCount ?? data.purchasedCount ?? prev[decorationType] ?? 0,
			}));
			if (typeof data.remainingPoints === "number") {
				setPoints(data.remainingPoints);
			} else {
				await refreshPoints();
			}
		} catch (error) {
			console.error("장식품 구매 실패:", error);
			const message = error.response?.data?.message || "장식품 구매에 실패했습니다.";
			setBuyError(message);
			alert(message);
		} finally {
			setIsBuying(false);
			refreshDecorationCounts();
		}
	};

	const handlePlaceDecoration = (decorationType) => {
		if (decorationCountsLoading) {
			alert("장식품 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
			return;
		}
		if ((availableDecorationCounts[decorationType] ?? 0) <= 0) {
			alert("보유 중인 장식이 없습니다. 장식품을 먼저 구매해주세요.");
			return;
		}

		const id = Date.now();
		const color = decorationType === 1 ? "#ff7eb3" : decorationType === 2 ? "#7ec8ff" : "#8affc1";
		const y = getShelfY(floor);
		setDecorsByFloor((prev) => ({
			...prev,
			[floor]: [
				...(prev[floor] || []),
				{
					id,
					type: decorationType,
					color,
					position: [0, y, (DECOR_Z_MIN + DECOR_Z_MAX) / 2],
					rotationY: 0,
				},
			],
		}));
	};

	// MiniGamePage 비율(1.5:1:0.2)을 축소 적용 + 90도 회전 후 가로 길이(BOOK_DEPTH) 기준 간격
	const BOOK_HEIGHT = 0.6;
	const BOOK_DEPTH = 0.4; // 90도 회전 후 가로 길이가 됨
	const BOOK_WIDTH = 0.08;
	const BOOK_GAP = 0.12; // BOOK_DEPTH 기준으로 조정
	const MAX_BOOKS_PER_SHELF = Math.floor(
		(SHELF_WIDTH - SHELF_MARGIN_X * 2 + BOOK_GAP) / (BOOK_DEPTH + BOOK_GAP)
	);

	const booksLaidOut = useMemo(() => {
		const ordered = [...books].reverse();
		let results = [];
		let fl = 1;
		let idx = 0;
		const totalWidth = MAX_BOOKS_PER_SHELF * BOOK_DEPTH + (MAX_BOOKS_PER_SHELF - 1) * BOOK_GAP;
		const startX = -totalWidth / 2;
		ordered.forEach((bk) => {
			const y = getShelfY(fl) + BOOK_HEIGHT / 2;
			const x = startX + idx * (BOOK_DEPTH + BOOK_GAP) + BOOK_DEPTH / 2;
			results.push({ ...bk, position: [x, y, BOOK_BASE_Z - 0.05], floor: fl });
			idx++;
			if (idx >= MAX_BOOKS_PER_SHELF) {
				idx = 0;
				fl = Math.min(fl + 1, FLOOR_MAX);
			}
		});
		return results;
	}, [books]);

	const placedDecorationCounts = useMemo(() => {
		const counts = { 1: 0, 2: 0, 3: 0 };
		Object.values(decorsByFloor || {}).forEach((list) => {
			(list || []).forEach((item) => {
				if (item?.type && counts.hasOwnProperty(item.type)) {
					counts[item.type] = (counts[item.type] || 0) + 1;
				}
			});
		});
		return counts;
	}, [decorsByFloor]);

	const availableDecorationCounts = useMemo(() => {
		return {
			1: Math.max(0, (decorationCounts[1] ?? 0) - (placedDecorationCounts[1] ?? 0)),
			2: Math.max(0, (decorationCounts[2] ?? 0) - (placedDecorationCounts[2] ?? 0)),
			3: Math.max(0, (decorationCounts[3] ?? 0) - (placedDecorationCounts[3] ?? 0)),
		};
	}, [decorationCounts, placedDecorationCounts]);

	const selectedDecorationPrice = DECO_PRICES[selectedDeco];
	const canPlaceSelected = (availableDecorationCounts[selectedDeco] ?? 0) > 0;
	const isPurchaseDisabled = isBuying || pointsLoading || (points ?? 0) < selectedDecorationPrice;

	const [activeBookId, setActiveBookId] = useState(null);

	// 자동 저장 기능 (디바운스)
	useEffect(() => {
		const timer = setTimeout(() => {
			if (decorsByFloor) {
				handleSave();
			}
		}, 60000); // 60초 후 자동 저장

		return () => clearTimeout(timer);
	}, [decorsByFloor]);

	// 저장 핸들러
	const handleSave = async () => {
		try {
			setIsSaving(true);
			await saveBookshelfData();
			setSaveMessage("저장 완료");
			setTimeout(() => setSaveMessage(""), 2000);
		} catch (error) {
			setSaveMessage("저장 실패");
			setTimeout(() => setSaveMessage(""), 2000);
		} finally {
			setIsSaving(false);
		}
	};

	const canUp = floor < FLOOR_MAX;
	const canDown = floor > FLOOR_MIN;

	const shelfY = useMemo(() => getShelfY(floor), [floor]);
	const floorLabel = useMemo(() => `${floor}층 선반`, [floor]);

	// 카메라 부드러운 전환을 위한 애니메이션
	const [cameraTarget, setCameraTarget] = useState([-13, shelfY - 3.2, 0]);
	const [cameraPosition, setCameraPosition] = useState([0, shelfY - 3.2, 0]);

	useEffect(() => {
		// 층 변경 시 카메라 위치를 부드럽게 전환
		const targetY = getShelfY(floor) - 3.2;
		const newTarget = [0, targetY, 0];
		const newPosition = [4, targetY + 1, 6];

		// 애니메이션으로 부드럽게 전환
		const duration = 500; // 0.5초
		const startTime = Date.now();
		const startTarget = [...cameraTarget];
		const startPosition = [...cameraPosition];

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// easeOutCubic 함수로 부드러운 애니메이션
			const easeProgress = 1 - Math.pow(1 - progress, 3);

			const currentTarget = [
				startTarget[0] + (newTarget[0] - startTarget[0]) * easeProgress,
				startTarget[1] + (newTarget[1] - startTarget[1]) * easeProgress,
				startTarget[2] + (newTarget[2] - startTarget[2]) * easeProgress,
			];

			const currentPosition = [
				startPosition[0] + (newPosition[0] - startPosition[0]) * easeProgress,
				startPosition[1] + (newPosition[1] - startPosition[1]) * easeProgress,
				startPosition[2] + (newPosition[2] - startPosition[2]) * easeProgress,
			];

			setCameraTarget(currentTarget);
			setCameraPosition(currentPosition);

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		};

		animate();
	}, [floor]);

	// 층 변경 시 현재 층에 없는 장식품 선택 해제
	useEffect(() => {
		if (activeId) {
			const currentFloorDecorations = decorsByFloor[floor] || [];
			const isDecorationInCurrentFloor = currentFloorDecorations.some((d) => d.id === activeId);
			if (!isDecorationInCurrentFloor) {
				setActiveId(null);
			}
		}
	}, [floor, activeId, decorsByFloor]);

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
				const updated = {
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
				return updated;
			});
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [activeId, floor, shelfY, setDecorsByFloor]);

	return (
		<div className='w-full h-[calc(100vh-64px)] bg-[#f9f6f1] relative'>
			{/* 로딩 상태 */}
			{(booksLoading || bookshelfLoading) && (
				<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white px-6 py-4 rounded-lg shadow-lg'>
					<div className='text-gray-700'>
						{booksLoading && "책 데이터 로딩 중..."}
						{bookshelfLoading && "책장 데이터 로딩 중..."}
					</div>
				</div>
			)}

			{/* 저장 상태 표시 */}
			{saveMessage && (
				<div className='absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-white px-4 py-2 rounded-lg shadow-lg'>
					<div
						className={`text-sm ${
							saveMessage.includes("완료") ? "text-green-600" : "text-red-600"
						}`}
					>
						{saveMessage}
					</div>
				</div>
			)}

			{/* 에러 메시지 */}
			{bookshelfError && (
				<div className='absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-red-50 px-4 py-2 rounded-lg shadow-lg border border-red-200'>
					<div className='text-sm text-red-600'>{bookshelfError}</div>
				</div>
			)}

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

			{/* 포인트 표시 */}
			<div className='absolute top-3 left-4 z-10'>
				<div className='px-4 py-2 rounded-full bg-white shadow flex items-center gap-2'>
					<span className='text-yellow-500 text-lg'>💰</span>
					<span className='text-gray-700 font-semibold'>
						{pointsLoading ? "로딩..." : `${points}P`}
					</span>
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
						<li>층 전환: 카메라가 해당 층 선반을 향하고, 모든 층 장식이 보임</li>
						<li>현재 층의 장식만 클릭/드래그/조작 가능</li>
						<li>장식품은 현재 층의 선반 범위 내에서만 이동 가능</li>
						<li className='text-blue-600 font-medium'>변경사항은 60초 마다 자동 저장됩니다</li>
					</ul>
				</div>
			)}

			{/* 수동 저장 버튼 */}
			<div className='absolute top-3 right-4 z-10'>
				<button
					onClick={handleSave}
					disabled={isSaving}
					className={`px-4 py-2 rounded-lg text-sm font-medium shadow transition-colors ${
						isSaving
							? "bg-gray-300 text-gray-500 cursor-not-allowed"
							: "bg-blue-500 hover:bg-blue-600 text-white"
					}`}
				>
					{isSaving ? "저장 중..." : "저장하기"}
				</button>
			</div>

			{/* 3D 뷰 */}
			<Canvas shadows camera={{ position: cameraPosition, fov: 50 }}>
				<ambientLight intensity={0.8} />
				<directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
				<directionalLight position={[-5, 6, 3]} intensity={0.8} castShadow />
				<Stage intensity={0.5} environment={null} adjustCamera={false}>
					<group onClick={() => setActiveId(null)}>
						<Bookcase />
						{/* 모든 층의 장식 렌더 (뒤쪽 Z 대역) */}
						{[1, 2, 3, 4, 5, 6, 7].flatMap((fl) =>
							(decorsByFloor[fl] || []).map((d) => (
								<Decoration
									key={`${fl}-${d.id}`}
									id={d.id}
									type={d.type || 1}
									color={d.color}
									position={d.position}
									rotationX={d.rotationX || 0}
									rotationY={d.rotationY || 0}
									rotationZ={d.rotationZ || 0}
									fixedY={d.position?.[1]}
									onSelect={(id) => {
										// 현재 층의 장식만 선택 가능
										if (fl === floor) {
											setActiveId(id);
										}
									}}
									isSelected={activeId === d.id && fl === floor}
									onDragEnd={(pos) => {
										// 현재 층의 장식만 드래그 가능
										if (fl !== floor) return;
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

						{/* 책 렌더 (실제 표지 이미지 적용) */}
						{booksLaidOut.map((bk) => (
							<Book
								key={bk.id}
								book={bk}
								position={[
									bk.position[0],
									bk.position[1],
									activeBookId === bk.id ? BOOK_ACTIVE_Z : bk.position[2],
								]}
								isActive={activeBookId === bk.id}
								onClick={() => setActiveBookId((cur) => (cur === bk.id ? null : bk.id))}
							/>
						))}
					</group>
				</Stage>
				<OrbitControls
					enablePan={false}
					minDistance={5.5}
					maxDistance={8}
					minPolarAngle={0.8}
					maxPolarAngle={1.4}
					minAzimuthAngle={-0.8}
					maxAzimuthAngle={0.8}
					enableDamping
					dampingFactor={0.1}
					target={cameraTarget}
					// 각 층별로 카메라가 해당 선반을 향하도록 설정
				/>
			</Canvas>

			{/* 장식 선택 및 구매/배치 컨트롤 */}
			<div className='absolute bottom-28 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 bg-white/85 rounded-2xl px-4 py-3 shadow-lg'>
				<div className='flex gap-2'>
					<button
						className={`px-3 py-1 rounded-full text-sm ${
							selectedDeco === 1 ? "bg-pink-500 text-white" : "bg-pink-200 hover:bg-pink-300"
						}`}
						onClick={() => setSelectedDeco(1)}
					>
						다각형 구
					</button>
					<button
						className={`px-3 py-1 rounded-full text-sm ${
							selectedDeco === 2 ? "bg-blue-500 text-white" : "bg-blue-200 hover:bg-blue-300"
						}`}
						onClick={() => setSelectedDeco(2)}
					>
						피규어
					</button>
					<button
						className={`px-3 py-1 rounded-full text-sm ${
							selectedDeco === 3 ? "bg-green-500 text-white" : "bg-green-200 hover:bg-green-300"
						}`}
						onClick={() => setSelectedDeco(3)}
					>
						별
					</button>
				</div>
				<div className='text-xs text-gray-600 text-center min-w-[200px]'>
					{decorationCountsLoading
						? "장식 정보 불러오는 중..."
						: `보유 ${decorationCounts[selectedDeco] ?? 0}개 · 배치 가능 ${
								availableDecorationCounts[selectedDeco] ?? 0
						  }개`}
				</div>
				<div className='flex gap-2'>
					<button
						className={`px-4 py-2 rounded-full text-sm font-medium shadow ${
							isPurchaseDisabled
								? "bg-gray-300 text-gray-500 cursor-not-allowed"
								: "bg-amber-300 hover:bg-amber-400 text-gray-800"
						}`}
						disabled={isPurchaseDisabled}
						onClick={() => handleBuyDecoration(selectedDeco)}
					>
						{isBuying ? "구매 중..." : `구매하기 (${selectedDecorationPrice}P)`}
					</button>
					<button
						className={`px-4 py-2 rounded-full text-sm font-medium shadow ${
							canPlaceSelected
								? "bg-primary text-white hover:bg-primary-dark"
								: "bg-gray-300 text-gray-500 cursor-not-allowed"
						}`}
						disabled={!canPlaceSelected}
						onClick={() => handlePlaceDecoration(selectedDeco)}
					>
						배치하기
					</button>
				</div>
				{buyError && <div className='text-xs text-red-600'>{buyError}</div>}
			</div>

			{/* 선택한 장식 컨트롤 */}
			{activeId && (
				<div className='absolute bottom-48 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white rounded-full px-3 py-2 shadow-lg'>
					{/* X축 회전 */}
					<div className='flex flex-col items-center gap-1'>
						<div className='text-xs text-gray-600'>X축</div>
						<div className='flex gap-1'>
							<button
								className='px-2 py-1 rounded text-xs bg-blue-100 hover:bg-blue-200'
								onClick={() => {
									setDecorsByFloor((prev) => ({
										...prev,
										[floor]: prev[floor].map((x) =>
											x.id === activeId ? { ...x, rotationX: (x.rotationX || 0) - Math.PI / 8 } : x
										),
									}));
								}}
							>
								↶
							</button>
							<button
								className='px-2 py-1 rounded text-xs bg-blue-100 hover:bg-blue-200'
								onClick={() => {
									setDecorsByFloor((prev) => ({
										...prev,
										[floor]: prev[floor].map((x) =>
											x.id === activeId ? { ...x, rotationX: (x.rotationX || 0) + Math.PI / 8 } : x
										),
									}));
								}}
							>
								↷
							</button>
						</div>
					</div>

					{/* Y축 회전 */}
					<div className='flex flex-col items-center gap-1'>
						<div className='text-xs text-gray-600'>Y축</div>
						<div className='flex gap-1'>
							<button
								className='px-2 py-1 rounded text-xs bg-green-100 hover:bg-green-200'
								onClick={() => {
									setDecorsByFloor((prev) => ({
										...prev,
										[floor]: prev[floor].map((x) =>
											x.id === activeId ? { ...x, rotationY: (x.rotationY || 0) - Math.PI / 8 } : x
										),
									}));
								}}
							>
								↶
							</button>
							<button
								className='px-2 py-1 rounded text-xs bg-green-100 hover:bg-green-200'
								onClick={() => {
									setDecorsByFloor((prev) => ({
										...prev,
										[floor]: prev[floor].map((x) =>
											x.id === activeId ? { ...x, rotationY: (x.rotationY || 0) + Math.PI / 8 } : x
										),
									}));
								}}
							>
								↷
							</button>
						</div>
					</div>

					{/* Z축 회전 */}
					<div className='flex flex-col items-center gap-1'>
						<div className='text-xs text-gray-600'>Z축</div>
						<div className='flex gap-1'>
							<button
								className='px-2 py-1 rounded text-xs bg-purple-100 hover:bg-purple-200'
								onClick={() => {
									setDecorsByFloor((prev) => ({
										...prev,
										[floor]: prev[floor].map((x) =>
											x.id === activeId ? { ...x, rotationZ: (x.rotationZ || 0) - Math.PI / 8 } : x
										),
									}));
								}}
							>
								↶
							</button>
							<button
								className='px-2 py-1 rounded text-xs bg-purple-100 hover:bg-purple-200'
								onClick={() => {
									setDecorsByFloor((prev) => ({
										...prev,
										[floor]: prev[floor].map((x) =>
											x.id === activeId ? { ...x, rotationZ: (x.rotationZ || 0) + Math.PI / 8 } : x
										),
									}));
								}}
							>
								↷
							</button>
						</div>
					</div>

					{/* 삭제 버튼 */}
					<button
						className='px-3 py-2 rounded-full text-sm bg-red-500 hover:bg-red-600 text-white'
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
