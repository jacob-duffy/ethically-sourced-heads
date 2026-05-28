# Performance & Scalability

## Expected Performance Metrics

| Metric | Target |
|--------|--------|
| Page load time | < 500ms (`heads.json` served from GitHub Pages CDN, no server round-trip) |
| Search/filter latency | < 50ms (in-memory JavaScript, all data already loaded at startup) |
| WebGL preview render | 30-60ms per head (GPU-accelerated) |
| Texture download (aggregation script) | ~3-5 min for 1,280 new textures (5 concurrent, runs locally) |
| Concurrent users | Unlimited on GitHub Pages (pure static CDN delivery, no backend to bottleneck) |

---

## Optimization Strategies

### Frontend

- All `heads.json` data loaded once at page startup; no per-search network requests
- Pagination limits visible DOM nodes to 20-30 heads at a time
- Lazy-load WebGL viewers only for visible cards (Intersection Observer, max 3-5 active contexts)
- Texture images served from GitHub Pages CDN with long-lived `Cache-Control` headers

### Aggregation Script

- Downloads only new textures; skips textures already present in `frontend/public/textures/`
- Concurrent downloads (5 at a time) to speed up texture retrieval
- Efficient deduplication by texture hash
