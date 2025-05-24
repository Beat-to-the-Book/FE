// src/components/ThreeScene.tsx

"use client";
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { World, Body, Box, Vec3, Material, ContactMaterial } from "cannon-es";

const Game: React.FC = () => {
	const mountRef = useRef<HTMLDivElement>(null);
	const bookBodyRef = useRef<Body | null>(null);
	const resetTriggeredRef = useRef<boolean>(false);
	const hasThrownRef = useRef<boolean>(false);
	// ✅ 추가: 선반 안에 머문 시간을 추적
	const insideShelfTimeRef = useRef<number>(0);
	// ✅ 추가: 성공 상태를 추적
	const successRef = useRef<boolean>(false);

	const [hasThrown, setHasThrown] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>(false); // ✅ 추가: 성공 상태를 UI에 표시

	// TODO: 성공 범위 표시

	useEffect(() => {
		// --------------------------
		// 1. Three.js 기본 세팅
		// --------------------------
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0xf0e6d2);
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 3, 20);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.domElement.style.touchAction = "none";
		mountRef.current?.appendChild(renderer.domElement);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
		scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
		directionalLight.position.set(0, 8, 5);
		scene.add(directionalLight);

		// --------------------------
		// 2. cannon-es 물리 세계 세팅
		// --------------------------
		const world = new World({ gravity: new Vec3(0, -9.82, 0) });

		const defaultMat = new Material("default");
		const contactMat = new ContactMaterial(defaultMat, defaultMat, {
			friction: 0.4,
			restitution: 0.2,
		});
		world.defaultContactMaterial = contactMat;

		// 바닥
		const floorMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
		const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), floorMat);
		floorMesh.rotation.x = -Math.PI / 2;
		scene.add(floorMesh);
		const floorBody = new Body({
			mass: 0,
			shape: new Box(new Vec3(25, 0.1, 25)),
			position: new Vec3(0, -0.1, 0),
		});
		world.addBody(floorBody);

		// 벽
		const wallMat3 = new THREE.MeshStandardMaterial({ color: 0xd3cbc0 });
		const wallGeo = new THREE.BoxGeometry(50, 50, 0.2);
		const backWall = new THREE.Mesh(wallGeo, wallMat3);
		backWall.position.set(0, 10, -10);
		scene.add(backWall);
		const backBody = new Body({ mass: 0, material: defaultMat });
		backBody.addShape(new Box(new Vec3(25, 10, 0.1)));
		backBody.position.set(0, 10, -10);
		world.addBody(backBody);

		const sideGeo = new THREE.BoxGeometry(0.2, 25, 25);
		const leftWall = new THREE.Mesh(sideGeo, wallMat3);
		leftWall.position.set(-13, 10, 0);
		scene.add(leftWall);
		const leftBody = new Body({ mass: 0, material: defaultMat });
		leftBody.addShape(new Box(new Vec3(0.1, 10, 25)));
		leftBody.position.set(-13, 10, 0);
		world.addBody(leftBody);

		const rightWall = new THREE.Mesh(sideGeo, wallMat3);
		rightWall.position.set(13, 10, 0);
		scene.add(rightWall);
		const rightBody = new Body({ mass: 0, material: defaultMat });
		rightBody.addShape(new Box(new Vec3(0.1, 10, 25)));
		rightBody.position.set(13, 10, 0);
		world.addBody(rightBody);

		// --------------------------
		// 3. 책 생성
		// --------------------------
		const bookWidth = 0.2;
		const bookHeight = 1.5;
		const bookDepth = 1;
		const initialBookPos = new THREE.Vector3(0, bookHeight / 2, 10);

		const coverMat = new THREE.MeshStandardMaterial({ color: 0x3b5998 });
		const pageMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
		const bookMaterial = [coverMat, coverMat, pageMat, pageMat, coverMat, pageMat];
		const bookGeometry = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
		const bookMesh = new THREE.Mesh(bookGeometry, bookMaterial);
		bookMesh.position.copy(initialBookPos);
		scene.add(bookMesh);

		const bookShape = new Box(new Vec3(bookWidth / 2, bookHeight / 2, bookDepth / 2));
		const bookBody = new Body({
			mass: 1,
			shape: bookShape,
			position: new Vec3(initialBookPos.x, initialBookPos.y, initialBookPos.z),
		});
		bookBody.linearDamping = 0.01;
		bookBody.angularDamping = 0.4;
		world.addBody(bookBody);
		bookBodyRef.current = bookBody;

		// --------------------------
		// 4. 책장 생성 & 물리 바디
		// --------------------------
		const shelfWidth = 8;
		const shelfHeight = 10;
		const shelfDepth = 2;
		const plankThickness = 0.2;
		const shelfGroup = new THREE.Group();
		const brownMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

		// 뒷면 판
		const backBookCaseGeo = new THREE.BoxGeometry(shelfWidth, shelfHeight, plankThickness);
		const back = new THREE.Mesh(backBookCaseGeo, brownMat);
		back.position.set(0, shelfHeight / 2, -shelfDepth / 2);
		shelfGroup.add(back);

		// 측면 판
		const sideBookCaseGeo = new THREE.BoxGeometry(plankThickness, shelfHeight, shelfDepth);
		const leftSide = new THREE.Mesh(sideBookCaseGeo, brownMat);
		leftSide.position.set(-shelfWidth / 2, shelfHeight / 2, 0);
		shelfGroup.add(leftSide);
		const rightSide = new THREE.Mesh(sideBookCaseGeo, brownMat);
		rightSide.position.set(shelfWidth / 2, shelfHeight / 2, 0);
		shelfGroup.add(rightSide);

		// 선반 판(바닥, 중간 2개, 상단)
		const plankBookCaseGeo = new THREE.BoxGeometry(shelfWidth, plankThickness, shelfDepth);
		[0, 1, 2, 3].forEach((i) => {
			const y = 0.1 + i * ((shelfHeight - plankThickness) / 3);
			const plank = new THREE.Mesh(plankBookCaseGeo, brownMat);
			plank.position.set(0, y, 0);
			shelfGroup.add(plank);
		});
		shelfGroup.position.set(0, 0, -5);
		scene.add(shelfGroup);

		// ✅ 책장 물리 바디
		const shelfBody = new Body({ mass: 0, material: defaultMat });
		shelfBody.position.set(0, 0, -5);
		// 뒤판
		shelfBody.addShape(
			new Box(new Vec3(shelfWidth / 2, shelfHeight / 2, plankThickness / 2)),
			new Vec3(0, shelfHeight / 2, -shelfDepth / 2)
		);
		// 측판들
		shelfBody.addShape(
			new Box(new Vec3(plankThickness / 2, shelfHeight / 2, shelfDepth / 2)),
			new Vec3(-shelfWidth / 2, shelfHeight / 2, 0)
		);
		shelfBody.addShape(
			new Box(new Vec3(plankThickness / 2, shelfHeight / 2, shelfDepth / 2)),
			new Vec3(shelfWidth / 2, shelfHeight / 2, 0)
		);
		// 선반 판들
		for (let i = 0; i < 4; i++) {
			const y = 0.1 + i * ((shelfHeight - plankThickness) / 3);
			shelfBody.addShape(
				new Box(new Vec3(shelfWidth / 2, plankThickness / 2, shelfDepth / 2)),
				new Vec3(0, y, 0)
			);
		}
		world.addBody(shelfBody);

		// ✅ 천장 메쉬 & 물리 바디
		const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
		const ceilingMesh = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), ceilingMat);
		ceilingMesh.rotation.x = Math.PI / 2;
		ceilingMesh.position.set(0, 20, 0);
		scene.add(ceilingMesh);
		const ceilingBody = new Body({
			mass: 0,
			material: defaultMat,
			shape: new Box(new Vec3(25, 0.1, 25)),
			position: new Vec3(0, 20, 0),
		});
		world.addBody(ceilingBody);

		// --------------------------
		// 5. 드래그 이벤트
		// --------------------------
		let dragging = false;
		let dragStart: { x: number; y: number } | null = null;
		let arrowLine: THREE.Line | null = null;
		const scaleFactor = 0.1;
		const baseUpward = 5;

		const onPointerDown = (event: PointerEvent) => {
			if (hasThrownRef.current) return;
			dragging = true;
			dragStart = { x: event.clientX, y: event.clientY };
			if (!arrowLine) {
				const points = [new THREE.Vector3(), new THREE.Vector3()];
				const geometry = new THREE.BufferGeometry().setFromPoints(points);
				const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
				arrowLine = new THREE.Line(geometry, material);
				scene.add(arrowLine);
			}
		};

		const onPointerMove = (event: PointerEvent) => {
			if (!dragging || !dragStart || hasThrownRef.current) return;
			const dx = event.clientX - dragStart.x;
			const dy = event.clientY - dragStart.y;
			const vX = scaleFactor * dx;
			const vY = scaleFactor * -dy + baseUpward;
			const L = Math.sqrt(dx * dx + dy * dy);
			const vZ = -scaleFactor * L;

			const points: THREE.Vector3[] = [];
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
				const geometry = new THREE.BufferGeometry().setFromPoints(points);
				arrowLine.geometry.dispose();
				arrowLine.geometry = geometry;
			}
		};

		const onPointerUp = (event: PointerEvent) => {
			if (!dragging || !dragStart || hasThrownRef.current) return;
			dragging = false;
			if (arrowLine) {
				scene.remove(arrowLine);
				arrowLine = null;
			}
			const dx = event.clientX - dragStart.x;
			const dy = event.clientY - dragStart.y;
			const vX = scaleFactor * dx;
			const vY = scaleFactor * -dy + baseUpward;
			const L = Math.sqrt(dx * dx + dy * dy);
			const vZ = -scaleFactor * L;

			// 초기 회전 설정
			const velocityVector = new THREE.Vector3(vX, vY, vZ);
			if (velocityVector.length() > 0.001) {
				const lookAtPos = bookMesh.position.clone().add(velocityVector);
				const m = new THREE.Matrix4().lookAt(
					bookMesh.position,
					lookAtPos,
					new THREE.Vector3(0, 1, 0)
				);
				const quat = new THREE.Quaternion().setFromRotationMatrix(m);
				bookBody.quaternion.set(quat.x, quat.y, quat.z, quat.w);
			}

			// 던지기 적용
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

						// ✅ 선반 성공 상태 리셋
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

		// --------------------------
		// 6. 애니메이션 루프
		// --------------------------
		const clock = new THREE.Clock();
		const animate = () => {
			requestAnimationFrame(animate);
			const delta = clock.getDelta();
			world.step(1 / 60, delta, 3);

			// 메쉬와 물리 동기화
			bookMesh.position.copy(bookBody.position as any);
			const vel = bookBody.velocity;
			if (hasThrown && vel.length() > 0.1) {
				const dir = new THREE.Vector3(vel.x, vel.y, vel.z).normalize();
				bookMesh.lookAt(bookMesh.position.clone().add(dir));
			} else {
				bookMesh.quaternion.copy(bookBody.quaternion as any);
			}

			// 📌 ✅ 책장 가운데 선반 성공 판정
			if (!successRef.current && hasThrownRef.current) {
				const pos = bookBody.position;
				// x 범위
				const xMin = -shelfWidth / 2;
				const xMax = shelfWidth / 2;
				// y 범위 (1번째와 2번째 중간 선반 사이)
				const y1 = 0.1 + 1 * ((shelfHeight - plankThickness) / 3);
				const y2 = 0.1 + 2 * ((shelfHeight - plankThickness) / 3);
				const yMin = y1 + plankThickness / 2;
				const yMax = y2 - plankThickness / 2;
				// z 범위
				const zMin = -5 - shelfDepth / 2;
				const zMax = -5 + shelfDepth / 2;

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

			// 카메라 움직임
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

		// --------------------------
		// 7. 리사이즈 & 클린업
		// --------------------------
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
	}, []);

	return (
		<div>
			<div className='w-full h-full relative'>
				<div ref={mountRef} className='w-full h-full' />
				<div className='absolute top-4 left-4 text-white text-lg'>
					마우스를 드래그하여 책을 던지세요.
				</div>
				{success && (
					<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
						<div className='bg-white text-black text-2xl px-6 py-4 rounded-lg shadow-lg'>
							🎉 성공! 책이 선반에 안착했습니다!
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Game;

// TODO: /purchase/history, /rental/history 에서 이미지 가져와 책 표지로 사용하기
