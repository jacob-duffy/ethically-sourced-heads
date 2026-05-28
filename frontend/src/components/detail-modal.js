import { HeadPreviewComponent } from "../viewer.js";

/**
 * Creates and displays a modal with detailed head information.
 * @param {Object} head - Head data object
 * @param {Function} [onClose] - Optional callback when modal closes
 * @returns {Object} - { close: Function } to programmatically close the modal
 */
export function createDetailModal(head, onClose) {
    // Overlay (semi-transparent background)
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;
        background:rgba(0, 0, 0, 0.6);
        display:flex;
        justify-content:center;
        align-items:center;
        z-index:9999;
    `;

    // Modal container
    const modal = document.createElement("div");
    modal.style.cssText = `
        background:#242424;
        border:1px solid #444;
        border-radius:12px;
        padding:32px;
        max-width:600px;
        max-height:90vh;
        overflow-y:auto;
        box-shadow:0 10px 40px rgba(0, 0, 0, 0.8);
        z-index:10000;
    `;

    // Close function
    const close = () => {
        overlay.remove();
        if (onClose) onClose();
    };

    // Close on overlay click
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });

    // Close on ESC key
    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            close();
            document.removeEventListener("keydown", handleKeyDown);
        }
    };
    document.addEventListener("keydown", handleKeyDown);

    // ─── Header ───────────────────────────────────────────────────────────

    const header = document.createElement("div");
    header.style.cssText = "display:flex;justify-content:space-between;align-items:start;margin-bottom:24px;";

    const titleContainer = document.createElement("div");
    titleContainer.style.cssText = "flex:1;";

    const title = document.createElement("h2");
    title.textContent = head.name;
    title.style.cssText = `
        margin:0 0 8px;
        font-size:1.6rem;
        color:#fff;
        word-break:break-word;
    `;

    const rarityBadge = document.createElement("div");
    rarityBadge.textContent = head.rarity;
    rarityBadge.style.cssText = `
        display:inline-block;
        background:#5b9bd5;
        color:#fff;
        padding:6px 12px;
        border-radius:4px;
        font-size:0.85rem;
        font-weight:bold;
    `;

    titleContainer.appendChild(title);
    titleContainer.appendChild(rarityBadge);

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = `
        background:none;
        border:none;
        color:#999;
        font-size:1.8rem;
        cursor:pointer;
        padding:0;
        width:40px;
        height:40px;
        display:flex;
        align-items:center;
        justify-content:center;
        transition:color 0.2s;
    `;
    closeBtn.addEventListener("mouseenter", () => (closeBtn.style.color = "#fff"));
    closeBtn.addEventListener("mouseleave", () => (closeBtn.style.color = "#999"));
    closeBtn.addEventListener("click", close);

    header.appendChild(titleContainer);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // ─── Canvas (Expanded Viewer) ─────────────────────────────────────────

    const canvasContainer = document.createElement("div");
    canvasContainer.style.cssText = `
        display:flex;
        justify-content:center;
        margin-bottom:24px;
    `;

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.cssText = `
        border:1px solid #444;
        border-radius:8px;
        display:block;
        background:#1a1a1a;
    `;

    canvasContainer.appendChild(canvas);
    modal.appendChild(canvasContainer);

    // Initialize expanded viewer
    new HeadPreviewComponent(canvas, head.texture_url, { mode: "expanded" });

    // ─── Details Section ──────────────────────────────────────────────────

    const details = document.createElement("div");
    details.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;";

    // Stock status
    const stockSection = document.createElement("div");
    stockSection.style.cssText = "display:flex;flex-direction:column;gap:4px;";

    const stockLabel = document.createElement("div");
    stockLabel.textContent = "Stock Status";
    stockLabel.style.cssText = "font-size:0.8rem;color:#999;text-transform:uppercase;letter-spacing:0.5px;";

    const stockValue = document.createElement("div");
    stockValue.textContent = head.in_stock ? "✓ In Stock" : "Out of Stock";
    stockValue.style.cssText = `
        font-size:0.95rem;
        color:${head.in_stock ? "#7ac74f" : "#e07070"};
        font-weight:bold;
    `;

    stockSection.appendChild(stockLabel);
    stockSection.appendChild(stockValue);
    details.appendChild(stockSection);

    // Price breakdown
    const priceSection = document.createElement("div");
    priceSection.style.cssText = "display:flex;flex-direction:column;gap:4px;";

    const priceLabel = document.createElement("div");
    priceLabel.textContent = "Price";
    priceLabel.style.cssText = "font-size:0.8rem;color:#999;text-transform:uppercase;letter-spacing:0.5px;";

    const priceContent = document.createElement("div");
    const priceItems = [];
    if (head.price.diamonds) priceItems.push(`💎 ${head.price.diamonds} diamonds`);
    if (head.price.emeralds) priceItems.push(`💚 ${head.price.emeralds} emeralds`);
    if (head.price.iron) priceItems.push(`⬜ ${head.price.iron} iron`);

    priceContent.innerHTML = priceItems.length 
        ? priceItems.map((item) => `<div style="font-size:0.95rem;color:#e0e0e0;">${item}</div>`).join("")
        : "<div style=\"font-size:0.95rem;color:#999;\">Price TBD</div>";

    priceSection.appendChild(priceLabel);
    priceSection.appendChild(priceContent);
    details.appendChild(priceSection);

    modal.appendChild(details);

    // ─── Tags ─────────────────────────────────────────────────────────────

    if (head.tags && head.tags.length) {
        const tagsSection = document.createElement("div");
        tagsSection.style.cssText = "display:flex;flex-direction:column;gap:12px;";

        const tagsLabel = document.createElement("div");
        tagsLabel.textContent = "Tags";
        tagsLabel.style.cssText = "font-size:0.8rem;color:#999;text-transform:uppercase;letter-spacing:0.5px;";

        const tagsList = document.createElement("div");
        tagsList.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;";

        for (const tag of head.tags) {
            const tagBadge = document.createElement("div");
            tagBadge.textContent = tag;
            tagBadge.style.cssText = `
                background:#3a6ea8;
                border:1px solid #5b9bd5;
                color:#e0e0e0;
                padding:6px 12px;
                border-radius:4px;
                font-size:0.85rem;
            `;
            tagsList.appendChild(tagBadge);
        }

        tagsSection.appendChild(tagsLabel);
        tagsSection.appendChild(tagsList);
        modal.appendChild(tagsSection);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    return { close };
}
