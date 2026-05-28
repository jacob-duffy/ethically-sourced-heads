/**
 * Creates a search input component.
 * @param {Function} onSearch - Callback with (query: string)
 * @returns {HTMLElement}
 */
export function createSearchBar(onSearch) {
    const container = document.createElement("div");
    container.style.cssText = `
        display:flex;
        gap:12px;
        margin-bottom:24px;
        max-width:1200px;
        margin-left:auto;
        margin-right:auto;
    `;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Search by name…";
    input.style.cssText = `
        flex:1;
        padding:10px 14px;
        background:#2c2c2c;
        border:1px solid #444;
        border-radius:6px;
        color:#e0e0e0;
        font-size:0.9rem;
        outline:none;
        transition:border-color 0.2s;
    `;

    input.addEventListener("focus", () => (input.style.borderColor = "#5b9bd5"));
    input.addEventListener("blur", () => (input.style.borderColor = "#444"));
    input.addEventListener("input", () => onSearch(input.value.trim()));

    container.appendChild(input);
    return container;
}
