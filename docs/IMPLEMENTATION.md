# Implementation Guide

## Implementation Phases

### Phase 1: Frontend Setup

1. Initialize Vite project
2. Place sample `heads.json` in `frontend/public/` for development
3. Implement `data.js` — load and parse `heads.json`, expose in-memory filter/search/sort functions
4. Refactor WebGL viewer into reusable `HeadPreviewComponent`
5. Build catalog grid with cards (preview canvas, name, rarity badge, price summary)
6. Build search/filter/pagination UI (all client-side, no API calls)
7. Implement expanded detail modal (400×400 canvas, full 360° mouse drag rotation)
8. Add responsive design and accessibility (ESC to close modal, keyboard pagination)
9. Enable GitHub Pages (repository Settings → Pages → Source: GitHub Actions) — auto-deploys on git push to `main`

### Phase 2: Aggregation Script

1. Create `scripts/aggregate.py`
2. Implement JSMacros JSON normalization and deduplication (using built-in `json`)
3. Implement texture download using `urllib` (5 concurrent with `asyncio`)
4. Validate PNG files (check magic header, reject large files)
5. Implement `heads.json` writer
6. Implement git commit + push step
7. Implement file movement from `scripts/input/untracked/` to `scripts/input/tracked/`
8. Test end-to-end with sample files in `scripts/input/untracked/`
9. Optionally configure Windows Task Scheduler for daily automated runs

### Phase 3: Testing & Deployment

1. End-to-end test: JSMacros files → run script → verify `heads.json` + textures written → GitHub Actions deploys → heads appear on live site
2. Cross-browser testing (WebGL, CSS grid, modal)
3. Mobile / responsive testing
4. Performance check: page load time, in-browser search latency, WebGL render
5. Validate all texture files (correct dimensions, no corrupt images)
6. Share live URL + Discord invite with players

---

## Technologies & Languages

| Layer | Technology | Language |
|-------|-----------|----------|
| Frontend | Vite, Vanilla JS, WebGL 1.0 | JavaScript |
| Aggregation | Local script (requests, asyncio) | Python |
| Deployment | GitHub Pages | — |
| Version Control | GitHub | — |
