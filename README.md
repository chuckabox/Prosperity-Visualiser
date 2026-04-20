# 🌌 OpenProsperity Visualizer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Fast](https://img.shields.io/badge/Performance-Ultra--Fast-brightgreen)](https://github.com/lachy-dauth/prosperity-visualizer)

A high-performance, local-first dashboard for the IMC Prosperity algorithmic trading competition. Engineered for speed, privacy, and deep analytical insight.

![Preview](https://via.placeholder.com/1200x600/161625/e5e7eb?text=OpenProsperity+Visualizer+Preview)

## ✨ Why OpenProsperity?

Designed for traders who need more than just a PnL graph. OpenProsperity is built from the ground up to handle massive log files and multi-strategy comparisons with zero latency.

-   **🚀 Ultra-Performance**: Offloads heavy parsing to Web Workers and uses Canvas for buttery-smooth charting.
-   **🔒 Privacy First**: Your strategies never leave your machine. No uploads, no telemetry, no tracking.
-   **📈 Deep Comparison**: Compare 10+ variants side-by-side. Use **Diff Mode** to see exact variance from a baseline.
-   **📅 Multi-Day Ready**: Seamlessly navigate through multiple days of competition logs.
-   **💾 Local Persistence**: Opt-in to save your parsed data to browser storage for instant access on reload.

## 🛠 Tech Stack

-   **Core**: Vanilla JavaScript (ES Modules)
-   **Architecture**: Pub/Sub Store + Web Workers
-   **Visuals**: High-Performance HTML5 Canvas
-   **Storage**: Browser File API + IndexedDB

## 🏁 Quick Start

```bash
git clone https://github.com/lachy-dauth/prosperity-visualizer
cd prosperity-visualizer

# Serve with any HTTP server (required for Web Workers)
python -m http.server 8080
```

Open `http://localhost:8080` and drop your `.log` files.

## 🎹 Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Play / Pause |
| `←` / `→` | Step one tick |
| `Shift` + `←` / `→` | Jump 10 ticks |
| `Esc` | Close Modals |

## 📁 Project Structure

-   `app.js` — Application entry point and orchestrator.
-   `styles.css` — Modern, responsive UI styling.
-   `js/parser.js` — Intelligent log parser (multithreaded).
-   `js/chart.js` — custom Canvas-based line chart with tooltips.
-   `js/panels/` — Modular UI components.

## 🤝 Credits

Massive inspiration from [jmerle's imc-prosperity-3-visualizer](https://github.com/jmerle/imc-prosperity-3-visualizer).

---

*OpenProsperity is an independent fan tool and is not affiliated with IMC Trading.*
