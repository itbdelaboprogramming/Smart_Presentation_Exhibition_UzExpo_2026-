# Container Micro-Hydro Site — GLB for the UzEnergyExpo 2026 smart presentation

Hillside site built around the Nakayama 20 ft container micro-hydro GLB:
**river → intake weir → headrace → forebay (head tank) → penstock → container (crossflow turbine) → tailrace → river**,
plus the grid connection. Stylised low-poly diorama (like the reference diagram), but every part is at real scale
and aligned to the container's actual inlet flange and discharge chute.

## Files

| File | What it is |
|---|---|
| `MicroHydro_Site_with_Container_draco.glb` (≈1.8 MB) | Full scene: site + your container GLB. Container geometry/transforms are untouched, just parented under `NIW_Container_20ft_100kW`. |
| `MicroHydro_Site_Environment_draco.glb` (≈0.55 MB) | Site only, **same coordinate frame** as the container GLB. Load it next to your existing container file with no offset. |
| `index.html` | Test viewer (three.js r169, GLTFLoader + DRACOLoader, hotspots, presets, animation). Serve over http (e.g. XAMPP), not `file://`. |
| `MicroHydro_review_contact_sheet.png`, `MicroHydro_reference_vs_render.png` | Review renders from the final GLB. |
| `source/` | Generator (three.js + glTF-Transform). See "Regenerate". |

Both GLBs use `KHR_draco_mesh_compression` (same as your current pipeline) and pass the Khronos glTF Validator with
0 errors / 0 warnings.

## Scale and alignment (metres, +Y up)

| Item | Value |
|---|---|
| Container | Original frame kept at its origin: ISO 20 ft 6.058 × 2.438 × 2.591 m, open display side −X, doors −Z |
| Inlet flange (from the CAD) | JIS 10K 400A, centre x −0.527, y 0.652, face z 2.146 → penstock mating flange OD 559 mm |
| Penstock | Steel 500A (OD 508), reducer to 400A at the container, dismantling joint, 3 anchor blocks, 7 piers, 34° slope |
| Discharge | Crossflow free discharge through the floor chute into a pit, then culvert, open tailrace (0.8 m) and outfall chute to the river |
| Forebay / head tank | 3.0 × 7.0 m inside, water level EL +26.8 m, desilting baffle, inclined trash rack, side spillway |
| Headrace | 1.0 m concrete channel, ≈19 m, from a side intake (trash rack + sluice gate) at the weir |
| Intake weir | Crest EL +27.0 m, 8.7 m long, ogee face, stilling basin |
| Head / flow (illustrative) | Gross head ≈26.2 m, Q ≈0.55 m³/s → ≈100 kW class (brochure: SN-1000_v1, head 10–100 m, Q 0.02–0.6 m³/s, pipe Φ400–Φ500) |
| Scale cues | Three 1.7 m workers, 11 m utility poles, 5–16 m trees |
| Diorama | 60 × 92 m, terrain from about −3 to +43 m, earth cut-away down to −12 m, waterfall off the front cut |

This is a presentation layout, not a site design: head, flow and structure sizes are plausible values chosen inside the
brochure ranges.

## Scene graph

```
MicroHydro_Site                 (extras: views, hydraulics, notes)
├─ ENV_Landscape                ENV_Terrain, ENV_EarthSection
├─ ENV_Water                    WATER_River, WATER_Waterfall_Edge, WATER_Channels, …
├─ CIVIL_Structures             CIVIL_01_IntakeWeir … CIVIL_05_Powerhouse_Foundation
├─ ELEC_07_GridConnection       poles, transformer, conductors, service cable from the roof cable frame
├─ ENV_Vegetation               VEG_Trees, VEG_Shrubs, VEG_Rocks  (hide for a clean technical view)
├─ FX_FlowArrows                29 animated chevrons (headrace, penstock, tailrace)
├─ HOTSPOTS                     HS_01_IntakeWeir … HS_07_GridConnection (empty anchor nodes)
├─ ENV_People_Scale_1.7m
└─ NIW_Container_20ft_100kW     original container nodes (only in the "with_Container" file)
```

Material names start with `MH_` (e.g. `MH_Water`, `MH_Penstock_Steel`, `MH_Concrete`) and `FX_FlowArrow`, so you can
restyle them by name.

## Using it in the smart presentation (three.js)

```js
loader.load('MicroHydro_Site_with_Container_draco.glb', (gltf) => {
  scene.add(gltf.scene);

  // 1) water-flow animation ("WaterFlow", 12 s loop) → hook to your Animation button
  const mixer = new THREE.AnimationMixer(gltf.scene);
  gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
  // in the render loop: mixer.update(delta)
  // to hide the arrows entirely: gltf.scene.getObjectByName('FX_FlowArrows').visible = false;

  // 2) camera presets stored in the file
  const site = gltf.scene.getObjectByName('MicroHydro_Site');
  const views = site.userData.views;          // [{ name, position:[x,y,z], target:[x,y,z] }, …]

  // 3) hotspot labels (glTF extras → userData)
  gltf.scene.traverse((o) => {
    if (o.userData.hotspot) addLabel(o, o.userData.index, o.userData.title, o.userData.title_ja, o.userData.description);
  });
});
```

Camera and lights for a scene this size: `near 0.1`, `far ≥ 1000`, OrbitControls `maxDistance ≈ 260`, directional-light
shadow camera about ±70 m around (−2, 5, 20). The container stays at the origin, so a "zoom to product" preset can reuse
your existing container camera.

## Regenerate / tweak

```
cd source
npm install
node src/build.mjs                          # → out/env_raw.glb (site, uncompressed)
node src/package.mjs container_draco.glb    # → out/*_draco.glb (merged + Draco)
```

All dimensions live in `src/params.mjs` (slope angle, forebay level = head, river path, weir, poles, camera presets).
Vegetation and cascades are seeded, so every build is identical until you change a parameter.

## Method

Built the img2threejs way (reference → detail inventory → dimensioned spec → procedural three.js factory, pass by pass:
blockout, structure, form, material, interaction/animation, optimisation → render-and-compare review), but as a
multi-component site rather than a single object. Scale comes from the CAD container and the brochure, not from the
reference pixels.
