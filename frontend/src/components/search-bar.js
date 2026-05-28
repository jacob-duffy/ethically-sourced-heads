import "./search-bar.css";

/**
 * Creates a search input component.
 * @param {Function} onSearch - Callback with (query: string)
 * @returns {HTMLElement}
 */
export function createSearchBar(onSearch) {
    const container = document.createElement("div");
    container.className = "search-bar";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Search by name…";
    input.addEventListener("input", () => onSearch(input.value.trim()));

    container.appendChild(input);
    return container;
}
