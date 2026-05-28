import "./filter-panel.css";

export function createFilterPanel(rarities, tags, onFilterChange, onSortChange, currentState = {}) {
    const container = document.createElement("div");
    container.className = "filter-panel";

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

    const rarityContainer = document.createElement("div");
    rarityContainer.className = "filter-group";

    const rarityLabel = document.createElement("label");
    rarityLabel.textContent = "Rarity:";
    rarityLabel.className = "filter-label";

    const raritySelect = document.createElement("select");
    raritySelect.className = "filter-select";

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All";
    raritySelect.appendChild(allOption);

    for (const rarity of rarities) {
        const option = document.createElement("option");
        option.value = rarity;
        option.textContent = rarity;
        raritySelect.appendChild(option);
    }

    raritySelect.value = selectedRarity;
    raritySelect.addEventListener("change", () => {
        selectedRarity = raritySelect.value;
        notifyChange();
    });

    rarityContainer.appendChild(rarityLabel);
    rarityContainer.appendChild(raritySelect);
    container.appendChild(rarityContainer);

    const sortContainer = document.createElement("div");
    sortContainer.className = "filter-group";

    const sortLabel = document.createElement("label");
    sortLabel.textContent = "Sort By:";
    sortLabel.className = "filter-label";

    const sortSelect = document.createElement("select");
    sortSelect.className = "filter-select";

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
    sortSelect.addEventListener("change", () => {
        selectedSort = sortSelect.value;
        if (onSortChange) onSortChange(selectedSort);
    });

    sortContainer.appendChild(sortLabel);
    sortContainer.appendChild(sortSelect);
    container.appendChild(sortContainer);

    if (tags.length) {
        const tagsContainer = document.createElement("div");
        tagsContainer.className = "filter-group";

        const tagsLabel = document.createElement("label");
        tagsLabel.textContent = "Tags:";
        tagsLabel.className = "filter-label";
        tagsContainer.appendChild(tagsLabel);

        const tagsGrid = document.createElement("div");
        tagsGrid.className = "tags-grid";

        for (const tag of tags) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `tag-${tag}`;
            checkbox.value = tag;
            checkbox.className = "tag-checkbox";
            checkbox.checked = selectedTags.has(tag);

            const label = document.createElement("label");
            label.htmlFor = `tag-${tag}`;
            label.textContent = tag;
            label.className = `tag-label ${checkbox.checked ? "tag-checked" : ""}`;

            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    selectedTags.add(tag);
                    label.classList.add("tag-checked");
                } else {
                    selectedTags.delete(tag);
                    label.classList.remove("tag-checked");
                }
                notifyChange();
            });

            label.insertBefore(checkbox, label.firstChild);
            tagsGrid.appendChild(label);
        }

        tagsContainer.appendChild(tagsGrid);
        container.appendChild(tagsContainer);
    }

    const stockContainer = document.createElement("div");
    stockContainer.className = "stock-container";

    const stockCheckbox = document.createElement("input");
    stockCheckbox.type = "checkbox";
    stockCheckbox.id = "in-stock-only";
    stockCheckbox.checked = inStockOnly;

    const stockLabel = document.createElement("label");
    stockLabel.htmlFor = "in-stock-only";
    stockLabel.textContent = "In Stock Only";
    stockLabel.className = "stock-label";

    stockCheckbox.addEventListener("change", () => {
        inStockOnly = stockCheckbox.checked;
        notifyChange();
    });

    stockContainer.appendChild(stockCheckbox);
    stockContainer.appendChild(stockLabel);
    container.appendChild(stockContainer);

    return container;
}
