import { scene, camera, orbitControls, loader, GRID_Y } from "../script.js";
import * as THREE from "three";
import {
	activateRecyclingPlant,
	deactivateRecyclingPlant,
	detachRecyclingPlant,
	closeInfoPopup,
} from "./recyclingPlant.js";
import { setVoiceOverEnabled, setVoiceOverContext } from "./voiceOver.js";
import { openLibrary } from "./mediaLibrary.js";
import { frameObject } from "./cameraFit.js";
import { applyCameraLimits } from "./cameraGuard.js";
import { DEFAULT_VIEW, DEFAULT_VIEWS, setActiveModel } from "./recyclingPlantAnnotationsStore.js";

// ---------------------------------------------------------------------------------------
// ----------------------------------- Const, Var, Let -----------------------------------
// ---------------------------------------------------------------------------------------

// ----------------------------------- Explode 3D File -----------------------------------

// const explode_button = document.querySelector(".explode-button");
const explode_button = document.getElementById("explode-button");

// ------------------------------------- floor grid --------------------------------------
/** Grid is hidden for catalogue items marked data-grid="hidden" (e.g. the site has its own ground). */
function syncGridVisibility() {
	const grid = scene.getObjectByName("grid");
	const item = document.querySelector(".catalogue-product-list-2.active");
	if (grid) grid.visible = item?.dataset.grid !== "hidden";
}

function replaceGrid(color) {
	scene.remove(scene.getObjectByName("grid"));
	const grid = new THREE.GridHelper(50, 50, color, color);
	grid.position.y = GRID_Y;
	grid.name = "grid";
	scene.add(grid);
	syncGridVisibility();
}

// ----------------------------------- dark/light mode -----------------------------------
const toggle = document.querySelector(".toggle");

let getMode = localStorage.getItem("mode");

// -------------------------------------- lightning --------------------------------------
const menuLightning = document.querySelector(".menu-container-blue-lightning");
const lightning_expand = document.querySelector(
	".menu-container-blue-lightning-expand"
);
const lightning_title = document.querySelector(".lightning-title-2");
const opsi = lightning_title.querySelectorAll(".opsi");

const custom_lightning = document.querySelector(".custom-lightning");

const ambientLight = scene.getObjectByName("ambientLight");
const dirLight = scene.getObjectByName("dirLight");
const light1 = scene.getObjectByName("light1");
const light2 = scene.getObjectByName("light2");
const light3 = scene.getObjectByName("light3");
const light4 = scene.getObjectByName("light4");

// -------------------------------- slider env brightness --------------------------------
const slider_env = document.getElementById("slider-env");
const maxValue_env = slider_env.getAttribute("max");
let value_env;
const sliderFill_env = document.getElementById("fill-env");

// --------------------------------- slider lamp position --------------------------------
const slider_lamp_pos = document.getElementById("slider-lamp-pos");
const maxValue_lamp_pos = slider_lamp_pos.getAttribute("max");
let value_lamp_pos;
const sliderFill_lamp_pos = document.getElementById("fill-lamp-pos");

// ------------------------------- slider lamp brightness --------------------------------
const slider_lamp = document.getElementById("slider-lamp");
const maxValue_lamp = slider_lamp.getAttribute("max");
let value_lamp;
const sliderFill_lamp = document.getElementById("fill-lamp");

// -------------------------------------- catalogue --------------------------------------
const menuAlbum = document.querySelector(".menu-container-blue-album");
const catalogueContainer = document.getElementById("catalogue-container-2");
const catalogue_product_list = document.querySelectorAll(
	".catalogue-product-list-2"
);

// ------------------------------------- slider zoom -------------------------------------
const slider = document.getElementById("slider-zoom");
const maxValue = slider.getAttribute("max");
let value;
const sliderFill = document.getElementById("fill-zoom");

// ---------------------------------------- sound ----------------------------------------
const menuSound = document.querySelector(".menu-container-blue-sound");
const iconSoundOff = document.getElementById("sound-off");
const iconSoundOn = document.getElementById("sound-on");

const soundExpand = document.querySelector(".sound-expand");

let change_audio = "model_name_1";

var audio = new Audio("./audio/podcast-18169.mp3");

let audioOwner = null; // "music" | "speech" | "video" | null
let silencedByVideo = null; // "music" | "speech" | null — turned back on when the video viewer closes

function stopMusic() {
	audio.pause();
	toggle_music.classList.remove("active");
}

function stopSpeech() {
	setVoiceOverEnabled(false);
	toggle_speech.classList.remove("active");
}

function stopVideo() {
	if (!video.paused) video.pause();
}

function claimAudio(owner) {
	if (owner === "video") {
		// Remember what the video silences. Keep the old value when moving on to a second video.
		if (toggle_music.classList.contains("active")) silencedByVideo = "music";
		else if (toggle_speech.classList.contains("active")) silencedByVideo = "speech";
	} else {
		silencedByVideo = null; // the visitor picked music / voice-over themselves
	}
	if (owner !== "music") stopMusic();
	if (owner !== "speech") stopSpeech();
	if (owner !== "video") stopVideo();
	audioOwner = owner;
}

function releaseAudio(owner) {
	if (audioOwner === owner) audioOwner = null;
}

function musicPlayer() {
	audio.addEventListener(
		"ended",
		function () {
			setTimeout(() => {
				if (audioOwner !== "music") return; 
				musicPlayer();
			}, 30000);
		},
		{ once: true }
	);

	audio.play();
}

const toggle_music = document.querySelector(".toggle-music");
const toggle_speech = document.querySelector(".toggle-speech");

// -------------------------------------- animation --------------------------------------
const menuAnimation = document.querySelector(".menu-container-blue-animation");
const iconAnimationOff = document.getElementById("animation-off");
const iconAnimationOn = document.getElementById("animation-on");

// ------------------------------------- information -------------------------------------
const menuInformation = document.querySelector(
	".menu-container-blue-information"
);
const informationContainer = document.getElementById("information-container");

// ------------------------------------- video button ------------------------------------
const video_button = document.querySelector(".menu-video");
const video = document.getElementById("video");

// ---------------------------------------------------------------------------------------
// ------------------------------------- PROGRAM CODE ------------------------------------
// ---------------------------------------------------------------------------------------

// ----------------------------------- Explode 3D File -----------------------------------
explode_button.addEventListener("click", () => {
	explode_button.classList.toggle("active");

	if (explode_button.classList.contains("active")) {
		activateRecyclingPlant();
	} else {
		deactivateRecyclingPlant();
	}
});

// ----------------------------------- dark/light mode -----------------------------------
if (getMode && getMode === "dark-theme") {
	document.body.classList.add("dark-theme");
	toggle.classList.add("active");

	scene.background = new THREE.Color(0x1d2538);
	replaceGrid(0x475b74);

	localStorage.setItem("mode", "dark-theme");
}

toggle.addEventListener("click", () => toggle.classList.toggle("active"));

toggle.addEventListener("click", () => {
	document.body.classList.toggle("dark-theme");

	if (document.body.classList.contains("dark-theme")) {
		scene.background = new THREE.Color(0x1d2538);
		replaceGrid(0x475b74);

		localStorage.setItem("mode", "dark-theme");
	} else {
		scene.background = new THREE.Color(0xdbe9e9);
		replaceGrid(0xffffff);

		localStorage.setItem("mode", "light");
	}
});

// -------------------------------------- lightning --------------------------------------
menuLightning.addEventListener("click", () => {
	menuLightning.classList.toggle("active");

	if (menuLightning.classList.contains("active")) {
		lightning_expand.style.display = "block";
	} else {
		lightning_expand.style.display = "none";
	}
});

opsi.forEach(function (opsi) {
	opsi.addEventListener("click", () => {
		resetOpsi();
		opsi.classList.toggle("active");

		if (opsi.classList.contains("active")) {
			updateLightning(opsi.dataset.value);
		}
	});
});

window.addEventListener("resize", () => {
	if (custom_lightning.style.display == "flex") {
		if (window.innerWidth < 900) {
			lightning_expand.style.height = "230px";
		} else {
			lightning_expand.style.height = "190px";
		}
	}
});

// -------------------------------- slider env brightness --------------------------------
updateSliderEnv();
slider_env.addEventListener("input", () => {
	updateSliderEnv();
	updateEnvBrightness();
});

// --------------------------------- slider lamp position --------------------------------
updateSliderLampPos();
slider_lamp_pos.addEventListener("input", () => {
	updateSliderLampPos();
	updateLampPos();
});

// ------------------------------- slider lamp brightness --------------------------------
updateSliderLamp();
slider_lamp.addEventListener("input", () => {
	updateSliderLamp();
	updateLamp();
});

// -------------------------------------- catalogue --------------------------------------
if (menuAlbum) {
	menuAlbum.addEventListener("click", () => setCatalogueOpen(!menuAlbum.classList.contains("active")));
	// The catalogue and the annotation info popup share the right edge: only one is open at a time.
	document.addEventListener("infopopupopen", () => setCatalogueOpen(false));
}

function setCatalogueOpen(open) {
	menuAlbum.classList.toggle("active", open);
	catalogueContainer.style.display = open ? "flex" : "none";
	if (open) closeInfoPopup();
}

loadCatalogue(catalogue_product_list);

// ------------------------------------- slider zoom -------------------------------------
updateSlider();
updateZoomCamera();
slider.addEventListener("input", () => {
	updateSlider();
	updateZoomCamera();
});

// ---------------------------------------- sound ----------------------------------------
menuSound.addEventListener("click", () => {
	menuSound.classList.toggle("active");

	if (menuSound.classList.contains("active")) {
		iconSoundOff.style.display = "none";
		iconSoundOn.style.display = "block";
		soundExpand.style.display = "flex";
	} else {
		iconSoundOff.style.display = "block";
		iconSoundOn.style.display = "none";
		soundExpand.style.display = "none";
	}
});

toggle_music.addEventListener("click", () => {
	toggle_music.classList.toggle("active");

	if (toggle_music.classList.contains("active")) {
		claimAudio("music"); // silences voice-over and video
		musicPlayer();
	} else {
		audio.pause();
		releaseAudio("music");
	}
});

toggle_speech.addEventListener("click", () => {
	toggle_speech.classList.toggle("active");

	if (toggle_speech.classList.contains("active")) {
		claimAudio("speech"); // silences music and video
		setVoiceOverEnabled(true);
	} else {
		setVoiceOverEnabled(false);
		releaseAudio("speech");
	}
});

// -------------------------------------- animation --------------------------------------
menuAnimation.addEventListener("click", () => {
	menuAnimation.classList.toggle("active");

	if (menuAnimation.classList.contains("active")) {
		iconAnimationOff.style.display = "none";
		iconAnimationOn.style.display = "block";
		orbitControls.autoRotate = true;
	} else {
		iconAnimationOff.style.display = "block";
		iconAnimationOn.style.display = "none";
		orbitControls.autoRotate = false;
	}
});

// ------------------------------------- information -------------------------------------
if (menuInformation && informationContainer) {
	menuInformation.addEventListener("click", () => {
		menuInformation.classList.toggle("active");

		if (menuInformation.classList.contains("active")) {
			informationContainer.style.display = "flex";
		} else {
			informationContainer.style.display = "none";
		}
	});
}

// ------------------------------------- video button ------------------------------------
video_button.addEventListener("click", () => openLibrary("video"));

video.addEventListener("play", () => claimAudio("video"));
video.addEventListener("pause", () => releaseAudio("video"));
video.addEventListener("ended", () => releaseAudio("video"));

// Closing the video viewer brings back the music / voice-over the video had silenced.
document.addEventListener("mediaclose", () => {
	const toggle = { music: toggle_music, speech: toggle_speech }[silencedByVideo];
	silencedByVideo = null;
	if (toggle && !toggle.classList.contains("active")) toggle.click(); // same path as the visitor's own click
});

// ---------------------------------------------------------------------------------------
// ---------------------------------- FUNCTION HELPER ------------------------------------
// ---------------------------------------------------------------------------------------

// -------------------------------------- lightning --------------------------------------
function resetOpsi() {
	opsi.forEach(function (opsi) {
		opsi.classList.remove("active");
	});
}

function updateLightning(opsi_text) {
	if (opsi_text === "custom") {
		custom_lightning.style.display = "flex";

		if (window.innerWidth < 900) {
			lightning_expand.style.height = "230px";
		}

		ambientLight.intensity = 0;
		dirLight.intensity = 0;

		light1.intensity = 0;
		light2.intensity = 0;
		light3.intensity = 0;
		light4.intensity = 0;

		slider_env.value = 0;
		updateSliderEnv();
		updateEnvBrightness();
		slider_lamp.value = 0;
		updateSliderLamp();
		updateLamp();
		slider_lamp_pos.value = 210;
		updateSliderLampPos();
		updateLampPos();
	} else {
		custom_lightning.style.display = "none";
		lightning_expand.style.height = "190px";

		ambientLight.intensity = 0;
		dirLight.intensity = 0;
		dirLight.position.set(100, 100, -10);

		light1.intensity = 0;
		light2.intensity = 0;
		light3.intensity = 0;
		light4.intensity = 0;
	}
}

// -------------------------------- slider env brightness --------------------------------
function updateSliderEnv() {
	value_env = (slider_env.value / maxValue_env) * 100 + "%";
	sliderFill_env.style.width = value_env;
}

function updateEnvBrightness() {
	let ambient = scene.getObjectByName("ambientLight");
	ambient.intensity = slider_env.value;
}

// --------------------------------- slider lamp position --------------------------------
function updateSliderLampPos() {
	value_lamp_pos = (slider_lamp_pos.value / maxValue_lamp_pos) * 100 + "%";
	sliderFill_lamp_pos.style.width = value_lamp_pos;
}

function updateLampPos() {
	let lamp = scene.getObjectByName("dirLight");
	lamp.position.set(100, 100, -(slider_lamp_pos.value - 200));
}

// ------------------------------- slider lamp brightness --------------------------------
function updateSliderLamp() {
	value_lamp = (slider_lamp.value / maxValue_lamp) * 100 + "%";
	sliderFill_lamp.style.width = value_lamp;
}

function updateLamp() {
	let lamp = scene.getObjectByName("dirLight");
	lamp.intensity = slider_lamp.value;
}

// -------------------------------------- catalogue --------------------------------------

// Inside the loadCatalogue function
function loadCatalogue(catalogue_product_list) {
	catalogue_product_list.forEach(function (product_list) {
		product_list.addEventListener("click", () => {
			if (product_list.id != change_audio) {
				change_audio = product_list.id;
				setVoiceOverContext(null);
			}

			resetCatalogueSelect();

			// product_list.classList.toggle("active");
			product_list.classList.add("active"); // Add the "active" class here

			// Annotations belong to the old model: remove them before it leaves the scene.
			explode_button.classList.remove("active");
			detachRecyclingPlant();

			updateFile3D(product_list.dataset.model, product_list.dataset.key);
		});
	});
}

function resetCatalogueSelect() {
	catalogue_product_list.forEach(function (product_list) {
		product_list.classList.remove("active");
	});
}

function updateFile3D(modelPath, modelKey) {
	if (!modelPath) return;
	const hasView = setActiveModel(modelKey);

	const oldFile3D = scene.getObjectByName("file3D");
	if (oldFile3D) scene.remove(oldFile3D);

	loader.load(
		modelPath,
		function (gltf) {
			const file3D = gltf.scene;
			file3D.name = "file3D";
			file3D.animations = gltf.animations; // clips, played by js/siteAmbience.js
			file3D.layers.enableAll();
			file3D.position.set(0, 0, 0);
			scene.add(file3D);
			applyCameraLimits(); // before placing the camera: update() clamps to the new model's range

			if (hasView) {
				camera.position.copy(DEFAULT_VIEW.position);
				orbitControls.target.copy(DEFAULT_VIEW.target);
				orbitControls.update();
			} else {
				// No DEFAULT_VIEWS entry yet: fit the whole model on screen and use that as its default.
				const { position, target } = frameObject(file3D, camera, orbitControls);
				DEFAULT_VIEWS[modelKey] = { position, target };
				setActiveModel(modelKey);
			}

			syncGridVisibility();
			document.dispatchEvent(new CustomEvent("modelchange", { detail: modelKey }));
		},
		undefined,
		function (error) {
			console.error(error);
		}
	);
}

// ------------------------------------- slider zoom -------------------------------------
function updateZoomCamera() {
	camera.zoom = slider.value;
	camera.updateProjectionMatrix();
}

function updateSlider() {
	value = (slider.value / maxValue) * 100 + "%";
	sliderFill.style.width = value;
}

// pdf button
document.querySelector(".menu-pdf").addEventListener("click", () => openLibrary("pdf"));
