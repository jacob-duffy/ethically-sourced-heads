import { HeadPreviewComponent } from "../viewer.js";
import { RARITY_ORDER } from "../data.js";
import { createTagsContainer } from "./tag-badge.js";
import "./styles/head-grid.css";

const RARITY_CLASSES = RARITY_ORDER.map(r => r.toLowerCase());

export function createHeadCard(head, onCardClick) {
    const card = document.createElement("div");
    card.className = "head-card";
    // Add rarity outline class
    const rarity = head.rarity ? head.rarity.toLowerCase() : "";
    if (RARITY_CLASSES.includes(rarity)) {
        card.classList.add(`head-card--${rarity}`);
    }

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
        // Add rarity color class to tag (avoid duplicate declaration)
        const rarityTag = head.rarity ? head.rarity.toLowerCase() : "";
        if (RARITY_CLASSES.includes(rarityTag)) {
            rarityBadge.classList.add(`head-card-rarity--${rarityTag}`);
        }

    const stockStatus = document.createElement("p");
    const inStock = head.stock_level > 0;
    stockStatus.textContent = inStock ? `✓ ${head.stock_level} In Stock` : "✗ Out of Stock";
    stockStatus.className = `head-card-stock ${inStock ? "in-stock" : "out-of-stock"}`;

    const priceSummary = document.createElement("div");
    priceSummary.className = "head-card-price";
    const currencies = [
        { value: head.price.diamonds, label: "D", cls: "head-card-price-chip--diamond" },
        { value: head.price.emeralds, label: "E", cls: "head-card-price-chip--emerald" },
        { value: head.price.iron,     label: "I", cls: "head-card-price-chip--iron"    },
    ];
    const chips = currencies.filter((c) => c.value);
    if (chips.length) {
        for (const c of chips) {
            const chip = document.createElement("span");
            chip.textContent = `${c.value}${c.label}`;
            chip.className = `head-card-price-chip ${c.cls}`;
            priceSummary.appendChild(chip);
        }
    } else {
        priceSummary.textContent = "Price TBD";
        priceSummary.classList.add("head-card-price--tbd");
    }

    info.appendChild(name);
    info.appendChild(rarityBadge);
    info.appendChild(createTagsContainer(head.tags));
    info.appendChild(stockStatus);
    if (inStock) info.appendChild(priceSummary);

    card.appendChild(canvas);
    card.appendChild(info);

    let initialized = false;
    let viewer = null;

    const initViewer = () => {
        if (initialized) return;
        initialized = true;
        viewer = new HeadPreviewComponent(canvas, head.texture_url, { mode: "preview" });
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

    return {
        element: card,
        destroy() {
            observer.disconnect();
            if (viewer) viewer.destroy();
        },
    };
}

export function createHeadGrid(heads, onCardClick) {
    const container = document.createElement("div");
    container.className = "head-grid";
    const destroyers = [];

    for (const head of heads) {
        const card = createHeadCard(head, onCardClick);
        container.appendChild(card.element);
        destroyers.push(card.destroy);
    }

    return {
        element: container,
        destroy() {
            destroyers.forEach((destroyer) => destroyer());
        },
    };
}
