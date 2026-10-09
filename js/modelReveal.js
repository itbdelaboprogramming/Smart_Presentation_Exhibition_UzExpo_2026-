import * as THREE from "three";

// Parts moved out of the way while annotations ("Animation") are on, per catalogue model key
// (data-key in index.php). Names are glTF node names as three.js sanitizes them.
const REVEAL_PARTS = {
	container: {
		// slide up and fade out
		lift: ["Roof_20ft-1", "WireSupport-1"],
		// swing open on their outer hinge, then fade out; `follow` = parts mounted on that door leaf
		doors: [
			{ door: "Standard_Door_20ft-1", follow: ["Lock_20ft-2", "Lock_20ft-3", "Lock_20ft-4", "Lock_20ft-5"] },
			{ door: "MirrorStandard_Door_20ft-3", follow: ["Lock_20ft-6", "Lock_20ft-7", "Lock_20ft-8", "Lock_20ft-9"] },
		],
		// The frame is one mesh, so it is cut by triangle position (world, m). Only the parts that block
		// the view into the container go: the top rails along the open side (-X) and over the door end
		// (-Z) lift away with the roof; the corner post where those two sides meet slides out with the
		// doors. The other posts, the bottom rails and the back/far top rails stay.
		split: {
			node: "Framework_20ft-1",
			lift: (c) => c.y > 2.38 && (c.x < -1.0 || c.z < -3.98),
			front: (c) => c.x < -1.0 && c.z < -3.9,
		},
	},
};

const LIFT_HEIGHT = 0.6; // m
const FRONT_SLIDE = 0.5; // m, outwards (-Z)
const DOOR_ANGLE = THREE.MathUtils.degToRad(100);

let timeline = null;
let revealed = false;

/**
 * Moves the triangles of `mesh` whose centre passes `test` into a new mesh (same material and
 * transform), added next to it. Returns that mesh, `mesh` itself if every triangle passes, or null.
 */
function splitMesh(mesh, test) {
	const geometry = mesh.geometry;
	if (geometry.groups.length > 1) return null; // multi-material: leave it alone
	const position = geometry.attributes.position;
	const index = geometry.index ? geometry.index.array : Array.from({ length: position.count }, (_, i) => i);
	mesh.updateWorldMatrix(true, false);

	const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
	const keep = [], cut = [];
	for (let i = 0; i < index.length; i += 3) {
		a.fromBufferAttribute(position, index[i]);
		b.fromBufferAttribute(position, index[i + 1]);
		c.fromBufferAttribute(position, index[i + 2]);
		const centre = a.add(b).add(c).divideScalar(3).applyMatrix4(mesh.matrixWorld);
		(test(centre) ? cut : keep).push(index[i], index[i + 1], index[i + 2]);
	}
	if (!cut.length) return null;
	if (!keep.length) return mesh;

	const cutGeometry = geometry.clone();
	cutGeometry.setIndex(cut);
	geometry.setIndex(keep);
	[geometry, cutGeometry].forEach((g) => {
		g.computeBoundingBox();
		g.computeBoundingSphere();
	});
	const piece = new THREE.Mesh(cutGeometry, mesh.material);
	piece.name = `${mesh.name}__reveal`;
	piece.position.copy(mesh.position);
	piece.quaternion.copy(mesh.quaternion);
	piece.scale.copy(mesh.scale);
	mesh.parent.add(piece);
	return piece;
}

/** A group at the file3D origin that moving parts are re-parented into (keeping their world pose). */
function addGroup(file3D, name) {
	const group = new THREE.Group();
	group.name = name;
	file3D.add(group);
	group.updateMatrixWorld(true);
	return group;
}

/** Builds the open/close timeline for `file3D` (once per loaded model). Null if the model has no config. */
function buildTimeline(file3D, modelKey) {
	const config = REVEAL_PARTS[modelKey];
	if (!config) return null;

	const box = new THREE.Box3();
	const parts = []; // every object that fades
	const tl = gsap.timeline({ paused: true });

	// Door leaves: re-parent onto a pivot at the hinge (outer vertical edge, nearest the container side).
	config.doors.forEach(({ door, follow }, i) => {
		const leaf = file3D.getObjectByName(door);
		if (!leaf) return;
		box.setFromObject(leaf);
		const center = box.getCenter(new THREE.Vector3());
		const hingeX = center.x >= 0 ? box.max.x : box.min.x;
		const pivot = new THREE.Object3D();
		pivot.name = `reveal-pivot-${door}`;
		pivot.position.set(hingeX, 0, box.max.z);
		file3D.add(pivot);
		pivot.updateMatrixWorld(true);
		[leaf, ...follow.map((name) => file3D.getObjectByName(name)).filter(Boolean)].forEach((obj) => {
			pivot.attach(obj);
			parts.push(obj);
		});
		// Opening outwards (-Z): the right leaf turns negative, the mirrored leaf positive.
		const angle = hingeX >= 0 ? -DOOR_ANGLE : DOOR_ANGLE;
		tl.to(pivot.rotation, { y: angle, duration: 1.1, ease: "power2.inOut" }, 0.1 + i * 0.08);
	});

	const liftGroup = addGroup(file3D, "reveal-lift");
	const frontGroup = addGroup(file3D, "reveal-front");
	config.lift.forEach((name) => {
		const obj = file3D.getObjectByName(name);
		if (obj) liftGroup.attach(obj);
	});

	const frame = config.split && file3D.getObjectByName(config.split.node);
	if (frame) {
		const frameMeshes = [];
		frame.traverse((child) => child.isMesh && frameMeshes.push(child));
		frameMeshes.forEach((mesh) => {
			const top = splitMesh(mesh, config.split.lift);
			if (top) liftGroup.attach(top);
			if (top === mesh || !config.split.front) return;
			const front = splitMesh(mesh, config.split.front);
			if (front) frontGroup.attach(front);
		});
	}

	parts.push(liftGroup, frontGroup);
	tl.to(liftGroup.position, { y: LIFT_HEIGHT, duration: 1.0, ease: "power2.inOut" }, 0);
	tl.to(frontGroup.position, { z: -FRONT_SLIDE, duration: 1.1, ease: "power2.inOut" }, 0.1);

	// Fade: per-mesh transparent clones, so materials shared with the walls/frame stay untouched.
	const meshes = [];
	parts.forEach((obj) => obj.traverse((child) => child.isMesh && meshes.push(child)));
	meshes.forEach((mesh) => {
		mesh.userData.revealOrigMat = mesh.material;
		const clone = (m) => Object.assign(m.clone(), { transparent: true, depthWrite: false });
		mesh.userData.revealFadeMat = Array.isArray(mesh.material) ? mesh.material.map(clone) : clone(mesh.material);
	});
	const fadeMaterials = meshes.flatMap((mesh) => [].concat(mesh.userData.revealFadeMat));
	const useMaterial = (key) => meshes.forEach((mesh) => (mesh.material = mesh.userData[key]));

	tl.eventCallback("onStart", () => useMaterial("revealFadeMat"));
	tl.eventCallback("onReverseComplete", () => useMaterial("revealOrigMat"));
	tl.to(fadeMaterials, { opacity: 0, duration: 0.6, ease: "power1.in" }, 0.55);
	tl.set(meshes, { visible: false });
	return tl;
}

/** Opens (true) or closes (false) the model's reveal parts; a no-op for models without a config. */
export function setRevealed(file3D, modelKey, value) {
	if (value === revealed) return;
	if (value && !timeline && file3D) timeline = buildTimeline(file3D, modelKey);
	revealed = value;
	if (!timeline) return;
	if (value) timeline.play();
	else timeline.reverse();
}

/** Forget the current model's timeline (its file3D is being removed from the scene). */
export function resetReveal() {
	timeline?.kill();
	timeline = null;
	revealed = false;
}

/** Debug/QA: the current open/close timeline (e.g. `tl.progress(0.5)` to inspect a frame). */
export function getRevealTimeline() {
	return timeline;
}
