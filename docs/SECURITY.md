# Security Considerations

## Minimal Attack Surface

- No server means no server-side vulnerabilities (no SQL injection, no authentication bypass, no RCE)
- The site is entirely read-only static files — there is nothing to attack at runtime

## HTTPS

- GitHub Pages provides HTTPS automatically
- Required for WebGL cross-origin texture loading (`crossOrigin: 'anonymous'`)

## Aggregation Script Input Validation

- Script validates all JSMacros JSON before writing `heads.json`
- Validates:
  - Rarity enum values (must be one of: Junk, Uncommon, Rare, Legendary, Player)
  - Prices as non-negative integers
  - Texture hash format (alphanumeric, 64 chars)
- Rejects malformed entries with clear error logs
- Never writes partial or corrupt data

## Texture Download Safety (in aggregation script)

- Only downloads from `textures.minecraft.net` (hardcoded, not configurable)
- Validates HTTP response `Content-Type` is `image/png`
- Rejects files larger than 50 KB (Minecraft skins are ~2-5 KB)
- Files saved with hash-based filenames only (no path traversal risk)

## No Secrets in Repository

- No API keys, tokens, or credentials are ever required
- `.gitignore` excludes any local config files
- Safe to make the repository public
