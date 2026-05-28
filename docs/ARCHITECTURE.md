# Technical Architecture

## Overview

A static-first two-tier architecture:

1. **Frontend** (Vite + Vanilla JS on GitHub Pages) — Loads static JSON inventory, renders search/filter UI with WebGL previews
2. **Local Aggregation Script** (Python) — Normalizes JSMacros output, downloads textures, writes `heads.json`, and pushes to GitHub

No backend server, no database, no API. All inventory data is a static `heads.json` file committed to the repository and served directly by GitHub Pages. Search and filtering run entirely in-browser.

---

## Key Design Principles

- **Static-first:** No server to maintain, no database to back up, no cold-start latency
- **Free to host:** GitHub free repo + GitHub Pages (both free, no third-party accounts required)
- **Simple updates:** All data updates are a single local script run followed by a git push
- **Scalable:** Handles 1,280+ heads with pagination + lazy WebGL rendering

---

## Data Flow

```
[JSMacros Script (In-Game, Local)]
        ↓ generates ↓
   scripts/input/untracked/head_data_<timestamp>.json (raw NBT-derived data)
        ↓
[Aggregation Script (Python, Local)]
   - Read untracked head data files
   - Normalize & deduplicate heads
   - Download new textures from textures.minecraft.net
   - Write frontend/public/heads.json
   - Write frontend/public/textures/{texture_hash}.png (new only)
   - Move processed files to scripts/input/tracked/
        ↓ git push to main ↓
[GitHub Repository]
        ↓ GitHub Actions workflow triggered ↓
[GitHub Actions: npm run build → deploy to GitHub Pages]
        ↓ serves static files ↓
[Browser → Frontend (Vite on GitHub Pages)]
   fetch('/heads.json')
        ↓
   In-memory search/filter/sort
        ↓
   Paginated Head Grid → WebGL Viewer (lazy-loaded)
```
