# Local Aggregation Script

## Purpose

- Normalizes JSMacros output
- Deduplicates heads by texture_b64
- Downloads only new textures (skips already-cached)
- Writes `frontend/public/heads.json` (the single source of truth for all inventory)
- Commits and pushes to GitHub, triggering an automatic GitHub Pages redeploy

No API, no server, no secrets, **no third-party packages required**. The script runs entirely on your local machine using only Python's built-in libraries.

---

## Workflow

1. In-game: Run the JSMacros macro (`scripts/macros/head-tracker.js`)
   - Macro scans your inventory, extracts head data, writes `head_data_<timestamp in ms>.json` files to `scripts/input/untracked/`
2. Local: Run `python scripts/aggregate.py`
3. Script reads and normalizes all JSON files from `scripts/input/untracked/` (extract name, rarity, texture_b64, tags, stock)
4. Deduplicates by texture_b64
5. Entries that fail to parse are logged and kept in `scripts/input/untracked/` for review
6. For each texture hash not already in `frontend/public/textures/`, downloads from `textures.minecraft.net` to `frontend/public/textures/{hash}.png`
7. Writes full normalized inventory to `frontend/public/heads.json`
8. Moves all processed files from `scripts/input/untracked/` to `scripts/input/tracked/`
9. Runs `git add . && git commit -m "auto: stock update" && git push`
10. GitHub Actions detects the push and redeploys to GitHub Pages automatically (~1 minute)
11. Logs result: new heads added, textures downloaded, any failures

---

## Input Format (JSMacros output)

```json
{
  "name": "EMFSkull",
  "rarity": "Uncommon",
  "texture_b64": "ewogICJ0ZXh0dXJlcyIg...",
  "in_stock": true,
  "price": { "diamonds": 10, "emeralds": 5, "iron": 20 },
  "tags": ["animal", "aquatic"]
}
```

---

## Output Format (`frontend/public/heads.json`)

```json
{
  "generated_at": "2026-05-27T14:30:00Z",
  "heads": [
    {
      "name": "EMFSkull",
      "rarity": "Uncommon",
      "texture_b64": "ewogICJ0ZXh0dXJlcyIg...",
      "texture_url": "http://textures.minecraft.net/texture/b59c0e9d...",
      "in_stock": true,
      "price": { "diamonds": 10, "emeralds": 5, "iron": 20 },
      "tags": ["animal", "aquatic"]
    }
  ]
}
```

---

## JSMacros Setup

The aggregation workflow starts with the JSMacros macro that exports head data from your inventory.

### Installation

1. Install [JSMacros](https://www.youtube.com/watch?v=zDh8O_oXyeI) on your Minecraft client
2. Copy `scripts/macros/head-tracker.js` to your JSMacros macro folder (usually `.minecraft/macros/`)
3. In-game, open the macro menu and load `head-tracker.js`

### Running the Macro

1. In-game, open your inventory with heads to export
2. Run the macro (keybind depends on your JSMacros config)
3. The macro scans your inventory, extracts head data (name, rarity, texture, price, tags, stock status)
4. Exports one `head_data_<timestamp in ms>.json` file per head to `scripts/input/untracked/`

The macro uses NBT parsing to extract:
- Player head profile data (texture base64)
- Custom data for rarity, price, tags (EMF fish mod integration)
- Stock status (in-hand = in stock)

### Expected Output

Each macro run generates files like:
```
scripts/input/untracked/head_data_1779985537660.json
scripts/input/untracked/head_data_1779985537661.json
```

Each JSON file contains a single head's normalized data (see **Input Format** section below).

---

## Running the Script

```bash
cd scripts
python aggregate.py
```

The script will:
- Read all `.json` files from `scripts/input/untracked/`
- Process and validate them
- Download any new textures from `textures.minecraft.net` to `frontend/public/textures/` (using `urllib`, no external packages)
- Update `frontend/public/heads.json`
- Move processed files from `scripts/input/untracked/` to `scripts/input/tracked/` (archive)
- Automatically commit and push to GitHub
- GitHub Actions redeploys to GitHub Pages within ~1 minute

---

## Automation (Optional)

To automate daily runs on Windows, use Task Scheduler:

1. Create a batch file `run_aggregation.bat`:
   ```batch
   @echo off
   cd C:\path\to\civmc-headshop\scripts
   python aggregate.py
   ```

2. Open Task Scheduler, create a new task
3. Set trigger: Daily at your preferred time
4. Set action: Run the batch file
5. Task will run automatically each day

---

## Configuration

All directory paths are resolved relative to `aggregate.py` at runtime. No configuration file is required.

---

## Dependencies

**Python 3.6+** — No third-party packages required. Built-in libraries used:
- `json` — Parse and write JSON
- `urllib` — Download textures from textures.minecraft.net
- `pathlib` — File path handling
- `subprocess` — Execute git commands
