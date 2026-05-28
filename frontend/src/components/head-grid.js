import { HeadPreviewComponent } from "../viewer.js";

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

    card.addEventListener("mouseenter", () => {
        card.style.borderColor = "#5b9bd5";
        card.style.transform = "scale(1.02)";
    });
    card.addEventListener("mouseleave", () => {
        card.style.borderColor = "#333";
        card.style.transform = "scale(1)";
    });

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

    const info = document.createElement("div");
    info.style.cssText = "display:flex;flex-direction:column;gap:8px;";

    const name = document.createElement("p");
    name.textContent = head.name;
    name.style.cssText = "margin:0;font-weight:bold;font-size:0.95rem;color:#fff;overflow:hidden;text-overflow:ellipsis;";

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

    const stockStatus = document.createElement("p");
    stockStatus.textContent = head.in_stock ? "? In Stock" : "Out of Stock";
    stockStatus.style.cssText = `
        margin:0;
        font-size:0.85rem;
        color:${head.in_stock ? "#7ac74f" : "#e07070"};
    `;

    const priceItems = [];
    if (head.price.diamonds) priceItems.push(`\u{1F48E} ${head.price.diamonds}`);
    if (head.price.emeralds) priceItems.push(`\u{1F49A} ${head.price.emeralds}`);
    if (head.price.iron) priceItems.push(`\u{2B1C} ${head.price.iron}`);

    const priceSummary = document.createElement("p");
    priceSummary.textContent = priceItems.length ? priceItems.join(" \u2022 ") : "Price TBD";
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

    let initialized = false;
    const initViewer = () => {
        if (initialized) return;
        initialized = true;
        new HeadPreviewComponent(canvas, head.texture_url, { mode: "preview" });
    };

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting) {
                initViewer();
                observer.disconnect();
            }
        },
        { threshold: 0.1 },
    );
    observer.observe(card);

    requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) initViewer();
    });

    if (onCardClick) {
        card.addEventListener("click", () => onCardClick(head));
    }

    return card;
}

export function createHeadGrid(heads, onCardClick) {
    const container = document.createElement("div");
    container.style.cssText = `
        display:grid;
        grid-template-columns:repeat(4,1fr);
        gap:16px;
        padding:0;
    `;

    for (const head of heads) {
        container.appendChild(createHeadCard(head, onCardClick));
    }

    return container;
}
