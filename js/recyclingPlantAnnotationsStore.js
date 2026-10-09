import seedAnnotations, { ACTIVE_MODEL, DEFAULT_VIEW, DEFAULT_VIEWS, setActiveModel } from "./recyclingPlantAnnotations.js";

// Bumped from "rpAnnotationsTagProgress" so leftover Czech-expo progress in the browser is ignored.
const STORAGE_KEY = "mhAnnotationsTagProgress";

export const isTagMode = new URLSearchParams(window.location.search).has("tag");

function cloneSeed() {
	return JSON.parse(JSON.stringify(seedAnnotations));
}

function loadInitial() {
	if (isTagMode) {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) return JSON.parse(raw);
		} catch (e) {}
	}
	return cloneSeed();
}

export let annotations = loadInitial();

export function saveProgress() {
	if (!isTagMode) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
}

/** Drop in-browser progress, e.g. once it has been written to the source file. */
export function clearProgress() {
	if (isTagMode) localStorage.removeItem(STORAGE_KEY);
}

export function resetToSeed() {
	clearProgress();
	annotations = cloneSeed();
}

/** Annotations of the model currently shown. */
export function modelAnnotations() {
	return annotations.filter((ann) => ann.model === ACTIVE_MODEL);
}

export { ACTIVE_MODEL, DEFAULT_VIEW, DEFAULT_VIEWS, setActiveModel };
