# Ethically Sourced Heads

A static-first storefront for a custom player head shop on CivMC. Browse 1,280+ custom heads with real-time 3D WebGL previews, search, filter, and join Discord to order.

**Live Site:** [To be deployed on GitHub Pages]

---

## Quick Start

### For Developers

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jacob-duffy/ethically-sourced-heads.git
   cd ethically-sourced-heads
   ```

2. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev     # Dev server at localhost:5173
   ```

3. **Setup Aggregation Script:**
   ```bash
   # No dependencies to install — uses only Python built-in libraries
   python scripts/aggregate.py --help  # Optional: see available options
   ```

4. **Enable GitHub Pages:**
   - Go to your GitHub repository → Settings → Pages
   - Set source to **GitHub Actions**
   - The included workflow will auto-build and deploy on every push to `main`
   - No environment variables required

### For Daily Updates

1. Run your JSMacros script in-game to generate head data
   - Files are automatically saved to `scripts/input/untracked/`
2. Run the aggregation script:
   ```bash
   python scripts/aggregate.py
   ```
3. The script will:
   - Read all head data files from `scripts/input/untracked/`
   - Process and merge them into `frontend/public/heads.json`
   - Download new textures to `frontend/public/textures/` (named by texture hash)
   - Move processed files to `scripts/input/tracked/` (for archiving)
   - Automatically commit and push to GitHub
4. Done! Your changes publish to GitHub Pages in ~1 minute

---

## Documentation

- **[Project Overview](docs/OVERVIEW.md)** — Inventory, rarity tiers, pricing, search features
- **[Architecture](docs/ARCHITECTURE.md)** — System design, data flow, tech stack
- **[Frontend Guide](docs/FRONTEND.md)** — WebGL preview component, UI structure, tech stack
- **[Aggregation Script](docs/AGGREGATION.md)** — How JSMacros data is processed and deployed
- **[Performance & Scalability](docs/PERFORMANCE.md)** — Expected metrics and optimization strategies
- **[Security](docs/SECURITY.md)** — Security considerations and validation
- **[Deployment](docs/DEPLOYMENT.md)** — Deployment checklist and constraints
- **[Directory Structure](docs/DIRECTORY_STRUCTURE.md)** — Project layout and file descriptions

---

## Technologies

- **Frontend:** Vite, Vanilla JavaScript, WebGL 1.0, CSS3
- **Aggregation:** Python (built-in libraries: urllib, json, asyncio, pathlib)
- **Hosting:** GitHub Pages (free)
- **Version Control:** GitHub

---

## Features

✓ 1,280+ custom player heads  
✓ Real-time 3D WebGL previews  
✓ Search by name, filter by rarity & tags  
✓ Paginated catalog (20-30 per page)  
✓ Expanded detail view with 360° rotation  
✓ Mobile-responsive design  
✓ Discord order integration  
✓ Daily auto-updates via git push  

---

## Contributing

This is a solo-operated shop. If you're a collaborator:
1. Create a feature branch from `main`
2. Submit changes via pull request
3. Test locally before pushing

---

## License

[To be determined]

---

## Contact

- **Shop Owner:** [To be determined]
- **Discord:** [To be determined]
