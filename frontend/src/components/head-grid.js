import { HeadPreviewComponent } from "../viewer.js";

/**
 * Renders a single head card with a small preview canvas, name, rarity, and price.
 * Canvas is initialized lazily when it enters the viewport (via Intersection Observer).
 * @param {Object} head - Head data object
 * @param {Function} [onCardClick] - Optional callback when card is clicked
 * @returns {HTMLElement}
 */
export function createHeadCard(head, onCardClick) {
    const card = document.createElement("div");
    card.style.cssText = `
        background:#242424;
        border:1px solid #333;
        border-radius:8px;
        padding:12px;
        cursor:pointer;
        transition:border-color 0.2s,transform 0.2s;
        flex:0 0 calc(50% - 8px);
        display:flex;
        flex-direction:column;
        gap:12px;
    `;

    // Hover effect
    card.addEventListener("mouseenter", () => {
        card.style.borderColor = "#5b9bd5";
        card.style.transform = "scale(1.02)";
    });
    card.addEventListener("mouseleave", () => {
        card.style.borderColor = "#333";
        card.style.transform = "scale(1)";
    });

    // Canvas for preview
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 160;
    canvas.style.cssText = `
        border:1px solid #444;
        border-radius:4px;
        display:block;
        margin:0 auto;
        background:#1a1a1a;
    `;

    // Info section
    const info = document.createElement("div");
    info.style.cssText = "display:flex;flex-direction:column;gap:8px;";

    // Name
    const name = document.createElement("p");
    name.textContent = head.name;
    name.style.cssText = "margin:0;font-weight:bold;font-size:0.95rem;color:#fff;overflow:hidden;text-overflow:ellipsis;";

    // Rarity badge
    const rarityBadge = document.createElement("div");
    rarityBadge.textContent = head.rarity;
    rarityBadge.style.cssText = `
        display:inline-block;
        background:#5b9bd5;
        color:#fff;
        padding:4px 8px;
        border-radius:3px;
        font-size:0.75rem;
        font-weight:bold;
        width:fit-content;
    `;

    // Stock status
    const stockStatus = document.createElement("p");
    stockStatus.textContent = head.in_stock ? "✓ In Stock" : "Out of Stock";
    stockStatus.style.cssText = `
        margin:0;
        font-size:0.85rem;
        color:${head.in_stock ? "#7ac74f" : "#e07070"};
    `;

    // Price summary
    const priceItems = [];
    if (head.price.diamonds) priceItems.push(`💎 ${head.price.diamonds}`);
    if (head.price.emeralds) priceItems.push(`💚 ${head.price.emeralds}`);
    if (head.price.iron) priceItems.push(`⬜ ${head.price.iron}`);

    const priceSummary = document.createElement("p");
    priceSummary.textContent = priceItems.length ? priceItems.join(" • ") : "Price TBD";
    priceSummary.style.cssText = `
        margin:0;
        font-size:0.8rem;
        color:#999;
        overflow:hidden;
        text-overflow:ellipsis;
    `;

    info.appendChild(name);
    info.appendChild(rarityBadge);
    info.appendChild(stockStatus);
    info.appendChild(priceSummary);

    card.appendChild(canvas);
    card.appendChild(info);

    // Lazy-load viewer when card enters viewport
    let viewerInitialized = false;
    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && !viewerInitialized) {
                viewerInitialized = true;
                new HeadPreviewComponent(canvas, head.texture_url, { mode: "preview" });
                observer.unobserve(card);
            }
        },
        { threshold: 0.1 },
    );
    observer.observe(card);

    // Card click handler
    if (onCardClick) {
        card.addEventListener("click", () => onCardClick(head));
    }

    return card;
}

/**
 * Renders a grid of head cards.
 * @param {Object[]} heads - Array of head objects
 * @param {Function} [onCardClick] - Optional callback when a card is clicked
 * @returns {HTMLElement}
 */
export function createHeadGrid(heads, onCardClick) {
    const container = document.createElement("div");
    container.style.cssText = `
        display:grid;
        grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
        gap:16px;
        padding:0;
    `;

    for (const head of heads) {
        container.appendChild(createHeadCard(head, onCardClick));
    }

    return container;
}
