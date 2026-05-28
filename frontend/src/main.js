import './style.css';
import { loadHeads, getHeads } from './data.js';
import { createHeadGrid } from './components/head-grid.js';

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

        // Render catalog
        const catalogContainer = document.createElement('div');
        catalogContainer.style.cssText = `
            background:#1a1a1a;
            color:#e0e0e0;
            font-family:'Segoe UI',sans-serif;
            padding:40px 20px;
            min-height:100vh;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            max-width:1200px;
            margin:0 auto 40px;
            text-align:center;
        `;

        const title = document.createElement('h1');
        title.textContent = 'Ethically Sourced Heads';
        title.style.cssText = `
            font-size:2rem;
            margin:0 0 12px;
            color:#fff;
            letter-spacing:0.5px;
        `;

        const subtitle = document.createElement('p');
        subtitle.textContent = heads.length + ' custom heads available';
        subtitle.style.cssText = `
            font-size:0.95rem;
            color:#999;
            margin:0;
        `;

        header.appendChild(title);
        header.appendChild(subtitle);
        catalogContainer.appendChild(header);

        // Grid container
        const gridWrapper = document.createElement('div');
        gridWrapper.style.cssText = `
            max-width:1200px;
            margin:0 auto;
        `;

        const grid = createHeadGrid(heads, (head) => {
            console.log('Clicked head:', head.name);
            // TODO: Open expanded modal when clicking a card
        });

        gridWrapper.appendChild(grid);
        catalogContainer.appendChild(gridWrapper);

        app.innerHTML = '';
        app.appendChild(catalogContainer);
    } catch (err) {
        console.error(err);
        app.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;color:#e07070;">' + err.message + '</div>';
    }
})();
