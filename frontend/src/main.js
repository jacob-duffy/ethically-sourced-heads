import './style.css';
import { loadHeads, getHeads, getRarities, getTags, filterHeads, sortHeads, paginateHeads } from './data.js';
import { createHeadGrid } from './components/head-grid.js';
import { createSearchBar } from './components/search-bar.js';
import { createFilterPanel } from './components/filter-panel.js';
import { createPagination } from './components/pagination.js';
import { createDetailModal } from './components/detail-modal.js';

const app = document.querySelector('#app');

// Render a simple loading state
app.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-size:1.2rem;color:#999;">Loading heads...</div>';

// Initialize
(async () => {
    try {
        await loadHeads();
        const allHeads = getHeads();

        if (allHeads.length === 0) {
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
        subtitle.textContent = allHeads.length + ' custom heads available';
        subtitle.style.cssText = `
            font-size:0.95rem;
            color:#999;
            margin:0;
        `;

        header.appendChild(title);
        header.appendChild(subtitle);
        catalogContainer.appendChild(header);

        // Content container
        const content = document.createElement('div');

        // State
        let currentPage = 1;
        let currentSearch = '';
        let currentFilters = { rarity: '', tags: [], inStockOnly: false };
        let currentSort = 'name-asc';
        const ITEMS_PER_PAGE = 12;

        // Create persistent search bar (doesn't get recreated on render)
        const searchBarContainer = document.createElement('div');
        const searchBar = createSearchBar((query) => {
            currentSearch = query;
            currentPage = 1;
            render();
        });
        searchBarContainer.appendChild(searchBar);

        // Container for filter panel (will be recreated to update state)
        const filterContainer = document.createElement('div');

        // Container for results (grid, pagination)
        const resultsContainer = document.createElement('div');

        content.appendChild(searchBarContainer);
        content.appendChild(filterContainer);
        content.appendChild(resultsContainer);

        // Render function
        const render = () => {
            // Apply search and filters
            let filtered = filterHeads({
                search: currentSearch,
                rarity: currentFilters.rarity,
                tags: currentFilters.tags,
                inStockOnly: currentFilters.inStockOnly,
            });

            // Apply sort
            filtered = sortHeads(filtered, currentSort);

            // Apply pagination
            const paginated = paginateHeads(filtered, currentPage, ITEMS_PER_PAGE);

            // Update filter panel
            filterContainer.innerHTML = '';
            filterContainer.appendChild(createFilterPanel(
                getRarities(),
                getTags(),
                (filters) => {
                    currentFilters = filters;
                    currentPage = 1;
                    render();
                },
                (sortKey) => {
                    currentSort = sortKey;
                    currentPage = 1;
                    render();
                },
                { rarity: currentFilters.rarity, tags: currentFilters.tags, inStockOnly: currentFilters.inStockOnly, sort: currentSort }
            ));

            // Update results container
            resultsContainer.innerHTML = '';

            // Results count
            const resultsInfo = document.createElement('div');
            resultsInfo.style.cssText = `
                max-width:1200px;
                margin:0 auto 24px;
                color:#999;
                font-size:0.9rem;
            `;
            resultsInfo.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;
            resultsContainer.appendChild(resultsInfo);

            // Grid
            if (paginated.items.length) {
                const gridWrapper = document.createElement('div');
                gridWrapper.style.cssText = `
                    max-width:1200px;
                    margin:0 auto;
                `;

                const grid = createHeadGrid(paginated.items, (head) => {
                    createDetailModal(head);
                });

                gridWrapper.appendChild(grid);
                resultsContainer.appendChild(gridWrapper);

                // Pagination
                resultsContainer.appendChild(createPagination(paginated.page, paginated.totalPages, (newPage) => {
                    currentPage = newPage;
                    render();
                    // Scroll to top
                    catalogContainer.scrollIntoView({ behavior: 'smooth' });
                }));
            } else {
                const noResults = document.createElement('div');
                noResults.style.cssText = `
                    max-width:1200px;
                    margin:0 auto;
                    padding:40px 20px;
                    text-align:center;
                    color:#999;
                `;
                noResults.textContent = 'No heads match your filters.';
                resultsContainer.appendChild(noResults);
            }
        };

        catalogContainer.appendChild(content);
        app.innerHTML = '';
        app.appendChild(catalogContainer);

        // Initial render
        render();
    } catch (err) {
        console.error(err);
        app.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;color:#e07070;">' + err.message + '</div>';
    }
})();
