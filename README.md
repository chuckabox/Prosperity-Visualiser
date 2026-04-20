# Prosperity Visualizer

A fast local dashboard for analyzing IMC Prosperity competition logs. It runs entirely in your browser and processes data locally to keep your strategies private.

## Features

- Performance: Moves log parsing to background workers to prevent UI lag.
- Privacy: No data uploads or tracking. All processing happens on your machine.
- Comparisons: Compare multiple strategy runs side-by-side. Use Diff Mode to highlight performance changes from a baseline.
- Timeline: Navigate through multiple competition days in one view.
- Persistence: Save parsed results to IndexedDB to avoid re-parsing on reload.

## Tech Stack

- Vanilla JavaScript (ES Modules)
- Pub/Sub State Management
- Web Workers for parsing
- HTML5 Canvas for charts
- Browser File API and IndexedDB

## Setup

You must use an HTTP server for Web Workers to function correctly.

```bash
git clone https://github.com/lachy-dauth/prosperity-visualizer
cd prosperity-visualizer
python -m http.server 8080
```

Visit `localhost:8080` and drop your .log files to start.

## Shortcuts

| Key                  | Action        |
| -------------------- | ------------- |
| Space                | Play or pause |
| Left / Right         | Move one tick |
| Shift + Left / Right | Move 10 ticks |
| Esc                  | Close modals  |

## Project Structure

- `app.js`: Main application script.
- `styles.css`: CSS for the dashboard.
- `js/parser.js`: Multi-threaded parser logic.
- `js/chart.js`: Custom Canvas charts for PnL and Price.
- `js/panels/`: Components for different dashboard sections.

## Credits

Inspired by [jmerle's IMC visualizer](https://github.com/jmerle/imc-prosperity-3-visualizer).
