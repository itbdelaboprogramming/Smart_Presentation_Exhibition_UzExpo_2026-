import { t, getLang, onLangChange } from "./i18n.js";

// ------------------------------------------- settings -------------------------------------------
// "iframe": embed the live site (online only, always up to date, its own look, Japanese only)
// "local":  built-in Leaflet map from files/Microhydro/map (works offline, our look, EN + JA)
const MAP_MODE = "local";

// Local mode basemap. "auto": OpenStreetMap tiles when there is internet, drawn over an offline
// vector map (Natural Earth) that shows through when tiles can't load. "vector": vector map only.
const LOCAL_BASEMAP = "auto";

// Demo override without editing code: index.php?map=iframe | local | vector
const override = new URLSearchParams(window.location.search).get("map");
const mode = override === "iframe" || override === "local" ? override : override === "vector" ? "local" : MAP_MODE;
const basemap = override === "vector" ? "vector" : LOCAL_BASEMAP;

const LIVE_URL = "https://www.nhdcloud.com/microhydro-map/";
const DATA_DIR = "./files/Microhydro/map/";
const LEAFLET_JS = "../vendor/leaflet/leaflet-src.esm.js";
const LEAFLET_CSS = "./vendor/leaflet/leaflet.css";
const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// English names for data.json (kept as published on the live site, in Japanese).
const NAMES_EN = {
	"白糸の滝step2発電所": "Shiraito Falls Step 2 Power Plant",
	"大人小水力発電所": "Obito Small Hydropower Plant",
	"三瀬発電所": "Mise Power Plant",
	"老竹発電所": "Otake Power Plant",
	"田口発電所": "Taguchi Power Plant",
	"白糸step3発電所": "Shiraito Step 3 Power Plant",
	"松隈発電所": "Matsuguma Power Plant",
	"本城イチトキ発電所": "Honjo Ichitoki Power Plant",
	"黒木川発電所": "Kurokigawa Power Plant",
	"豊松発電所": "Toyomatsu Power Plant",
	"阿波村発電所": "Abamura Power Plant",
	"諸塚発電所": "Morotsuka Power Plant",
	"こども発電所クロスフロー水車": "Kodomo Power Plant (Crossflow Turbine)",
	"プロペラ水車用発電所": "Propeller Turbine Power Plant",
	"水分トンネルの小水力発電所": "Mizuwake Tunnel Small Hydropower Plant",
};
const PREFECTURES_EN = {
	"福岡県": "Fukuoka", "宮崎県": "Miyazaki", "佐賀県": "Saga", "鹿児島県": "Kagoshima",
	"広島県": "Hiroshima", "岡山県": "Okayama", "熊本県": "Kumamoto", "大分県": "Oita",
};
const DETAIL_LABELS = {
	"有効落差": { en: "Effective head", ja: "有効落差" },
	"最大流量": { en: "Max. flow rate", ja: "最大流量" },
	"発電機出力": { en: "Generator output", ja: "発電機出力" },
	"年間電力量": { en: "Annual energy", ja: "年間電力量" },
	"CO2年間削減量": { en: "Annual CO₂ reduction", ja: "CO₂年間削減量" },
	"CO2 排出量の削減": { en: "Annual CO₂ reduction", ja: "CO₂年間削減量" },
};

// ------------------------------------------- modal -------------------------------------------
const root = document.getElementById("map-modal");
const body = document.getElementById("map-body");
const button = document.querySelector(".menu-map");
let built = null; // Promise of the mode's content, built on first open (null = build again next time)
let leafletMap = null;

function open() {
	root.classList.add("active");
	built ??= mode === "iframe" ? buildIframe() : buildLocal();
	// Leaflet measures its container: refit once the modal has its final size.
	built?.then(() => leafletMap && requestAnimationFrame(() => leafletMap.invalidateSize()));
}

function close() {
	root.classList.remove("active");
	leafletMap?.closePopup();
}

button?.addEventListener("click", open);
document.getElementById("map-close").addEventListener("click", close);
root.addEventListener("click", (event) => event.target === root && close());
document.addEventListener("keydown", (event) => event.key === "Escape" && root.classList.contains("active") && close());

// ------------------------------------------- A: iframe -------------------------------------------
function buildIframe() {
	if (!navigator.onLine) {
		body.innerHTML = `<div class="map-notice" data-i18n="map.offline">${t("map.offline")}</div>`;
		return null; // try again on the next open (maybe back online)
	}
	const frame = document.createElement("iframe");
	frame.className = "map-iframe";
	frame.src = LIVE_URL;
	frame.title = t("map.title");
	frame.loading = "lazy";
	body.replaceChildren(frame);
	return Promise.resolve();
}

// ------------------------------------------- B: local Leaflet -------------------------------------------
function loadCss(href) {
	if (document.querySelector(`link[href="${href}"]`)) return;
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = href;
	document.head.appendChild(link);
}

const escapeHtml = (value) =>
	String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function popupHtml(site) {
	const ja = getLang() === "ja";
	const prefecture = site.location.replace(/​/g, "").trim();
	const name = ja ? site.name : NAMES_EN[site.name] ?? site.name;
	const place = ja ? prefecture : `${PREFECTURES_EN[prefecture] ?? prefecture}, Japan`;
	const rows = Object.entries(site.details || {})
		.map(([key, value]) => {
			const label = DETAIL_LABELS[key]?.[ja ? "ja" : "en"] ?? key;
			const shown = ja ? value : String(value).replace("/年", "/yr");
			return `<div class="mh-popup-row"><span>${escapeHtml(label)}</span><b>${escapeHtml(shown)}</b></div>`;
		})
		.join("");
	const image = (file, cls) =>
		file ? `<img class="${cls}" src="${DATA_DIR}img/${encodeURIComponent(file)}" alt="" onerror="this.remove()">` : "";
	const directions = navigator.onLine
		? `<a class="mh-popup-link" href="https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}" target="_blank" rel="noopener">${t("map.directions")}</a>`
		: "";
	return `
		<div class="mh-popup-place">${escapeHtml(place)}</div>
		<div class="mh-popup-name">${escapeHtml(name)}</div>
		${image(site.image, "mh-popup-photo")}
		<div class="mh-popup-info">
			${image(site.image2, "mh-popup-photo2")}
			<div class="mh-popup-details">${rows}</div>
		</div>
		${directions}`;
}

async function buildLocal() {
	loadCss(LEAFLET_CSS);
	const [L, sites, shapes] = await Promise.all([
		import(LEAFLET_JS),
		fetch(`${DATA_DIR}data.json`).then((r) => r.json()),
		fetch(`${DATA_DIR}basemap.geojson`).then((r) => r.json()),
	]);

	const container = document.createElement("div");
	container.className = "map-leaflet";
	body.replaceChildren(container);

	const map = L.map(container, { minZoom: 4, maxZoom: 16, zoomSnap: 0.5 });
	leafletMap = map;

	// Offline vector basemap, in its own pane below the tile pane (z 200) so tiles cover it when online.
	map.createPane("basemap").style.zIndex = 150;
	L.geoJSON(shapes, {
		pane: "basemap",
		interactive: false,
		style: (feature) =>
			feature.properties.kind === "prefecture"
				? { color: "#8fb3bd", weight: 0.8, fillColor: "#f7faf8", fillOpacity: 1 }
				: { color: "#b8c9cc", weight: 0.6, fillColor: "#e9eeec", fillOpacity: 1 },
	}).addTo(map);
	map.attributionControl.addAttribution("Basemap: Natural Earth");

	if (basemap === "auto" && navigator.onLine) {
		L.tileLayer(OSM_TILES, {
			maxZoom: 18,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
		}).addTo(map);
	}

	const icon = L.divIcon({ className: "mh-marker", html: "<span></span>", iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -12] });
	const bounds = [];
	sites.forEach((site) => {
		bounds.push([site.lat, site.lng]);
		L.marker([site.lat, site.lng], { icon, title: NAMES_EN[site.name] ?? site.name })
			.bindPopup(() => popupHtml(site), { className: "mh-popup", minWidth: 260, maxWidth: 300, autoPanPadding: [24, 24] })
			.addTo(map);
	});
	map.fitBounds(bounds, { padding: [48, 48] });

	// Photos load after the popup opens and make it taller: re-layout (and re-pan into view) once they arrive.
	map.on("popupopen", ({ popup }) => {
		popup.getElement()?.querySelectorAll("img").forEach((img) => {
			if (!img.complete) img.addEventListener("load", () => popup.isOpen() && popup.update(), { once: true });
		});
	});
}

onLangChange(() => leafletMap?.closePopup());
