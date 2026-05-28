/**
 * Creates a filter panel with rarity dropdown, sort dropdown, and tag multi-select.
 * @param {string[]} rarities - Available rarity values
 * @param {string[]} tags - Available tag values
 * @param {Function} onFilterChange - Callback with ({ rarity, tags, inStockOnly })
 * @param {Function} onSortChange - Callback with (sortKey: string)
 * @param {Object} currentState - Current filter state ({ rarity, tags, inStockOnly, sort })
 * @returns {HTMLElement}
 */
export function createFilterPanel(rarities, tags, onFilterChange, onSortChange, currentState = {}) {
    const container = document.createElement("div");
    container.style.cssText = `
        display:flex;
        flex-wrap:wrap;
        gap:16px;
        margin-bottom:24px;
        max-width:1200px;
        margin-left:auto;
        margin-right:auto;
        align-items:center;
    `;

    // Track state (initialize from currentState)
    let selectedRarity = currentState.rarity || "";
    let selectedTags = new Set(currentState.tags || []);
    let inStockOnly = currentState.inStockOnly || false;
    let selectedSort = currentState.sort || "name-asc";

    const notifyChange = () => {
        onFilterChange({
            rarity: selectedRarity,
            tags: Array.from(selectedTags),
            inStockOnly,
        });
    };

    // ─── Rarity Dropdown ──────────────────────────────────────────────────────

    const rarityContainer = document.createElement("div");
    rarityContainer.style.cssText = "display:flex;flex-direction:column;gap:6px;";

    const rarityLabel = document.createElement("label");
    rarityLabel.textContent = "Rarity:";
    rarityLabel.style.cssText = "font-size:0.8rem;color:#999;text-transform:uppercase;letter-spacing:0.5px;";

    const raritySelect = document.createElement("select");
    raritySelect.style.cssText = `
        padding:8px 12px;
        background:#2c2c2c;
        border:1px solid #444;
        border-radius:6px;
        color:#e0e0e0;
        font-size:0.9rem;
        cursor:pointer;
        outline:none;
        transition:border-color 0.2s;
    `;

    // Add "All" option
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All";
    raritySelect.appendChild(allOption);

    // Add rarity options
    for (const rarity of rarities) {
        const option = document.createElement("option");
        option.value = rarity;
        option.textContent = rarity;
        raritySelect.appendChild(option);
    }

    raritySelect.value = selectedRarity;
    raritySelect.addEventListener("focus", () => (raritySelect.style.borderColor = "#5b9bd5"));
    raritySelect.addEventListener("blur", () => (raritySelect.style.borderColor = "#444"));
    raritySelect.addEventListener("change", () => {
        selectedRarity = raritySelect.value;
        notifyChange();
    });

    rarityContainer.appendChild(rarityLabel);
    rarityContainer.appendChild(raritySelect);
    container.appendChild(rarityContainer);

    // ─── Sort Dropdown ────────────────────────────────────────────────────────

    const sortContainer = document.createElement("div");
    sortContainer.style.cssText = "display:flex;flex-direction:column;gap:6px;";

    const sortLabel = document.createElement("label");
    sortLabel.textContent = "Sort By:";
    sortLabel.style.cssText = "font-size:0.8rem;color:#999;text-transform:uppercase;letter-spacing:0.5px;";

    const sortSelect = document.createElement("select");
    sortSelect.style.cssText = `
        padding:8px 12px;
        background:#2c2c2c;
        border:1px solid #444;
        border-radius:6px;
        color:#e0e0e0;
        font-size:0.9rem;
        cursor:pointer;
        outline:none;
        transition:border-color 0.2s;
    `;

    const sortOptions = [
        { value: "name-asc", label: "Name (A-Z)" },
        { value: "name-desc", label: "Name (Z-A)" },
        { value: "rarity-asc", label: "Rarity (Low to High)" },
        { value: "rarity-desc", label: "Rarity (High to Low)" },
        { value: "price-asc", label: "Price (Low to High)" },
        { value: "price-desc", label: "Price (High to Low)" },
        { value: "tags-asc", label: "Tags (Few to Many)" },
    ];

    for (const opt of sortOptions) {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        sortSelect.appendChild(option);
    }

    sortSelect.value = selectedSort;
    sortSelect.addEventListener("focus", () => (sortSelect.style.borderColor = "#5b9bd5"));
    sortSelect.addEventListener("blur", () => (sortSelect.style.borderColor = "#444"));
    sortSelect.addEventListener("change", () => {
        selectedSort = sortSelect.value;
        if (onSortChange) onSortChange(selectedSort);
    });

    sortContainer.appendChild(sortLabel);
    sortContainer.appendChild(sortSelect);
    container.appendChild(sortContainer);

    // ─── Tag Checkboxes ───────────────────────────────────────────────────────

    if (tags.length) {
        const tagsContainer = document.createElement("div");
        tagsContainer.style.cssText = "display:flex;flex-direction:column;gap:6px;";

        const tagsLabel = document.createElement("label");
        tagsLabel.textContent = "Tags:";
        tagsLabel.style.cssText = "font-size:0.8rem;color:#999;text-transform:uppercase;letter-spacing:0.5px;";
        tagsContainer.appendChild(tagsLabel);

        const tagsGrid = document.createElement("div");
        tagsGrid.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;";

        for (const tag of tags) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `tag-${tag}`;
            checkbox.value = tag;
            checkbox.checked = selectedTags.has(tag);

            const label = document.createElement("label");
            label.htmlFor = `tag-${tag}`;
            label.textContent = tag;
            label.style.cssText = `
                display:flex;
                align-items:center;
                gap:6px;
                padding:6px 10px;
                background:#242424;
                border:1px solid #444;
                border-radius:4px;
                cursor:pointer;
                font-size:0.85rem;
                transition:all 0.2s;
            `;

            checkbox.style.cssText = "cursor:pointer;";

            // Apply initial styling if already selected
            if (checkbox.checked) {
                label.style.background = "#3a6ea8";
                label.style.borderColor = "#5b9bd5";
            }

            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    selectedTags.add(tag);
                    label.style.background = "#3a6ea8";
                    label.style.borderColor = "#5b9bd5";
                } else {
                    selectedTags.delete(tag);
                    label.style.background = "#242424";
                    label.style.borderColor = "#444";
                }
                notifyChange();
            });

            label.addEventListener("mouseenter", () => {
                if (!checkbox.checked) {
                    label.style.borderColor = "#5b9bd5";
                }
            });
            label.addEventListener("mouseleave", () => {
                if (!checkbox.checked) {
                    label.style.borderColor = "#444";
                }
            });

            label.insertBefore(checkbox, label.firstChild);
            tagsGrid.appendChild(label);
        }

        tagsContainer.appendChild(tagsGrid);
        container.appendChild(tagsContainer);
    }

    // ─── Stock Status Toggle ──────────────────────────────────────────────────

    const stockContainer = document.createElement("div");
    stockContainer.style.cssText = "display:flex;align-items:center;gap:8px;";

    const stockCheckbox = document.createElement("input");
    stockCheckbox.type = "checkbox";
    stockCheckbox.id = "in-stock-only";
    stockCheckbox.checked = inStockOnly;

    const stockLabel = document.createElement("label");
    stockLabel.htmlFor = "in-stock-only";
    stockLabel.textContent = "In Stock Only";
    stockLabel.style.cssText = "font-size:0.85rem;cursor:pointer;color:#e0e0e0;";

    stockCheckbox.addEventListener("change", () => {
        inStockOnly = stockCheckbox.checked;
        notifyChange();
    });

    stockContainer.appendChild(stockCheckbox);
    stockContainer.appendChild(stockLabel);
    container.appendChild(stockContainer);

    return container;
}
