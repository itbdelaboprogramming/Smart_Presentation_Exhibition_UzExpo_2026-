import * as THREE from "three";
import { scene, camera, orbitControls, frameCallbacks } from "../script.js";
import { ACTIVE_MODEL } from "./recyclingPlantAnnotationsStore.js";

// Camera limits per catalogue model key (data-key in index.php).
//   minDistance / maxDistance: orbit zoom range (m) around the target — maxDistance is the zoom-out limit
//   floorY:      the camera never goes below this height (m)
//   groundMesh:  keep the camera above this mesh's surface (+ clearance) — stops flying into the terrain
const CAMERA_LIMITS = {
	container: { minDistance: 1, maxDistance: 14, floorY: 0.3 },
	site: { minDistance: 5, maxDistance: 180, floorY: 1, groundMesh: "ENV_Terrain", clearance: 2 },
};

const CELL = 1; // heightfield resolution (m)
const defaults = { minDistance: orbitControls.minDistance, maxDistance: orbitControls.maxDistance };
let limits = null;
let ground = null; // { minX, minZ, cols, rows, heights: Float32Array }

/** Max surface height per CELL x CELL column, built once from the mesh vertices (no per-frame raycasts). */
function buildHeightfield(mesh) {
	mesh.updateWorldMatrix(true, false);
	const box = new THREE.Box3().setFromObject(mesh);
	const cols = Math.ceil((box.max.x - box.min.x) / CELL) + 1;
	const rows = Math.ceil((box.max.z - box.min.z) / CELL) + 1;
	const heights = new Float32Array(cols * rows).fill(-Infinity);
	const position = mesh.geometry.attributes.position;
	const v = new THREE.Vector3();
	for (let i = 0; i < position.count; i++) {
		v.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
		const c = Math.round((v.x - box.min.x) / CELL);
		const r = Math.round((v.z - box.min.z) / CELL);
		const k = r * cols + c;
		if (v.y > heights[k]) heights[k] = v.y;
	}
	// Fill cells no vertex fell into from their neighbours (a few passes are enough for a dense terrain).
	for (let pass = 0; pass < 4; pass++) {
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const k = r * cols + c;
				if (heights[k] !== -Infinity) continue;
				let best = -Infinity;
				if (c > 0) best = Math.max(best, heights[k - 1]);
				if (c < cols - 1) best = Math.max(best, heights[k + 1]);
				if (r > 0) best = Math.max(best, heights[k - cols]);
				if (r < rows - 1) best = Math.max(best, heights[k + cols]);
				heights[k] = best;
			}
		}
	}
	return { minX: box.min.x, minZ: box.min.z, cols, rows, heights };
}

/** Highest ground around (x, z), or -Infinity outside the terrain footprint. */
function groundHeight(x, z) {
	const c = (x - ground.minX) / CELL;
	const r = (z - ground.minZ) / CELL;
	if (c < 0 || r < 0 || c > ground.cols - 1 || r > ground.rows - 1) return -Infinity;
	const c0 = Math.floor(c), r0 = Math.floor(r);
	const c1 = Math.min(c0 + 1, ground.cols - 1), r1 = Math.min(r0 + 1, ground.rows - 1);
	const h = ground.heights;
	return Math.max(h[r0 * ground.cols + c0], h[r0 * ground.cols + c1], h[r1 * ground.cols + c0], h[r1 * ground.cols + c1]);
}

/** Applies the active model's limits. home.js calls this before placing the camera on a new model, so
 *  orbitControls.update() clamps against the new model's range, not the previous one's. */
export function applyCameraLimits() {
	limits = CAMERA_LIMITS[ACTIVE_MODEL] ?? null;
	orbitControls.minDistance = limits?.minDistance ?? defaults.minDistance;
	orbitControls.maxDistance = limits?.maxDistance ?? defaults.maxDistance;
	const mesh = limits?.groundMesh && scene.getObjectByName("file3D")?.getObjectByName(limits.groundMesh);
	ground = mesh ? buildHeightfield(mesh) : null;
}

// Runs after orbitControls.update() and before rendering (see script.js render loop).
frameCallbacks.push(() => {
	if (!limits) return;
	let minY = limits.floorY ?? -Infinity;
	if (ground) minY = Math.max(minY, groundHeight(camera.position.x, camera.position.z) + (limits.clearance ?? 0));
	if (camera.position.y < minY) camera.position.y = minY;
});

// Initial model (loaded by script.js); later models are handled by home.js.
(function waitForModel() {
	if (scene.getObjectByName("file3D")) applyCameraLimits();
	else setTimeout(waitForModel, 200);
})();
