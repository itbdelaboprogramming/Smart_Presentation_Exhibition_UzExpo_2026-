import * as THREE from "three";

// Viewing direction (from target towards camera): from -X (the container's open display side),
// slightly from above — same side as the site GLB's "Overview" preset.
const VIEW_DIR = new THREE.Vector3(-1, 0.6, -0.6).normalize();

/**
 * Camera view ({ position, target }) that fits the whole `object` on screen for a camera
 * with the given vertical `fov` (degrees) and `aspect`. `padding` < 1 crops into the bounding
 * sphere (which is loose for long/flat models), > 1 adds margin.
 */
export function computeFitView(object, fov, aspect, padding = 1) {
	const box = new THREE.Box3().setFromObject(object);
	if (box.isEmpty()) return null;

	const sphere = box.getBoundingSphere(new THREE.Sphere());
	const vFov = THREE.MathUtils.degToRad(fov);
	const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
	const distance = (sphere.radius * padding) / Math.sin(Math.min(vFov, hFov) / 2);

	return {
		position: sphere.center.clone().addScaledVector(VIEW_DIR, distance),
		target: sphere.center.clone(),
		distance,
	};
}

/** Moves `cam` (and `controls`, if given) to the fit view of `object`. */
export function frameObject(object, cam, controls = null, padding) {
	const view = computeFitView(object, cam.fov, cam.aspect, padding);
	if (!view) return;

	cam.position.copy(view.position);
	cam.lookAt(view.target);
	if (controls) {
		controls.target.copy(view.target);
		controls.update();
	}
	return view;
}
