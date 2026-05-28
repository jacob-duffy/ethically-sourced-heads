import { HeadPreviewComponent } from "../viewer.js";
import "./head-grid.css";

export function createHeadCard(head, onCardClick) {
    const card = document.createElement("div");
    card.className = "head-card";

    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 160;
    canvas.className = "head-card-canvas";

    const info = document.createElement("div");
    info.className = "head-card-info";

    const name = document.createElement("p");
    name.textContent = head.name;
    name.className = "head-card-name";

    const rarityBadge = document.createElement("div");
    rarityBadge.textContent = head.rarity;
    rarityBadge.className = "head-card-rarity";

    const stockStatus = document.createElement("p");
    stockStatus.textContent = head.in_stock ? "✓ In Stock" : "Out of Stock";
    stockStatus.className = `head-card-stock ${head.in_stock ? "in-stock" : "out-of-stock"}`;

    const priceItems = [];
    if (head.price.diamonds) priceItems.push(`?? ${head.price.diamonds}`);
    if (head.price.emeralds) priceItems.push(`?? ${head.price.emeralds}`);
    if (head.price.iron) priceItems.push(`? ${head.price.iron}`);

    const priceSummary = document.createElement("p");
    priceSummary.textContent = priceItems.length ? priceItems.join(" � ") : "Price TBD";
    priceSummary.className = "head-card-price";

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
    container.className = "head-grid";

    for (const head of heads) {
        container.appendChild(createHeadCard(head, onCardClick));
    }

    return container;
}
