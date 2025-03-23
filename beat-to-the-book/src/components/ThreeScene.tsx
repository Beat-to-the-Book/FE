"use client";
// pages/index.tsx
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { World, Body, Box, Vec3 } from "cannon-es";

const Game: React.FC = () => {
	const mountRef = useRef<HTMLDivElement>(null);
	const bookBodyRef = useRef<Body | null>(null);
	const resetTriggeredRef = useRef<boolean>(false);
	const hasThrownRef = useRef<boolean>(false);
	const [hasThrown, setHasThrown] = useState<boolean>(false);
	const [score, setScore] = useState<number>(0);

	useEffect(() => {
		// --------------------------
		// 1. Three.js 기본 세팅
		// --------------------------
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 5, 15);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.domElement.style.touchAction = "none";
		mountRef.current?.appendChild(renderer.domElement);

		// 조명 추가
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(10, 10, 10);
		scene.add(directionalLight);

		// --------------------------
		// 2. cannon‑es 물리 세계 세팅
		// --------------------------
		const world = new World({
			gravity: new Vec3(0, -9.82, 0),
		});

		const groundGeometry = new THREE.PlaneGeometry(50, 50);
		const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x00684a });
		const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
		groundMesh.rotation.x = -Math.PI / 2;
		scene.add(groundMesh);

		const groundBody = new Body({
			mass: 0,
			shape: new Box(new Vec3(25, 0.1, 25)),
			position: new Vec3(0, -0.1, 0),
		});
		world.addBody(groundBody);

		// --------------------------
		// 3. 책(던져질 객체) 생성
		// --------------------------
		const bookWidth = 0.2;
		const bookHeight = 1.5;
		const bookDepth = 1;
		const initialBookPos = new THREE.Vector3(0, bookHeight / 2, 10);

		const bookGeometry = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
		const bookMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
		const bookMesh = new THREE.Mesh(bookGeometry, bookMaterial);
		bookMesh.position.copy(initialBookPos);
		scene.add(bookMesh);

		const bookShape = new Box(new Vec3(bookWidth / 2, bookHeight / 2, bookDepth / 2));
		const bookBody = new Body({
			mass: 1,
			shape: bookShape,
			position: new Vec3(initialBookPos.x, initialBookPos.y, initialBookPos.z),
		});
		world.addBody(bookBody);
		bookBodyRef.current = bookBody;

		// --------------------------
		// 4. 책장(타겟 영역) 생성
		// --------------------------
		const shelfWidth = 6;
		const shelfHeight = 8;
		const shelfDepth = 2;
		const shelfGeometry = new THREE.BoxGeometry(shelfWidth, shelfHeight, shelfDepth);
		const shelfMaterial = new THREE.MeshStandardMaterial({
			color: 0x00ff00,
			opacity: 0.5,
			transparent: true,
		});
		const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
		shelfMesh.position.set(0, shelfHeight / 2 + 0.2, 0);
		scene.add(shelfMesh);
		const shelfBounds = {
			xMin: shelfMesh.position.x - shelfWidth / 2,
			xMax: shelfMesh.position.x + shelfWidth / 2,
			yMin: shelfMesh.position.y - shelfHeight / 2,
			yMax: shelfMesh.position.y + shelfHeight / 2,
			zMin: shelfMesh.position.z - shelfDepth / 2,
			zMax: shelfMesh.position.z + shelfDepth / 2,
		};

		// --------------------------
		// 5. 드래그 이벤트 및 포물선 예측 화살표
		// --------------------------
		let dragging = false;
		let dragStart: { x: number; y: number } | null = null;
		let arrowLine: THREE.Line | null = null;
		// scaleFactor: 드래그 길이에 곱할 값, baseUpward: 던질 때 항상 부여할 상승 성분
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
			const currentPos = { x: event.clientX, y: event.clientY };
			const dx = currentPos.x - dragStart.x;
			const dy = currentPos.y - dragStart.y;
			const vX = scaleFactor * dx;
			const vY = scaleFactor * -dy + baseUpward;
			const L = Math.sqrt(dx * dx + dy * dy);
			const vZ = -scaleFactor * L;

			const initialPos = initialBookPos.clone();
			const gravity = new THREE.Vector3(0, -9.82, 0);
			const points: THREE.Vector3[] = [];
			const numPoints = 30;
			const totalTime = 2;
			const dt = totalTime / numPoints;
			for (let i = 0; i <= numPoints; i++) {
				const t = i * dt;
				const pos = new THREE.Vector3()
					.copy(initialPos)
					.add(new THREE.Vector3(vX, vY, vZ).multiplyScalar(t))
					.add(gravity.clone().multiplyScalar(0.5 * t * t));
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
			const endPos = { x: event.clientX, y: event.clientY };
			const dx = endPos.x - dragStart.x;
			const dy = endPos.y - dragStart.y;
			const vX = scaleFactor * dx;
			const vY = scaleFactor * -dy + baseUpward;
			const L = Math.sqrt(dx * dx + dy * dy);
			const vZ = -scaleFactor * L;

			// 책의 방향 설정
			const velocityVector = new THREE.Vector3(vX, vY, vZ);
			if (velocityVector.length() > 0.001) {
				const lookAtPos = new THREE.Vector3().copy(bookMesh.position).add(velocityVector);
				const m = new THREE.Matrix4().lookAt(
					bookMesh.position,
					lookAtPos,
					new THREE.Vector3(0, 1, 0)
				);
				const quat = new THREE.Quaternion().setFromRotationMatrix(m);
				bookBody.quaternion.set(quat.x, quat.y, quat.z, quat.w);
			}

			if (bookBodyRef.current) {
				bookBodyRef.current.wakeUp();
				bookBodyRef.current.velocity.set(vX, vY, vZ);
				hasThrownRef.current = true;
				setHasThrown(true);
				// 던진 후 리셋 전까지는 새 입력을 받지 않음 (3초 후 리셋)
				if (!resetTriggeredRef.current) {
					resetTriggeredRef.current = true;
					setTimeout(() => {
						// 리셋: 위치, 속도, 각속도, 회전 모두 초기화
						bookBody.position.set(initialBookPos.x, initialBookPos.y, initialBookPos.z);
						bookBody.velocity.set(0, 0, 0);
						bookBody.angularVelocity.set(0, 0, 0);
						bookBody.quaternion.set(0, 0, 0, 1);
						hasThrownRef.current = false;
						setHasThrown(false);
						resetTriggeredRef.current = false;
					}, 3000);
				}
			}
			dragStart = null;
		};

		renderer.domElement.addEventListener("pointerdown", onPointerDown);
		renderer.domElement.addEventListener("pointermove", onPointerMove);
		renderer.domElement.addEventListener("pointerup", onPointerUp);

		// --------------------------
		// 6. 애니메이션 루프: 물리 업데이트, 카메라 추적 등
		// --------------------------
		const clock = new THREE.Clock();
		const animate = () => {
			requestAnimationFrame(animate);
			const delta = clock.getDelta();
			world.step(1 / 60, delta, 3);

			// 물리 바디와 메쉬 동기화
			bookMesh.position.copy(bookBody.position as any);
			const vel = bookBody.velocity;
			if (hasThrown && vel.length() > 0.1) {
				const direction = new THREE.Vector3(vel.x, vel.y, vel.z).normalize();
				const lookAtPos = new THREE.Vector3().copy(bookMesh.position).add(direction);
				bookMesh.lookAt(lookAtPos);
			} else {
				bookMesh.quaternion.copy(bookBody.quaternion as any);
			}

			// 카메라 추적: 던진 후 물체를 따라가고, 아니면 기본 위치
			if (hasThrownRef.current) {
				const targetCamPos = new THREE.Vector3(
					bookMesh.position.x,
					bookMesh.position.y + 2,
					bookMesh.position.z + 5
				);
				camera.position.lerp(targetCamPos, 0.1);
				camera.lookAt(bookMesh.position);
			} else {
				const defaultCamPos = new THREE.Vector3(0, 5, 15);
				camera.position.lerp(defaultCamPos, 0.1);
				camera.lookAt(new THREE.Vector3(0, 0, 0));
			}

			renderer.render(scene, camera);
		};
		animate();

		// --------------------------
		// 7. 창 크기 변경 대응 및 클린업
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
	}, []); // 컴포넌트가 마운트될 때 한 번 실행

	return (
		<div>
			<div ref={mountRef} />
			<div
				style={{
					position: "absolute",
					top: 20,
					left: 20,
					color: "white",
					fontSize: "24px",
					zIndex: 1,
				}}
			>
				점수: {score}
			</div>
			<div
				style={{
					position: "absolute",
					top: 60,
					left: 20,
					color: "white",
					zIndex: 1,
				}}
			>
				(마우스로 드래그하여 책을 던지세요)
			</div>
		</div>
	);
};

export default Game;
