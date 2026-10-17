import * as THREE from "three";
import { scene, camera, renderer, orbitControls, frameCallbacks } from "../script.js";
import { ACTIVE_MODEL, DEFAULT_VIEW } from "./recyclingPlantAnnotationsStore.js";

// Ambience per catalogue model key (data-key in index.php). Everything here is shader/tween work on
// the existing model: no extra assets, no extra draw calls.
//   flow:  play the GLB's own animation clips (the site's "WaterFlow" chevrons)
//   sky:   gradient sky background + fog that fades the far side into the horizon
//   power: material name of the overhead line + start point of the "electricity" pulses
//   intro: camera swoops into the default view when the model opens
const AMBIENCE = {
	site: {
		flow: true,
		sky: true,
		fog: { near: 150, far: 420 },
		power: { material: "MH_Cable", from: [0, 2.9, 1.7] }, // container roof cable frame
		intro: true,
	},
};

// Attract mode (every model): after this many seconds without input, return to the default view
// and slowly orbit — for the expo booth. 0 disables it.
const IDLE_SECONDS = 45;
const ATTRACT_ROTATE_SPEED = 0.35;

const SKY = {
	light: { top: "#7fb8de", middle: "#c5e2ef", horizon: "#eaf4f3" },
	dark: { top: "#0a1628", middle: "#1b2b44", horizon: "#33475f" },
};
const THEME_BACKGROUND = { light: 0xdbe9e9, dark: 0x1d2538 }; // same as home.js

const clock = new THREE.Clock();
const time = { value: 0 }; // shared shader uniform
let config = null;
let mixer = null;
let intro = null;
const INTRO_HOLD_FRAMES = 3; // rendered frames to wait (at the start pose) before the swoop begins
const skyTextures = {};

// ------------------------------------------- sky + fog -------------------------------------------
const theme = () => (document.body.classList.contains("dark-theme") ? "dark" : "light");

function skyTexture(name) {
	if (skyTextures[name]) return skyTextures[name];
	const canvas = Object.assign(document.createElement("canvas"), { width: 4, height: 512 });
	const ctx = canvas.getContext("2d");
	const { top, middle, horizon } = SKY[name];
	const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
	gradient.addColorStop(0, top);
	gradient.addColorStop(0.55, middle);
	gradient.addColorStop(1, horizon);
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	return (skyTextures[name] = texture);
}

function applySky() {
	const name = theme();
	if (config?.sky) {
		scene.background = skyTexture(name);
		scene.fog = config.fog ? new THREE.Fog(SKY[name].horizon, config.fog.near, config.fog.far) : null;
	} else {
		scene.background = new THREE.Color(THEME_BACKGROUND[name]);
		scene.fog = null;
	}
}

// home.js repaints the background when the theme toggles: put the sky back on top of it.
new MutationObserver(() => config?.sky && applySky()).observe(document.body, { attributes: true, attributeFilter: ["class"] });

// ------------------------------------------- shaders -------------------------------------------
function patchMaterial(material, key, uniforms, fragment) {
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, uniforms);
		shader.vertexShader = "varying vec3 vMhWorld;\n" + shader.vertexShader.replace(
			"#include <begin_vertex>",
			"#include <begin_vertex>\n\tvMhWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;"
		);
		shader.fragmentShader =
			"uniform float uMhTime;\nuniform vec3 uMhOrigin;\nvarying vec3 vMhWorld;\n" +
			shader.fragmentShader.replace(fragment.after, `${fragment.after}\n${fragment.code}`);
	};
	material.customProgramCacheKey = () => key;
	material.needsUpdate = true;
}

// Dashes of light running out of the container along the line: "the power goes to the grid".
const POWER = {
	after: "#include <emissivemap_fragment>",
	code: `
	float mhPhase = fract(distance(vMhWorld, uMhOrigin) * 0.08 - uMhTime * 0.35);
	float mhGlow = smoothstep(0.0, 0.06, mhPhase) * (1.0 - smoothstep(0.06, 0.2, mhPhase));
	totalEmissiveRadiance += vec3(1.0, 0.78, 0.25) * mhGlow * 2.5;`,
};

function patchModel(file3D) {
	const done = new Set();
	file3D.traverse((child) => {
		if (!child.isMesh) return;
		[].concat(child.material).forEach((material) => {
			if (done.has(material)) return;
			if (config.power?.material === material.name)
				patchMaterial(material, "mh-power", { uMhTime: time, uMhOrigin: { value: new THREE.Vector3(...config.power.from) } }, POWER);
			done.add(material);
		});
	});
}

// ------------------------------------------- intro -------------------------------------------
function stopIntro() {
	intro?.kill();
	intro = null;
}

/** Swoop from wider, higher and rotated into the default view the camera is already set to. */
function playIntro() {
	const target = orbitControls.target.clone();
	const end = new THREE.Spherical().setFromVector3(camera.position.clone().sub(target));
	const start = new THREE.Spherical(
		Math.min(end.radius * 1.45, orbitControls.maxDistance * 0.95),
		Math.max(0.15, end.phi - 0.25),
		end.theta + 0.9
	);
	const now = new THREE.Spherical();
	const progress = { t: 0 };
	const place = () => {
		now.radius = THREE.MathUtils.lerp(start.radius, end.radius, progress.t);
		now.phi = THREE.MathUtils.lerp(start.phi, end.phi, progress.t);
		now.theta = THREE.MathUtils.lerp(start.theta, end.theta, progress.t);
		camera.position.setFromSpherical(now).add(target);
	};
	place();
	// The first frames of a freshly added model stall (shader programs, texture uploads): compile now and
	// hold the start pose for a couple of frames, so the swoop runs smoothly from its first frame.
	renderer.compile(scene, camera);
	const tween = gsap.to(progress, { t: 1, duration: 2.8, ease: "power2.inOut", paused: true, onUpdate: place, onComplete: () => (intro = null) });
	intro = tween;
	let frames = INTRO_HOLD_FRAMES;
	const hold = () => {
		if (intro !== tween) return; // stopped (input or model switch) while holding
		if (--frames > 0) requestAnimationFrame(hold);
		else tween.play();
	};
	requestAnimationFrame(hold);
}

// ------------------------------------------- attract mode -------------------------------------------
let lastInput = performance.now();
let attract = null; // null | "flying" | "rotating"
let attractFlight = null;
const USER_ROTATE_SPEED = orbitControls.autoRotateSpeed;

const userRotating = () => document.querySelector(".menu-container-blue-animation")?.classList.contains("active") ?? false;

function attractAllowed() {
	return (
		!userRotating() &&
		!document.getElementById("explode-button")?.classList.contains("active") &&
		!document.getElementById("tour-controls")?.classList.contains("is-playing") &&
		!document.querySelector(".media-library.active, .map-modal.active") &&
		!document.hidden &&
		!intro
	);
}

function startAttract() {
	attract = "flying";
	attractFlight = gsap.timeline({
		onComplete: () => {
			attract = "rotating";
			orbitControls.autoRotate = true;
			orbitControls.autoRotateSpeed = ATTRACT_ROTATE_SPEED;
		},
	});
	const { position, target } = DEFAULT_VIEW;
	attractFlight.to(camera.position, { x: position.x, y: position.y, z: position.z, duration: 2.2, ease: "power2.inOut" }, 0);
	attractFlight.to(orbitControls.target, { x: target.x, y: target.y, z: target.z, duration: 2.2, ease: "power2.inOut" }, 0);
}

function stopAttract() {
	attractFlight?.kill();
	attractFlight = null;
	orbitControls.autoRotate = userRotating();
	orbitControls.autoRotateSpeed = USER_ROTATE_SPEED;
	attract = null;
}

function onInput(event) {
	lastInput = performance.now();
	if (attract) stopAttract();
	// The visitor takes over mid-swoop, but only on purpose: a mouse merely moving (e.g. right after
	// clicking the catalogue) must not cut it short.
	if (intro && event.type !== "pointermove") stopIntro();
}
["pointerdown", "pointermove", "wheel", "keydown", "touchstart"].forEach((type) =>
	window.addEventListener(type, onInput, { capture: true, passive: true })
);

// ------------------------------------------- per frame -------------------------------------------
frameCallbacks.push(() => {
	const delta = Math.min(clock.getDelta(), 0.1);
	time.value += delta;
	mixer?.update(delta);
	if (IDLE_SECONDS && !attract && performance.now() - lastInput > IDLE_SECONDS * 1000 && attractAllowed()) startAttract();
});

// ------------------------------------------- model switch -------------------------------------------
function apply() {
	stopIntro();
	stopAttract();
	mixer?.stopAllAction();
	mixer = null;

	const file3D = scene.getObjectByName("file3D");
	config = AMBIENCE[ACTIVE_MODEL] ?? null;
	applySky();
	if (!config || !file3D) return;

	if (config.flow && file3D.animations?.length) {
		mixer = new THREE.AnimationMixer(file3D);
		file3D.animations.forEach((clip) => mixer.clipAction(clip).play());
	}
	patchModel(file3D);
	if (config.intro) playIntro();
}

document.addEventListener("modelchange", apply);

// Initial model (loaded by script.js, which fires no modelchange).
(function waitForModel() {
	if (scene.getObjectByName("file3D")) apply();
	else setTimeout(waitForModel, 200);
})();
