import './style.css';
import { loadHeads, getHeads } from './data.js';
import { HeadPreviewComponent } from './viewer.js';

const app = document.querySelector('#app');

// Render a simple loading state
app.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-size:1.2rem;color:#999;">Loading heads...</div>';

// Initialize
(async () => {
    try {
        await loadHeads();
        const heads = getHeads();

        if (heads.length === 0) {
            app.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;color:#e07070;">No heads found in heads.json</div>';
            return;
        }

        // Pick a random head
        const head = heads[Math.floor(Math.random() * heads.length)];

        // Build price HTML
        let priceHtml = '';
        if (head.price.diamonds) priceHtml += '<p style="margin:8px 0;">💎 ' + head.price.diamonds + ' diamond' + (head.price.diamonds !== 1 ? 's' : '') + '</p>';
        if (head.price.emeralds) priceHtml += '<p style="margin:8px 0;">💚 ' + head.price.emeralds + ' emerald' + (head.price.emeralds !== 1 ? 's' : '') + '</p>';
        if (head.price.iron) priceHtml += '<p style="margin:8px 0;">⬜ ' + head.price.iron + ' iron' + (head.price.iron !== 1 ? 's' : '') + '</p>';
        if (Object.keys(head.price).length === 0) priceHtml = '<p style="color:#999;">Price not set</p>';

        let tagsHtml = '';
        if (head.tags.length) {
            const tagSpans = head.tags.map(t => '<span style="background:#3a6ea8;color:#fff;padding:6px 12px;border-radius:4px;font-size:0.85rem;">' + t + '</span>').join('');
            tagsHtml = '<div style="background:#242424;border:1px solid #333;border-radius:8px;padding:20px;"><h2 style="font-size:0.85rem;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Tags</h2><div style="display:flex;flex-wrap:wrap;gap:8px;">' + tagSpans + '</div></div>';
        }

        app.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;padding:40px 20px;min-height:100vh;background:#1a1a1a;color:#e0e0e0;font-family:\'Segoe UI\',sans-serif;"><h1 style="font-size:1.6rem;margin-bottom:28px;color:#fff;letter-spacing:0.5px;">Random Head Sample</h1><div style="display:flex;gap:32px;max-width:800px;width:100%;"><div style="flex:0 0 auto;"><div style="background:#242424;border:1px solid #333;border-radius:8px;padding:20px;display:flex;flex-direction:column;align-items:center;"><h2 style="font-size:0.95rem;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Preview</h2><canvas id="headCanvas" width="320" height="320" style="border:2px solid #444;border-radius:4px;"></canvas></div></div><div style="flex:1;display:flex;flex-direction:column;gap:20px;justify-content:center;"><div style="background:#242424;border:1px solid #333;border-radius:8px;padding:20px;"><h2 style="font-size:0.85rem;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Info</h2><p style="margin:8px 0;"><strong>Name:</strong> ' + head.name + '</p><p style="margin:8px 0;"><strong>Rarity:</strong> <span style="color:#5b9bd5;">' + head.rarity + '</span></p>' + (head.in_stock ? '<p style="margin:8px 0;color:#7ac74f;">✓ In Stock</p>' : '<p style="margin:8px 0;color:#e07070;">Out of Stock</p>') + '</div><div style="background:#242424;border:1px solid #333;border-radius:8px;padding:20px;"><h2 style="font-size:0.85rem;color:#aaa;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Price</h2>' + priceHtml + '</div>' + tagsHtml + '</div></div><p style="color:#999;font-size:0.85rem;margin-top:40px;text-align:center;">Drag to rotate • Click "Run" again to see a different random head</p></div>';

        // Initialize viewer
        const canvas = document.getElementById('headCanvas');
        new HeadPreviewComponent(canvas, head.texture_url, { mode: 'expanded' });
    } catch (err) {
        console.error(err);
        app.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;color:#e07070;">' + err.message + '</div>';
    }
})();
