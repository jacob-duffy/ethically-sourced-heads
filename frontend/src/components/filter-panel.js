import "./styles/filter-panel.css";

export function createFilterPanel(rarities, tags, onChange, currentState = {}) {
    const container = document.createElement("div");
    container.className = "filter-panel";

    let selectedRarity = currentState.rarity || "";
    let selectedTag = currentState.tags && currentState.tags.length > 0 ? currentState.tags[0] : "";
    let inStockOnly = currentState.inStockOnly || false;
    let selectedSort = currentState.sort || "name-asc";

    const notifyChange = () => {
        onChange({
            rarity: selectedRarity,
            tags: selectedTag ? [selectedTag] : [],
            inStockOnly,
            sort: selectedSort,
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
        notifyChange();
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

        const tagsSelect = document.createElement("select");
        tagsSelect.className = "filter-select";

        const allOption = document.createElement("option");
        allOption.value = "";
        allOption.textContent = "All";
        tagsSelect.appendChild(allOption);

        for (const tag of tags) {
            const option = document.createElement("option");
            option.value = tag;
            option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
            tagsSelect.appendChild(option);
        }

        tagsSelect.value = selectedTag;
        tagsSelect.addEventListener("change", () => {
            selectedTag = tagsSelect.value;
            notifyChange();
        });

        tagsContainer.appendChild(tagsLabel);
        tagsContainer.appendChild(tagsSelect);
        container.appendChild(tagsContainer);
    }

    const stockContainer = document.createElement("div");
    stockContainer.className = "filter-group";

    const stockLabel = document.createElement("label");
    stockLabel.textContent = "Availability:";
    stockLabel.className = "filter-label";

    const stockCheckboxContainer = document.createElement("div");
    stockCheckboxContainer.className = "stock-checkbox-container"

    const stockCheckbox = document.createElement("input");
    stockCheckbox.type = "checkbox";
    stockCheckbox.id = "in-stock-only";
    stockCheckbox.checked = inStockOnly;

    const stockCheckLabel = document.createElement("label");
    stockCheckLabel.htmlFor = "in-stock-only";
    stockCheckLabel.textContent = "In Stock Only";
    stockCheckLabel.className = "stock-label";

    stockCheckbox.addEventListener("change", () => {
        inStockOnly = stockCheckbox.checked;
        notifyChange();
    });

    stockCheckboxContainer.appendChild(stockCheckbox);
    stockCheckboxContainer.appendChild(stockCheckLabel);
    stockContainer.appendChild(stockLabel);
    stockContainer.appendChild(stockCheckboxContainer);
    container.appendChild(stockContainer);

    return container;
}
