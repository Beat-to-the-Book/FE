import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import * as CANNON from "cannon";
import { gameAPI } from "../lib/api/game";

const MiniGamePage = () => {
	const mountRef = useRef(null);
	const bookBodyRef = useRef(null);
	const resetTriggeredRef = useRef(false);
	const hasThrownRef = useRef(false);
	const insideShelfTimeRef = useRef(0);
	const successRef = useRef(false);

	const [bookData, setBookData] = useState(null);
	const [hasThrown, setHasThrown] = useState(false);
	const [success, setSuccess] = useState(false);

	// 0. 구매 내역 + 대여 내역 합쳐서 랜덤 책 하나 선택
	useEffect(() => {
		Promise.all([gameAPI.getPurchaseHistory(), gameAPI.getRentalHistory()])
			.then(([purchases, rentals]) => {
				const combined = [...purchases.data, ...rentals.data];
				const valid = combined.filter(
					(item) => item.frontCoverImageUrl || item.backCoverImageUrl || item.leftCoverImageUrl
				);
				if (valid.length > 0) {
					const randomBook = valid[Math.floor(Math.random() * valid.length)];
					setBookData(randomBook);
				} else {
					console.warn("표지 이미지가 있는 책이 없습니다. 기본 컬러로 렌더링합니다.");
				}
			})
			.catch((err) => console.error("책 정보 불러오기 실패:", err));
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
		scene.add(new THREE.AmbientLight(0xfff5e6, 0.4));
		const dirLight = new THREE.DirectionalLight(0xfff5e6, 0.8);
		dirLight.position.set(5, 10, 5);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		scene.add(dirLight);

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
			if (hasThrownRef.current) return;
			dragging = true;
			dragStart = { x: e.clientX, y: e.clientY };
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
						// 리셋
						bookBody.position.set(initialBookPos.x, initialBookPos.y, initialBookPos.z);
						bookBody.velocity.set(0, 0, 0);
						bookBody.angularVelocity.set(0, 0, 0);
						bookBody.quaternion.set(0, 0, 0, 1);
						hasThrownRef.current = false;
						setHasThrown(false);

						insideShelfTimeRef.current = 0;
						successRef.current = false;
						setSuccess(false);

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
				const xMin = -shelfWidth / 2;
				const xMax = shelfWidth / 2;
				const y1 = 0;
				const y2 = 0.1 + (shelfHeight - plankThickness);
				const yMin = y1 + plankThickness / 2;
				const yMax = y2 - plankThickness / 2;
				const zMin = -8 - shelfDepth / 2;
				const zMax = -8 + shelfDepth / 2;

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
						setSuccess(true);
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

		return () => {
			window.removeEventListener("resize", handleResize);
			renderer.domElement.removeEventListener("pointerdown", onPointerDown);
			renderer.domElement.removeEventListener("pointermove", onPointerMove);
			renderer.domElement.removeEventListener("pointerup", onPointerUp);
			renderer.dispose();
			const gl = renderer.getContext();
			if (gl && gl.getExtension("WEBGL_lose_context")) {
				gl.getExtension("WEBGL_lose_context").loseContext();
			}
			mountRef.current?.removeChild(renderer.domElement);
		};
	}, [bookData]);

	// 로딩 상태
	if (!bookData) {
		return <div className='w-full h-full flex items-center justify-center'>로딩 중...</div>;
	}

	// 렌더링
	return (
		<div className='fixed inset-0 top-16'>
			<div ref={mountRef} className='w-full h-full' />
			<div className='absolute top-4 left-4 text-white text-lg z-10'>
				마우스를 드래그하여 책을 던지세요.
			</div>
			{success && (
				<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10'>
					<div className='bg-white text-black text-2xl px-6 py-4 rounded-lg shadow-lg'>
						🎉 성공! 책이 선반에 안착했습니다!
					</div>
				</div>
			)}
		</div>
	);
};

export default MiniGamePage;
