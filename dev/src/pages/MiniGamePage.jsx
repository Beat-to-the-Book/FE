import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import * as CANNON from "cannon";
import { pointsAPI } from "../lib/api/points";

const MiniGamePage = () => {
	const mountRef = useRef(null);
	const bookBodyRef = useRef(null);
	const resetTriggeredRef = useRef(false);
	const hasThrownRef = useRef(false);
	const insideShelfTimeRef = useRef(0);
	const successRef = useRef(false);
	const activeBookRef = useRef(null);
	const attemptedBookRef = useRef(null);
	const resultCooldownRef = useRef(false);
	const resultTimeoutRef = useRef(null);
	const cleanupSceneRef = useRef(null);

	const [bookData, setBookData] = useState(null);
	const [hasThrown, setHasThrown] = useState(false);
	const [availableBooks, setAvailableBooks] = useState([]);
	const [playableCount, setPlayableCount] = useState(0);
	const [result, setResult] = useState(null);
	const [noAvailableBook, setNoAvailableBook] = useState(false);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	const handleAttemptComplete = (wasSuccessful) => {
		const attempted = attemptedBookRef.current;
		if (!attempted || (!attempted.bookId && !attempted.id)) {
			return;
		}

		const attemptedBookId = attempted.bookId ?? attempted.id;

		setResult({
			type: wasSuccessful ? "success" : "fail",
			message: wasSuccessful
				? "성공! 포인트가 지급되는 중입니다..."
				: "아쉽지만 실패했습니다. 다시 도전해보세요!",
		});

		pointsAPI
			.throwBook({
				bookId: attemptedBookId,
				success: wasSuccessful,
			})
			.then((response) => {
				const data = response?.data || {};
				if (wasSuccessful) {
					setResult({
						type: "success",
						message: `성공! ${data.pointsAwarded ?? 5}점 획득!`,
						totalPoints: data.totalPoints,
					});
				} else {
					setResult({
						type: "fail",
						message: "아쉽지만 실패했습니다. 다시 도전해보세요!",
						totalPoints: data.totalPoints,
					});
				}
			})
			.catch((error) => {
				console.error("포인트 처리 실패:", error);
				if (wasSuccessful) {
					setResult({
						type: "success",
						message: "성공! 포인트 반영을 확인하지 못했습니다.",
					});
				} else {
					setResult({
						type: "fail",
						message: "실패 결과를 기록하지 못했습니다. 잠시 후 다시 시도해주세요.",
					});
				}
			})
			.finally(() => {
				setAvailableBooks((prev) => prev.filter((book) => book.bookId !== attemptedBookId));
				attemptedBookRef.current = null;
				successRef.current = false;
				resultCooldownRef.current = true;
				if (resultTimeoutRef.current) {
					clearTimeout(resultTimeoutRef.current);
				}
				resultTimeoutRef.current = setTimeout(() => {
					resultCooldownRef.current = false;
					setResult(null);
					resultTimeoutRef.current = null;
				}, 1200);
			});
	};

	// 0. 던질 수 있는 책 목록 조회
	useEffect(() => {
		const fetchBooks = async () => {
			setLoading(true);
			try {
				const response = await pointsAPI.getMyBooks();
				const books = Array.isArray(response.data) ? response.data : [];
				const playable = books.filter((book) => !book.thrown);
				setAvailableBooks(playable);
			} catch (err) {
				console.error("던질 수 있는 책 목록 조회 실패:", err);
				setAvailableBooks([]);
			} finally {
				setLoading(false);
			}
		};

		fetchBooks();
	}, []);

	useEffect(() => {
		if (loading) {
			return;
		}

		setPlayableCount(availableBooks.length);

		if (availableBooks.length === 0) {
			cleanupSceneRef.current?.();
			cleanupSceneRef.current = null;
			activeBookRef.current = null;
			setBookData(null);
			setNoAvailableBook(true);
			setResult(null);
			return;
		}

		setNoAvailableBook(false);
		setBookData((prev) => {
			if (prev) {
				const matching = availableBooks.find((book) => book.bookId === prev.bookId);
				if (matching) {
					activeBookRef.current = matching;
					return matching;
				}
			}
			const nextBook = availableBooks[Math.floor(Math.random() * availableBooks.length)];
			activeBookRef.current = nextBook;
			return nextBook;
		});
	}, [availableBooks, loading]);

	useEffect(() => {
		return () => {
			if (resultTimeoutRef.current) {
				clearTimeout(resultTimeoutRef.current);
				resultTimeoutRef.current = null;
			}
		};
	}, []);

	// 1~7. bookData 준비된 뒤 Three.js + cannon.js 초기화
	useEffect(() => {
		if (!bookData) return;

		// 1. Scene & Camera
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0xf5e6d3);
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 3, 20);

		// 2. Renderer
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.domElement.style.touchAction = "none";
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		const container = mountRef.current;
		container.innerHTML = "";
		container.appendChild(renderer.domElement);

		// 3. Lights
		scene.add(new THREE.AmbientLight(0xfff5e6, 0.4)); // 따뜻한 자연광

		// 햇살 효과를 위한 방향성 조명
		const dirLight = new THREE.DirectionalLight(0xfff5e6, 0.8);
		dirLight.position.set(5, 10, 5);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		scene.add(dirLight);

		// 책장 양쪽 스포트라이트 추가 (형광등 스타일)
		const leftSpotLight = new THREE.SpotLight(0xfff777, 5, 30, Math.PI / 3, 50, 1);
		leftSpotLight.position.set(-15, 0, -6);
		leftSpotLight.target.position.set(0, 0.1, -7);
		leftSpotLight.castShadow = true;
		leftSpotLight.shadow.mapSize.width = 2048;
		leftSpotLight.shadow.mapSize.height = 2048;
		leftSpotLight.shadow.bias = -0.0001;
		scene.add(leftSpotLight);
		scene.add(leftSpotLight.target);

		const rightSpotLight = new THREE.SpotLight(0xfff777, 5, 30, Math.PI / 3, 50, 1);
		rightSpotLight.position.set(15, 0, -6);
		rightSpotLight.target.position.set(0, 0.1, -7);
		rightSpotLight.castShadow = true;
		rightSpotLight.shadow.mapSize.width = 2048;
		rightSpotLight.shadow.mapSize.height = 2048;
		rightSpotLight.shadow.bias = -0.0001;
		scene.add(rightSpotLight);
		scene.add(rightSpotLight.target);

		// 따뜻한 분위기를 위한 포인트 라이트
		const pointLight = new THREE.PointLight(0xffd700, 0.5);
		pointLight.position.set(-5, 8, 5);
		scene.add(pointLight);

		// 4. Physics World
		const world = new CANNON.World();
		world.gravity.set(0, -9.82, 0);
		const defaultMat = new CANNON.Material();
		const contactMat = new CANNON.ContactMaterial(defaultMat, defaultMat, {
			friction: 0.4,
			restitution: 0.2,
		});
		world.defaultContactMaterial = contactMat;

		// 5. Floor
		const floorMat = new THREE.MeshStandardMaterial({
			color: 0x8b6b4e,
			roughness: 0.7,
			metalness: 0.1,
		});
		const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), floorMat);
		floorMesh.rotation.x = -Math.PI / 2;
		floorMesh.receiveShadow = true;
		scene.add(floorMesh);

		// 카페트 추가
		const carpetGeometry = new THREE.CircleGeometry(8, 64);
		const carpetMaterial = new THREE.MeshStandardMaterial({
			color: 0x9b7b5e, // 따뜻한 베이지 갈색
			roughness: 0.8,
			metalness: 0.0,
		});

		const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
		carpet.rotation.x = -Math.PI / 2;
		carpet.position.y = 0.02;
		carpet.position.z = 2;
		carpet.receiveShadow = true;
		carpet.castShadow = true;
		scene.add(carpet);

		// 러그 가장자리 장식 추가
		const rugBorderGeometry = new THREE.RingGeometry(7.8, 8, 64);
		const rugBorderMaterial = new THREE.MeshStandardMaterial({
			color: 0x7d6b4f, // 어두운 갈색 테두리
			roughness: 0.8,
			metalness: 0.0,
		});
		const rugBorder = new THREE.Mesh(rugBorderGeometry, rugBorderMaterial);
		rugBorder.rotation.x = -Math.PI / 2;
		rugBorder.position.y = 0.03;
		rugBorder.position.z = 2;
		rugBorder.receiveShadow = true;
		scene.add(rugBorder);

		const floorBody = new CANNON.Body({
			mass: 0,
			shape: new CANNON.Box(new CANNON.Vec3(20, 0.1, 20)),
			position: new CANNON.Vec3(0, -0.1, 0),
		});
		world.addBody(floorBody);

		// 6. Walls
		const wallMat = new THREE.MeshStandardMaterial({
			color: 0xf5e6d3,
			roughness: 0.5,
			metalness: 0.1,
		});
		const backWall = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 0.2), wallMat);
		backWall.position.set(0, 10, -10);
		backWall.receiveShadow = true;
		scene.add(backWall);
		const backBody = new CANNON.Body({ mass: 0, material: defaultMat });
		backBody.addShape(new CANNON.Box(new CANNON.Vec3(25, 10, 0.1)));
		backBody.position.set(0, 10, -10);
		world.addBody(backBody);

		const sideGeo = new THREE.BoxGeometry(0.2, 25, 25);
		[-13, 13].forEach((x) => {
			const mesh = new THREE.Mesh(sideGeo, wallMat);
			mesh.position.set(x, 10, 0);
			scene.add(mesh);
			const body = new CANNON.Body({ mass: 0, material: defaultMat });
			body.addShape(new CANNON.Box(new CANNON.Vec3(0.1, 10, 25)));
			body.position.set(x, 10, 0);
			world.addBody(body);
		});

		// 7. Book 생성 & 커버 텍스처 적용
		const bookWidth = 0.2;
		const bookHeight = 1.5;
		const bookDepth = 1;
		const initialBookPos = new THREE.Vector3(0, bookHeight / 2, 10);
		const loader = new THREE.TextureLoader();
		const fallbackMat = new THREE.MeshStandardMaterial({
			color: 0xdddddd,
		});
		const materials = [
			bookData.backCoverImageUrl
				? new THREE.MeshStandardMaterial({
						map: loader.load(bookData.backCoverImageUrl),
				  })
				: new THREE.MeshStandardMaterial({ color: 0x8b4513 }), // 갈색 뒷표지
			// +X (오른쪽 페이지)
			bookData.frontCoverImageUrl
				? new THREE.MeshStandardMaterial({
						map: loader.load(bookData.frontCoverImageUrl),
				  })
				: new THREE.MeshStandardMaterial({ color: 0x8b4513 }), // 갈색 앞표지
			new THREE.MeshStandardMaterial({ color: 0xffffff }), // 흰색 상단
			new THREE.MeshStandardMaterial({ color: 0xffffff }), // 흰색 하단
			bookData.leftCoverImageUrl
				? new THREE.MeshStandardMaterial({
						map: loader.load(bookData.leftCoverImageUrl),
				  })
				: new THREE.MeshStandardMaterial({ color: 0x8b4513 }), // 갈색 스파인
			new THREE.MeshStandardMaterial({ color: 0xffffff }), // 흰색 페이지
		];
		const bookGeo = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
		const bookMesh = new THREE.Mesh(bookGeo, materials);
		bookMesh.position.copy(initialBookPos);
		scene.add(bookMesh);
		const bookShape = new CANNON.Box(new CANNON.Vec3(bookWidth / 2, bookHeight / 2, bookDepth / 2));
		const bookBody = new CANNON.Body({
			mass: 1,
			shape: bookShape,
			position: new CANNON.Vec3(initialBookPos.x, initialBookPos.y, initialBookPos.z),
		});
		bookBody.linearDamping = 0.01;
		bookBody.angularDamping = 0.4;
		world.addBody(bookBody);
		bookBodyRef.current = bookBody;

		// 8. Shelf 생성 & 물리 바디
		const shelfWidth = 8;
		const shelfHeight = 10;
		const shelfDepth = 2;
		const plankThickness = 0.2;
		const shelfMat = new THREE.MeshStandardMaterial({
			color: 0x8b6b4e,
			roughness: 0.6,
			metalness: 0.2,
		});
		const shelfGroup = new THREE.Group();

		const backShelf = new THREE.Mesh(
			new THREE.BoxGeometry(shelfWidth, shelfHeight, plankThickness),
			shelfMat
		);
		backShelf.position.set(0, shelfHeight / 2, -shelfDepth / 2);
		shelfGroup.add(backShelf);

		[-shelfWidth / 2, shelfWidth / 2].forEach((x) => {
			const sideShelf = new THREE.Mesh(
				new THREE.BoxGeometry(plankThickness, shelfHeight, shelfDepth),
				shelfMat
			);
			sideShelf.position.set(x, shelfHeight / 2, 0);
			shelfGroup.add(sideShelf);
		});

		for (let i = 0; i < 4; i++) {
			const plank = new THREE.Mesh(
				new THREE.BoxGeometry(shelfWidth, plankThickness, shelfDepth),
				shelfMat
			);
			const y = 0.1 + i * ((shelfHeight - plankThickness) / 3);
			plank.position.set(0, y, 0);
			shelfGroup.add(plank);
		}
		shelfGroup.position.set(0, 0, -8);
		scene.add(shelfGroup);

		const shelfBody = new CANNON.Body({ mass: 0, material: defaultMat });
		shelfBody.position.set(0, 0, -8);
		// 뒤판
		shelfBody.addShape(
			new CANNON.Box(new CANNON.Vec3(shelfWidth / 2, shelfHeight / 2, plankThickness / 2)),
			new CANNON.Vec3(0, shelfHeight / 2, -shelfDepth / 2)
		);
		// 측판
		shelfBody.addShape(
			new CANNON.Box(new CANNON.Vec3(plankThickness / 2, shelfHeight / 2, shelfDepth / 2)),
			new CANNON.Vec3(-shelfWidth / 2, shelfHeight / 2, 0)
		);
		shelfBody.addShape(
			new CANNON.Box(new CANNON.Vec3(plankThickness / 2, shelfHeight / 2, shelfDepth / 2)),
			new CANNON.Vec3(shelfWidth / 2, shelfHeight / 2, 0)
		);
		// 선반 판들
		for (let i = 0; i < 4; i++) {
			const y = 0.1 + i * ((shelfHeight - plankThickness) / 3);
			shelfBody.addShape(
				new CANNON.Box(new CANNON.Vec3(shelfWidth / 2, plankThickness / 2, shelfDepth / 2)),
				new CANNON.Vec3(0, y, 0)
			);
		}
		world.addBody(shelfBody);

		// 9. Ceiling
		const ceilingMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(50, 50),
			new THREE.MeshStandardMaterial({
				color: 0xf5e6d3,
				roughness: 0.5,
				metalness: 0.1,
			})
		);
		ceilingMesh.rotation.x = Math.PI / 2;
		ceilingMesh.position.set(0, 20, 0);
		ceilingMesh.receiveShadow = true;
		scene.add(ceilingMesh);
		const ceilingBody = new CANNON.Body({
			mass: 0,
			material: defaultMat,
			shape: new CANNON.Box(new CANNON.Vec3(25, 0.1, 25)),
			position: new CANNON.Vec3(0, 20, 0),
		});
		world.addBody(ceilingBody);

		// 10. Drag 이벤트 및 포물선 예측
		let dragging = false;
		let dragStart = null;
		let arrowLine = null;
		const scaleFactor = 0.1;
		const baseUpward = 5;

		const onPointerDown = (e) => {
			if (hasThrownRef.current || !activeBookRef.current || resultCooldownRef.current) {
				return;
			}
			if (resultTimeoutRef.current) {
				clearTimeout(resultTimeoutRef.current);
				resultTimeoutRef.current = null;
			}
			setResult(null);
			attemptedBookRef.current = activeBookRef.current;

			dragging = true;
			dragStart = { x: e.clientX, y: e.clientY };
			insideShelfTimeRef.current = 0;
			successRef.current = false;
			if (!arrowLine) {
				const geom = new THREE.BufferGeometry().setFromPoints([
					new THREE.Vector3(),
					new THREE.Vector3(),
				]);
				arrowLine = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0xffff00 }));
				scene.add(arrowLine);
			}
		};

		const onPointerMove = (e) => {
			if (!dragging || !dragStart || hasThrownRef.current) return;
			const dx = e.clientX - dragStart.x;
			const dy = e.clientY - dragStart.y;
			const vX = scaleFactor * dx;
			const vY = scaleFactor * -dy + baseUpward;
			const L = Math.sqrt(dx * dx + dy * dy);
			const vZ = -scaleFactor * L;

			const points = [];
			const numPoints = 30;
			const totalTime = 2;
			const dt = totalTime / numPoints;
			for (let i = 0; i <= numPoints; i++) {
				const t = i * dt;
				const pos = new THREE.Vector3()
					.copy(initialBookPos)
					.add(new THREE.Vector3(vX, vY, vZ).multiplyScalar(t))
					.add(new THREE.Vector3(0, -9.82, 0).multiplyScalar(0.5 * t * t));
				points.push(pos);
			}
			if (arrowLine) {
				arrowLine.geometry.dispose();
				arrowLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
			}
		};

		const onPointerUp = (e) => {
			if (!dragging || !dragStart || hasThrownRef.current) return;
			dragging = false;
			if (arrowLine) {
				scene.remove(arrowLine);
				arrowLine = null;
			}
			const dx = e.clientX - dragStart.x;
			const dy = e.clientY - dragStart.y;
			const vX = scaleFactor * dx;
			const vY = scaleFactor * -dy + baseUpward;
			const L = Math.sqrt(dx * dx + dy * dy);
			const vZ = -scaleFactor * L;

			// 회전 설정
			const velVec = new THREE.Vector3(vX, vY, vZ);
			if (velVec.length() > 0.001) {
				const look = bookMesh.position.clone().add(velVec);
				const mat4 = new THREE.Matrix4().lookAt(
					bookMesh.position,
					look,
					new THREE.Vector3(0, 1, 0)
				);
				const quat = new THREE.Quaternion().setFromRotationMatrix(mat4);
				bookBody.quaternion.set(quat.x, quat.y, quat.z, quat.w);
			}

			// 던지기
			if (bookBodyRef.current) {
				bookBodyRef.current.wakeUp();
				bookBodyRef.current.velocity.set(vX, vY, vZ);
				hasThrownRef.current = true;
				setHasThrown(true);

				if (!resetTriggeredRef.current) {
					resetTriggeredRef.current = true;
					setTimeout(() => {
						const wasSuccessful = successRef.current;
						handleAttemptComplete(wasSuccessful);

						// 리셋
						bookBody.position.set(initialBookPos.x, initialBookPos.y, initialBookPos.z);
						bookBody.velocity.set(0, 0, 0);
						bookBody.angularVelocity.set(0, 0, 0);
						bookBody.quaternion.set(0, 0, 0, 1);
						hasThrownRef.current = false;
						setHasThrown(false);

						insideShelfTimeRef.current = 0;
						successRef.current = false;
						resetTriggeredRef.current = false;
					}, 4000);
				}
			}
			dragStart = null;
		};

		renderer.domElement.addEventListener("pointerdown", onPointerDown);
		renderer.domElement.addEventListener("pointermove", onPointerMove);
		renderer.domElement.addEventListener("pointerup", onPointerUp);

		// 11. 애니메이션 루프 & 성공 판정
		const clock = new THREE.Clock();
		const animate = () => {
			requestAnimationFrame(animate);
			const delta = clock.getDelta();
			world.step(1 / 60, delta, 3);

			// 물리 → 메쉬
			bookMesh.position.copy(bookBody.position);
			const vel = bookBody.velocity;
			if (hasThrown && vel.length() > 0.1) {
				const dir = new THREE.Vector3(vel.x, vel.y, vel.z).normalize();
				bookMesh.lookAt(bookMesh.position.clone().add(dir));
			} else {
				bookMesh.quaternion.copy(bookBody.quaternion);
			}

			// 성공 판정
			if (!successRef.current && hasThrownRef.current) {
				const pos = bookBody.position;
				const tolerance = 0.15;
				const xMin = -shelfWidth / 2 - tolerance;
				const xMax = shelfWidth / 2 + tolerance;
				const y1 = 0;
				const y2 = 0.1 + (shelfHeight - plankThickness);
				const yMin = y1 + plankThickness / 2 - tolerance;
				const yMax = y2 - plankThickness / 2 + tolerance;
				const zMin = -7.8 - shelfDepth / 2 - tolerance;
				const zMax = -7.8 + shelfDepth / 2 + tolerance;

				if (
					pos.x > xMin &&
					pos.x < xMax &&
					pos.y > yMin &&
					pos.y < yMax &&
					pos.z > zMin &&
					pos.z < zMax
				) {
					insideShelfTimeRef.current += delta;
					if (insideShelfTimeRef.current >= 1) {
						successRef.current = true;
						setResult((prev) =>
							prev?.type === "success"
								? prev
								: {
										type: "success",
										message: "성공! 포인트가 지급되는 중입니다...",
								  }
						);
					}
				} else {
					insideShelfTimeRef.current = 0;
				}
			}

			// 카메라
			if (hasThrownRef.current) {
				const targetCamPos = new THREE.Vector3(
					bookMesh.position.x,
					bookMesh.position.y + 3,
					bookMesh.position.z + 5
				);
				camera.position.lerp(targetCamPos, 0.1);
				camera.lookAt(bookMesh.position);
			} else {
				const defaultCamPos = new THREE.Vector3(0, 3, 15);
				camera.position.lerp(defaultCamPos, 0.1);
				camera.lookAt(new THREE.Vector3(0, 0, 0));
			}

			renderer.render(scene, camera);
		};
		animate();

		// 12. 리사이즈 & 클린업
		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener("resize", handleResize);

		const cleanup = () => {
			window.removeEventListener("resize", handleResize);
			renderer.domElement.removeEventListener("pointerdown", onPointerDown);
			renderer.domElement.removeEventListener("pointermove", onPointerMove);
			renderer.domElement.removeEventListener("pointerup", onPointerUp);
			renderer.dispose();
			const gl = renderer.getContext();
			if (gl && gl.getExtension("WEBGL_lose_context")) {
				gl.getExtension("WEBGL_lose_context").loseContext();
			}
			if (mountRef.current?.contains(renderer.domElement)) {
				mountRef.current.removeChild(renderer.domElement);
			}
		};

		cleanupSceneRef.current = cleanup;

		return () => {
			cleanupSceneRef.current = null;
			cleanup();
		};
	}, [bookData]);

	// 로딩 상태
	if (loading) {
		return (
			<div className='w-full h-full flex items-center justify-center text-gray-600 text-lg'>
				로딩 중...
			</div>
		);
	}

	if (noAvailableBook) {
		return (
			<div className='w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-6 text-center'>
				<div className='w-full max-w-xl bg-white shadow-2xl rounded-3xl border border-gray-100 px-10 py-12 flex flex-col items-center space-y-6'>
					<div className='w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl text-primary'>
						📚
					</div>
					<div className='space-y-3'>
						<h2 className='text-2xl font-bold text-gray-900'>던질 수 있는 책이 없어요</h2>
						<p className='text-gray-600 leading-relaxed'>
							이미 던져본 책은 다시 사용할 수 없어요. 새로운 도서를 구매하거나 대여해서 다시 한 번
							도전해보세요!
						</p>
						<p className='text-sm font-semibold text-primary'>현재 던질 수 있는 책: 0권</p>
					</div>
					<div className='w-full grid gap-3 sm:grid-cols-2'>
						<button
							onClick={() => navigate("/recommend")}
							className='w-full px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all shadow'
						>
							추천 도서 보러가기
						</button>
						<button
							onClick={() => navigate("/")}
							className='w-full px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all'
						>
							다른 책 찾기
						</button>
					</div>
				</div>
			</div>
		);
	}

	// 렌더링
	return (
		<div className='fixed inset-0 top-16'>
			<div ref={mountRef} className='w-full h-full' />
			<div className='absolute top-4 left-4 text-white text-lg z-10'>
				마우스를 드래그하여 책을 던지세요.
			</div>
			<div className='absolute top-4 right-4 bg-black/60 text-white text-sm sm:text-base px-4 py-2 rounded-xl shadow-lg z-10'>
				던질 수 있는 책: <span className='font-semibold'>{playableCount}</span>권
			</div>
			{result && (
				<div className='absolute inset-0 flex items-center justify-center bg-black/60 z-10 px-6 text-center'>
					<div
						className={`bg-white px-6 py-5 rounded-2xl shadow-2xl text-2xl font-semibold ${
							result.type === "success" ? "text-green-600" : "text-red-500"
						}`}
					>
						{result.type === "success" ? "🎉 " : "💥 "}
						{result.message}
						{typeof result.totalPoints === "number" && (
							<p className='mt-2 text-base text-gray-600'>현재 포인트: {result.totalPoints}P</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default MiniGamePage;
