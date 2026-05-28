# Deployment

## Deployment Checklist

- [ ] Frontend code implemented (Vite project, components, WebGL viewer)
- [ ] `frontend/public/heads.json` sample committed
- [ ] Repository created on GitHub
- [ ] Repository pushed to GitHub (all commits, all branches)
- [ ] GitHub Pages enabled: repository Settings → Pages → Source: **GitHub Actions**
- [ ] GitHub Actions workflow committed (`.github/workflows/deploy.yml`) — runs `npm run build` and deploys `frontend/dist/`
- [ ] Aggregation script (`scripts/aggregate.py`) implemented and tested locally
- [ ] Test aggregation script with sample JSMacros input files
- [ ] Verify `heads.json` and textures written correctly
- [ ] Verify `git push` from script triggers GitHub Actions deploy
- [ ] Live site deployed and accessible via `https://<username>.github.io/<repo>/`
- [ ] Custom domain configured (optional)
- [ ] Discord invite link added to site footer
- [ ] Tested on multiple browsers and mobile
- [ ] Tested WebGL rendering on lower-end GPUs

---

## Known Constraints & Trade-Offs

### Static-First Architecture

- Inventory updates require running the local aggregation script, not instant API endpoint
- Trade-off: Simplicity and zero operational overhead for a single daily refresh
- Solution: Script can be fully automated via Task Scheduler (Windows) or cron (Linux/Mac)

### 1,280 Head Limit

- Current inventory: 1,280 heads
- Browser `fetch()` and in-memory parsing of `heads.json` completes in < 500ms
- If inventory grows significantly (5,000+ heads), may need client-side pagination or lazy-load approach
- Scalable without changes as long as `heads.json` is < 10MB

### Git Repository Storage

- All textures (1,280 × ~3 KB) = ~3.8 MB total committed to git
- GitHub's free plan allows 1GB per repo (plenty of headroom)
- Trade-off: Large binary files in git history; mitigated by periodic git history cleanup (git filter-branch) if needed in far future

### No Real-Time Inventory Sync

- Changes (new heads, price updates, stock status) only visible after aggregation script runs + GitHub Pages deploy (~1-2 minutes)
- Acceptable for a daily-refresh shop model
- If real-time updates needed, backend API would be required

---

## Git Strategy

- `main` branch: production-ready code, always deployed to GitHub Pages
- Never commit work-in-progress to `main`
- Use feature branches for development (e.g. `feature/webgl-viewer`, `feature/search-ui`)
- Merge to `main` only when tested and ready
- Each aggregation script run auto-commits to `main` with message: `chore: update inventory`

---

## Quick Setup for New Developer

1. Clone the repo: `git clone <repo-url>`
2. Frontend setup:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in browser
4. Aggregation script setup:
   ```bash
   cd scripts
   python -m venv .venv
   .venv\Scripts\activate    # Windows; use ".venv/bin/activate" on macOS/Linux
   # No dependencies to install — uses only Python built-in libraries
   ```
5. To test aggregation: `cd .. && python scripts/aggregate.py` (place sample JSMacros files in `scripts/input/untracked/` first)
