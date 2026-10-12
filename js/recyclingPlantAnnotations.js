// Annotations per catalogue model. `model` (and the DEFAULT_VIEWS key) = the catalogue item's
// `data-key` in index.php. The array below is plain JSON: the tag tool (?tag=1) rewrites it
// through api/annotations/save.php, so keep comments out of it.
export const DEFAULT_VIEWS = {
	// from the container's open display side (-X)
	container: {
		position: { x: -5.6, y: 3.3, z: -3.6 },
		target: { x: 0, y: 1.1, z: -1 },
	},
	// "Overview" preset stored in the site GLB (MicroHydro_Site.userData.views)
	site: {
		position: { x: -72, y: 58, z: -52 },
		target: { x: -3, y: 8, z: 18 },
	},
};

/** Key of the model currently shown (live binding: follows setActiveModel). */
export let ACTIVE_MODEL = "container";

/** Default view of the model currently shown (live binding: follows setActiveModel). */
export let DEFAULT_VIEW = DEFAULT_VIEWS[ACTIVE_MODEL];

/** Called when the catalogue switches model; returns false if `key` has no default view yet. */
export function setActiveModel(key) {
	ACTIVE_MODEL = key;
	if (!DEFAULT_VIEWS[key]) return false;
	DEFAULT_VIEW = DEFAULT_VIEWS[key];
	return true;
}

const annotations = 
[
  {
    "id": "container-crossflow-turbine",
    "model": "container",
    "order": 2,
    "group": null,
    "title": {
      "en": "Crossflow Turbine",
      "ja": "クロスフロー水車"
    },
    "anchor": {
      "x": -0.56,
      "y": 0.93,
      "z": 0.12
    },
    "labelOffset": {
      "x": -0.6,
      "y": 2.25,
      "z": 0.05
    },
    "camera": {
      "position": {
        "x": -2.2,
        "y": 2.3,
        "z": -0.6
      },
      "target": {
        "x": -0.5,
        "y": 0.6,
        "z": 0.15
      },
      "duration": 1.8
    },
    "meshNames": [
      "Cut-Sweep1",
      "<20210524_岡山_LabyrinthSeal>-<Cut-Sweep1>",
      "<22214EKH314_01>-<Revolve1>",
      "<22214EKH314_02>-<CirPattern1>",
      "<22214EKH314_03>-<Boss-Extrude1>",
      "<22214EKH314_04>-<Cut-Extrude1>",
      "<22214EKH314_05>-<Cut-Extrude1>",
      "<20210524_岡山_T14D225(BearingHouse)>-<Chamfer1>",
      "<20210524_岡山_T14D225(RotorCover)>-<CirPattern2>",
      "Cut-Extrude1",
      "Revolve1",
      "CirPattern1_(2)",
      "Boss-Extrude002",
      "Cut-Extrude1_(2)",
      "Cut-Extrude1_(1)",
      "CirPattern1_(3)",
      "CirPattern1_(4)",
      "Chamfer007",
      "CirPattern2",
      "Cut-Extrude1_(3)",
      "Boss-Extrude005",
      "Boss-Extrude15",
      "Boss-Extrude18",
      "Boss-Extrude19",
      "Boss-Extrude20",
      "Boss-Extrude8",
      "Cut-Extrude81",
      "Cut-Extrude82",
      "Cut-Extrude9",
      "Intersect11",
      "Intersect13",
      "Intersect14",
      "Intersect15",
      "Intersect16",
      "Intersect17",
      "LPattern2",
      "Fillet2"
    ],
    "popup": {
      "en": {
        "blocks": [
          {
            "type": "text",
            "value": "The heart of the package. Water from the penstock flows through the motorized inlet valve into the crossflow turbine, whose rotation drives the generator."
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/turbine-generator-photo.png",
            "caption": "Crossflow turbine and generator"
          },
          {
            "type": "heading",
            "value": "Features"
          },
          {
            "type": "list",
            "items": [
              "High efficiency",
              "Less maintenance",
              "Stable operation"
            ]
          },
          {
            "type": "heading",
            "value": "Operating range"
          },
          {
            "type": "list",
            "items": [
              "Effective head: <b>10–100 m</b>",
              "Flow rate: <b>0.02–0.6 m³/s</b>",
              "Output: <b>19.9 / 30 / 49.9 / 100 kW</b>",
              "Applicable to small rivers, springs, irrigation channels, etc."
            ]
          },
          {
            "type": "heading",
            "value": "Turbine selection"
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/turbine-selection-chart.png",
            "caption": "Selection by effective head and flow rate"
          },
          {
            "type": "text",
            "value": "Example: effective head <b>80 m</b> and flow rate <b>0.11 m³/s</b> → <b>66 kW</b> with a crossflow turbine."
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/turbine-efficiency-curve.png",
            "caption": "Water turbine efficiency curve"
          }
        ]
      },
      "ja": {
        "blocks": [
          {
            "type": "text",
            "value": "パッケージの中心となる機器です。水圧管路からの水は電動入口弁を通ってクロスフロー水車に流れ込み、その回転で発電機を駆動します。"
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/turbine-generator-photo.png",
            "caption": "クロスフロー水車と発電機"
          },
          {
            "type": "heading",
            "value": "特長"
          },
          {
            "type": "list",
            "items": [
              "高効率",
              "メンテナンスが少ない",
              "安定した運転"
            ]
          },
          {
            "type": "heading",
            "value": "適用範囲"
          },
          {
            "type": "list",
            "items": [
              "有効落差：<b>10～100 m</b>",
              "流量：<b>0.02～0.6 m³/s</b>",
              "出力：<b>19.9 / 30 / 49.9 / 100 kW</b>",
              "小河川、湧水、農業用水路などに適用可能"
            ]
          },
          {
            "type": "heading",
            "value": "水車の選定"
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/turbine-selection-chart.png",
            "caption": "有効落差と流量による選定"
          },
          {
            "type": "text",
            "value": "選定例：有効落差 <b>80 m</b>、流量 <b>0.11 m³/s</b> → クロスフロー水車で <b>66 kW</b>。"
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/turbine-efficiency-curve.png",
            "caption": "水車効率曲線"
          }
        ]
      }
    }
  },
  {
    "id": "container-generator",
    "model": "container",
    "order": 4,
    "group": null,
    "title": {
      "en": "Generator",
      "ja": "発電機"
    },
    "anchor": {
      "x": -0.49,
      "y": 0.97,
      "z": -1.2
    },
    "labelOffset": {
      "x": -0.6,
      "y": 1.9,
      "z": -1.35
    },
    "camera": {
      "position": {
        "x": -2.6,
        "y": 1.6,
        "z": -2.3
      },
      "target": {
        "x": -0.49,
        "y": 0.7,
        "z": -0.75
      },
      "duration": 1.8
    },
    "meshNames": [
      "Combine2"
    ],
    "popup": {
      "en": {
        "blocks": [
          {
            "type": "text",
            "value": "Converts the turbine's rotation into electricity. The output passes through the generator control inverter and the power conditioner, then goes to the grid or to stand-alone loads."
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/turbine-generator-photo.png",
            "caption": "Generator (front) and crossflow turbine"
          },
          {
            "type": "heading",
            "value": "Features"
          },
          {
            "type": "list",
            "items": [
              "High efficiency",
              "Less maintenance",
              "Stable operation"
            ]
          },
          {
            "type": "heading",
            "value": "Different ways of use"
          },
          {
            "type": "list",
            "items": [
              "<b>Stand-alone power supply</b> — sends electricity to homes in the surrounding area without the power company's lines; especially effective where there are no supply lines",
              "<b>Power generation business</b> — produce and sell electricity to the electric power company"
            ]
          },
          {
            "type": "text",
            "value": "<small>In developed countries, 1 kW of electricity covers two or three households; in developing countries it can cover more.</small>"
          }
        ]
      },
      "ja": {
        "blocks": [
          {
            "type": "text",
            "value": "水車の回転を電気に変換します。出力は発電機制御インバータとパワーコンディショナを経て、系統または自立負荷へ供給されます。"
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/turbine-generator-photo.png",
            "caption": "発電機（手前）とクロスフロー水車"
          },
          {
            "type": "heading",
            "value": "特長"
          },
          {
            "type": "list",
            "items": [
              "高効率",
              "メンテナンスが少ない",
              "安定した運転"
            ]
          },
          {
            "type": "heading",
            "value": "さまざまな使い方"
          },
          {
            "type": "list",
            "items": [
              "<b>自立電源として</b> — 電力会社の送電線を使わずに周辺の家庭へ電気を届けます。送電線のない地域で特に有効です",
              "<b>発電事業として</b> — 発電した電気を電力会社に売電できます"
            ]
          },
          {
            "type": "text",
            "value": "<small>先進国では 1 kW で 2～3 世帯分、電力消費の少ない途上国ではさらに多くの世帯をまかなえます。</small>"
          }
        ]
      }
    }
  },
  {
    "id": "container-control-panel",
    "model": "container",
    "order": 5,
    "group": null,
    "title": {
      "en": "Control Panel",
      "ja": "制御盤"
    },
    "anchor": {
      "x": -0.01,
      "y": 1.75,
      "z": 1.21
    },
    "labelOffset": {
      "x": 0.0,
      "y": 2.45,
      "z": 1.25
    },
    "camera": {
      "position": {
        "x": -2.6,
        "y": 1.2,
        "z": 0.0
      },
      "target": {
        "x": 0.3,
        "y": 1.3,
        "z": 1.2
      },
      "duration": 1.8
    },
    "meshNames": [
      "Boss-Extrude10",
      "Boss-Extrude51_(1)",
      "Boss-Extrude52_(1)",
      "Boss-Extrude61",
      "Boss-Extrude62",
      "Boss-Extrude63",
      "Boss-Extrude64",
      "Boss-Extrude71",
      "Boss-Extrude72",
      "Boss-Extrude8_(2)",
      "Boss-Extrude9",
      "Cut-Extrude1_(11)",
      "Fillet1_(2)",
      "Shell1",
      "TrimExtend11",
      "TrimExtend12",
      "等辺山形鋼_L-50×50×6(1)1",
      "等辺山形鋼_L-50×50×6(1)2",
      "Fillet7",
      "Fillet8_(1)",
      "LPattern1_(1)",
      "Fillet8",
      "2Cuts_(1)",
      "3Cuts_(1)",
      "Dome1_(1)",
      "2Cuts_(2)",
      "3Cuts_(2)",
      "Dome1_(2)",
      "2Cuts_(3)",
      "3Cuts_(3)",
      "Dome1_(3)",
      "2Cuts_(4)",
      "3Cuts_(4)",
      "Dome1_(4)",
      "2Cuts_(5)",
      "3Cuts_(5)",
      "Dome1_(5)",
      "2Cuts_(6)",
      "3Cuts_(6)",
      "Dome1_(6)"
    ],
    "popup": {
      "en": {
        "blocks": [
          {
            "type": "text",
            "value": "Controls and protects the whole package, from start/stop to output control."
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/control-panel-photo.png",
            "caption": "Example: control panel"
          },
          {
            "type": "heading",
            "value": "Features"
          },
          {
            "type": "list",
            "items": [
              "Built-in reverse converter for compact storage",
              "Easy to operate",
              "High quality and reliability"
            ]
          },
          {
            "type": "heading",
            "value": "Remote monitoring (optional)"
          },
          {
            "type": "text",
            "value": "Operation and output can be monitored by smartphone, tablet or PC. The total CO₂ emission reduction, electricity generated and electricity sales revenue can be checked on a dedicated page (online)."
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/remote-monitoring.png",
            "caption": "Remote monitoring on PC and tablet"
          }
        ]
      },
      "ja": {
        "blocks": [
          {
            "type": "text",
            "value": "起動・停止から出力制御まで、パッケージ全体を制御・保護します。"
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/control-panel-photo.png",
            "caption": "制御盤の例"
          },
          {
            "type": "heading",
            "value": "特長"
          },
          {
            "type": "list",
            "items": [
              "逆変換器を内蔵しコンパクトに収納",
              "操作が簡単",
              "高品質・高信頼性"
            ]
          },
          {
            "type": "heading",
            "value": "遠隔監視（オプション）"
          },
          {
            "type": "text",
            "value": "運転状況や出力をスマートフォン、タブレット、PC で確認できます。CO₂ 削減量の累計、発電量、売電収入も専用ページ（オンライン）で確認できます。"
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/remote-monitoring.png",
            "caption": "PC・タブレットでの遠隔監視"
          }
        ]
      }
    }
  },
  {
    "id": "container-power-conditioner",
    "model": "container",
    "order": 7,
    "group": null,
    "title": {
      "en": "Power Conditioner",
      "ja": "パワーコンディショナ"
    },
    "anchor": {
      "x": 0.2,
      "y": 1.75,
      "z": -2.0
    },
    "labelOffset": {
      "x": 0.2,
      "y": 2.35,
      "z": -2.0
    },
    "camera": {
      "position": {
        "x": -1.817,
        "y": 2.548,
        "z": -3.199
      },
      "target": {
        "x": 0.58,
        "y": 1.2,
        "z": -2.0
      },
      "duration": 1.8
    },
    "meshNames": [
      "2Cuts",
      "3Cuts",
      "Dome1",
      "Shell3",
      "TrimExtend1",
      "溝形鋼_-125×65×6(1)1",
      "溝形鋼_-125×65×6(1)2",
      "溝形鋼_-125×65×6(1)3",
      "溝形鋼_-125×65×6(1)4",
      "Cut-Extrude2_(1)"
    ],
    "popup": {
      "en": {
        "blocks": [
          {
            "type": "text",
            "value": "Grid-tied inverter that connects the generated power to the utility grid, with a built-in islanding detection function."
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/power-conditioner-photo.png",
            "caption": "Power conditioner"
          },
          {
            "type": "heading",
            "value": "Features"
          },
          {
            "type": "list",
            "items": [
              "Allowable frequency at parallel connection",
              "FRT",
              "STEP3.2",
              "Output control"
            ]
          },
          {
            "type": "heading",
            "value": "Quality of power connected to the grid"
          },
          {
            "type": "list",
            "items": [
              "Compliant with <b>JEAC 9701</b>",
              "Voltage: <b>202 V ±10%</b>",
              "Frequency: <b>50/60 Hz, ±0.1 Hz</b>",
              "Current distortion: less than 5% in total, less than 3% for each harmonic (up to the 40th)"
            ]
          },
          {
            "type": "heading",
            "value": "Islanding detection"
          },
          {
            "type": "list",
            "items": [
              "OV, UV, OF, UF",
              "Passive method (voltage phase jump)",
              "Step-injection frequency feedback method"
            ]
          }
        ]
      },
      "ja": {
        "blocks": [
          {
            "type": "text",
            "value": "発電した電力を電力系統へ連系する系統連系インバータです。単独運転検出機能を内蔵しています。"
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/power-conditioner-photo.png",
            "caption": "パワーコンディショナ"
          },
          {
            "type": "heading",
            "value": "特長"
          },
          {
            "type": "list",
            "items": [
              "並列時の許容周波数",
              "FRT",
              "STEP3.2",
              "出力制御"
            ]
          },
          {
            "type": "heading",
            "value": "系統連系の電力品質"
          },
          {
            "type": "list",
            "items": [
              "<b>JEAC 9701</b> 準拠",
              "電圧：<b>202 V ±10%</b>",
              "周波数：<b>50/60 Hz、±0.1 Hz</b>",
              "電流歪率：総合 5% 未満、各次 3% 未満（40 次まで）"
            ]
          },
          {
            "type": "heading",
            "value": "単独運転検出"
          },
          {
            "type": "list",
            "items": [
              "OV、UV、OF、UF",
              "受動的方式（電圧位相跳躍）",
              "ステップ注入付周波数フィードバック方式"
            ]
          }
        ]
      }
    }
  },
  {
    "id": "container-motorized-inlet-valve",
    "model": "container",
    "order": 1,
    "group": null,
    "title": {
      "en": "Motorized Inlet Valve",
      "ja": "電動入口弁"
    },
    "anchor": {
      "x": -0.53,
      "y": 1.0,
      "z": 0.945
    },
    "labelOffset": {
      "x": -0.75,
      "y": 1.8,
      "z": 0.8
    },
    "camera": {
      "position": {
        "x": -2.128,
        "y": 1.749,
        "z": 0.151
      },
      "target": {
        "x": -0.53,
        "y": 0.85,
        "z": 0.95
      },
      "duration": 1.8
    },
    "meshNames": [
      "Cut-Extrude17",
      "Cut-Extrude1_(10)",
      "Boss-Extrude3_(2)"
    ],
    "popup": {
      "en": {
        "blocks": [
          {
            "type": "text",
            "value": "Motor-driven valve at the container inlet that opens and closes the water supply to the turbine. The site penstock is connected to the container's inlet flange."
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/flow-control-diagram.png",
            "caption": "Inflow → motorized inlet valve → turbine → discharge"
          },
          {
            "type": "heading",
            "value": "Flow control"
          },
          {
            "type": "list",
            "items": [
              "Smooth start/stop operation",
              "Water flow continuity ensured, even in case of breakdown or power failure",
              "Maximum output control according to the water volume",
              "Additional functions to support variable water level and volume"
            ]
          },
          {
            "type": "heading",
            "value": "Available options for various water use"
          },
          {
            "type": "list",
            "items": [
              "Control of constant water level in the intake tank",
              "Control of constant water discharge",
              "Control of pressure reduction"
            ]
          },
          {
            "type": "text",
            "value": "<small>Pipe size: Φ400–Φ500 (100 kW). Check the pipe and flange size (5K, 10K, 16K, etc.) before connecting.</small>"
          }
        ]
      },
      "ja": {
        "blocks": [
          {
            "type": "text",
            "value": "コンテナ入口にある電動弁で、水車への給水を開閉します。現地の水圧管路はコンテナの入口フランジに接続します。"
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/flow-control-diagram.png",
            "caption": "流入 → 電動入口弁 → 水車 → 放流"
          },
          {
            "type": "heading",
            "value": "流量制御"
          },
          {
            "type": "list",
            "items": [
              "スムーズな起動・停止",
              "故障時や停電時でも通水を継続",
              "水量に応じた最大出力制御",
              "水位・水量の変動に対応する機能の追加が可能"
            ]
          },
          {
            "type": "heading",
            "value": "さまざまな水利用に対応するオプション"
          },
          {
            "type": "list",
            "items": [
              "取水槽の水位一定制御",
              "放流量一定制御",
              "減圧制御"
            ]
          },
          {
            "type": "text",
            "value": "<small>配管径：Φ400～Φ500（100 kW）。接続前に配管およびフランジ規格（5K、10K、16K など）をご確認ください。</small>"
          }
        ]
      }
    }
  },
  {
    "id": "container-ups",
    "model": "container",
    "order": 6,
    "group": null,
    "title": {
      "en": "UPS",
      "ja": "UPS（無停電電源装置）"
    },
    "anchor": {
      "x": -0.3,
      "y": 1.32,
      "z": 1.43
    },
    "labelOffset": {
      "x": -0.75,
      "y": 1.15,
      "z": 1.75
    },
    "camera": {
      "position": {
        "x": -2.1,
        "y": 1.05,
        "z": 0.2
      },
      "target": {
        "x": -0.2,
        "y": 1.3,
        "z": 1.4
      },
      "duration": 1.8
    },
    "meshNames": [
      "Boss-Extrude2",
      "LPattern5",
      "Mirror3"
    ],
    "popup": {
      "en": {
        "blocks": [
          {
            "type": "text",
            "value": "Uninterruptible power supply that keeps the control system powered during a power failure."
          },
          {
            "type": "heading",
            "value": "Backed-up circuits (AC 100 V)"
          },
          {
            "type": "list",
            "items": [
              "Control power and I/O power",
              "Instrumentation power",
              "Remote monitoring power",
              "Guide vane and motorized inlet valve"
            ]
          },
          {
            "type": "text",
            "value": "Because the guide vane and the inlet valve stay powered, water discharge can be maintained even in case of failure."
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/package-layout.png",
            "caption": "Package layout (❻ UPS)"
          },
          {
            "type": "text",
            "value": "<small>UPS capacity in the example single-line diagram: 3 kVA, 10 min.</small>"
          }
        ]
      },
      "ja": {
        "blocks": [
          {
            "type": "text",
            "value": "停電時にも制御システムへの給電を維持する無停電電源装置です。"
          },
          {
            "type": "heading",
            "value": "バックアップ対象（AC 100 V）"
          },
          {
            "type": "list",
            "items": [
              "制御電源・I/O 電源",
              "計装電源",
              "遠隔監視電源",
              "ガイドベーン・電動入口弁"
            ]
          },
          {
            "type": "text",
            "value": "ガイドベーンと入口弁への給電が維持されるため、故障時でも放流を継続できます。"
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/package-layout.png",
            "caption": "パッケージ構成（❻ UPS）"
          },
          {
            "type": "text",
            "value": "<small>単線結線図（例）での UPS 容量：3 kVA、10 分。</small>"
          }
        ]
      }
    }
  },
  {
    "id": "container-guide-vane",
    "model": "container",
    "order": 3,
    "group": null,
    "title": {
      "en": "Guide Vane",
      "ja": "ガイドベーン"
    },
    "anchor": {
      "x": -0.48,
      "y": 0.76,
      "z": -0.22
    },
    "labelOffset": {
      "x": -0.75,
      "y": 1.45,
      "z": -0.45
    },
    "camera": {
      "position": {
        "x": -1.918,
        "y": 1.489,
        "z": -0.939
      },
      "target": {
        "x": -0.48,
        "y": 0.68,
        "z": -0.22
      },
      "duration": 1.8
    },
    "meshNames": [
      "Cut-Revolve2_(1)",
      "Cut-Revolve2",
      "Boss-Extrude8_(1)",
      "CirPattern3",
      "Chamfer006",
      "CirPattern1_(1)",
      "CirPattern1",
      "Cut-Extrude6",
      "Boss-Extrude003",
      "Boss-Extrude004",
      "Cut-Extrude002",
      "Cut-Extrude1_(12)"
    ],
    "popup": {
      "en": {
        "blocks": [
          {
            "type": "text",
            "value": "Adjusts the opening into the turbine runner, so the output follows the available water."
          },
          {
            "type": "heading",
            "value": "Role in flow control"
          },
          {
            "type": "list",
            "items": [
              "Smooth start/stop operation",
              "Maximum output control according to the water volume",
              "Maintaining water discharge even in case of failure"
            ]
          },
          {
            "type": "text",
            "value": "The guide vane is powered from the UPS circuit (AC 100 V)."
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/package-layout.png",
            "caption": "Package layout (❼ guide vane)"
          }
        ]
      },
      "ja": {
        "blocks": [
          {
            "type": "text",
            "value": "水車ランナへの開度を調整し、利用できる水量に合わせて出力を制御します。"
          },
          {
            "type": "heading",
            "value": "流量制御での役割"
          },
          {
            "type": "list",
            "items": [
              "スムーズな起動・停止",
              "水量に応じた最大出力制御",
              "故障時でも放流を継続"
            ]
          },
          {
            "type": "text",
            "value": "ガイドベーンは UPS 回路（AC 100 V）から給電されます。"
          },
          {
            "type": "image",
            "src": "./files/Microhydro/annotations/package-layout.png",
            "caption": "パッケージ構成（❼ ガイドベーン）"
          }
        ]
      }
    }
  },
  {
    "id": "site-intake-weir",
    "model": "site",
    "order": 1,
    "group": null,
    "title": {
      "en": "Intake Weir",
      "ja": "取水堰"
    },
    "anchor": {
      "x": -17.2,
      "y": 29.3,
      "z": 59.6
    },
    "labelOffset": {
      "x": -22.0,
      "y": 36.0,
      "z": 64.0
    },
    "camera": {
      "position": {
        "x": -10,
        "y": 40,
        "z": 38
      },
      "target": {
        "x": -17,
        "y": 31,
        "z": 59
      },
      "duration": 2.2
    },
    "meshNames": [],
    "popup": {
      "en": {
        "blocks": []
      },
      "ja": {
        "blocks": []
      }
    }
  },
  {
    "id": "site-headrace",
    "model": "site",
    "order": 2,
    "group": null,
    "title": {
      "en": "Headrace Channel",
      "ja": "導水路"
    },
    "anchor": {
      "x": -8.5,
      "y": 28.45,
      "z": 61.2
    },
    "labelOffset": {
      "x": -9.5,
      "y": 41.0,
      "z": 62.0
    },
    "camera": {
      "position": {
        "x": 10,
        "y": 46,
        "z": 36
      },
      "target": {
        "x": -9,
        "y": 31,
        "z": 59
      },
      "duration": 2.2
    },
    "meshNames": [],
    "popup": {
      "en": {
        "blocks": []
      },
      "ja": {
        "blocks": []
      }
    }
  },
  {
    "id": "site-forebay",
    "model": "site",
    "order": 3,
    "group": null,
    "title": {
      "en": "Forebay / Head Tank",
      "ja": "ヘッドタンク（沈砂池）"
    },
    "anchor": {
      "x": -0.53,
      "y": 29.2,
      "z": 50.0
    },
    "labelOffset": {
      "x": 3.0,
      "y": 32.0,
      "z": 46.0
    },
    "camera": {
      "position": {
        "x": 8,
        "y": 33,
        "z": 40
      },
      "target": {
        "x": -1,
        "y": 26,
        "z": 51
      },
      "duration": 2.2
    },
    "meshNames": [],
    "popup": {
      "en": {
        "blocks": []
      },
      "ja": {
        "blocks": []
      }
    }
  },
  {
    "id": "site-penstock",
    "model": "site",
    "order": 4,
    "group": null,
    "title": {
      "en": "Penstock (Steel 500A)",
      "ja": "水圧鉄管"
    },
    "anchor": {
      "x": -0.53,
      "y": 14.73,
      "z": 25.9
    },
    "labelOffset": {
      "x": -0.53,
      "y": 18.73,
      "z": 25.9
    },
    "camera": {
      "position": {
        "x": 30,
        "y": 36,
        "z": 4
      },
      "target": {
        "x": -0.5,
        "y": 11,
        "z": 25
      },
      "duration": 2.2
    },
    "meshNames": [],
    "popup": {
      "en": {
        "blocks": []
      },
      "ja": {
        "blocks": []
      }
    }
  },
  {
    "id": "site-container",
    "model": "site",
    "order": 5,
    "group": null,
    "title": {
      "en": "Container Micro-Hydro (Crossflow Turbine)",
      "ja": "コンテナ型小水力発電（クロスフロー水車）"
    },
    "anchor": {
      "x": 0.0,
      "y": 4.0,
      "z": -1.17
    },
    "labelOffset": {
      "x": 0.0,
      "y": 8.0,
      "z": -1.17
    },
    "camera": {
      "position": {
        "x": -14,
        "y": 7,
        "z": -12
      },
      "target": {
        "x": -1,
        "y": 1,
        "z": 2
      },
      "duration": 2.2
    },
    "meshNames": [],
    "popup": {
      "en": {
        "blocks": []
      },
      "ja": {
        "blocks": []
      }
    }
  },
  {
    "id": "site-tailrace",
    "model": "site",
    "order": 6,
    "group": null,
    "title": {
      "en": "Tailrace",
      "ja": "放水路"
    },
    "anchor": {
      "x": -5.0,
      "y": 0.9,
      "z": -0.35
    },
    "labelOffset": {
      "x": -5.0,
      "y": 3.4,
      "z": -0.35
    },
    "camera": {
      "position": {
        "x": -22,
        "y": 9,
        "z": -16
      },
      "target": {
        "x": -6,
        "y": 0,
        "z": -2
      },
      "duration": 2.2
    },
    "meshNames": [],
    "popup": {
      "en": {
        "blocks": []
      },
      "ja": {
        "blocks": []
      }
    }
  },
  {
    "id": "site-grid-connection",
    "model": "site",
    "order": 7,
    "group": null,
    "title": {
      "en": "Grid Connection",
      "ja": "系統連系"
    },
    "anchor": {
      "x": 3.7,
      "y": 11.75,
      "z": 3.9
    },
    "labelOffset": {
      "x": 3.7,
      "y": 15.25,
      "z": 3.9
    },
    "camera": {
      "position": {
        "x": -18,
        "y": 16,
        "z": -10
      },
      "target": {
        "x": 2,
        "y": 8,
        "z": 4
      },
      "duration": 2.2
    },
    "meshNames": [],
    "popup": {
      "en": {
        "blocks": []
      },
      "ja": {
        "blocks": []
      }
    }
  }
]

export default annotations;
