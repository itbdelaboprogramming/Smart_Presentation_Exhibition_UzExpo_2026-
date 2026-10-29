import { t, getLang, localize, onLangChange } from "./i18n.js";

// ------------------------------------------- settings -------------------------------------------
// "iframe": embed the live site (online only, always up to date, its own look, Japanese only)
// "local":  built-in Leaflet map from files/Microhydro/map (works offline, our look, EN + JA)
const MAP_MODE = "local";

// Local mode basemap. "vector": offline vector map (Natural Earth) only, the same look online and
// offline (the expo booth has no reliable internet). "auto": OpenStreetMap tiles when there is
// internet, drawn over the vector map, which shows through when tiles can't load.
const LOCAL_BASEMAP = "vector";

// Demo override without editing code: index.php?map=iframe | local | vector | tiles
const override = new URLSearchParams(window.location.search).get("map");
const mode = override === "iframe" ? "iframe" : ["local", "vector", "tiles"].includes(override) ? "local" : MAP_MODE;
const basemap = override === "tiles" ? "auto" : override === "vector" ? "vector" : LOCAL_BASEMAP;

const LIVE_URL = "https://www.nhdcloud.com/microhydro-map/";
const DATA_DIR = "./files/Microhydro/map/";
const LEAFLET_JS = "../vendor/leaflet/leaflet-src.esm.js";
const LEAFLET_CSS = "./vendor/leaflet/leaflet.css";
const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// English names for data.json (its Japanese names follow ncjpn.com/products/effective-micro-hydro-system/).
const NAMES_EN = {
	"白糸の滝step2発電所": "Shiraito no Taki Step 2 Power Plant",
	"大日止昴小水力発電所": "Ohhitosubaru Small Hydropower Plant",
	"井手野毘沙門堂発電所": "Ideno Bishamondo Power Plant",
	"老竹発電所": "Oitake Power Plant",
	"田口発電所": "Taguchi Power Plant",
	"白糸の滝step3小水力発電所": "Shiraito no Taki Step 3 Small Hydropower Plant",
	"松隈小水力発電所": "Matsuguma Small Hydropower Plant",
	"本城イチトキ小水力発電所": "Honjo-Ichitoki Small Hydropower Plant",
	"黒木川発電所": "Kurokigawa Power Plant",
	"豊松発電所": "Toyomatsu Power Plant",
	"あばむらコンパクト発電所": "Abamura Compact Power Plant",
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
};

// Nakayama Iron Works head office and factory (ncjpn.com/company/access/), geocoded with GSI.
const HQ = {
	lat: 33.211353,
	lng: 130.046112,
	name: { en: "Nakayama Iron Works, Ltd.", ja: "株式会社中山鉄工所" },
	place: { en: "Head office & factory · Takeo, Saga", ja: "本社・工場 · 佐賀県武雄市" },
	address: { en: "2246-1 Amaku, Asahi-machi, Takeo, Saga 843-0001, Japan", ja: "〒843-0001 佐賀県武雄市朝日町甘久2246-1" },
};

// Reference cities on the vector basemap (prefectural capitals and a few large cities), shown from CITY_ZOOM.
const CITIES = [
	{ en: "Fukuoka", ja: "福岡", lat: 33.59, lng: 130.402 },
	{ en: "Kitakyushu", ja: "北九州", lat: 33.883, lng: 130.875 },
	{ en: "Saga", ja: "佐賀", lat: 33.249, lng: 130.299 },
	{ en: "Nagasaki", ja: "長崎", lat: 32.75, lng: 129.878 },
	{ en: "Kumamoto", ja: "熊本", lat: 32.803, lng: 130.708 },
	{ en: "Oita", ja: "大分", lat: 33.238, lng: 131.613 },
	{ en: "Miyazaki", ja: "宮崎", lat: 31.911, lng: 131.424 },
	{ en: "Kagoshima", ja: "鹿児島", lat: 31.597, lng: 130.557 },
	{ en: "Yamaguchi", ja: "山口", lat: 34.178, lng: 131.474 },
	{ en: "Hiroshima", ja: "広島", lat: 34.385, lng: 132.455 },
	{ en: "Okayama", ja: "岡山", lat: 34.655, lng: 133.919 },
	{ en: "Matsue", ja: "松江", lat: 35.468, lng: 133.049 },
	{ en: "Tottori", ja: "鳥取", lat: 35.501, lng: 134.238 },
	{ en: "Matsuyama", ja: "松山", lat: 33.839, lng: 132.766 },
	{ en: "Kochi", ja: "高知", lat: 33.559, lng: 133.531 },
	{ en: "Takamatsu", ja: "高松", lat: 34.342, lng: 134.047 },
	{ en: "Tokushima", ja: "徳島", lat: 34.07, lng: 134.555 },
	{ en: "Kobe", ja: "神戸", lat: 34.69, lng: 135.196 },
	{ en: "Osaka", ja: "大阪", lat: 34.694, lng: 135.502 },
];
// One set of place names at a time: prefecture names from PREFECTURE_ZOOM, replaced by city names
// from CITY_ZOOM (both at once repeat each other: "Saga" next to "SAGA").
const PREFECTURE_ZOOM = 6.5;
const CITY_ZOOM = 8.5;

// Line icons (24×24, stroked by CSS) for the list, the legend and the HQ marker.
const ICONS = {
	factory: '<path d="M3 20.5V10l5 3v-3l5 3V5.5h3.5v15zM2 20.5h20M7 17h1.5M11 17h1.5M15 17h1.5"/>',
};
const svgIcon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

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

const siteName = (site) => (getLang() === "ja" ? site.name : NAMES_EN[site.name] ?? site.name);
const sitePrefecture = (site) => (getLang() === "ja" ? site.location : PREFECTURES_EN[site.location] ?? site.location);

function popupHtml(site) {
	const ja = getLang() === "ja";
	const place = ja ? site.location : `${sitePrefecture(site)}, Japan`;
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
		<div class="mh-popup-name">${escapeHtml(siteName(site))}</div>
		${image(site.image, "mh-popup-photo")}
		<div class="mh-popup-info">
			${image(site.image2, "mh-popup-photo2")}
			<div class="mh-popup-details">${rows}</div>
		</div>
		${directions}`;
}

function hqPopupHtml() {
	return `
		<div class="mh-popup-place">${escapeHtml(localize(HQ.place))}</div>
		<div class="mh-popup-name">${escapeHtml(localize(HQ.name))}</div>
		<div class="mh-popup-address">${escapeHtml(localize(HQ.address))}</div>`;
}

// ------------------------------------------- sidebar: KPIs + plant list -------------------------------------------
const number = (value) => parseFloat(value) || 0;
const formatNumber = (value, digits) => value.toLocaleString("en-US", { maximumFractionDigits: digits });

// Annual energy as the headline (plants + prefectures under it), capacity and CO₂ as the supporting row.
function kpisHtml(sites) {
	const total = (key) => sites.reduce((sum, site) => sum + number(site.details?.[key]), 0);
	const prefectures = new Set(sites.map((site) => site.location)).size;
	const note = escapeHtml(t("map.kpi.note"))
		.replace("{plants}", `<b>${sites.length}</b>`)
		.replace("{prefectures}", `<b>${prefectures}</b>`);
	const stats = [
		{ label: "map.kpi.output", value: formatNumber(total("発電機出力"), 1), unit: "kW" },
		{ label: "map.kpi.co2", value: formatNumber(total("CO2年間削減量"), 0), unit: t("map.kpi.co2Unit") },
	];
	return `
		<div class="map-kpi-label">${escapeHtml(t("map.kpi.energy"))}</div>
		<div class="map-kpi-hero">${formatNumber(total("年間電力量"), 0)}<span>${escapeHtml(t("map.kpi.energyUnit"))}</span></div>
		<div class="map-kpi-note">${note}</div>
		<div class="map-kpi-row">
			${stats
				.map(
					(stat) => `
			<div class="map-kpi-stat">
				<div class="map-kpi-value">${escapeHtml(stat.value)}<span>${escapeHtml(stat.unit)}</span></div>
				<div class="map-kpi-label">${escapeHtml(t(stat.label))}</div>
			</div>`
				)
				.join("")}
		</div>`;
}

function listItemHtml(index, name, sub, value = "") {
	return `
		<li><button type="button" class="map-list-item${index === "hq" ? " is-hq" : ""}" data-index="${index}">
			<span class="map-list-dot">${index === "hq" ? svgIcon("factory") : ""}</span>
			<span class="map-list-text">
				<span class="map-list-name">${escapeHtml(name)}</span>
				<span class="map-list-sub">${escapeHtml(sub)}</span>
			</span>
			<span class="map-list-value">${escapeHtml(value)}</span>
		</button></li>`;
}

function renderSidebar(side, sites) {
	const rows = sites.map((site, i) => listItemHtml(i, siteName(site), sitePrefecture(site), site.details?.["発電機出力"]));
	side.innerHTML = `
		<div class="map-kpis">${kpisHtml(sites)}</div>
		<div class="map-list-head">${escapeHtml(t("map.list.title"))}<span>${sites.length}</span></div>
		<ul class="map-list">
			${listItemHtml("hq", localize(HQ.name), localize(HQ.place))}
			${rows.join("")}
		</ul>`;
}

// ------------------------------------------- basemap labels -------------------------------------------
/** Label point of a (Multi)Polygon: centroid of its largest outer ring. */
function labelPoint(geometry) {
	const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
	let best = null;
	polygons.forEach(([ring]) => {
		let area = 0, x = 0, y = 0;
		for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
			const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
			area += cross;
			x += (ring[j][0] + ring[i][0]) * cross;
			y += (ring[j][1] + ring[i][1]) * cross;
		}
		if (!best || Math.abs(area) > best.area) best = { area: Math.abs(area), lat: y / (3 * area), lng: x / (3 * area) };
	});
	return [best.lat, best.lng];
}

// "Ōita Prefecture" -> "Oita"
const plainName = (name) => name.replace(/ Prefecture$/, "").normalize("NFD").replace(/[̀-ͯ]/g, "");

function addLabels(L, layer, shapes, served) {
	const ja = getLang() === "ja";
	const label = (latlng, text, className) =>
		L.marker(latlng, {
			pane: "labels",
			interactive: false,
			keyboard: false,
			icon: L.divIcon({ className, html: `<span>${escapeHtml(text)}</span>`, iconSize: null }),
		}).addTo(layer);

	layer.clearLayers();
	shapes.features
		.filter((feature) => feature.properties.kind === "prefecture")
		.forEach(({ properties, geometry }) => {
			const text = ja ? properties.name_ja : plainName(properties.name_en);
			label(labelPoint(geometry), text, `mh-label-prefecture${served.has(properties.name_ja) ? " is-served" : ""}`);
		});
	CITIES.forEach((city) => label([city.lat, city.lng], ja ? city.ja : city.en, "mh-label-city"));
}

// ------------------------------------------- build -------------------------------------------
async function buildLocal() {
	loadCss(LEAFLET_CSS);
	const [L, data, shapes] = await Promise.all([
		import(LEAFLET_JS),
		fetch(`${DATA_DIR}data.json`).then((r) => r.json()),
		fetch(`${DATA_DIR}basemap.json`).then((r) => r.json()), // GeoJSON; .json because IIS has no .geojson MIME type
	]);
	// North to south, so the list reads in the same order as the map.
	const sites = data.map((site) => ({ ...site, location: site.location.trim() })).sort((a, b) => b.lat - a.lat);
	const served = new Set(sites.map((site) => site.location));

	const wrap = document.createElement("div");
	wrap.className = "map-local";
	const side = document.createElement("aside");
	side.className = "map-side";
	const container = document.createElement("div");
	container.className = "map-leaflet";
	wrap.append(side, container);
	body.replaceChildren(wrap);
	renderSidebar(side, sites);

	const map = L.map(container, { minZoom: 4, maxZoom: 16, zoomSnap: 0.5 });
	leafletMap = map;

	// Offline vector basemap, in its own pane below the tile pane (z 200) so tiles cover it when online.
	// Prefectures with an installation get a light tint.
	map.createPane("basemap").style.zIndex = 150;
	L.geoJSON(shapes, {
		pane: "basemap",
		interactive: false,
		style: ({ properties }) =>
			properties.kind !== "prefecture"
				? { color: "#b8c9cc", weight: 0.6, fillColor: "#e9eeec", fillOpacity: 1 }
				: served.has(properties.name_ja)
				? { color: "#8fb3bd", weight: 0.8, fillColor: "#dff0f2", fillOpacity: 1 }
				: { color: "#8fb3bd", weight: 0.8, fillColor: "#f7faf8", fillOpacity: 1 },
	}).addTo(map);
	map.attributionControl.addAttribution("Basemap: Natural Earth");

	if (basemap === "auto" && navigator.onLine) {
		L.tileLayer(OSM_TILES, {
			maxZoom: 18,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
		}).addTo(map);
	}

	// Names above the basemap/tiles, below the markers (marker pane: z 600). Shown per zoom level by CSS.
	map.createPane("labels").style.zIndex = 450;
	const labels = L.layerGroup().addTo(map);
	addLabels(L, labels, shapes, served);
	const syncZoomClasses = () => {
		const zoom = map.getZoom();
		container.classList.toggle("show-prefectures", zoom >= PREFECTURE_ZOOM && zoom < CITY_ZOOM);
		container.classList.toggle("show-cities", zoom >= CITY_ZOOM);
	};
	map.on("zoomend", syncZoomClasses);

	const popupOptions = { className: "mh-popup", minWidth: 260, maxWidth: 300, autoPanPadding: [24, 24] };
	const plantIcon = L.divIcon({ className: "mh-marker", html: "<span></span>", iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -12] });
	const markers = sites.map((site) =>
		L.marker([site.lat, site.lng], { icon: plantIcon })
			.bindPopup(() => popupHtml(site), popupOptions)
			.bindTooltip(() => escapeHtml(siteName(site)), { className: "mh-tooltip", direction: "top", offset: [0, -12] })
			.addTo(map)
	);

	const hqIcon = L.divIcon({ className: "mh-hq", html: `<span>${svgIcon("factory")}</span>`, iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -18] });
	const hqMarker = L.marker([HQ.lat, HQ.lng], { icon: hqIcon, zIndexOffset: 1000 })
		.bindPopup(hqPopupHtml, { ...popupOptions, minWidth: 220 })
		.bindTooltip(() => escapeHtml(localize(HQ.name)), { className: "mh-tooltip", direction: "top", offset: [0, -18] })
		.addTo(map);
	const markerAt = (index) => (index === "hq" ? hqMarker : markers[index]);
	const indexOf = (marker) => (marker === hqMarker ? "hq" : markers.indexOf(marker));

	// Legend (bottom left, over the East China Sea) and a first-use hint that goes once a popup opens.
	const legend = L.control({ position: "bottomleft" });
	legend.onAdd = () => L.DomUtil.create("div", "map-legend");
	legend.addTo(map);
	const hint = document.createElement("div");
	hint.className = "map-hint";
	container.appendChild(hint);
	const renderOverlays = () => {
		legend.getContainer().innerHTML = `
			<div><span class="map-legend-plant"></span>${escapeHtml(t("map.legend.plant"))}</div>
			<div><span class="map-legend-hq">${svgIcon("factory")}</span>${escapeHtml(t("map.legend.hq"))}</div>`;
		hint.textContent = t("map.hint");
	};
	renderOverlays();

	map.fitBounds([...sites.map((site) => [site.lat, site.lng]), [HQ.lat, HQ.lng]], { padding: [40, 40] });
	syncZoomClasses();

	// List -> map: hover highlights the marker, click flies there and opens its popup.
	side.addEventListener("click", (event) => {
		const item = event.target.closest(".map-list-item");
		if (!item) return;
		const marker = markerAt(item.dataset.index);
		map.closePopup();
		map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 9), { duration: 0.8 });
		map.once("moveend", () => marker.openPopup());
	});
	const hover = (event, value) => {
		const item = event.target.closest?.(".map-list-item");
		if (item && !item.contains(event.relatedTarget)) markerAt(item.dataset.index).getElement()?.classList.toggle("is-hover", value);
	};
	side.addEventListener("mouseover", (event) => hover(event, true));
	side.addEventListener("mouseout", (event) => hover(event, false));

	// Map -> list: the open popup's row is highlighted and scrolled into view.
	const listItem = (marker) => side.querySelector(`.map-list-item[data-index="${indexOf(marker)}"]`);
	map.on("popupopen", ({ popup }) => {
		hint.classList.add("is-hidden");
		const item = listItem(popup._source);
		item?.classList.add("is-active");
		item?.scrollIntoView({ block: "nearest", behavior: "smooth" });
		// Photos load after the popup opens and make it taller: re-layout (and re-pan into view) once they arrive.
		popup.getElement()?.querySelectorAll("img").forEach((img) => {
			if (!img.complete) img.addEventListener("load", () => popup.isOpen() && popup.update(), { once: true });
		});
	});
	map.on("popupclose", ({ popup }) => listItem(popup._source)?.classList.remove("is-active"));

	onLangChange(() => {
		renderSidebar(side, sites);
		addLabels(L, labels, shapes, served);
		renderOverlays();
	});
}

onLangChange(() => leafletMap?.closePopup());
