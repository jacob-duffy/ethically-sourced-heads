import { HeadPreviewComponent } from "../viewer.js";
import "./detail-modal.css";

export function createDetailModal(head, onClose) {
    const overlay = document.createElement("div");
    overlay.className = "detail-modal-overlay";

    const modal = document.createElement("div");
    modal.className = "detail-modal";

    const close = () => {
        overlay.remove();
        if (onClose) onClose();
    };

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            close();
            document.removeEventListener("keydown", handleKeyDown);
        }
    };
    document.addEventListener("keydown", handleKeyDown);

    const header = document.createElement("div");
    header.className = "detail-modal-header";

    const titleContainer = document.createElement("div");
    titleContainer.className = "detail-modal-title-container";

    const title = document.createElement("h2");
    title.textContent = head.name;
    title.className = "detail-modal-title";

    const rarityBadge = document.createElement("div");
    rarityBadge.textContent = head.rarity;
    rarityBadge.className = "detail-modal-rarity";

    titleContainer.appendChild(title);
    titleContainer.appendChild(rarityBadge);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "?";
    closeBtn.className = "detail-modal-close-btn";
    closeBtn.addEventListener("click", close);

    header.appendChild(titleContainer);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    const canvasContainer = document.createElement("div");
    canvasContainer.className = "detail-modal-canvas-container";

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    canvas.className = "detail-modal-canvas";

    canvasContainer.appendChild(canvas);
    modal.appendChild(canvasContainer);

    new HeadPreviewComponent(canvas, head.texture_url, { mode: "expanded" });

    const details = document.createElement("div");
    details.className = "detail-modal-details";

    const stockSection = document.createElement("div");
    stockSection.className = "detail-modal-section";

    const stockLabel = document.createElement("div");
    stockLabel.textContent = "Stock Status";
    stockLabel.className = "detail-modal-section-label";

    const stockValue = document.createElement("div");
    stockValue.textContent = head.in_stock ? "? In Stock" : "Out of Stock";
    stockValue.className = `detail-modal-stock-value ${head.in_stock ? "detail-modal-stock-in" : "detail-modal-stock-out"}`;

    stockSection.appendChild(stockLabel);
    stockSection.appendChild(stockValue);
    details.appendChild(stockSection);

    const priceSection = document.createElement("div");
    priceSection.className = "detail-modal-section";

    const priceLabel = document.createElement("div");
    priceLabel.textContent = "Price";
    priceLabel.className = "detail-modal-section-label";

    const priceContent = document.createElement("div");
    const priceItems = [];
    if (head.price.diamonds) priceItems.push(`?? ${head.price.diamonds} diamonds`);
    if (head.price.emeralds) priceItems.push(`?? ${head.price.emeralds} emeralds`);
    if (head.price.iron) priceItems.push(`? ${head.price.iron} iron`);

    if (priceItems.length) {
        for (const item of priceItems) {
            const div = document.createElement("div");
            div.textContent = item;
            div.className = "detail-modal-price-item";
            priceContent.appendChild(div);
        }
    } else {
        const div = document.createElement("div");
        div.textContent = "Price TBD";
        div.className = "detail-modal-price-tbd";
        priceContent.appendChild(div);
    }

    priceSection.appendChild(priceLabel);
    priceSection.appendChild(priceContent);
    details.appendChild(priceSection);

    modal.appendChild(details);

    if (head.tags && head.tags.length) {
        const tagsSection = document.createElement("div");
        tagsSection.className = "detail-modal-tags";

        const tagsLabel = document.createElement("div");
        tagsLabel.textContent = "Tags";
        tagsLabel.className = "detail-modal-section-label";

        const tagsList = document.createElement("div");
        tagsList.className = "detail-modal-tags-list";

        for (const tag of head.tags) {
            const tagBadge = document.createElement("div");
            tagBadge.textContent = tag;
            tagBadge.className = "detail-modal-tag-badge";
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
